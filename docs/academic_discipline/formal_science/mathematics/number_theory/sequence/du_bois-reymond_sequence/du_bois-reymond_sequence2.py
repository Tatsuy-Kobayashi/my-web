import mpmath

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

def reymondFirst(m, n):
    result = mpmath.nsum(lambda i: (1 + find_root(i) ** 2) ** (-m / 2), [2, mpmath.inf])
    return 2 * result

# いくつかのmで計算
for m in range(1, 5):
    sum_value = reymondFirst(m, 500)
    print(f"sum (m={m}): {sum_value}")

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
