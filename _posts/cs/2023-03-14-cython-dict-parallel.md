---
title: 记一次 Hash Table (dict / unordered_map) 性能优化
key: cython_dict_parallel
tags: ["Cython", "OpenMP", "C++"]
modify_date: "2023-03-16 18:27:00"
aside:
    toc: true
---

## 背景说明

很显然需求来自物理问题，因课题还未完成，暂且不表，应该会另开文章进行总结，完整代码也会给出

> 后加说明：论文代码详见 [本科毕设论文代码](https://github.com/Lost-MSth/Lost/tree/main/Maths%26Physics/%E6%9C%AC%E7%A7%91%E6%AF%95%E8%AE%BE%E8%AE%BA%E6%96%87%E4%BB%A3%E7%A0%81)，论文草稿详见 [量子多体引力模拟中的 Krylov 复杂度研究](../../../2023/06/11/krylov复杂度-量子模拟.html)

## 模型分析

数据结构大概就是超大矩阵的感觉，而且矩阵元是复数，方阵阶数为 $2^n$，$n$ 是粒子数，呃，我们就叫它 `MultiPauliString` 好了，就是多粒子 Pauli 链

<!--more-->

数据两两间**外积**并不是简单的矩阵乘法运算，这就是头疼的地方，实际上根据物理本质可知，二者行号 xor 为新行号，二者列号 xor 为新列号，值相乘后还要考虑二者行号列号 and 运算带来的 $-1$，四重循环这复杂度一下子就上来了，时间复杂度 $$\order{2^{4n}}$$，如果真用矩阵存储那空间复杂度也是 $$\order{2^{2n}}$$

当然还有个**内积**运算，这个简单，对应矩阵元的内积 $$a_{ij}^{*} b_{ij}$$ 再全求和就是了，复杂度肯定没外积高

讲个笑话，用 Pauli 算符矩阵进行展开直接矩阵乘法暴算，怎么都能跑十五六个粒子，你这多粒子 Pauli 链算法跑十二三个都够呛，能忍？

## 开始折腾

### 环境

#### 本地环境

- Python 3.7.8
- Cython 0.29.30
- MinGW-W64 GCC 12.2.0

#### 超算服务器

- Python 3.7.6
- Cython 0.29.16
- GNU GCC 10.2.0

### 从 Cython 开始

> 目前我没写过 Cython 编译和使用相关问题和解决方法，网上找找教程好了，这至少还算好找

首先选定顶层语言为 Python，别问，问就是不会 C++，当然不会有人直接傻到拿 Python 写算法吧，肯定会用一些底层的语言，Fortran 可以但语法我不喜欢，C 的话也可以，只不过不在 C 上做处理的话，Python 这边的数据转换很烦，所以超级无敌胶水 Cython 就是很好的折中选择

什么，你问 Numba ？那玩意也挺乱的，还容易报错啊

多粒子 Pauli 链其实很稀疏，至少 Hamilton 量是非常非常稀疏的，算符倒是会随着每次计算指数增长，很显然的一个想法就是用字典来存储，万物皆对象，故二元组 `tuple(int, int)` 毫无疑问可以 hash，也就直接可以作为 key

噼里啪啦一通写，写出来发现，嗯，可以用，就是有一点慢，真的慢……

在 Cython 里加数据类型可以加速，乱加一通，好像也没快多少，于是开始检查哪里计算量大，然后果然是那破烂外积耗时离谱

### 绕远路喽

循环耗时大，最简单的办法就是并行，诶别说，Cython 并行超方便，`prange` 只要求 `nogil` 就可以在 OpenMP 的加持下占满你的 CPU

不过啊，字典可不好并行，于是在做外积之前把值遍历出来放到 `malloc` 的数组里，然后再分配几个结果数组……为什么要分配几个？呃，**Cython 对 OpenMP 中 reduction 的支持有点问题，二重循环时内部计算无法正常翻译**[^1]，所以只能手动啦，不然会线程竞争的

对了，**对于编译和链接都要加 `-fopenmp`**，当然编译器不同选项不一定一样

写完一试，不对啊，时间没有一点点减少，还那么慢，奇怪了哦，难道我这不支持 OpenMP ？试了半天，突发奇想记个时，然后绝了！

那计算根本没花多长时间啊，当然看不出来多线程效果了，耗时大头是字典插入和更新！

### 分桶

嘛，一开始我是先觉得 `dict` 是 Python 的数据结构，应该挺慢的，所以简单嘛，换成 C++ 的 `unordered_map` 不就好了，然后一搜，性能差距不大，10%左右，完全没必要

好吧，那再想想，数据量太大，hash 表性能下降，呃有点像数据库啊，那应该可以分开来，像是分表吧

再看看多粒子 Pauli 链，有行号和列号两个数，自然而然，嵌套字典！

很好，性能提升了2倍以上！

### 再绕几次，但有意义

不过还是比不上矩阵算法，中途去弄了弄，密集矩阵换成稀疏矩阵一下子提升了几十倍的速度，这下还得优化啊

想起来用的是 `dict`，不行，我就要改，吧唧吧唧全换成了 `unordered_map`

这次想了很久很久，注意到一个很奇怪的点，算符的多粒子 Pauli 链在撑满整个 Hilbert 空间之前的之前，很早的时候行号和列号空间就满了，也就是非零元的行号或者列号几乎遍历所有可能值

这说明并不需要嵌套 Hash 表，而是列表嵌套字典就行，或者说是数组里放 Hash Table 的指针

不幸的是，这一步一堆坑，对 C++ 的容器没有接触过，到底是指针还是什么结构已经快被绕晕了，倒是最后还是写出来了些东西

{% highlight Cython linenos %}
from cython.parallel import prange
from libc.stdlib cimport malloc, free
from libcpp.unordered_map cimport unordered_map, pair

ctypedef unordered_map[int, complex] ic_dict

cdef class MultiPauliString:
    cdef ic_dict **_data
    cdef public Py_ssize_t _len
    cdef public int _n

    def __cinit__(self, n: int):
        self._n = n
        self._len = 2**n
        self._data = <ic_dict **> malloc(self._len * sizeof(ic_dict *))  # type: ignore
        if self._data == NULL:
            raise MemoryError()

        cdef Py_ssize_t i
        with nogil:
            for i in prange(self._len):
                self._data[i] = new ic_dict()

    def __dealloc__(self):
        cdef Py_ssize_t i
        if self._data != NULL:
            with nogil:
                for i in prange(self._len):
                    del self._data[i]
                free(self._data)
{% endhighlight %}

鬼知道这会不会内存泄漏，能用就行，注意到需要用 `cython.operator.dereference` 解引用，也就是 C 的 `*` 运算符，这样才能正常的使用 `[]` 进行增查改（调实例方法好像不用？），不过用 `[0]` 当做 `*` 用也可以，但貌似这会复制一份而不是引用（在左边的时候就可以用来复制右边的副本？）

这步优化，时间效率提升3%，几乎没有……甚至在 Hamilton 量的建立上更慢，因为要建大量的 `unordered_map`

### 艰难且错误地尝试并行

很显然，问题还是字典的插入上，这太耗时间了，所以怎么都得让 `unordered_map` 写并行（不然浪费了超算的多核性能啊）

**意外之喜**，为了 Cython 并行，**在代码里加了一堆 `nogil`**，跑了一下发现，速度提升约2倍！

搜一搜，发现推荐 oneTBB 的 `concurrent_unordered_map`，这就是一整天噩梦的开始……

先装个 Intel oneAPI，结果装在 VS 上（可能也没装成功），不行，得用 MinGW 编译

从源代码开始，一看用的是 CMake，装上转 Makefile，报了一堆奇奇怪怪的 warning 后成功，然后 make 失败

看样子把 warning 当做 error 了，搜了一圈去掉选项，开编……笑死忘记关 test 编译了，一天也编不完啊

选项关掉测试，终于在一堆报错（找不到文件什么的）中得到了 dll

然后代码编译警告，链接报错，进行不下去了，提示 `undefined reference to tbb::detail` 什么什么，反正搜不到解决办法，乱试一通也没用，寄

过了一晚，脑袋清醒了，搜一下并行 hash 表实现，草，为什么非要用 TBB 呢？

最终选用 [parallel-hashmap](https://github.com/greg7mdp/parallel-hashmap)，因为可以原样替换，而且只需引用头文件就行

于是我们开个 pxd 文件（Cython 头文件）这么写：

{% highlight Cython linenos %}
from libcpp.utility cimport pair

cdef extern from "parallel_hashmap/phmap.h" namespace "phmap" nogil:
    cdef cppclass Hash[T]:
        pass
    cdef cppclass EqualTo[T]:
        pass
    cdef cppclass Allocator[T]:
        pass
    cdef cppclass four "4":
        pass

cdef extern from "parallel_hashmap/phmap.h" namespace "phmap" nogil:
    cdef cppclass parallel_flat_hash_map[T, U, HASH=*, PRED=*, ALLOCATOR=*, N=*, MTX=*]:
        ctypedef T key_type
        ctypedef U mapped_type
        ......
{% endhighlight %}

后面省略了一些方法和运算符重载的定义，照着 Cython `libcpp` 标准库的 `unordered_map` 抄一下就好了

这里也挺麻烦的，如果只是正常使用 template，传前两个泛型 key 和 value 的类型就好，但是文档告诉我们，最后一个参数锁类型加上后就有线程安全了，鬼迷心窍之下就搞起来（咳咳，其实这又是在绕弯路了）

于是就翻了翻默认定义，`Hash`、`EqualTo`、`Allocator` 这三个类貌似都是 std 的，不过我啥也不会，看起来命名空间 phmap 里已经引用了而且给了别名，就这样子引进来吧

然后出现个怪事，template 参数里有个数字啊，默认值为4，**然而 Cython 还不支持模板里面放数字**，我们只能手动写一下了，这样翻译出来的 C++ 代码是对的，算是奇技淫巧吧[^2]

对了，还要把锁定义一下：

{% highlight Cython linenos %}
cdef extern from "<mutex>" namespace "std" nogil:
    cdef cppclass mutex:
        void lock() except +
        void unlock() except +
{% endhighlight %}

让人摸不着头脑的第不知道多少个问题来了，这里如果使用推荐的 `std::shared_mutex`，程序原地爆炸，随机崩溃，所以用了 `std::mutex`

但仔细想想，是不是哪里不对劲，好像文档里只说对于插入、查找、修改等之类的操作是线程安全的，可是我这里是增加！也就是先取值加上一个数再放回去，这怎么弄好像都没法保证线程安全，应该不会有哪个第三方库做这种需求吧？

不过就算是单线程，性能也提升了20%左右，可能是这里的 `parallel_flat_hash_map` 自带四分表导致的吧

### 来个锁

不得已，看样子只能自己写个锁了，幸好，我们已经做了分块字典了，不需要再拆了，直接上锁就好

可是啊，还是有个坑，`std::mutex` 这玩意好像说是没法复制和移动，要和数据绑定就显得有点困难，太麻烦了

索性这里就不采用一个 hash 表绑定一个锁了，而是来个全局的 hash mutex

{% highlight Cython linenos %}
from parallel_hashmap cimport parallel_flat_hash_map as unordered_map, pair, mutex

DEF MUTEX_NUM = 8192

cdef mutex mutexes[MUTEX_NUM]
{% endhighlight %}

接下来就是简单的同余类的 hash 操作和在计算时上锁解锁了

{% highlight Cython linenos %}
def l_super(MultiPauliString a, SparseMultiPauliString h):
    # [H, .]
    # return h @ a - a @ h

    cdef MultiPauliString r = MultiPauliString(a._n)
    cdef ic_dict *aa
    cdef ic_dict *rr
    cdef PauliString p
    cdef Py_ssize_t i
    cdef int kk1, kk2, k11, k12, k21, k22, t, mutex_idx
    cdef pair[int, complex] k2

    ......

                    mutex_idx = kk1 % MUTEX_NUM
                    mutexes[mutex_idx].lock()
                    deref(rr)[kk2] = deref(rr)[kk2] + 2 * t * p.v * k2.second
                    mutexes[mutex_idx].unlock()
{% endhighlight %}

大功告成，本地测试外积速度提升接近4倍！

再调一调其它地方，把之前没并行都开并行，速度又提升了好几倍，可以算是大胜利~

## 后话

由于在本地测试时环境太乱了，`setup.py` 没法正常工作，于是用了 `makefile` 手动翻译、编译、链接，然后上超算的时候写的是 `setup.py`，脑子抽了忘记了 `-fopenmp` 了，单线程下跑了几次，要不是灵光乍现我就想不起来了哈哈哈哈

不过不管怎么弄，内存占用都随着计算步骤的增加而指数增长，这真的没办法从本质上解决了，毕竟算的就是量子混沌啊

[^1]: 这个问题截止本文写时还没解决，请参考 [Cython Issue #2316](https://github.com/cython/cython/issues/2316)
[^2]: 参考链接 [Cython C++ templates](https://stackoverflow.com/questions/40323938/cython-c-templates)
