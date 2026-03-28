---
modify_date: "2026-03-28 23:30:00"
title: PKU HPCGame 3rd 2026 Writeup
key: hpcgame_2026_writeup
tags: ["HPC", ]
aside:
    toc: true
---

> 这是 PKU HPCGame 2026 即第三届北京大学高性能计算综合能力竞赛的本人与各路 LLM 的题解与思路。
>
> [本人代码](https://github.com/Lost-MSth/Lost/tree/main/HPC/HPCGame%202026)
>
> [官方题解与记录](https://github.com/hpcgame/hpcgame-problems-3rd)

## 前言

今年的比赛真是被 LLM 完全爆杀了，AI 也成功把各位选手的水平拉到了差不多的位置上，所以大伙除了 L、M 题以外基本全部满分。而不占分的题目，我也不想去做了，太累人了，而且 Copilot 限额用完了。

第一天我没有第一时间开赛，因为在参加某个 CTF 比赛，所以稍微迟了一点，在看到榜上前几题已经一大堆满分后才开始动手，这影响不大。实际上今年时间挺充裕的，LLM 大人真是太强了！

在本文中我不想贴太多代码，如果你想看就去上面的我的代码仓库里看看吧。但是得劝一句，基本全是 LLM 写的，我自己都看不太懂，不建议学习。

声明：本人使用的 LLM AI 在 chat 模式下包括：GPT-5.2 Thinking、GPT-5.2 Free、Gemini 3 Pro、Gemini 3 Flash、Claude Sonnet 4.5 Extended (free)。在 agent 模式下使用的是 Copilot Pro，包括：GPT-5.2-Codex、GPT-5.1-Codex-Max、Claude Sonnet 4.5、Claude Opus 4.6（这个只用了一次，完全不好用，基本思考了半天就断了）。

## 各题思路

### A. 签到

明显 Fortran，编译后发现原样输出了自己，但如果你把命令行里的输出交上去是错的，直接把题目本身复制过去提交即可。

### B. 小北问答-超速版

本题基本 AI，基于 GPT-5.2 Free 和 Gemini 3 Pro/Flash，错了就把反馈给它们俩，然后接着搞，看看它们能达成什么共识即可。

1. Amdahl & Gustafson：某程序的代码中 10% 必须串行执行，90% 可完美并行。根据 Amdahl's Law，无论核心数如何增加，该程序的理论最大加速比极限是 `10` 倍；若在 10 核系统中通过扩大问题规模来保持每核计算负载不变，根据 Gustafson's Law，该系统的加速比将达到 `10 - 0.1 * (10 - 1) = 9.1` 倍。
2. OpenMP：`B`。
3. BF16 拥有 `8` 位指数位，`7` 位尾数位；NVFP4 拥有 `2` 位指数位，`1` 位尾数位。
4. MPI 通信：`MPI_Allgather(&local_val, 1, MPI_INT, recv_buf, 1, MPI_INT, MPI_COMM_WORLD);` 和 `MPI_Cart_create(MPI_COMM_WORLD, 2, dims, periods, 1, &comm_cart);`。
5. NCCL 延迟：在 NCCL 2.28 的默认调优常量中，用 NVLink 连接的两 GPU、采用 Tree 算法和 LL 协议时，在估算时每跳（单步）的硬件延迟取值为 `0.6` µs。
6. 高性能网络：`AEF`。
7. GPU：`BDEF`。
8. LLM：`18 1 96`。
9. UB 互联：`336 112 150528`。
10. `D`、`C`。

### C. Ticker

```bash
hpcgame create -p arm_infer -c 16 -m 16 -n ticker -i cr.hpc.lcpu.dev/hpcgame/3rd-kunpeng920:latest
```

随便问问 AI，对齐到 128 即可。

```cpp
#ifndef MARKET_H
#define MARKET_H

struct alignas(128) Candle {
    double high;
    double low;
    double close;
    long long vol;
};

#endif
```

### D. Hyperlane Hopper

```bash
hpcgame create -p wm2_8358 -c 16 -m 32 -n hopper -i cr.hpc.lcpu.dev/hpcgame/base:latest
```

本题是并行 SSSP 算法，Gemini 3 Pro/Flash 在多轮对话加上不断重试中弄出来，人工部分主要在调参数 `delta`，对不同的输入尺寸，选用不同的值进行计算。另外 AI 发现构建 CSR 矩阵也要针对是否是稀疏图进行优化，实在是太变态了。

### E. 哪里爆了

```bash
hpcgame create -p arm_v200 -c 32 -m 32 -n mypod -i crmirror.lcpu.dev/hpcgame/3rd-kunpeng920:latest
hpcgame create -p arm_v200 -c 4 -m 16 -n mypod3 -i crmirror.lcpu.dev/hpcgame/3rd-kunpeng920:latest
hpcgame create -p arm_920f -c 4 -m 16 -n mypod2 -i crmirror.lcpu.dev/hpcgame/3rd-kunpeng920:latest

tar xf handout.tar.gz
cd handout
tar xf OpenBLAS-git.tar.gz
cd OpenBLAS
CC=clang CXX=clang++ FC=flang make libs USE_OPENMP=1 TARGET=ARMV9SME -j 
cd ..
make all -j
# 换成920专业版
make test_ssyrk

# 看看调用了哪个文件
nm -an test | grep ssyrk
```

气晕过去的一题，难度完全不在题目本身，做出来之前我都一直怀疑这题真的只有 100 分吗，做完后我觉得这题 100 分是出题者以为的，但实际上本题对综合能力的考验完全不止这点分。

主要问题或者说步骤在于以下：

1. 测试环境经常炸，心态开始受到了一丝丝影响。
2. 一开始给的题面的编译命令是错的，`make all -j` 不在上层跑的话会炸，我看了半天才反应过来。
3. 题面没有给重试的代码，可能以为大伙都知道：在修改了 OpenBLAS 的某些文件后，直接 `make libs` 其实没有变化，**需要先 `make clean`，然后全部重新编译**。但是误区就在这里，对于大部分文件，特别是 `*.c` 代码，不需要重头来，也可以发现变化，所以我直到做出来前才发现这个问题。
4. 找不到问题在哪，其实就是指不知道底层调用的到底是哪个文件，如果不给任何提示词，AI 或者人工会优先锁定 `kernel/arm64/ssyr(2)k_direct_alpha_beta_arm64_sme1.c` 这两个文件，但实际上，测试用例根本没调用它们，因为矩阵太小了。
5. 然后经过艰苦卓绝的一点一点的尝试和分析后，你就会看到在 `interface/syrk.c` 里最后那段调用的是单线程的实现，实现实际文件在 `driver/level3/level3_syrk.c`。接着如果你把这些文件扔给 AI，那基本它们会尝试修改文件，那完蛋了。
6. 人工分析大概可以感觉出来，SME 的问题嘛，所以 `GEMM_UNROLL_M` 等参数应该非常重要。接着如果你尝试修改它们，那它还是会炸……当然问题确实在这。
7. 最后，定位到 `param.h` 文件，此时 AI 有不小的概率能改对这第一个问题，`ARMV9SME` 里定义的展开参数是不够的，所以要变成 512 位版本的。但是如果只改这里，那么编译是会炸的，然后接着问 AI，应该有概率会帮你改改 `kernel/arm64/KERNEL.ARMV9SME` 文件，但是很可惜，大概率改不对。

直到最后的最后，我不抱希望地让 GPT-5.1-Codex-Max 再试一下，这次直接改对了，它把 `A64FX` 的配置全部嫁接过来，简直太聪明了！顺带还让我发现了上面的第 3 条里的问题，我一直没注意到这个。以下是最终 patch：

```patch
From a7bbcce9c226d5de326dc3f1687a84798c1e2459 Mon Sep 17 00:00:00 2001
From: Lost-MSth <github@lost-msth.cn>
Date: Tue, 3 Feb 2026 16:48:40 +0800
Subject: [PATCH] Fix Armv9

---
 kernel/arm64/KERNEL.ARMV9SME | 2 +-
 param.h                      | 4 ++--
 2 files changed, 3 insertions(+), 3 deletions(-)

diff --git a/kernel/arm64/KERNEL.ARMV9SME b/kernel/arm64/KERNEL.ARMV9SME
index dc333d829..3a120f773 100644
--- a/kernel/arm64/KERNEL.ARMV9SME
+++ b/kernel/arm64/KERNEL.ARMV9SME
@@ -1,3 +1,3 @@
-include $(KERNELDIR)/KERNEL.ARMV8SVE
+include $(KERNELDIR)/KERNEL.A64FX
 
 
diff --git a/param.h b/param.h
index 8112e8915..34de0b8ba 100644
--- a/param.h
+++ b/param.h
@@ -3744,7 +3744,7 @@ is a big desktop or server with abundant cache rather than a phone or embedded d
 #define CGEMM_DEFAULT_R 4096
 #define ZGEMM_DEFAULT_R 4096
 
-#elif defined(A64FX) // 512-bit SVE
+#elif defined(A64FX) || defined(ARMV9SME) // 512-bit SVE
 
 #define GEMM_DIVIDE_RATE  1
 
@@ -3793,7 +3793,7 @@ Until then, just keep it different than DGEMM_DEFAULT_UNROLL_N to keep copy rout
 #define CGEMM_DEFAULT_R 4096
 #define ZGEMM_DEFAULT_R 4096
 
-#elif defined(ARMV8SVE) || defined(ARMV9SME) || defined(ARMV9) || defined(CORTEXA510)|| defined(CORTEXA710) || defined(CORTEXX2) // 128-bit SVE
+#elif defined(ARMV8SVE) || defined(ARMV9) || defined(CORTEXA510)|| defined(CORTEXA710) || defined(CORTEXX2) // 128-bit SVE
 
 #if defined(XDOUBLE) || defined(DOUBLE)
 #define SWITCH_RATIO            8
-- 
2.46.1.windows.1
```

### F. 小北买文具

```bash
hpcgame create -p wm2_8358 -c 16 -m 32 -n mypod -i cr.hpc.lcpu.dev/hpcgame/base:latest
```

并行 LU 分解，告诉 AI 要分块并行就好了，然后上环境人工调一下 block 大小为 16 就过了。不得不说这题花的时间基本在怎么把测试脚本跑起来这件事上。

### G. 显存不足

```bash
hpcgame create -p amd_w7800 -c 16 -m 128 -g 1 -n mypod -v problem-prefill-data -i cr.hpc.lcpu.dev/hpcgame/rocm-prefill:latest 
hpcgame create -p yanyuan_9654 -c 8 -m 16 -g 1 -n mypodcuda -v problem-prefill-data -i cr.hpc.lcpu.dev/hpcgame/cuda:latest
hpcgame create -p gpu_a800 -c 16 -m 32 -g 1 -n mypodcuda2 -v problem-prefill-data -i cr.hpc.lcpu.dev/hpcgame/cuda:latest
```

本题是要求部分加载模型，AI 做起来不算很轻松（特别是没有反馈的情况下），我只能疯狂要求它们提升性能，然后最后貌似 GPT-5.2 Thinking 给出了比较好的答案。我的工作量在于收紧参数，看看那几个参数能怎么在不爆显存的情况下影响性能。

当然还是被坑了不少。首先这题抢不到卡就是很糟糕的事情，然后我浪费了一大堆提交来当测试用，幸亏提了上限，不然就直接判死刑了。其次这题的测评数据用的随机点是精心挑选的，可能接近于最差的结果，所以测试时得到的结果还得多次反复确认才能交，不仅不一定时间对的上，而且还会爆显存。不过，在提交上限增加后，AI 给了我一个 76s 左右的答案，我就可以不紧不慢地摸索参数，顺带赌测评波动能带我进 75s 内了。事实证明，确实可以。

### H. 流水排排乐

本题使用 GPT-5.2 Thinking，我一行代码没写。唯一一道本地能测且计时与平台无关的题，也是一道单从背后的新语言设计来看非常精彩的题目。

任务 1：向量加法，一边读数据，一边计算就可以了，因为是异步的，所以 for 循环就可以了，AI 可秒。

任务 2：矩阵乘法，分块成 $128 \times 128$ 的核就可以了，AI 一两轮对话内可秒。

任务 3：带有细粒度缩放的矩阵乘法，这题应该是比较难的，连 AI 都不能轻易答对，但是只要不断 push 它，就能满分！说实话我都看不懂它在干什么，不过大致可以发现它在缓存上做了很多努力，用什么双缓冲尽量用光显存。

任务 4：Flash Attention 算法，看了 AI 的代码，大概正确理解在干什么，调一调顺序，保证一下正确性就过了，AI 两轮可秒。

### I. Python 笑传之吃吃饼

```bash
hpcgame create -p wm2_8358 -c 1 -m 4 -n mypy -i cr.hpc.lcpu.dev/hpcgame/base:latest
```

任谁都能看出本题是运行时编译 C/C++ 代码，手写实现自动微分。前期做了很多无用功，AI 怎么写都只能写到两倍耗时就止步于此了。

之后我人工发现题目很死，于是提醒 AI 合并同类项，处理三角函数的解析计算后，GPT-5.2 Thinking 给出了非常快的代码，但是我的提交次数所剩无几，倒数第二次还 RE 了。等了半天后，我赌性大发，最后一次提交试了下它尝试修正倒数第二次提交的一个 python 版本问题的代码，交了上去，满分……吓死我了。

### J. 古法 Agent

```shell
hpcgame create -p wm2_8358 -c 32 -m 32 -n podwm -i cr.hpc.lcpu.dev/hpcgame/base:latest
hpcgame create -p yanyuan_8358 -c 32 -m 32 -n podyy -i cr.hpc.lcpu.dev/hpcgame/base:latest
hpcgame create -p yanyuan_8358 -c 31 -m 32 -n podyy31 -i cr.hpc.lcpu.dev/hpcgame/base:latest
```

GPT-5.2 Thinking 莫名奇妙做出来了，做法是因为模式字符串长度固定，全是小写字母，所以列出所有变体，作字典查找……无敌了这想法。

### L. 稀疏注意力

Gemini 3 Flash 给出了最快的代码。另外 NPU 实在搞不定，直接硬编码 baseline 了。

本题得分 126.4 / 200。

### M. 真忙的管理员 - MapReduce SpGEMM

```shell
hpcgame create -p yanyuan_8358 -c 32 -m 32 -n podyy -i cr.hpc.lcpu.dev/hpcgame/mpi:latest

/usr/bin/time -v -p mpirun -np 32 --allow-run-as-root ./mr_spgemm_topk --A data/A --B data/B --topk 32 --out out.txt
mpirun -np 32 --allow-run-as-root ./mr_spgemm_topk --A data_base/A --B data_base/B --topk 3 --out out_baseline_check.txt

python3 scripts/gen_coo.py --M 30000 --K 30000 --N 30000 --densityA 0.01 --densityB 0.01 --parts 48 --seed 7 --out data
python3 scripts/gen_coo.py --M 50000 --K 50000 --N 50000 --densityA 0.005 --densityB 0.005 --parts 48 --seed 7 --out data
python3 scripts/gen_coo.py --M 100000 --K 100000 --N 100000 --densityA 0.0025 --densityB 0.0025 --parts 240 --seed 7 --out data
python3 scripts/gen_coo.py --M 10000 --K 10000 --N 10000 --densityA 0.1 --densityB 0.1 --parts 48 --seed 7 --out data
python3 scripts/gen_coo.py --M 200000 --K 50000 --N 200000 --densityA 0.002 --densityB 0.002 --parts 240 --seed 7 --out data
python3 scripts/gen_coo.py --M 500000 --K 10000 --N 500000 --densityA 0.0032 --densityB 0.0032 --parts 240 --seed 7 --out data
```

Gemini 3 Flash/Pro 联合起来秒了，先测试正确性，然后测试内存炸了或者速度不够就告诉它，它会自己优化（

但是非常可惜，因为这题测试数据特殊构造加上没法测试，时间上并没有满分……本题得分 126.03 / 150。

## 后记

本人最终得分 1702.43 分，总排名第 16，校内排名第 8，是第三次参加此比赛。

这次比赛的问题比之前多很多，体感上来讲这几天也可以说累到爆炸，但如果是从写码的角度来讲那可太轻松了，我基本上没有写几行代码，全是在督促 LLM 干活。

比赛平台问题很大，抢不到资源导致有些题都没法做，然后测评还是经常爆炸，接着最后两题居然还没法测试加测评，像是在摸黑做题一样。比赛题目出得确实不错，难度比之前高多了，但很可惜，AI 的发展已经超出了预期，这些题目完全可以靠 LLM 做出，人力已经比不过了，结果就是大家都 AK，基本没有区分度了。

个人感觉就是很累很难受，但实际根本没写几行代码。有种当老板催手下干活，发现手下干不出，但别的老板已经拿出成功结果的感觉，说到底 LLM 太强拉平了大部分差距，只需要一点基本理解就可以督促它们干得很好了。

还是看看出题组想怎么办吧，明年这比赛到底怎么办呢……

哦对，最后说说 AI 的使用体验。GPT-5.2 Thinking 不愧是付费的，还是挺厉害的，不过思考时间很长是个缺点，而且貌似用多了会退化；Gemini 3 Flash 和 Pro 的体验都很不错，完全可以说是可以免费使用的最强的模型，而且 Flash 更稳定一点，更容易出结果；Copilot 的 codex 都差不多，也算有的时候能给个惊喜的，但是容易犯错，而且用量掉得很快，好像也会退化；Claude 因为限额没怎么用，效果还行，Copilot 上的并不好用。

再最后，这次出分相当的慢，L、M 的测评过完年才出，所以我的这篇文章现在才发出来。很可惜，L、M 确实没法拿到满分，藏测评太阴间了。当然对我而言还有一些更重要的原因，一是我的 Copilot 没有额度了，二是我也不想再做题了，就随便糊了一下，所以并没有强烈 push 自己和 LLM 去做这两题了。
