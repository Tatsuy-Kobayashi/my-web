import numpy as np
import mpmath

# ケプラー–ブーカム定数Kepler–Bouwkamp constant
def KB_const(n):
  prod = 1
  for k in range(3, n + 1):
    prod *= np.cos(np.pi / k)
  return prod

print(f"npで計算したケプラー–ブーカム定数: {KB_const(10 ** 3)}")

# mpmath
KBconst = mpmath.nprod(lambda n: mpmath.cos(mpmath.pi / n), [3, mpmath.inf])
print(f"mpmathで計算したケプラー–ブーカム定数: {KBconst}")

logarithm = - 2 * mpmath.nsum(lambda k: ((2 ** (2 * k) - 1) / (2 * k)) * mpmath.zeta(2 * k) * (mpmath.zeta(2 * k) - 1 - 2 ** (-2 * k)), [1, mpmath.inf])
print(mpmath.exp(logarithm))
