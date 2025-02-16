import mpmath
import numpy as np
import matplotlib.pyplot as plt

# デ・ブリュイン・ニューマン定数de Bruijn–Newman constant
# 0 \le \Lambda \le 0.2
def Phi(u):
    result = 4 * mpmath.nsum(lambda n: (2 * (mpmath.pi ** 2) * (n ** 4) * mpmath.exp(9 * u) - 3 * mpmath.pi * (n ** 2) * mpmath.exp(5 * u)) * mpmath.exp(- mpmath.pi * (n ** 2) * mpmath.exp(4 * u)), [1, mpmath.inf])
    return result

def H(λ, z):
    # 本当は積分範囲 [0, mpmath.inf] にしたいところだが、計算時間を短縮するため10^4にする
    result = 2 * mpmath.quad(lambda u: mpmath.exp(λ * u ** 2) * Phi(u) * mpmath.cos(z * u), [0, 10 ** 4])
    return result

def xi(t):
    s = 1 / 2 + 1j * t
    result = (s * (s - 1) / 2) * mpmath.gamma(s / 2) * (mpmath.pi ** (- s / 2)) * mpmath.zeta(s)
    return result

print(f"Phi(1/3) = {Phi(1/3)}")
λ = 0.2
print(f"H(λ, 1/2) = {H(λ, 1/2)}")
print(f"H(λ, 1/2 + 1j) = {H(λ, 1/2 + 1j)}")
print(f"H(0, 0) = {H(0, 0)}")
print(f"xi(0) = {xi(0)}")

# 計算が終わらない場合は、グラフの区間を変えるz_values = np.linspace(20, 30, 100)
z_values = np.linspace(-5, 35, 100)
H_values = [H(λ, z) for z in z_values]
# グラフを作成
plt.plot(z_values, H_values)
plt.title('Graph of H(λ, z) when λ = 0.2')
plt.xlabel('z')
plt.ylabel('H(λ, z)')
plt.grid(True)
plt.show()
