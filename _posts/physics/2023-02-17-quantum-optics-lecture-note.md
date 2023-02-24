---
title: 《量子光学与量子信息》课程笔记
key: quantum_optics_lecture_note
tags: ["physics"]
modify_date: "2023-02-21 17:30:00"
aside:
    toc: true
---

> 课程复习笔记，对着 PPT 和书[^1]整理的，课程参考书是那本著名的量子光学[^2]  
> 数位板手写效果不好，想起来 blog 利用 Mathjax 可以放公式，故试试  
> 公式中可能会省略算符的 hat

<!--more-->

[^1]: 量子光学，郭光灿、周祥发 著，科学出版社，2022年1月第一版
[^2]: Quantum Optics, Marlan O.Scully and M.Suhail Zubairy, Cambridge University Press

## 引言

### 量子光学历史部分

- 1901年，Planck，黑体辐射谱，发现量子
- **1905年，Einstein，光电效应，发现光子**
- 1917年，Einstein，自发和受激辐射的唯象理论
- 1927年，Dirac，辐射场量子化
  > 此时，量子力学理论已经建立
- 1940~1960年，Schwinger 和 Feynman，量子电动力学 QED
- 1950~1960年，Hanbury-Brown 和 Twiss实验，强度干涉法
- 1963年，Glauber，光学相干理论
  > 上面两个是量子光学的里程碑
- 1960~1970年，激光量子理论，原子和场相互作用理论
- 1970~1990年，Ashkin, C. Cohen Tannoudji, and S.Chu，冷原子激光捕获和冷却
- 1990~2000年，Cornell, Weimann, and Ketterle，玻色爱因斯坦凝聚态物质 BEC

### 量子信息学

#### 构成

- 量子力学
- 经典信息论
- 计算机科学
- 量子通信
  - 量子超密编码
  - 隐形传态，量子密钥分配等
- 量子计算
  - 超快速计算
  - 模拟量子系统等
- 量子力学基本问题

物理实现：量子光学、原子分子物理、凝聚态物理和材料科学、低温物理学、光电子技术等

信息的本质是物理的
: 信息归根结底是编码在物理态中的东西。信息源于物理态在时空中的变化，信息传输是编码物理态的传输，信息处理是被称为“计算机”的物理系统态的有控制（按算法要求）的演化，信息的提取则是对编码物理态的测量。

用量子物理态编码（表示〕信息，并以量子物理学规律为基础研究信息存储、传输和信息处理的科学就是量子信息学。

#### 产生背景

- 经典计算机不能模拟粒子数大的量子系统
- Moore 定律
- 没有绝对安全的通信
- 量子非局域性的本质等量子理论的不完全理解

#### 发展

- 1980年，Benioff 最早用量子力学来描述可逆计算机，但是没有利用量子力学的本质特性
- 1982、1985年，Richard Feynman 最早提出量子计算的概念
- 1985年，David Deutsch，量子 Turing 机模型
- 1989年，量子计算机的量子网络模型，量子计算机的通用逻辑门
- 1984年，Charles Bennett 和 Gilles Brassard 提出利用极化光子非正交态建立量子密钥的方案，即 BB84 方案
- 1992、1993年，Charles Bennett 提出量子超密编码，量子隐态传输方案
- 1992年，IBM-Montreal 小组首次进行 BB84 原型实验
- 1994年，Peter Shor 发现了分解大数质因子的量子算法
- 1995~1996年，Peter Shor，Andrew Steane，量子纠错和容错计算方法
- 1995年，Cirac 和 Zoller 提出离子阱量子计算机方案，同年实现离子阱方案 CNOT 门计算
  - 2003年，奥地利 Innsbruck 大学首次实现了 Cirac 和 Zoller 提出的 CNOT 门
- 1996年，Grover 随机数据库搜索的量子算法
- 1997年，提出利用核磁共振 NMR 技术实现量子计算的思想
  - 2001年，斯坦福大学用 NMR 量子计算机成功分解了数字15的质因子
- 1996、1997年，奥地利 Innsbruck 大学的研究小组，实验实现了量子超密编码和量子隐形传态

***

## 量子力学基础

### 量子态

> 这还能不会？格里菲斯请（

坐标与动量的不确定性关系：$\Delta x \cdot \Delta p_x \geq \frac{\hbar}{2}$

