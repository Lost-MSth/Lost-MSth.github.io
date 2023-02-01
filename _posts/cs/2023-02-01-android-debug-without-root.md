---
title: Android无ROOT权限动态调试
key: android_debug_without_root
tags: ["Reverse Engineering", "Dynamic Debugging", "Android", "IDA"]
modify_date: "2023-02-01 22:20:00"
aside:
    toc: true
---

## 前情提要

手上只有自己的手机能用，又想要动态调试，试了安卓模拟器不行，ARM架构的模拟器就只有Android Studio的AVD，可是不知是不是没调好，卡的要死，基本没法用，于是随手一搜，我去，真有无ROOT调试大法啊~

嘛，看雪论坛资料是真的多啊！不过还是有不少坑的，先把参考资料扔上来：

1. [安卓真机免root动态调试so](https://bbs.kanxue.com/thread-262524.htm)
2. [Android 10 免ROOT 对于 IDA 的动态调试心得](https://bbs.kanxue.com/thread-271165-1.htm)
3. [IDA PRO 调试Android so遇到断点就App就崩溃](https://bbs.kanxue.com/thread-265482.htm)

你问最后那是什么？嗯，其实我看的资料远多于此，期间遇到的问题实在是太多了，最坑的最难搜到的就是最后这个，故写此文记录步骤，怕以后忘了又搜不到 :(

<!--more-->

## 相关环境

- 手机OS：Android 10 (HarmonyOS 2)
- IDA Pro v7.5
- 某APP的APK，内有ARM 64的so文件
- ADB调试工具
- 解包、打包、签名相关工具
  - apktool 2.7.0
  - keytool、jarsigner

很明显手机无ROOT权限，且是64位的ARM架构的核心，所以选用64位so文件进行动调

已知APP没有任何反调试，没有乱七八糟的签名校验什么的

## 简要步骤

先解包APK，提取so文件，复制一份，IDA开起来，自动分析跑起来~

紧接着，改`AndroidManifest.xml`文件，在`<application>`标签里面加属性`android:debuggable="true"`，呃，这里保险起见我加了另外一个不知道有啥用的`android:extractNativeLibs="true"`

打包并签名，扔到设备上安装，用USB连接到电脑上，开启USB调试

开个CMD，先`adb devices`连接看看设备在不在，然后找一下IDA里的`android_server64`文件（就是arm64调试端），adb推送到手机

```shell
adb push "F:\\Program Files\\IDA_Pro_v7.5_Portable\\dbgsrv\\android_server64" /data/local/tmp
```

嘛这里的路径不一定一样，然后连接shell，加权限

```shell
adb shell
cd /data/local/tmp
chmod 777 android_server64
```

重点来了，以应用身份运行sh，有点提权的感觉，把文件拷贝到应用data里，运行！

```shell
run-as <application name>
cp /data/local/tmp/android_server64 ./
./android_server64
```

停，等一下，这里有个大坑，如果是Android 10，那么这里会导致遇到断点时应用闪退，因为系统的`libc.so`位置变了，最后一句需要改一下

```shell
IDA_LIBC_PATH=/apex/com.android.runtime/lib/bionic/libc.so ./android_server
IDA_LIBC_PATH=/apex/com.android.runtime/lib64/bionic/libc.so ./android_server64
```

上面是32位，下面是64位的，这样才能不闪退

另开个CMD，转发调试端口

```shell
adb forward tcp:23946 tcp:23946
```

然后打开APP，IDA附加到进程，就是常规操作了

## 并没有用到的

先开应用，再附加，so就已经加载进去了，貌似有时候需要从头动调，在非常前的位置上断点，就不能这样了，不过这次没用到

```shell
adb shell dumpsys package <application name>  # 看MainActivity叫啥
adb shell am start -D -n <application name>/<main activity>
```

此时设备应该卡在等待调试界面，这时候上IDA附加就可以从头调试了，记得先F9恢复运行，再按下面的步骤开始应用运行

```shell
adb jdwp  # 看调试进程<pid>，Ctrl+c退出
adb forward tcp:5005 jdwp:<pid>  # 转发到5005端口
jdb -connect com.sun.jdi.SocketAttach:hostname=localhost,port=5005  # 开始调试 
```
