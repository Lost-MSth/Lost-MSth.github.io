---
title: No File Buffer
key: file_buffer
tags: Python Win32
modify_date: "2023-01-14 22:54:00"
aside:
    toc: true
---

## 问题描述

发现一个奇怪现象，利用Python读取文件时，第一次会很慢，以后就会很快，盲猜是某种缓存

因为一开始读的是文件夹下所有文件，所以先排除了`os.listdir`的干扰，不过过程中发现了值得注意的一点：Python 3.5引入的`os.scandir`的速度和`os.listdir`几乎一样，但前者能够提供更多信息，比如是不是文件夹/文件，而后者如果要判断文件类型，还需要`os.path.isdir`和`os.path.isfile`，当循环判断时，耗时极其高，故此时用`os.scandir`更好

回归正题，就算是单文件读取，第二次及以后的速度也是第一次的一半不到，多文件就更惊人了

查了半天，应该是系统I/O buffer的问题，参考资料：[文件缓冲](https://learn.microsoft.com/zh-cn/windows/win32/fileio/file-buffering)和[文件缓存](https://learn.microsoft.com/zh-cn/windows/win32/fileio/file-caching)

好，现在问题来了，如果我想强制不使用buffer怎么办？因为需要测试每次读取文件的时间，我觉得有必要是最大值，缓存在文件不常用后是会失效的

## 代码

Win32API给了方法，设置`FILE_FLAG_NO_BUFFERING`就行，而Python可以直接调用Win32API，不过网上基本没啥资料，这边就留一下当存档了

{% highlight Python linenos %}
from time import time
import hashlib
import os
import win32file, win32con

def get_file_md5_2(file_path):
    handle = win32file.CreateFile(file_path, win32file.GENERIC_READ, 0, None, win32con.OPEN_EXISTING, win32file.FILE_FLAG_NO_BUFFERING, None)
    myhash = hashlib.md5()
    while True:
        rc, data = win32file.ReadFile(handle, 8192*1024)
        if not data:
            break
        myhash.update(data)

    handle.Close()
    return myhash.hexdigest()

def get_file_md5(file_path: str) -> str:
    if not os.path.isfile(file_path):
        return None
    myhash = hashlib.md5()
    with open(file_path, 'rb') as f:
        while True:
            b = f.read(8192)
            if not b:
                break
            myhash.update(b)

    return myhash.hexdigest()

PATH = 'test.dat'

t = time()
print(get_file_md5(PATH))
print(time() - t)

t = time()
print(get_file_md5(PATH))
print(time() - t)

t = time()
print(get_file_md5_2(PATH))
print(time() - t)
{% endhighlight %}

测试一下，文件大小为2.31GB，结果如下：

{% highlight Console linenos %}
d7596c870fad7695178c101fa39dd686
13.094956398010254
d7596c870fad7695178c101fa39dd686
4.701142311096191
d7596c870fad7695178c101fa39dd686
12.817755460739136
{% endhighlight %}

多次运行取个平均值就知道，第一次和第三次一样都是无缓存的，第二次是有缓存的，差异很大，以及如果开着任务管理器可以发现，第二次读取是没有文件所在硬盘活动的