1. 量子力学态由 Hilbert 空间中的矢量描写
2. 叠加原理
3. 每一个力学量用一个线性厄米算子表示，算子的所有本征态构成系统所在 Hilbert 空间的一组正交完备基

线性空间
: 全体元素构成可交换加法群+对数乘满足分配率和结合律

内积空间
: 线性空间+定义内积

Hilbert 空间
: 线性、完备、复内积空间

### 纯态和混合态

#### 纯态

可用单一态矢量描述的态，比如$\ket{\alpha}$、$\ket{\Psi} = \frac{1}{\sqrt{2}} \qty(\ket{0} + \ket{1})$

对于每个纯态都可定义一个线性算子：投影算子$\hat{\rho} = \ketbra{\alpha}$，具有以下性质：

1. 厄米性 $\hat{\rho}^\dagger = \hat{\rho}$
2. 正定性 $\ev{\hat{\rho}}{\Phi} \geq 0$
3. 幺迹性 $\Tr{\hat{\rho}} = 1$（相对任意正交归一基）
4. 幂等性 $\hat{\rho}^2 = \hat{\rho}$
5. 任意力学量算子 $\hat{F}$ 在态 $\ket{\Psi}$ 的平均值可用投影算子表示为 $\bar{F} = \ev{\hat{F}}{\Psi} = \Tr(\hat{\rho} \hat{F})$

#### 混合态

系统由两个或两个以上的纯态成分，各纯态间不存在可以检测出的相位关系（各个纯态概率确定，相位不确定）

密度算子：$\hat{\rho} = \sum_{i=1}^{n} \ket{\Psi_i} p_i \bra{\Psi_i}$，具有以下性质：

1. 厄米性，注意到如果 $\{\Psi_i\}$ 满足正交归一化条件，那么它就是完备本征函数系，而 $\{p_i\}$ 就是本征值谱
2. 正定性
3. 幺迹性
4. 任意力学量算子 $\hat{F}$ 在混态中的平均值可用密度算子表示为 $\bar{F} = \sum_{i=1}^{n} p_i \ev{\hat{F}}{\Psi_i} = \Tr(\hat{\rho} \hat{F})$

密度矩阵
: 纯态的投影算子/混态的密度算子在某组基下的矩阵，**密度矩阵的秩为1当且仅当是纯态**

#### 密度矩阵的纯态分解

$$
\hat{\rho} = \sum_{i=1}^{n} p_i \ketbra{\Psi_i} = \sum_{j=1}^{n} \lambda_j \ketbra{\phi_i}
$$

设 $m > n$ 则有
$$
\sqrt{p_i} \ket{\Psi_i} = \sum_{j=1}^{m} U_{ij} \sqrt{\lambda_j} \ket{\phi_j}, \  i = 1, 2, \cdots, m
$$
其中，$U$ 是一个m阶幺正方阵

1. 这里的幺正变换不是基矢到基矢的变换，因为幺正变换作用在一组非归一的态上了
2. 变换前后幺正矩阵本身不变
3. 各个纯态不一定正交
4. 同一密度矩阵的任何两组纯态分解都可通过幺正变换联系
5. 一个密度矩阵有无穷种纯态分解

### 量子不可克隆定理 No-Cloning Theorem

克隆 Cloning
: 不改变原来的量子态，在新系统中产生一个完全相同的量子态

1. 如果 $\ket{\alpha}$ 和 $\ket{\beta}$ 是两个不同的非正交态，不存在一个物理过程可以做出两者的完全拷贝，但能以一定几率克隆
2. 假设 $\ket{\alpha}$ 是一个**未知**量子态，不存在一个物理过程能完全拷贝它
3. 要从非正交量子态中获取信息，而不扰动这些态是不可能的

> 上述证明不难，全是取两个任意态，用同一幺正变换作用在各个态和其环境上，其中一个取厄米共轭后拼起来，反证即可

***

## 辐射场量子理论

### 自由电磁场量子化

#### Mode Expansion

对自由电磁场波动方程 $$\laplacian{\vb*{E}} - \frac{1}{c^2} \pdv[2]{\vb*{E}}{t} = 0$$，在一个盒子里做模式展开有

$$
E_x(z, t) = \sum_j A_j q_j(t) \sin(k_j z), \ A_j = \sqrt{\frac{2 v_j^2 m_j}{V \varepsilon_0}}, \ v_j = c k_j
$$

$$
H_y(z, t) = \sum_j A_j \frac{\dot{q}_j(t) \varepsilon_0}{k_j} \cos(k_j z)
$$

