---
modify_date: "2024-02-08 23:00:00"
title: PKU HPCGame 1st 2024 Writeup
key: hpcgame_2024_writeup
tags: ["HPC", ]
aside:
    toc: true
---

> 这是 PKU HPCGame 2024 的本人题解与思路
>
> [本人代码](https://github.com/Lost-MSth/Lost/tree/main/HPC/HPCGame%202024)
>
> [官方题解与记录](https://github.com/lcpu-club/hpcgame_1st_problems)

## 各题思路

### A. 欢迎参赛！

提交即可拿到账号密码，后面题目测试的必需品

### B. 流量席卷土豆

```bash
srun -p C064M0256G -N4 --ntasks-per-node=4 bash -c 'tshark -r /lustre/shared_data/potato_kingdom_univ_trad_cluster/pcaps/$SLURM_PROCID.pcap -Y ssh -w $SLURM_PROCID.ssh.pcap'
sacct -u $(whoami) --format JobID | tail
mergecap -w merged.pcap *.ssh.pcap
quantum-cracker merged.pcap
```

按照提示写出以上玩意，一行行运行得到作业 ID `3144`，和密钥 `75243d0f7f5cc4e192110fed7aa1e6dab655ea176f8b2a0a47c5a939062710b1`

### C. 简单的编译

直接 copilot 完事（以下代码 tab 被我换成空格了，因为 markdown lint 标黄，众所周知 makefile 需要的是 tab）：

```makefile
ALL: hello_omp hello_cuda hello_mpi

hello_omp: hello_omp.o
    g++ -fopenmp hello_omp.o -o hello_omp

hello_omp.o: hello_omp.cpp
    g++ -fopenmp -c hello_omp.cpp -o hello_omp.o

hello_mpi: hello_mpi.o
    mpic++ hello_mpi.o -o hello_mpi

hello_mpi.o: hello_mpi.cpp
    mpic++ -c hello_mpi.cpp -o hello_mpi.o

hello_cuda: hello_cuda.o
    nvcc hello_cuda.o -o hello_cuda

hello_cuda.o: hello_cuda.cu
    nvcc -c hello_cuda.cu -o hello_cuda.o
```

另一个用 copilot 有点报错，CUDA 有问题，问问 bing 得到修正：

```cmake
cmake_minimum_required(VERSION 3.12)
project(hpcgame)
enable_language(CUDA)

find_package(OpenMP REQUIRED)
find_package(MPI REQUIRED)
find_package(CUDA REQUIRED)

add_executable(hello_omp hello_omp.cpp)
target_link_libraries(hello_omp PRIVATE OpenMP::OpenMP_CXX)

add_executable(hello_mpi hello_mpi.cpp)
target_link_libraries(hello_mpi PRIVATE MPI::MPI_CXX)

include_directories(${CUDA_INCLUDE_DIRS})
add_executable(hello_cuda hello_cuda.cu)
target_link_libraries(hello_cuda ${CUDA_LIBRARIES})
```

### D. 小北问答 CLASSIC

> 这真的不是 CTF 题？

1. 访问[官网数据](https://www.top500.org/lists/green500/2023/11/)，得到答案 65.396
2. 找 Amdahl 公式得到 $$S_n = \frac{1}{(1 - F_e) + F_e / S_e}$$，代入 $F_e = 0.1, S_e = 2$ 得到答案 $105.26\ \%$，代入 $F_e = 0.4, S_e = 1.2$ 得到答案 $107.14\ \%$
3. 查一查知道 Meson、Autoconf 都是类似于 Makefile 和 CMake 的东西，显然最独特的是 GCC
4. 查到[知乎回答](https://www.zhihu.com/question/20188244/answer/14552204)，所以答案是进程、线程、线程
5. $512 / 64 = 8$，另外查一下就知道 Intel 会降频，答案显然
6. 乱选排除了 HIP 和 OpenACC，还剩 CUDA 和 OpenGL，看眼题，好像是强调计算，但 OpenGL 真的可以计算啊，得只能选它了
7. 根据字面意思理解，答案为 `iii,iv`
8. ~~一眼 NVLink~~，那就只能选 HBM 了
9. 一眼 Slurm
10. 查一下发现[知乎专栏](https://zhuanlan.zhihu.com/p/667189867)，是缓存优化

### E. 齐心协力

照着官方文档以及提示中给的 Placement Groups 的文档干了老半天，根本不懂

瞎弄弄吧，写出了个流水线，然后本地跑过了，交上去超时

搜索一下，可能是没指定 CPU 的时候默认单核，于是加上四核限制，但还是超时（猜是没用 Placement Groups 限定导致自动分配太傻了）

于是花了好久好久好久反复调整各种地方的函数 remote 性质，快死了

最最最最坑的是，这题基本没法在集群上测试，环境建立就已经恶心炸了，然后跑的时候慢吞吞的，根本没法出结果，或者说还没出结果 ray 就 down

于是我大胆地把测评当成测试平台了……试了老半天，集群测试每次都挂我都怀疑人生了，一次次提交然后我等了好久，切回去发现有分……无语了呢，核心代码（不完整）如下：

```python
CPU_NUM = 4
pg = placement_group([{"CPU": CPU_NUM} for _ in range(4)], strategy="PACK")
ray.get(pg.ready(), timeout=10)

@ray.remote(num_cpus=CPU_NUM)
def run_A(i, A):
    m = np.load(f"inputs/input_{i}.npy")
    A = ray.get(A)
    m = m @ A
    m = np.maximum(m, 0)
    return ray.put(m)
    
@ray.remote(num_cpus=CPU_NUM)
def run_B(m, B):
    m = ray.get(m)
    B = ray.get(B)
    m = m @ B
    m = np.maximum(m, 0)
    return ray.put(m)

@ray.remote(num_cpus=CPU_NUM)
def run_C(m, C):
    m = ray.get(m)
    C = ray.get(C)
    m = m @ C
    m = np.maximum(m, 0)
    return ray.put(m)

@ray.remote(num_cpus=CPU_NUM)
def run_D(i, m, D):
    m = ray.get(m)
    D = ray.get(D)
    m = m @ D
    m = np.maximum(m, 0)

    np.save(f"outputs/output_{i}.npy", m)
    return

@ray.remote(num_cpus=CPU_NUM)
def load_weight(i):
    return ray.put(np.load(f"weights/weight_{i}.npy"))

def pipe_run(i, A, B, C, D):
    m = run_A.options(scheduling_strategy=PlacementGroupSchedulingStrategy(
        placement_group=pg,
        placement_group_bundle_index=0,
    )).remote(i, A)
    m = run_B.options(scheduling_strategy=PlacementGroupSchedulingStrategy(
        placement_group=pg,
        placement_group_bundle_index=1,
    )).remote(m, B)
    m = run_C.options(scheduling_strategy=PlacementGroupSchedulingStrategy(
        placement_group=pg,
        placement_group_bundle_index=2,
    )).remote(m, C)
    x = run_D.options(scheduling_strategy=PlacementGroupSchedulingStrategy(
        placement_group=pg,
        placement_group_bundle_index=3,
    )).remote(i, m, D)
    return x

def main():
    if not os.path.exists("outputs"):
        os.mkdir("outputs")
    A = load_weight.options(scheduling_strategy=PlacementGroupSchedulingStrategy(
        placement_group=pg,
        placement_group_bundle_index=0,
    )).remote(0)
    B = load_weight.options(scheduling_strategy=PlacementGroupSchedulingStrategy(
        placement_group=pg,
        placement_group_bundle_index=1,
    )).remote(1)
    C = load_weight.options(scheduling_strategy=PlacementGroupSchedulingStrategy(
        placement_group=pg,
        placement_group_bundle_index=2,
    )).remote(2)
    D = load_weight.options(scheduling_strategy=PlacementGroupSchedulingStrategy(
        placement_group=pg,
        placement_group_bundle_index=3,
    )).remote(3)

    x = [pipe_run(i, A, B, C, D) for i in range(100)]
    ray.get(x)
```

> 这题只拿到大部分分，不知道是因为测评机器波动，还是代码可以再优化，标答的方法也差不多，不过是直接在主进程里面加载需要计算的输入矩阵了

### F. 高性能数据校验

现场学了点 MPI，感觉最重要的是进程间通信和进程号，这东西在 python 里我还算熟悉，就是多进程通信

看了眼代码，校验块的计算需要上一块的 SHA-512，方法是在末尾 update 上去，那么一个很直接的思路就是多进程用 `seekg` 取文件然后一起算，在最后等待前一个进程把 SHA-512 发过来，算一下再发送到下一个进程，形成一个循环

难点是处理循环的头和尾部，头肯定是 0 进程，尾部进程要算一下，尾还要处理一下输出，最终可随便过，完整代码见仓库，核心函数如下：

```cpp
int get_checksum(int rank, const size_t file_size, fs::path input_path,
                 uint8_t *obuf) {
    constexpr size_t BUFFER_SIZE = BLOCK_SIZE;  // 读取的缓冲区大小
    int num_block = file_size / BLOCK_SIZE;     // 总块数，向下取整
    int all_num = num_block / CORE_NUM;         // 总大循环个数
    int end_rank = num_block - all_num * CORE_NUM;  // 余数，最后结果在的进程号

    uint8_t prev_md[SHA512_DIGEST_LENGTH];  // 上一次的 sha512 结果
    std::ifstream istrm(input_path, std::ios::binary);  // 读取文件

    if (rank == 0) {
        SHA512(nullptr, 0, prev_md);
    }

    EVP_MD_CTX *ctx = EVP_MD_CTX_new();
    EVP_MD *sha512 = EVP_MD_fetch(nullptr, "SHA512", nullptr);

    for (int i = 0; i < all_num + 1; i++) {
        if (rank >= end_rank && i == all_num) {
            // 最后几个进程的最后一次循环
            // 最后一块不跑，可能不满一块
            break;
        }
        uint8_t buffer[BUFFER_SIZE]{};
        istrm.seekg((rank + CORE_NUM * i) * BUFFER_SIZE);
        istrm.read(reinterpret_cast<char *>(buffer), BUFFER_SIZE);
        EVP_DigestInit_ex(ctx, sha512, nullptr);
        EVP_DigestUpdate(ctx, buffer, BUFFER_SIZE);
        if (rank != 0) {
            // 从前一个进程获取 prev_md
            MPI_Recv(&prev_md, SHA512_DIGEST_LENGTH, MPI_BYTE, rank - 1,
                     rank + CORE_NUM * i - 1, MPI_COMM_WORLD,
                     MPI_STATUS_IGNORE);

            EVP_DigestUpdate(ctx, prev_md, SHA512_DIGEST_LENGTH);
            unsigned int len = 0;
            EVP_DigestFinal_ex(ctx, prev_md, &len);

            // 发送 prev_md 到下一个进程
            int next_rank = rank + 1;
            if (next_rank == CORE_NUM) {
                next_rank = 0;
            }
            MPI_Send(&prev_md, SHA512_DIGEST_LENGTH, MPI_BYTE, next_rank,
                     rank + CORE_NUM * i, MPI_COMM_WORLD);
        } else {
            if (i != 0) {
                // 从最后一个进程获取 prev_md
                MPI_Recv(&prev_md, SHA512_DIGEST_LENGTH, MPI_BYTE, CORE_NUM - 1,
                         rank + CORE_NUM * i - 1, MPI_COMM_WORLD,
                         MPI_STATUS_IGNORE);
            }
            EVP_DigestUpdate(ctx, prev_md, SHA512_DIGEST_LENGTH);
            unsigned int len = 0;
            EVP_DigestFinal_ex(ctx, prev_md, &len);

            // 发送 prev_md 到下一个进程
            MPI_Send(&prev_md, SHA512_DIGEST_LENGTH, MPI_BYTE, 1, CORE_NUM * i,
                     MPI_COMM_WORLD);
        }
    }

    if (rank == end_rank) {
        // 最后一个进程处理剩余数据

        int pre_rank = rank - 1;
        if (pre_rank == -1) {
            pre_rank = CORE_NUM - 1;
        }
        MPI_Recv(&prev_md, SHA512_DIGEST_LENGTH, MPI_BYTE, pre_rank,
                 rank - 1 + CORE_NUM * all_num, MPI_COMM_WORLD,
                 MPI_STATUS_IGNORE);

        size_t offset = num_block * BLOCK_SIZE;
        if ((file_size - offset) != 0) {
            // 有不完整块需要处理
            uint8_t data[file_size - offset]{};
            istrm.seekg(offset);
            istrm.read(reinterpret_cast<char *>(data), file_size - offset);

            uint8_t buffer[BLOCK_SIZE]{};

            EVP_DigestInit_ex(ctx, sha512, nullptr);

            std::memcpy(buffer, data, file_size - offset);

            EVP_DigestUpdate(ctx, buffer, BLOCK_SIZE);
            EVP_DigestUpdate(ctx, prev_md, SHA512_DIGEST_LENGTH);

            unsigned int len = 0;
            EVP_DigestFinal_ex(ctx, prev_md, &len);
        }
        std::memcpy(obuf, prev_md, SHA512_DIGEST_LENGTH);
    }
    EVP_MD_CTX_free(ctx);
    EVP_MD_free(sha512);

    return end_rank;
}
```

### G. 3D 生命游戏

咳，不会 CUDA，速成了一下，然后找了个网上的代码改了改，扔上去拿了个 2 分（

手动重写一遍，优化了循环展开和位运算替代除法和取模，然后尽力去掉各种分支判断，Nsight 跑一遍发现 SM Throughout 达到了 0.8 以上，自信提交，拿了 33 分，交换 x 和 z，多了两分，疑似评测波动

看了看，还没用到 shared 显存，如果要用的话，整个代码就必须变成 3 维 block 版本，然后改了改，跑一下，笑死，慢了十倍，一看就知道是显存复制到共享时，为了判断边界用了过多的 if 语句导致的（

> 标答也看不懂，等讲解.jpg

### H. 矩阵乘法

openmp 扔上去，只有 13 分，抄了下[网上](https://siboehm.com/articles/22/Fast-MMM-on-CPU)的代码，扔上去，变成了 21 分

手动重写了一遍，用了 AVX-512、循环展开、openmp、分块矩阵优化，调了调参数，分块 256 且循环展开 8 的时候表现不错，扔上去拿了 31 分（

貌似加点微内核，来点汇编可以起飞，但我不会写，又不让我抄……

> 其实最后我发现交换行列顺序可以快四倍左右，于是我想了半天，B 矩阵可能要按列优先会很快，但是我第一时间觉得转置矩阵耗时很多，于是把这想法抛之脑后了哈哈哈哈
>
> 标答看起来和网上的没差多少，具体细节还是要等解释

### I. Logistic 方程

上 OpenMP 和 AVX-512 可以拿到大半分数，问了问 copilot，写出这个：

```cpp
void itv(double r, double* x, int64_t n, int64_t itn) {
    const __m512d r_vec = _mm512_set1_pd(r);
    const __m512d one_vec = _mm512_set1_pd(1.0);
    __m512d x_vec;

#pragma omp parallel for
    for (int64_t i = 0; i < n; i += 8) {
        x_vec = _mm512_load_pd(&x[i]);

        for (int64_t j = 0; j < itn; j++) {
            x_vec = _mm512_mul_pd(_mm512_mul_pd(r_vec, x_vec),
                                  _mm512_sub_pd(one_vec, x_vec));
        }
        _mm512_store_pd(&x[i], x_vec);
    }
}
```

当然读数据要对齐 `x = (double*)_mm_malloc(n * 8, 64);`

这样只能拿 73 分，还需要优化到四分之一时间，简单的细节优化肯定不行，我想了想循环展开，但是编译选项里是有 `-O3` 的，所以想了半天决定放弃……吗？我突然觉得可以试试，结果发现特么的快了一倍，多叠加几次就能 AC：

```cpp
void itv(double r, double* x, int64_t n, int64_t itn) {
    const __m512d r_vec = _mm512_set1_pd(r);
    const __m512d one_vec = _mm512_set1_pd(1.0);
    __m512d x_vec, y_vec, z_vec, w_vec, a_vec, b_vec, c_vec, d_vec;

#pragma omp parallel for schedule(dynamic, 64)
    for (int64_t i = 0; i < n; i += 64) {
        x_vec = _mm512_load_pd(&x[i]);
        y_vec = _mm512_load_pd(&x[i+8]);
        z_vec = _mm512_load_pd(&x[i+16]);
        w_vec = _mm512_load_pd(&x[i+24]);
        a_vec = _mm512_load_pd(&x[i+32]);
        b_vec = _mm512_load_pd(&x[i+40]);
        c_vec = _mm512_load_pd(&x[i+48]);
        d_vec = _mm512_load_pd(&x[i+56]);

        for (int64_t j = 0; j < itn; j++) {
            x_vec = _mm512_mul_pd(_mm512_mul_pd(x_vec, r_vec),
                                  _mm512_sub_pd(one_vec, x_vec));
            y_vec = _mm512_mul_pd(_mm512_mul_pd(y_vec, r_vec),
                                  _mm512_sub_pd(one_vec, y_vec));
            z_vec = _mm512_mul_pd(_mm512_mul_pd(z_vec, r_vec),
                                  _mm512_sub_pd(one_vec, z_vec));
            w_vec = _mm512_mul_pd(_mm512_mul_pd(w_vec, r_vec),
                                  _mm512_sub_pd(one_vec, w_vec));
            a_vec = _mm512_mul_pd(_mm512_mul_pd(a_vec, r_vec),
                                  _mm512_sub_pd(one_vec, a_vec));
            b_vec = _mm512_mul_pd(_mm512_mul_pd(b_vec, r_vec),
                                  _mm512_sub_pd(one_vec, b_vec));
            c_vec = _mm512_mul_pd(_mm512_mul_pd(c_vec, r_vec),
                                  _mm512_sub_pd(one_vec, c_vec));
            d_vec = _mm512_mul_pd(_mm512_mul_pd(d_vec, r_vec),
                                  _mm512_sub_pd(one_vec, d_vec));
        }
        _mm512_store_pd(&x[i], x_vec);
        _mm512_store_pd(&x[i+8], y_vec);
        _mm512_store_pd(&x[i+16], z_vec);
        _mm512_store_pd(&x[i+24], w_vec);
        _mm512_store_pd(&x[i+32], a_vec);
        _mm512_store_pd(&x[i+40], b_vec);
        _mm512_store_pd(&x[i+48], c_vec);
        _mm512_store_pd(&x[i+56], d_vec);
    }
}
```

### J. H-66

我一看，诶，这不我毕设里的吗……虽然我用的是 python 的稀疏矩阵、python + CUDA、多粒子 Pauli 群算法，成功水了篇文章，但这题好像只让我用 cpp 优化稀疏矩阵，我看了眼，哦哦，这初始态是个向量，哎呀我那边是个矩阵，算着算着会空间爆炸（

因为我知道性能瓶颈在哪，就是那个矩阵乘向量，所以直接优化完事，看着能 openmp 的就来一套，然后看关键函数 `mmv`，稀疏矩阵乘法最佳应该是 CSR 行压缩矩阵，比较适合并行，然后我就哼哧哼哧把那玩意从 COO 改成 CSR，再并行计算，太棒了，跑出了惊人的 14 分（耗时一分半多）

分段计时发现，性能瓶颈多了个 COO 转 CSR 的第一个排序，需要先排序才能正确转换（或者用密集矩阵中转，可是我怕内存爆炸，毕设深有体会.jpg）

然后头疼了……突发奇想直接 COO 也不是不行，反正数值不稳定，直接 openmp，也不怕它线程竞争了，跑出来真挺快，而且数值基本对上了，但是悲惨的是评测算错

脑子烧了，该歇歇了，测试数据的粒子数只有 12 和 14，真不大的说，毕竟我毕设用的是 20……

脑子还是不好使，直接都能搜到 scipy 的 [coo_tocsr 实现](https://github.com/scipy/scipy/blob/3b36a57/scipy/sparse/sparsetools/coo.h#L34)我为什么要自己写……这还是个牛皮的线性复杂度，起飞了好吗（笑死拿了 31 分

核心函数 `mmv` 上个 AVX512 优化试试，锵锵，36 分，多加点 AVX512，调一下 openmp 的 share，好，42 分了（没救了我真的调不动了

此时对 `mmv` 进行总计时，发现大概在 $$20 \mathrm{s}$$ 左右，于是我想看看别的部分能怎么优化，在 `act` 函数中，因为 Hamiltonian 是厄米的，题目又告诉我是实对称的，所以可以交换一下矩阵行列顺序，我在想，是不是可以直接在生成时变成 CSR，等会好像有一种优化的 CSR，多占点空间，分离行依赖然后就可以并行了！太棒了，一顿操作以后得到了 48 分（

现在有好几秒不知道怎么多出来的时间（计时不出来），我猜是线程开销，寄了呐

> 标答依旧没看懂（

### ~~K. 光之游戏~~

丢给软件分析，一步步测试时间，然后看出了问题所在，在渲染相机的画面的时候，用 z buffer 算法遍历像素点计算了面的遮挡关系，但是这怎么优化我是一点也不会，在丢失精度的情况下采用多线程跳步算法，让速度快了约 30 倍，但是仍然够不到基本分线

> 如果没理解错，标答是将遍历像素点的范围缩小了，应该是利用了几何计算，那玩意看着太复杂了就没心思细看了

### L. 洪水 困兽

~~emmm 迷惑题，我就加了个 `#pragma omp parallel for` 就 AC 了……难不成聪明的编译器自动规约了？？？~~ 好吧原来是测评 bug

实际上，本地跑的，手动规约超级慢，还不如单线程，这题真是迷惑

弄了半天，甚至手写了使用数组的规约，还是不清楚为什么多线程这么慢……直到我指定了线程数……

我去居然有个最佳线程数，上集群调试了一万年，发现使用自定义规约，并限制线程数为 7 是最快的（共 64 核心），于是有：

```cpp
#define THREADS 7

#pragma omp declare reduction(vsum : std::vector<double> : std::transform( \
        omp_out.begin(), omp_out.end(), omp_in.begin(), omp_out.begin(),   \
            std::plus<double>()))                                          \
    initializer(omp_priv = decltype(omp_orig)(omp_orig.size()))

#pragma omp parallel for reduction(vsum : velocityu, velocityv, weightu, \
                                       weightv) num_threads(THREADS)
    for ...... // omit loop
```

### M. RISC-V OPENBLAS

你怎么觉得我会这个的？

好吧我试试，看看机器里给的 openblas，make 一下，哎确实在 test 中报错了

看眼官方仓库，有个 riscv 分支，看眼 commit 好像有什么 merge，点进去发现一个 [fork](https://github.com/kseniyazaytseva/OpenBLAS/tree/riscv-rvv07)，他说了能在那啥啥上编译并通过测试，我就信他

使用 `make TARGET=C910V CC=riscv64-linux-gnu-gcc-10 FC=riscv64-linux-gnu-gfortran-10` 编译，然后等啊等啊等，等不了了卡在测试了太慢了（

在 `/opt/OpenBLAS/` 目录中找到所需文件下载回来装一起打包压缩提交

估计是没分的（

> 拿了编译的 10 分，忘记交题给的 openblas 了，那样子貌似还有 3 分测试分，好吧，原地垫底（

### ~~N. RISC-V LLM~~

哈？

## 后记

本人最终得分 872.4 分，总排名第 26，校内排名第 10，考虑到第一次试水，感觉还不错，希望下一届也有时间参加

不过比赛平台各种问题，题目普通没趣味，考查点太少而且区分度较低，这可太值得吐槽了，我在想这种类似于 CTF 的比赛形式是不是不太适合于 HPC 呢
