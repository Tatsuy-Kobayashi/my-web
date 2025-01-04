import numpy as np
import scipy

print(f"22/7 - π:  {22 / 7 - np.pi}")

# scipy
def scipy_int(n):
    result, err = scipy.integrate.quad(lambda x: ((x ** 4) * (1 - x) ** 4) / (1 + x ** 2), 0, 1)
    if n == 0:
        return result
    elif n == 1:
        return err
    else:
        return None

print(f"scipy積分:  {scipy_int(0)}")

# mpmath
import mpmath
def mpmath_int(a):
    result = mpmath.quad(lambda x: ((x ** 4) * (1 - x) ** 4) / (1 + x ** 2), [0, a])
    return result

print(f"mpmath積分: {mpmath_int(1)}")