易得哈密顿量

$$
H = \frac{1}{2} \iiint_V \dd{V} \qty(\varepsilon_0 E_x^2 + \mu_0 H_y^2) = \sum_j \qty(\frac{p_j^2}{2 m_j} + \frac{1}{2} m_j v_j^2 q_j^2), \ p_j = m_j \dot{q}_j
$$

可以发现场的哈密顿量等价于一些独立谐振子能量的和，说明**场的每一个模式都可以和一个简单的单频量子化谐振子相对应**

#### 正则量子化

量子化条件：$\comm{q_j}{p_i} = \ii \hbar \delta_{ij}, \ \comm{q_i}{q_j} = \comm{p_i}{p_j} = 0$

正则变换：

$$
\begin{aligned}
a_j \ee^{-\ii v_j t} &= \frac{1}{\sqrt{2 m_j \hbar v_j}} \qty(m_j v_j q_j + \ii p_j) \\
a_j^\dagger \ee^{\ii v_j t} &= \frac{1}{\sqrt{2 m_j \hbar v_j}} \qty(m_j v_j q_j - \ii p_j)
\end{aligned}
$$

新的量子化条件变为：$\comm{a_j}{a_i^\dagger} = \delta_{ij}, \ \comm{a_i}{a_j} = \comm{a_i^\dagger}{a_j^\dagger} = 0$

场的新哈密顿量变为：$H = \hbar \sum_j v_j \qty(a_j^\dagger a_j + \frac{1}{2})$

现在，电磁场变为：

$$
E_x(z, t) = \sum_j \varepsilon_j \qty(a_j \ee^{-\ii v_j t} + a_j^\dagger \ee^{\ii v_j t}) \sin(k_j z), \ \varepsilon_j = \sqrt{\frac{\hbar v_j}{V \varepsilon_0}}
$$

$$
H_y(z, t) = -\ii \varepsilon_0 c \sum_j \varepsilon_j \qty(a_j \ee^{-\ii v_j t} - a_j^\dagger \ee^{\ii v_j t}) \cos(k_j z)
$$

上述均是一维情况，三维情况下，考虑边长$L$立方体（周期性边界条件），波矢$\vb*{k} \equiv (k_x, k_y, k_z)$，其中$k_x = 2 \pi n_x / L \ (n_x \in Z), \ \cdots$，有：

$$
\vb*{E}(\vb*{r}, t) = \sum_{\vb*{k}} \vb*{e}_k \varepsilon_{\vb*{k}} \alpha_{\vb*{k}} \ee^{- \ii v_{\vb*{k}} t + \ii \vb*{k} \vdot \vb*{r}} + c.c. \ , \ \vb*{k} \vdot \vb*{e}_k = 0
$$

$$
\vb*{H}(\vb*{r}, t) = \frac{1}{\mu_0} \sum_{\vb*{k}} \frac{\vb*{k} \cp \vb*{e}_k}{v_{\vb*{k}}} \varepsilon_{\vb*{k}} \alpha_{\vb*{k}} \ee^{- \ii v_{\vb*{k}} t + \ii \vb*{k} \vdot \vb*{r}} + c.c.
$$

接下来正则量子化过程略

### Fock State

> 这太熟了（

$$
H \ket{n} = \hbar \nu \qty(a^\dagger a + \frac{1}{2}) \ket{n} = E_n \ket{n}
$$

$$
\begin{aligned}
a \ket{n} &= \sqrt{n} \ket{n-1} \\
a^\dagger \ket{n} &= \sqrt{n+1} \ket{n+1}
\end{aligned}
$$

$$
\ket{n} = \frac{\qty(a^\dagger)^n}{\sqrt{n!}} \ket{0} ,\  \sum_{n = 0}^{\infty} \ketbra{n} = 1
$$

单模线性极化场算符：$$E(\vb*{r}, t) = \varepsilon a \ee^{- \ii \nu t + \ii \vb*{k} \vdot \vb*{r}} + h.c.$$

注意有 $\ev{E}{n} = 0$ 和 $\ev{E^2}{n} = 2 \varepsilon^2 \qty(n + \frac{1}{2})$，这说明真空非空

### 相干态

