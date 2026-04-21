---
title: "Ewald Summation of Dipole--Dipole Interaction in Quasi-2D Systems"
key: ewald_summation_of_dipole_dipole_interaction_in_quasi_2d_systems
tags: ["physics"]
modify_date: "2026-04-21 18:00:00"
aside:
    toc: true
---

> 标题：准二维系统中偶极-偶极相互作用的 Ewald 求和。
>
> 参考资料主要是学长的三维系统版本的[知乎专栏](https://zhuanlan.zhihu.com/p/1892667327243339682)（[English Version](https://zhuanlan.zhihu.com/p/643745411)）。Grzybowski 等人的论文 [^1] 基本上是被我拿来对比结果了，当然他们是准二维系统的情况，而且不仅仅是讨论 dipole--dipole 相互作用，主要是考虑的库伦相互作用。

[^1]: Grzybowski, A., E. Gwóźdź, and A. Bródka. 2000. “Ewald Summation of Electrostatic Interactions in Molecular Dynamics of a Three-Dimensional System with Periodicity in Two Directions.” Physical Review B 61(10): 6706–12. doi:10.1103/PhysRevB.61.6706.

<!--more-->

## Dipole--Dipole Interaction

> 本文大部分内容是英文的，因为 LLM 帮忙了……啊不是，其实是因为这是从 note 里抄出来的，那边的核心内容是 Luttinger--Tisza (LT) 方法。但是非母语内容读得就是难受，所以有些地方我会用中文来解释一下，注意，中文内容的意思不是纯粹的翻译，可能英文原文里并没有那个意思。
>
> 正如上句话所说，Ewald summation 主要是用来计算长程相互作用的能量的，在分子动力学模拟中常用，我这里是 LT 方法需要用到，并且 Classical Monte Carlo 模拟也需要用到，所以就整理了这篇笔记。

In this article, we consider a quasi-two-dimensional (quasi-2D) system containing point dipoles. The system has translational periodicity in the $xy$-plane but is finite (or lacks periodic boundary conditions) in the $z$-direction.

Let the 2D periodic lattice be spanned by basis vectors $$\vb*{A}_1$$ and $$\vb*{A}_2$$. The lattice vectors are given by $$\vb*{R} = n_1\vb*{A}_1 + n_2\vb*{A}_2$$ with $n_1, n_2 \in \mathbb{Z}$. Inside one unit cell, there are $M$ sublattice sites, whose positions can be written as $$\vb*{d}_\alpha$$ with $$\alpha=1, \cdots, M$$. Therefore, the position of the $\alpha$-th sublattice site in the $$\vb*{R}$$-th unit cell is given by $$\vb*{r}_{\vb*{R}, \alpha} = \vb*{R} + \vb*{d}_\alpha$$.

> 这里定义了晶格结构，准二维系统的意思是原胞在 $xy$ 平面内是周期性的，但允许子格之间有 $z$ 方向的差别。

Defining the sublattice displacement $$\vb*{\delta}_{\alpha \beta} \equiv \vb*{d}_\beta - \vb*{d}_\alpha$$, and dipolar tensor
$$
\begin{equation}
    \mathcal{T}_{\mu\nu}(\vb*{r})
    =
    \frac{\delta_{\mu\nu}}{r^3}
    -
    3 \frac{r_\mu r_\nu}{r^5},
    \qquad r=\abs{\vb*{r}}.
\end{equation}
$$
Then the dipole--dipole interaction can be compactly written as
$$
\begin{equation}
    H_{\text{dd}}
    =
    \frac{D}{2}
    \sum_{\vb*{R}, \vb*{L}}
    \sum_{\alpha, \beta}'
    \sum_{\mu,\nu=x,y,z}
    S_{\vb*{R}, \alpha}^\mu
    \,
    \mathcal{T}_{\mu\nu}
    \qty(
        \vb*{L} + \vb*{\delta}_{\alpha \beta}
    )
    \,
    S_{\vb*{R} + \vb*{L}, \beta}^\nu ,
\end{equation}
$$
where $$\vb*{L} = \vb*{R}' - \vb*{R}$$.
We have used the translation symmetry to rewrite the sum over $$\vb*{R}'$$ as a sum over $$\vb*{L}$$. Note that the primed sum still indicates that when $\alpha=\beta$, the term with $$\vb*{L}=0$$ should be excluded.

> 求和带撇号是排除掉自己和自己之间的相互作用。

By performing the Fourier transform, we can naturally define the dipole--dipole interaction matrix:
$$
\begin{equation}
\begin{aligned}
    J_{\alpha \beta}^{\mu\nu}(\vb*{k})
    &=
    \sum_{\vb*{L}}'
    J_{\alpha \beta}^{\mu\nu}(\vb*{L})
    \ee^{\ii \vb*{k}\vdot(\vb*{L}+\vb*{\delta}_{\alpha \beta})}
    \\
    &=
    \sum_{\vb*{L}}'
    \frac{D}{2}
    \mathcal{T}_{\mu\nu}\qty(\vb*{L} + \vb*{\delta}_{\alpha \beta})
    \,
    \ee^{\ii \vb*{k}\vdot(\vb*{L}+\vb*{\delta}_{\alpha \beta})}
    ,
\end{aligned}
\label{eq:LT_matrix}
\end{equation}
$$
and the Hamiltonian can be written as
$$
\begin{equation}
    H_{\text{dd}}
    =
    \sum_{\vb*{k} \in \text{BZ}}
    \sum_{\alpha, \beta = 1}^{M}
    \sum_{\mu,\nu=x,y,z}
    S_{-\vb*{k}, \alpha}^\mu
    \,
    J_{\alpha \beta}^{\mu\nu}(\vb*{k})
    \,
    S_{\vb*{k}, \beta}^\nu
    .
\end{equation}
$$
The notation $$\vb*{k} \in \text{BZ}$$ means that the sum over $$\vb*{k}$$ is restricted to the first Brillouin zone.

> 这里我省略了 Fourier 变换的细节，这不是重点，你只需要知道 Hamiltonian 动量空间表达式就是上面那个式子，里面的相互作用矩阵使我们接下来的核心出发点。

## Ewald Summation

Let us go back to Eq. $\eqref{eq:LT_matrix}$ and consider the lattice sum
$$
\begin{equation}
    J_{\alpha \beta}^{\mu\nu}(\vb*{k})
    =
    \sum_{\vb*{L}}'
    \mathcal{T}_{\mu\nu}\qty(\vb*{L}+\vb*{\delta}_{\alpha\beta})
    \,
    \ee^{\ii\vb*{k}\vdot(\vb*{L}+\vb*{\delta}_{\alpha\beta})},
\end{equation}
$$
which is conditionally convergent in 3D lattices because $$\mathcal{T}_{\mu\nu}(\vb*{r})\sim r^{-3}$$ is long-ranged.
For simplicity, we have removed the factor $D/2$ here, and the primed sum indicates that the term with $$\vb*{L}=0$$ should be excluded when $\alpha=\beta$.
In our situation, the lattice is only periodic in two dimensions, so the sum is actually absolutely convergent and does not depend on the summation order. Nevertheless, a direct lattice summation may still converge very slowly, and a more efficient method is desirable.

> 一开始直接丢掉了系数 $D/2$。
>
> 在三维系统中，Ewald 求和是必须考虑的，因为是条件收敛的。但是在准二维系统中，求和是绝对收敛的，所以严格来说不需要 Ewald 求和，但是直接求和可能计算量很大，所以我们还是希望有一个更高效的方法来计算这个求和。（实际上，在我的这个模型的测试中我发现了，考虑两个方向 $\pm 16$ 个原胞的直接求和就足够了。）

The Ewald idea is to split the Coulomb kernel first,
$$
\begin{equation}
    \frac{1}{r}
    =
    \frac{\mathrm{erfc}(\alpha r)}{r}
    +
    \frac{\mathrm{erf}(\alpha r)}{r},
\end{equation}
$$
where the error function $\mathrm{erf}(x)$ and the complementary error function $\mathrm{erfc}(x)$ are defined as
$$
\begin{equation}
    \mathrm{erf}(x)
    =
    \frac{2}{\sqrt{\pi}}
    \int_0^x \ee^{-t^2} \mathrm{d}t,
    \qquad
    \mathrm{erfc}(x)
    =
    1 - \mathrm{erf}(x)
    =
    \frac{2}{\sqrt{\pi}}
    \int_x^\infty \ee^{-t^2} \mathrm{d}t
    ,
\end{equation}
$$
and then apply
$$
\begin{equation}
    \mathcal{T}_{\mu\nu}(\vb*{r}_0)
    =
    \eval{-\pp_\mu\pp_\nu\frac{1}{r}}_{\vb*{r} = \vb*{r}_0}
    =
    \mathcal{T}^{\text{(R)}}_{\mu\nu}(\vb*{r}_0; \alpha)
    +
    \mathcal{T}^{\text{(K)}}_{\mu\nu}(\vb*{r}_0; \alpha).
\end{equation}
$$
Here $\alpha>0$ is the Ewald splitting parameter. And, we notice that $r = \sqrt{r_x^2 + r_y^2 + r_z^2}$ is the norm of the 3D vector $\vb*{r}$.

> 这套方法的重点就在这里，使用 Ewald 分割**将长程相互作用分成一个短程部分和一个长程部分**。短程部分在实空间中快速衰减，长程部分在倒空间中快速衰减，这样就可以分别在实空间和倒空间中高效地求和了。
>
> 这里需要强调，我们使用 $$\eval{}_{\vb*{r} = \vb*{r}_0}$$ 这个符号的意思是，**取值在偏导之后进行**。
>
> 这里的两次偏导在矢量表达里面是两次求梯度的意思，因为有 $$\grad = (\pp_x, \pp_y, \pp_z)$$。所以，相互作用矩阵就是个张量，当然我们使用了分量表示法来写它，这样更好看一点。

### Real-Space Part

The short-ranged real-space tensor is
$$
\begin{equation}
\begin{aligned}
    \mathcal{T}^{\text{(R)}}_{\mu\nu}(\vb*{r};\alpha)
    &=
    \qty[
        \frac{\mathrm{erfc}(\alpha r)}{r^3}
        +
        \frac{2\alpha}{\sqrt{\pi}}
        \frac{\ee^{-\alpha^2 r^2}}{r^2}
    ]\delta_{\mu\nu}
    \\
    &\quad
    -
    \qty[
        \frac{3\mathrm{erfc}(\alpha r)}{r^5}
        +
        \frac{6\alpha}{\sqrt{\pi}}
        \frac{\ee^{-\alpha^2 r^2}}{r^4}
        +
        \frac{4\alpha^3}{\sqrt{\pi}}
        \frac{\ee^{-\alpha^2 r^2}}{r^2}
    ] r_\mu r_\nu,
\end{aligned}
\end{equation}
$$
which decays exponentially and is therefore rapidly convergent in direct lattice summation.

> 上面这个实空间部分是 $- \mathrm{erfc}(\alpha r) / r$ 直接求两次梯度得到的，我用了 Mathematica 来计算。请注意，下面的我**没有说明的或者说跳过了的计算细节都是通过 Mathematica 来完成的**。

So the real-space contribution to the LT matrix can be written as
$$
\begin{equation}
    J_{\alpha\beta}^{\mu\nu,\text{(R)}}(\vb*{k})
    =
    \sum_{\vb*{L}}'
    \,
    \mathcal{T}^{\text{(R)}}_{\mu\nu}\qty(\vb*{L}+\vb*{\delta}_{\alpha\beta};\alpha)
    \,
    \ee^{\ii\vb*{k}\vdot(\vb*{L}+\vb*{\delta}_{\alpha\beta})}.
    \label{eq:J_real_space}
\end{equation}
$$

### Self Energy Part

Defining $u = t / r$, the long-ranged reciprocal-space tensor can be written as
$$
\begin{equation}
\begin{aligned}
    \mathcal{T}^{\text{(K)}}_{\mu\nu}(\vb*{r}; \alpha)
    &=
    - \pp_\mu \pp_\nu
    \frac{2}{r \sqrt{\pi}}
    \int_0^{\alpha r} \ee^{-t^2} \dd{t}
    \\
    &=
    - \pp_\mu \pp_\nu
    \frac{2}{\sqrt{\pi}}
    \int_0^{\alpha} \ee^{-r^2 u^2} \dd{u}
    .
\end{aligned}
\end{equation}
$$
It is important to note that $r = 0$ should be treated separately, since $u$ will diverge in this case. However, for simplicity, we will add a small displacement $\vb*{\varepsilon}$, and take the limit $\varepsilon \to 0$ of its norm at the end of the calculation. So, considering the sum over the periodic lattice, we have
$$
\begin{equation}
\begin{aligned}
    J_{\alpha \beta}^{\mu\nu}(\vb*{k}) - J_{\alpha \beta}^{\mu\nu,\text{(R)}}(\vb*{k})
    &=
    \sum_{\vb*{L}}'
    \,
    \mathcal{T}^{\text{(K)}}_{\mu\nu}\qty(\vb*{L}+\vb*{\delta}_{\alpha\beta};\alpha)
    \,
    \ee^{\ii\vb*{k}\vdot(\vb*{L}+\vb*{\delta}_{\alpha\beta})}
    \\
    &=
    \sum_{\vb*{L}}
    \,
    \mathcal{T}^{\text{(K)}}_{\mu\nu}\qty(\vb*{L}+\vb*{\delta}_{\alpha\beta};\alpha)
    \,
    \ee^{\ii\vb*{k}\vdot(\vb*{L}+\vb*{\delta}_{\alpha\beta})}
    -
    \mathcal{T}^{\text{(K)}}_{\mu\nu}\qty(0; \alpha)
    \delta_{\alpha\beta}
    \\
    &\equiv
    J_{\alpha\beta}^{\mu\nu,\mathrm{(K)}}(\vb*{k})
    +
    J_{\alpha\beta}^{\mu\nu,\mathrm{(self)}}
    ,
\end{aligned}
\end{equation}
$$
with the self energy term calculated as
$$
\begin{equation}
\begin{aligned}
    J_{\alpha\beta}^{\mu\nu,\mathrm{(self)}}
    &=
    -
    \mathcal{T}^{\text{(K)}}_{\mu\nu}\qty(0; \alpha)
    \,
    \delta_{\alpha\beta}
    \\
    &=
    \frac{2}{\sqrt{\pi}} \, \delta_{\alpha\beta}
    \lim_{\varepsilon \to 0}
    \pp_\mu \pp_\nu
    \int_0^{\alpha} \ee^{-\varepsilon^2 u^2} \dd{u}
    \\
    &=
    -
    \frac{4 \alpha^3}{3 \sqrt{\pi}}
    \,
    \delta_{\alpha\beta} \delta_{\mu\nu}
    .
\end{aligned}
\label{eq:J_self_energy}
\end{equation}
$$

> 短程部分正好对应了实空间部分贡献，但是长程部分似乎会发散。把发散部分单独拿出来就对应了自能项，剩余的部分对应了倒空间部分贡献。求自能项的时候注意一下极限是在最后取的。
>
> 当然其实因为外部求和去掉了自己和自己的相互作用，这里理论上是不会发散的，自能项的引入其实是为了让我们在后续的计算中可以直接把求和范围写全，这样就可以使用 Poisson 求和公式了。

### Reciprocal-Space Part

From above, the reciprocal-space part is defined as
$$
\begin{equation}
\begin{aligned}
    J_{\alpha\beta}^{\mu\nu,\mathrm{(K)}}(\vb*{k})
    &=
    \sum_{\vb*{L}}
    \,
    \mathcal{T}^{\text{(K)}}_{\mu\nu}\qty(\vb*{L}+\vb*{\delta}_{\alpha\beta};\alpha)
    \,
    \ee^{\ii\vb*{k}\vdot(\vb*{L}+\vb*{\delta}_{\alpha\beta})}
    \\
    &=
    -\ee^{\ii \vb*{k} \vdot \vb*{\delta}_{\alpha\beta}}
    \frac{2}{\sqrt{\pi}}
    \lim_{\varepsilon \to 0}
    \,
    \sum_{\vb*{L}}
    \pp_\mu \pp_\nu
    \eval{\int_0^{\alpha} \ee^{\ii \vb*{k} \vdot \vb*{L}} \ee^{-u^2 r^2} \dd{u}}
    _{\vb*{r} = \vb*{L} + \vb*{\delta}_{\alpha\beta} + \vb*{\varepsilon}}
    \\
    &=
    -\ee^{\ii \vb*{k} \vdot \vb*{\delta}_{\alpha\beta}}
    \frac{2}{\sqrt{\pi}}
    \,
    \pp_\mu \pp_\nu
    \int_0^{\alpha}
    \sum_{\vb*{L}}
    \eval{
        \ee^{\ii \vb*{k} \vdot \vb*{L}} \ee^{-u^2 \abs{\vb*{r} + \vb*{L}}^2} \dd{u}
    }
    _{\vb*{r} = \vb*{\delta}_{\alpha\beta}}
    \\
    &=
    -\ee^{\ii \vb*{k} \vdot \vb*{\delta}_{\alpha\beta}}
    \frac{2}{\sqrt{\pi}}
    \,
    \pp_\mu \pp_\nu
    \,
    \ee^{-\ii \vb*{k} \vdot \vb*{r}}
    \int_0^{\alpha}
    \sum_{\vb*{L}}
    \eval{
        \ee^{\ii \vb*{k} \vdot (\vb*{r} + \vb*{L})} \ee^{-u^2 \abs{\vb*{r} + \vb*{L}}^2} \dd{u}
    }
    _{\vb*{r} = \vb*{\delta}_{\alpha\beta}}
    \\
    &\equiv
    -\ee^{\ii \vb*{k} \vdot \vb*{\delta}_{\alpha\beta}}
    \frac{2}{\sqrt{\pi}}
    \,
    \pp_\mu \pp_\nu
    \,
    \ee^{-\ii \vb*{k} \vdot \vb*{r}}
    \int_0^{\alpha}
    \sum_{\vb*{L}}
    \eval{
        f(\vb*{r} + \vb*{L}; u) \dd{u}
    }
    _{\vb*{r} = \vb*{\delta}_{\alpha\beta}}
    ,
\end{aligned}
\label{eq:J_K_1}
\end{equation}
$$
where we have defined
$$
\begin{equation}
    f(\vb*{r}; u)
    =
    \ee^{\ii \vb*{k} \vdot \vb*{r} -u^2 r^2}.
\end{equation}
$$

> 这里找出了要进行 Fourier 变换的函数，接着就是 Poisson 求和变换到倒空间了。

For periodic directions, define reciprocal vectors
$$
\begin{equation}
    \vb*{G} = m_1\vb*{B}_1 + m_2\vb*{B}_2,
    \qquad m_1,m_2\in\mathbb{Z} ,
\end{equation}
$$
and we have the Poisson summation formula
$$
\begin{equation}
    \sum_{\vb*{L}} f(\vb*{r} + \vb*{L}; u)
    =
    \frac{1}{\Omega}
    \sum_{\vb*{G}}
    \tilde{f} (\vb*{G}; u) \,
    \ee^{\ii \vb*{G} \vdot \vb*{r}},
\end{equation}
$$
where $$\tilde{f}(\vb*{G}; u)$$ is the Fourier transform of $$f(\vb*{r}; u)$$, defined as
$$
\begin{equation}
    \tilde{f}(\vb*{G}; u)
    =
    \int \ee^{-\ii \vb*{G} \vdot \vb*{r}} f(\vb*{r}; u) \dd[d]{\vb*{r}}
    =
    \int \ee^{\ii (\vb*{k} - \vb*{G}) \vdot \vb*{r} - u^2 r^2} \dd[d]{\vb*{r}}.
\end{equation}
$$
Here, $\Omega$ is the supercell volume used for normalization, and $d$ is the expansion dimension (in our case, $d=2$). So, the Fourier transform can be evaluated as
$$
\begin{equation}
\begin{aligned}
    \tilde{f}(\vb*{G}; u)
    &=
    \int \ee^{\ii (\vb*{k} - \vb*{G}) \vdot \vb*{r} - u^2 r^2} \dd[2]{\vb*{r}}
    \\
    &=
    \iint \ee^{\ii \rho \abs{\vb*{k} - \vb*{G}} \cos(\phi - \phi_0) - u^2 (\rho^2 + z^2)} \rho \dd{\rho} \dd{\phi}
    \\
    &=
    2 \pi \int_0^\infty
    \ee^{-u^2 (\rho^2 + z^2)} \rho
    \,
    \mathrm{J}_0\qty[\abs{\vb*{k} - \vb*{G}} \rho]
    \dd{\rho}
    \\
    &=
    \frac{\pi}{u^2} \exp[-u^2 z^2 - \frac{\abs{\vb*{k} - \vb*{G}}^2}{4 u^2}]
    ,
\end{aligned}
\end{equation}
$$
where $$\vb*{r} = \rho \vu*{r} + z \vu*{z}$$, $$\vu*{r} = \cos\phi \, \vu*{x} + \sin\phi \, \vu*{y}$$, and $J_0$ is the first kind Bessel function of order zero. We note that $$\vb*{r}$$ is a 3D vector, but the Fourier transform is taken in the 2D plane, so $$\vb*{k}$$ and $$\vb*{G}$$ do not have $$z$$-components. Substituting the above into Eq.$\,\eqref{eq:J_K_1}$, we obtain
$$
\begin{equation}
\begin{aligned}
    J_{\alpha\beta}^{\mu\nu,\mathrm{(K)}}(\vb*{k})
    &=
    -\ee^{\ii \vb*{k} \vdot \vb*{\delta}_{\alpha\beta}}
    \frac{2}{\sqrt{\pi}}
    \eval{
    \pp_\mu \pp_\nu
    \,
    \int_0^{\alpha}
    \frac{1}{\Omega}
    \sum_{\vb*{G}}
    \ee^{\ii (\vb*{G}-\vb*{k}) \vdot \vb*{r}}
    \tilde{f} (\vb*{G}; u)
    \dd{u}
    }
    _{\vb*{r} = \vb*{\delta}_{\alpha\beta}}
    \\
    &=
    -\ee^{\ii \vb*{k} \vdot \vb*{\delta}_{\alpha\beta}}
    \frac{2 \sqrt{\pi}}{\Omega}
    \eval{
    \pp_\mu \pp_\nu
    \,
    \sum_{\vb*{G}}
    \ee^{\ii (\vb*{G}-\vb*{k}) \vdot \vb*{r}}
    \int_0^{\alpha}
    u^{-2}
    \exp[-u^2 z^2 - \frac{\abs{\vb*{k} - \vb*{G}}^2}{4 u^2}]
    \dd{u}
    }_{\vb*{r} = \vb*{\delta}_{\alpha\beta}}
    \\
    &=
    -\ee^{\ii \vb*{k} \vdot \vb*{\delta}_{\alpha\beta}}
    \frac{\pi}{\Omega}
    \pp_\mu \pp_\nu
    \,
    \sum_{\vb*{G}}
    \frac{1}{\abs{\vb*{k} - \vb*{G}}}
    \,
    \ee^{\ii (\vb*{G}-\vb*{k}) \vdot \vb*{r}}
    \\
    \times &
    \eval{
    \qty{
        \ee^{- \abs{\vb*{k} - \vb*{G}} \vb*{r} \vdot \vu*{z}}
        \,
        \mathrm{erfc}\qty[\frac{\abs{\vb*{k} - \vb*{G}}}{2 \alpha} - \alpha \vb*{r} \vdot \vu*{z}]
        +
        \ee^{ \abs{\vb*{k} - \vb*{G}} \vb*{r} \vdot \vu*{z}}
        \,
        \mathrm{erfc}\qty[\frac{\abs{\vb*{k} - \vb*{G}}}{2 \alpha} + \alpha \vb*{r} \vdot \vu*{z}]
    }
    }_{\vb*{r} = \vb*{\delta}_{\alpha\beta}}
    \\
    &=
    -\ee^{\ii \vb*{k} \vdot \vb*{\delta}_{\alpha\beta}}
    \frac{\pi}{\Omega}
    \eval{
    \pp_\mu \pp_\nu
    \,
    \sum_{\vb*{G}}
    \frac{1}{\abs{\vb*{k} - \vb*{G}}}
    \,
    \ee^{\ii (\vb*{G}-\vb*{k}) \vdot \vb*{r}}
    \qty[
        D(\vb*{G}-\vb*{k}, z; \alpha)
        +
        D(\vb*{G}-\vb*{k}, -z; \alpha)
    ]
    }_{\vb*{r} = \vb*{\delta}_{\alpha\beta}}
    ,
\end{aligned}
\end{equation}
$$
with $$z = \vb*{r} \vdot \vu*{z}$$ and the function
$$
\begin{equation}
    D(\vb*{G}-\vb*{k}, z; \alpha) =
    \ee^{\abs{\vb*{G} - \vb*{k}} z}
    \,
    \mathrm{erfc}\qty[\frac{\abs{\vb*{G} - \vb*{k}}}{2 \alpha} + \alpha z]
    .
\end{equation}
$$

> Fourier 变换那步我记得是需要先积分角度 $\phi$ 的，Mathematica 直接算二重积分好像会爆掉。$\phi_0$ 是一个常数，就是俩向量夹角，不用管是多少，计算结果不会依赖于它。
>
> 注意准二维和三维的区别就在于 Fourier 变换的维度不同。
>
> 把变换后的核代入积分掉 $u$ 后得到了上面的式子，只是看起来复杂而已。接下来就是讨论求和里的发散项了，之前自能项是把发散项引入，让求和范围完整，这里不同的就是把发散项拿出来，然后在求和里把它排除掉了。

At the last step, we should take care of the case $$\vb*{G} = \vb*{k}$$. Note that $$\vb*{k}$$ is in the first Brillouin zone, so $$\vb*{G} = \vb*{k}$$ can only happen when $$\vb*{k} = \vb*{G} = 0$$.
Similarly, we add $\ee^{- s r^2}$ with $s>0$ to the summand, and take the limit $s \to 0$ at the end of the calculation. This gives
$$
\begin{equation}
\begin{aligned}
    J_{\alpha\beta}^{\mu\nu,\mathrm{(K)}}(\vb*{k})
    &=
    -\ee^{\ii \vb*{k} \vdot \vb*{\delta}_{\alpha\beta}}
    \frac{\pi}{\Omega}
    \eval{
    \pp_\mu \pp_\nu
    \,
    \sum_{\vb*{G} (\neq \vb*{k})}
    \frac{1}{\abs{\vb*{k} - \vb*{G}}}
    \,
    \ee^{\ii (\vb*{G}-\vb*{k}) \vdot \vb*{r}}
    \qty[
        D(\vb*{G}-\vb*{k}, z; \alpha)
        +
        D(\vb*{G}-\vb*{k}, -z; \alpha)
    ]
    }_{\vb*{r} = \vb*{\delta}_{\alpha\beta}}
    \\
    & \quad -
    \ee^{\ii \vb*{k} \vdot \vb*{\delta}_{\alpha\beta}}
    \frac{2}{\sqrt{\pi}}
    \eval{
    \lim_{s \to 0}
    \frac{\delta_{\vb*{k}, \vb*{G}}}{\Omega}
    \,
    \pp_\mu \pp_\nu
    \int_0^{\alpha} \dd{u}
    \int \dd[d]{\vb*{r}}
    \ee^{-u^2 r^2 - s r^2}
    }_{\vb*{r} = \vb*{\delta}_{\alpha\beta}}
    \\
    &=
    \ee^{\ii \vb*{k} \vdot \vb*{\delta}_{\alpha\beta}}
    \frac{\pi}{\Omega}
    \sum_{\vb*{G} (\neq \vb*{k})}
    \frac{(k_\mu - G_\mu)(k_\nu - G_\nu)}{\abs{\vb*{k} - \vb*{G}}}
    \ee^{\ii (\vb*{G}-\vb*{k}) \vdot \vb*{\delta}_{\alpha\beta}}
    \qty(
        D^+
        +
        D^-
    )
    \\
    & \quad +
    \ee^{\ii \vb*{k} \vdot \vb*{\delta}_{\alpha\beta}}
    \frac{\pi}{\Omega}
    \sum_{\vb*{G} (\neq \vb*{k})}
    \sum_\lambda
    \ii
    (k_\lambda - G_\lambda) (\delta_{\mu \lambda} \delta_{\nu z} + \delta_{\mu z} \delta_{\nu \lambda})
    \ee^{\ii (\vb*{G}-\vb*{k}) \vdot \vb*{\delta}_{\alpha\beta}}
    \qty(
        D^+
        -
        D^-
    )
    \\
    & \quad -
    \ee^{\ii \vb*{k} \vdot \vb*{\delta}_{\alpha\beta}}
    \frac{\pi}{\Omega}
    \sum_{\vb*{G} (\neq \vb*{k})}
    \ee^{\ii (\vb*{G}-\vb*{k}) \vdot \vb*{\delta}_{\alpha\beta}}
    \delta_{\mu z} \delta_{\nu z}
    \qty[
        \abs{\vb*{k} - \vb*{G}}
        \qty(
            D^+
            +
            D^-
        )
        -
        \frac{4 \alpha}{\sqrt{\pi}} \ee^{-\frac{\abs{\vb*{k} - \vb*{G}}^2}{4 \alpha^2} - \alpha^2 z_{\alpha \beta}^2}
    ]
    \\
    & \quad +
    \frac{4 \alpha \sqrt{\pi} }{\Omega}
    \delta_{\mu z} \delta_{\nu z}
    \delta_{\vb*{k}, 0}
    \,
    \ee^{-\alpha^2 z_{\alpha \beta}^2}
\end{aligned}
\end{equation}
$$
with $$z_{\alpha \beta} = \vb*{\delta}_{\alpha\beta} \vdot \vu*{z}$$, $$k_\mu = \vb*{k} \vdot \vu*{\mu}$$, $$G_\mu = \vb*{G} \vdot \vu*{\mu}$$, and the notation $$D^{\pm} = D(\vb*{G}-\vb*{k}, \pm z_{\alpha \beta}; \alpha)$$.
Recall that $$k_z = G_z = 0$$ since $$\vb*{k}$$ and $$\vb*{G}$$ are in-plane vectors.
So, the first term only contributes to the in-plane components, the second term only contributes to the mixed components, and the last two terms only contribute to the out-of-plane component. We can find that after the calculation, the case $$\vb*{G} = \vb*{k}$$ is not singular anymore, and can be safely included in the summation, especially the fourth term can be combined with the third term to give a unified expression. Hence, the final expression for the reciprocal-space contribution can be written as
$$
\begin{equation}
\begin{aligned}
    J_{\alpha\beta}^{\mu\nu,\mathrm{(K)}}(\vb*{k})
    &=
    \frac{\pi}{\Omega}
    \sum_{\vb*{G}}
    \ee^{\ii \vb*{G} \vdot \vb*{\delta}_{\alpha\beta}}
    \Bigg\{
    \frac{(k_\mu - G_\mu)(k_\nu - G_\nu)}{\abs{\vb*{k} - \vb*{G}}}
    \qty(
        D^+
        +
        D^-
    )
    \\
    & \quad +
    \sum_\lambda
    \ii
    (k_\lambda - G_\lambda) (\delta_{\mu \lambda} \delta_{\nu z} + \delta_{\mu z} \delta_{\nu \lambda})
    \qty(
        D^+
        -
        D^-
    )
    \\
    & \quad -
    \delta_{\mu z} \delta_{\nu z}
    \qty[
        \abs{\vb*{k} - \vb*{G}}
        \qty(
            D^+
            +
            D^-
        )
        -
        \frac{4 \alpha}{\sqrt{\pi}} \ee^{-\frac{\abs{\vb*{k} - \vb*{G}}^2}{4 \alpha^2} - \alpha^2 z_{\alpha \beta}^2}
    ]
    \Bigg\}
    .
\end{aligned}
\label{eq:J_K_final}
\end{equation}
$$

> 计算中用到了 $$\vb*{k}$$ 和 $$\vb*{G}$$ 没有 $z$ 分量的事实，这样就可以把一些项直接丢掉了。这里 Mathematica 可能会得到比较复杂的结果，需要小心拆解，建议对着结果来计算。
>
> 最后一步就是在说，在经过两次梯度后求值的运算后，我们这个准二维系统的倒空间项其实没有发散项了（和三维系统不同），所以我们可以直接把 $$\vb*{G} = \vb*{k}$$ 的项也包含在求和里了，这样就得到了上面那个比较简洁的表达式了。

### Final Expression

Putting Eq.$\, \eqref{eq:J_real_space}$, $\eqref{eq:J_K_final}$, and $\eqref{eq:J_self_energy}$ together, the LT matrix can be expressed as
$$
\begin{equation}
    J_{\alpha\beta}^{\mu\nu}(\vb*{k})
    =
    J_{\alpha\beta}^{\mu\nu,\mathrm{(R)}}(\vb*{k})
    +
    J_{\alpha\beta}^{\mu\nu,\mathrm{(K)}}(\vb*{k})
    +
    J_{\alpha\beta}^{\mu\nu,\mathrm{(self)}}.
\end{equation}
$$
In exact arithmetic, the final result is independent of $\alpha$; in numerics, residual $\alpha$-dependence is a convergence diagnostic.

Moreover, if we want the real-space representation of the dipolar interaction, we can take $$\vb*{k} = 0$$ in the above expression to obtain $J_{\alpha\beta}^{\mu\nu}(0)$.

> 把三项合在一起就是最终的结果了。$\alpha$ 的选择虽然在理论上不影响结果，但在数值计算中会影响收敛速度。
>
> 另外，如果我们想要实空间的相互作用矩阵，可以直接把 $$\vb*{k}$$ 取零就好了。

## Extra: Practical Considerations

The Ewald splitting parameter $\alpha$ controls the balance of computational workload between the real-space and reciprocal-space sums. A standard empirical choice is:
$$
\begin{equation}
    \alpha \approx \sqrt{\frac{\pi}{\Omega}},
\end{equation}
$$
where $$\Omega = \abs{\vb*{A}_1 \cp \vb*{A}_2}$$ is the area of the 2D unit cell.

- **Real-Space Cutoff ($R_c$)**: The real-space tensor $\mathcal{T}^{\text{(R)}}_{\mu\nu}$ decays exponentially as $\ee^{-\alpha^2 r^2}$. In practice, truncating the sum at $R_c \approx 3.5/\alpha \sim 4.0/\alpha$ guarantees high precision.
- **Reciprocal-Space Cutoff ($G_c$)**: The reciprocal-space sum decays according to the Gaussian-like factor $$\ee^{- \abs{\vb*{k} - \vb*{G}}^2 / 4\alpha^2}$$. We typically limit the sum to reciprocal lattice vectors satisfying $$\abs{\vb*{G}} \leqslant G_c$$, where $G_c \approx 3.5 \, \alpha \sim 4.0 \, \alpha$.

> 嗯，上面那几句话是 LLM 写的。不过我测试了下应该是对的，意思就是实际计算的时候有实空间截断 $R_c$ 和倒空间截断 $G_c$，它们的选择大概要满足 $\alpha R_c \sim G_c / \alpha \sim 4.0$ 就好了。
