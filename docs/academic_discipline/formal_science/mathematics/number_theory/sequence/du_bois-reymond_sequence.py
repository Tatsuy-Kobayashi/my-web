import mpmath

# デュ・ボア=レイモンの$1$番目の定数の有限項のテスト
print(mpmath.quad(lambda t: - (t * mpmath.cos(t) - mpmath.sin(t)) / t**2, [0, 4.49340945790906]) \
+ mpmath.quad(lambda t: (t * mpmath.cos(t) - mpmath.sin(t)) / t**2, [4.49340945790906, 7.72525183693771]) \
+ mpmath.quad(lambda t: - (t * mpmath.cos(t) - mpmath.sin(t)) / t**2, [7.72525183693771, 10.9041216594289]) \
+ mpmath.quad(lambda t: (t * mpmath.cos(t) - mpmath.sin(t)) / t**2, [10.9041216594289, 14.0661939128315]))

def find_root(n):
    """tan(t) = t の n 番目の正の根を求める"""
    if n == 0:
        return None
    if n == 1:
        return mpmath.pi / 2
    else:
        previous_root = find_root(n - 1)
        initial_guess = previous_root + mpmath.mp.pi
    return mpmath.findroot(lambda t: t * mpmath.cos(t) - mpmath.sin(t), initial_guess)

# 最初のいくつかの根を確認
for i in range(2, 4):
    root = find_root(i)
    print(f"Root {i}: {root}")

def reymondFirst(n):
    """デュ・ボア=レイモンの積分を最初のn個の区間で計算"""
    result = mpmath.mpf(0) + mpmath.quad(lambda t: - (t * mpmath.cos(t) - mpmath.sin(t)) / t**2, [0, 4.49340945790906417530788092728032208221558387229])
    for i in range(2, n + 1):
        root_i = find_root(i)
        root_i_plus_1 = find_root(i + 1)
        if i % 2 == 1:  # 奇数番目の区間は負
            result += mpmath.quad(lambda t: - (t * mpmath.cos(t) - mpmath.sin(t)) / t**2, [root_i, root_i_plus_1])
        else:  # 偶数番目の区間は正
            result += mpmath.quad(lambda t: (t * mpmath.cos(t) - mpmath.sin(t)) / t**2, [root_i, root_i_plus_1])
    return result

# いくつかのnで計算
for n in range(1, 4): # nを11まで拡張
    integral_value = reymondFirst(n)
    print(f"Integral (n={n}): {integral_value}")

# 無限大までの近似として大きなnで計算
n_large = 100
integral_value_large = reymondFirst(n_large)
print(f"Integral (n={n_large}, approximation to infinity): {integral_value_large}")
# Integral (n=10, approximation to infinity): 2.48698425591393
# Integral (n=100, approximation to infinity): 3.92559074916487
# Integral (n=600, approximation to infinity): 5.06362203988756
# Integral (n=950, approximation to infinity): 5.35597420142475845

import numpy as np
import matplotlib.pyplot as plt

# 被積分関数と近似関数の比較
X = np.linspace(0.5, 100, 1000)
Y = [abs((x * np.cos(x) - np.sin(x))/(x**2)) for x in X]
Z = [abs((np.cos(x))/x) for x in X]
W = [1/x for x in X]

fig, ax = plt.subplots()
ax.plot(X, Y)
ax.plot(X, Z)
ax.plot(X, W)
plt.show()