> Baker-Hausdorff 公式：
>
> $$
> \ee^{A} B \ee^{-A} = B + \comm{A}{B} + \frac{1}{2!} \comm{A}{\comm{A}{B}} + \cdots
> $$
>
> $$
> \ee^{A + B} = \ee^{-\frac{1}{2} \comm{A}{B}} \ee^{A} \ee^{B} = \ee^{\frac{1}{2} \comm{A}{B}} \ee^{B} \ee^{A} , \  \text{if} \  \comm{\comm{A}{B}}{A} = \comm{\comm{A}{B}}{B} = 0
> $$

相干态 Coherent state
: 湮灭算符的本征态，即$a \ket{\alpha} = \alpha \ket{\alpha}$，其中$\alpha \in C$

另一个等价定义：

$$
\ket{\alpha} = D(\alpha) \ket{0} = \ee^{- \abs{\alpha}^2 / 2} \sum_{n=0}^{\infty} \frac{\alpha^n}{\sqrt{n!}} \ket{n}
$$

其中位移算符定义为

$$
\begin{aligned}
  D(\alpha) &= \ee^{\alpha a^\dagger - \alpha^* a} \\
  &= \ee^{-\abs{\alpha}^2 / 2} \ee^{\alpha a^\dagger} \ee^{-\alpha^* a}
\end{aligned}
$$

位移算符性质：

$$
D^\dagger(\alpha) = D(-\alpha) = \qty[D(\alpha)]^{-1}
$$

$$
\begin{aligned}
  D^{-1}(\alpha) a D(\alpha) &= a + \alpha \\
  D^{-1}(\alpha) a^\dagger D(\alpha) &= a^\dagger + \alpha^*
\end{aligned}
$$

1. 相干态光子数满足 Poisson 分布
2. 不同相干态之间不正交，但所有相干态的集合是超完备的
3. 相干态满足最小不确定关系  
在$\alpha$复平面内，相干态的起伏可用两个厄米算符$X_1 = \qty(a + a^\dagger)/2$和$X_2 = \qty(a - a^\dagger) / (2 \ii)$来刻画，有对易关系$\comm{X_1}{X_2} = \ii / 2$，易知$\qty(\Delta X_1)^2 = \qty(\Delta X_2)^2 = 1 / 4$

### 压缩相干态

#### 单模压缩态

压缩算符：$$S(\xi) = \exp(\frac{\xi^*}{2}  a^2 - \frac{\xi}{2}  {a^{\dagger}}^2), \  \xi = r \exp(\ii \theta)$$，其中，$r$为压缩参数，$\theta$为压缩角

压缩算符性质：

$$
S^\dagger(\xi) = S^{-1}(\xi) = S(-\xi)
$$

$$
\begin{aligned}
  S^\dagger(\xi) a S^(\xi) &= a \cosh{r} - a^\dagger \ee^{\ii \theta} \sinh{r} \\
  S^\dagger(\xi) a^\dagger S^(\xi) &= a^\dagger \cosh{r} - a \ee^{- \ii \theta} \sinh{r}
\end{aligned}
$$

压缩真空态$\ket{0, \xi} = S(\xi) \ket{0}$，对应初始真空态按照双光子哈密顿量演化的系统状态

压缩相干态$\ket{\alpha, \xi} = S(\xi) D(\alpha) \ket{0}$，或者$\ket{\alpha, \xi} = D(\alpha) S(\xi) \ket{0}$，这根据具体文献有所不同，两种定义只在相干振幅有一些变化

计算不确定度，取主轴方向

$$
\begin{aligned}
  Y_1 &= X_1 \cos{\frac{\theta}{2}} + X_2 \sin{\frac{\theta}{2}} \\
  Y_2 &= X_2 \cos{\frac{\theta}{2}} - X_1 \sin{\frac{\theta}{2}}
\end{aligned}
$$

易知$\qty(\Delta Y_1)^2 = \frac{1}{4} \ee^{-2r}, \ \qty(\Delta Y_2)^2 = \frac{1}{4} \ee^{2r}, \ \Delta Y_1 \Delta Y_2 = \frac{1}{4}$，故涨落分布呈现椭圆形

#### 双模压缩态

包含两个独立模式，场算符不为0的对易关系为$\comm{a_1}{a_1^\dagger} = \comm{a_2}{a_2^\dagger} = 1$

双模压缩算符$$S_{12}(\xi) = \exp(\xi^*  a_1 a_2 - \xi a_1^\dagger a_2^\dagger), \  \xi = r \exp(\ii \theta)$$

双模压缩算符性质：

$$
S_{12}^\dagger(\xi) = S_{12}^{-1}(\xi) = S_{12}(-\xi)
$$

$$
\begin{aligned}
  S_{12}^\dagger(\xi) a_{i} S_{12}(\xi) &= a_i \cosh{r} - a_{\bar{i}}^\dagger \ee^{\ii \theta} \sinh{r} \\
  S_{12}^\dagger(\xi) a_{i}^\dagger S_{12}(\xi) &= a_{i}^\dagger \cosh{r} - a_{\bar{i}} \ee^{- \ii \theta} \sinh{r} \\
  (i, \bar{i}) & \in \{(1, 2), (2, 1)\}
\end{aligned}
$$

双模压缩真空态$\ket{\xi} = S_{12}(\xi) \ket{0, 0}$

双模压缩相干态$\ket{\alpha, \beta, \xi} = D(\alpha_1) D(\alpha_2) S_{12}(\xi) \ket{0, 0}$

***

## 光场相干性与干涉

> 感觉应该不考 :(

### 量子相关函数

电场算符可以拆成正频部分和负频部分的组合形式$$\hat{E}(\vb*{r}, t) = \hat{E}^{(+)}(\vb*{r}, t) + \hat{E}^{(-)}(\vb*{r}, t)$$

假定电场线偏振，光的吸收过程中，光子发生湮灭，故只有正频部分起作用

理想光子探测器的光子计数率（平均光强）或者说是系统的总跃迁概率为：

$$
\begin{aligned}
  w_1(\vb*{r}, t) &= \sum_{f} \abs{\mel{f}{E^{(+)}(\vb*{r}, t)}{i}}^2 = \sum_{f} \mel{i}{E^{(-)}(\vb*{r}, t)}{f} \mel{f}{E^{(+)}(\vb*{r}, t)}{i} \\
  &= \ev{E^{(-)}(\vb*{r}, t) E^{(+)}(\vb*{r}, t)}{i}
\end{aligned}
$$

上式$\ket{i}$和$\ket{f}$是系统初末态，如果场初态非纯态，则可以用密度矩阵改写为：

$$
w_1(\vb*{r}, t) = \Tr[\rho E^{(-)}(\vb*{r}, t) E^{(+)}(\vb*{r}, t)]
$$

光场在不同时空点上的**一阶相关函数**：

$$
G^{(1)}(\vb*{r_1}, \vb*{r_2}; t_1, t_2) = \Tr[\rho E^{(-)}(\vb*{r_1}, t_1) E^{(+)}(\vb*{r_2}, t_2)] = \langle E^{(-)}(\vb*{r_1}, t_1) E^{(+)}(\vb*{r_2}, t_2) \rangle
$$

如果有时间平移不变性，则可取$\tau = t_2 - t_1$，从而有$$G^{(1)}(\vb*{r_1}, \vb*{r_2}; t_1, t_2) = G^{(1)}(\vb*{r_1}, \vb*{r_2}; \tau)$$

令$$X_i = \{\vb*{r_i}, t_i\}$$，归一化，得一阶相关度：

$$
g^{(1)}(X_1, X_2) = \frac{\langle E^{(-)}(X_1) E^{(+)}(X_2) \rangle}{\sqrt{\langle E^{(-)}(X_1) E^{(+)}(X_1) \rangle \langle E^{(-)}(X_2) E^{(+)}(X_2) \rangle}}
$$

两个探测器的探测到两个时空点处的光子的联合概率为

$$
w_2(\vb*{r_1}, \vb*{r_2}; t_1, t_2) = \Tr[\rho E^{(-)}(\vb*{r_1}, t_1) E^{(-)}(\vb*{r_2}, t_2) E^{(+)}(\vb*{r_2}, t_2) E^{(+)}(\vb*{r_1}, t_1)]
$$

光场在不同时空点上的**二阶相关函数**：

$$
G^{(2)}(X_1, X_2, X_3, X_4) = \Tr[\rho E^{(-)}(X_1) E^{(-)}(X_2) E^{(+)}(X_3) E^{(+)}(X_4)] = \langle E^{(-)}(X_1) E^{(-)}(X_2) E^{(+)}(X_3) E^{(+)}(X_4) \rangle
$$

归一化，二阶相干度：

$$
g^{(2)}(X_1, X_2, X_2, X_1) = \frac{\langle E^{(-)}(X_1) E^{(-)}(X_2) E^{(+)}(X_2) E^{(+)}(X_1) \rangle}{\langle E^{(-)}(X_1) E^{(+)}(X_1) \rangle \langle E^{(-)}(X_2) E^{(+)}(X_2) \rangle}
$$

对于单模情况，在空间固定位置 $$\vb*{r}$$ 处，相干度可以化简为：

$$
g^{(1)}(\tau) = \frac{\langle a^\dagger(t + \tau) a(t) \rangle}{\langle a^\dagger a \rangle}
$$

$$
g^{(2)}(\tau) = \frac{\langle a^\dagger(t) a^\dagger(t + \tau) a(t + \tau) a(t) \rangle}{\langle a^\dagger a \rangle^2}
$$

### 一阶相干度与杨氏双缝干涉

场强 $$E^{(+)}(\vb*{r}, t) = u_1 E^{(+)}(\vb*{r_1}, t - t_1) + u_2 E^{(+)}(\vb*{r_2}, t - t_2)$$

平均光强：

$$
\begin{aligned}
  \expval{I(\vb*{r}, t)} &= \expval{E^{(-)}(\vb*{r}, t) E^{(+)}(\vb*{r}, t)} \\
  &= \expval{I^{(1)}(\vb*{r})} + \expval{I^{(2)}(\vb*{r})} + 2 \sqrt{\expval{I^{(1)}(\vb*{r})}\expval{I^{(2)}(\vb*{r})}} \abs{g^{(1)}(\vb*{r_1}, t_1; \vb*{r_2}, t_2)} \cos{[k(s_1 - s_2) + \phi_0]}
\end{aligned}
$$

条纹可见度（最大最小光强差和比）：

$$
U = \frac{2\sqrt{\expval{I^{(1)}(\vb*{r})}\expval{I^{(2)}(\vb*{r})}}}{\expval{I^{(1)}(\vb*{r})} + \expval{I^{(2)}(\vb*{r})}} \abs{g^{(1)}(\vb*{r_1}, t_1; \vb*{r_2}, t_2)}
$$

### 二阶相干度和 Hanbury Brown-Twiss 实验

1. $$g^{(2)}(\tau) \leq g^{(2)}(0)$$ 时，光子群聚，热相干光
2. $$g^{(2)}(\tau) > g^{(2)}(0)$$ 时，光子反群聚

不同的光子分布

1. $$g^{(2)}(0) < 1$$ 时，亚 Poissonian 分布，比如粒子数态
2. $$g^{(2)}(0) = 1$$ 时，Poissonian 分布，比如相干态
3. $$g^{(2)}(0) > 1$$ 时，超 Poissonian 分布，比如热光场

> 下略，反正跟二阶相干度有关就完事了（

### Hong-Ou-Mandel 干涉仪

> 压缩光场的平均零拍测量什么的……

***

## 光场与原子相互作用

### 半经典理论

1. 原子被视作量子力学的二能级系统
2. 电磁场视作经典单模场

具有局部规范不变性的哈密顿量是：

$$
H = \frac{1}{2 m} \qty[\vb*{P} - q \vb*{A}(\vb*{r}, t)]^2 + q \Phi(\vb*{r}, t) + V(\vb*{r})
$$

#### 电偶极近似

要求光与原子相互作用时近似在原子位置 $$\vb*{r_0}$$ 附近，故矢势均匀，即 $$\vb*{A}(\vb*{r}, t) \simeq \vb*{A}(\vb*{r}_0, t)$$

哈密顿量分解，其相互作用部分为

$$
H_{I} = - e \vb*{r} \vdot \vb*{E}(\vb*{r}_0, t)
$$

#### 二能级原子与场的相互作用

自由原子系统本征态 $H_0 \ket{i} = E_{i} \ket{i}$

考虑两个态 $\ket{a}$ 和 $\ket{b}$，本征能量分别为 $\hbar \omega_{a}$ 和 $\hbar \omega_{b}$

则有

$$
H_0 = \hbar \omega_{a} \ketbra{a} + \hbar \omega_{b} \ketbra{b}
$$

$$
H_1 = - e x E(t) = - \qty(d_{ab} \ketbra{a}{b} + d_{ab}^* \ketbra{b}{a}) E(t)
$$

上面两式用完备性基$\ketbra{a} + \ketbra{b} = 1$往里面插一下就自然得出，其中$d_{ab} = e \mel{a}{x}{b} = \abs{d_{ab}} \ee^{\ii \phi}$，并假设电场线性极化方向相同$$\vb*{E}(t) = \varepsilon \cos(\nu t) \vb*{x}$$

设 $\ket{\Psi(t)} = c_a \ee^{-\ii \omega_a t} \ket{a} + c_b \ee^{\ii \omega_b t} \ket{b}$ 代入薛定谔方程一通解就行了，注意要做**旋转波近似**，即忽略 $\exp(\pm \ii (\omega + \nu)t)$ 高频项，因为变得太快了会被平均掉，最后易得：

$$
W(t) = \abs{c_a}^2 - \abs{c_b}^2 = \frac{\Delta^2 - \Omega_R^2}{\Omega^2} \sin[2](\frac{\Omega t}{2}) + \cos[2](\frac{\Omega t}{2}) , \quad \Omega = \sqrt{\Omega_R^2 + \Delta^2}
$$

其中，$\Omega_R = \abs{d_{ab}} \varepsilon / \hbar$ 是 Rabi 频率，$\omega = \omega_a - \omega_b$ 是原子跃迁频率，$\Delta = \omega - \nu$ 是失谐参数

#### 二能级原子密度矩阵

Liouville 方程 $$\ii \hbar \dv{t} \rho(t) = \comm{H}{\rho}$$

带耗散的情况有 $\dot{\rho} = - \frac{\ii}{\hbar} \comm{H}{\rho} - \frac{1}{2} \acomm{\Gamma}{\rho} $

> 注意到用密度矩阵时，旋转波近似不是很明显，实际上对电场余弦波动用 $\ee$ 展开后取负频项即可

#### Maxwell-Schrodinger 方程

二能级原子介质和场相互作用的方程，导致了介质的宏观极化

> 略，根本不会考的哈哈哈

### 全量子理论

薛定谔绘景下，量子化电磁场，其中 $$\vb*{e}$$ 代表光场的偏振

$$
E(\vb*{r}, t) = \sum_{\vb*{k}} \vb*{e}_{\vb*{k}} \sqrt{\frac{\hbar \nu_{\vb*{k}}}{\varepsilon_0 V}} a_{\vb*{k}} \ee^{\ii \vb*{k} \vdot \vb*{r}} + h.c.
$$

做电偶极近似，即认为电场就是 $$E{\vb*{r}_0}$$，系统哈密顿为（省略零点能）

$$
H = \sum_i E_i \ketbra{i} + \sum_{\vb*{k}} \hbar \nu_{\vb*{k}} a^\dagger_{\vb*{k}} a_{\vb*{k}} + \hbar \sum_{i, j} \sum_{\vb*{k}} \qty[ g^{ij}_k(\vb*{r}_0) a_{\vb*{k}} + {g^{ij}_k}^*(\vb*{r}_0) a^\dagger_{\vb*{k}} ] \ketbra{i}{j}
$$

$$
g^{ij}_{\vb*{k}} (\vb*{r}_0) \equiv - \frac{\vb*{\mu}_{ij} \vdot \vb*{\varepsilon}_{\vb*{k}}}{\hbar} \varepsilon_{\vb*{k}} \ee^{\ii \vb*{k} \vdot \vb*{r}_0}
$$

#### 二能级系统

若能级间能量差为 $E_a - E_b = \hbar \omega$，假设是单模电磁场，取 $$\vb*{r}_0 = 0, \ \vb*{\mu}_{ab} = \vb*{\mu}_{ba} , \ g^{ab} = g^{ba} = g$$，则有系统哈密顿量（忽略常数）

$$
\begin{aligned}
  H &= \frac{1}{2} \hbar \omega \qty(\ketbra{a} - \ketbra{b}) + \hbar \nu a^\dagger a + \hbar g \qty(a + a^\dagger) \qty(\ketbra{a}{b} + \ketbra{b}{a}) \\
  &= \frac{1}{2} \hbar \omega \sigma_z + \hbar \nu a^\dagger a + \hbar g \qty(a + a^\dagger) \qty(\sigma_{+} + \sigma_{-}) \\
  &= \frac{1}{2} \hbar \omega \sigma_z + \hbar \nu a^\dagger a + \hbar g \qty(a \sigma_{+} + a^\dagger \sigma_{-})
\end{aligned}
$$

上式最后一步使用了旋转波近似，此式子即单模电磁场与单个原子耦合的 **Jaynes-Cummings 模型**（J-C 模型）

> 怎么解薛定谔方程以及密度矩阵之类的就略了，应该不考，注意激发数守恒，两个态是 $\ket{a, n}$ 和 $\ket{b, n + 1}$
>
> 海森堡绘景下的解法也略了，找几个算符弄弄就出来了（

#### 自发辐射的 Weisskopf-Wigner 理论

> 略，看书去（

***

## 量子信息基础

> 这没法考吧（

### 量子位 qubit

物理上是个二维 Hilbert 空间，实现条件：

1. 存在有两个正交态
2. 可制备出这两个态的线性叠加态

例子：恒定磁场中半自旋粒子的两个自旋态、简谐振子的两个最低能态……

表示：$$\ket{\Psi} = a \ket{0} + b \ket{1}, \quad \abs{a}^2 + \abs{b}^2 = 1$$

可以定义为单位球面上的一个点，形象地用 Bloch 矢量表示：

$$
\mqty[a \\ b] = \mqty[\cos(\theta / 2) \\ \ee^{\ii \phi} \sin(\theta / 2)]
$$

### 量子门

孤立量子系统的时间演化是一个幺正变换，而 Bloch 矢量的转动表示了二维 Hilbert 空间的幺正变换

> 证明需要引理：如果矩阵 $A$ 满足 $A^2 = I$，则可以证明
>
> $$
> \ee^{\ii A x} = \cos(x) I + \ii \sin(x) A, \quad \forall x \in R
> $$

定理：单量子位态空间的任意幺正变换，都可以通过绕 X 轴和绕 Y 轴适当角度的转动实现

Hadamard 门
: $$\text{H} = \frac{1}{\sqrt{2}} \mqty[1 & 1 \\ 1 & -1]$$

控制 Z 门（C-Z 门）
: $$\text{C-Z} = \mqty[1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & -1]$$

控制非门（CNOT 门）
: $$\text{CNOT} = \mqty[1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0]$$

> 量子线路图长啥样就直接搜就好，比如[微软的文档](https://learn.microsoft.com/zh-cn/azure/quantum/concepts-circuits)

### 量子通用逻辑门组

如果任意维 Hilbert 空间中的幺正变换都可以通过一个门组的乘积实现，这个门组对量子计算就是一个通用逻辑门组

定理：两量子位控制非门操作和单量子位转动操作构成量子计算的一个通用逻辑门组

> 定理（Deutsch 1985）：任意一个 $d$ 维幺正变换 $U$，都可以分解为 $d(d-1)/2$ 个幺正变换的乘积，其中每一个仅作用在由两个基矢量张成的二维子空间上

定理：两量子位控制相位反转门（控制 X 门、控制 Y 门或者控制 Z 门）可以取代控制非门构成通用逻辑门组

### 量子密钥分发 QKD

#### BB84 协议

1. Alice 发送一串量子比特 Bob，对每一个量子比特，Alice 随机选择 $\ket{0}$ 或 $\ket{1}$，随机选择是否使用 Hadamard 门，这时 Bob 每次可能收到下面四种状态 $\ket{0}, \ \ket{1}, \ \ket{+}, \ \ket{-}$
2. Bob 随机选择以 $\ket{0}, \ \ket{1}$ 或者 $\ket{+}, \ \ket{-}$ 为基测量收到的量子比特，并且在经典通道上宣布他测量使用的基
3. Alice 告诉 Bob 哪些基是正确的
4. 二者舍弃错误的基，正确的基对应的量子比特就组成密钥

#### 安全性

- QKD 协议的安全性不等于实际系统的安全性
- 实际安全性已经相对完善
- 设计“不依赖”于实际系统的 QKD 协议
- 防御攻击手段是完善安全性的最优途径

***

## 作业题

> 简单写些思路，题号都是按照量光[^2]上的

- 1.5 没什么难度，暴力 Taylor 展开即可
- 1.6 依旧是 Taylor 展开即可
- 2.1 利用相干态和真空态的关系，求 $$\pdv{\alpha}(\ketbra{\alpha})$$ 即可
- 2.5 死算题，利用压缩算符和位移算符对两个正交算符暴力展开，注意及时消掉产生湮灭算符带来的 $0$
- 2.6 死算题，和上题没啥区别，就是变成了双模
- 5.2 数学题，解微分方程组
- 5.5 三能级问题，对着二能级问题抄一遍就好，注意做缓变近似和旋转波近似
