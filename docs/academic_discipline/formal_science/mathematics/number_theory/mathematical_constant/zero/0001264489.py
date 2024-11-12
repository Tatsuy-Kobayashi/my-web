import numpy as np
import scipy

# 円周率と近似値の誤差
result, err = scipy.integrate.quad(lambda x: ((x ** 4) * (1 - x) ** 4) / (1 + x ** 2), 0, 1)
print(f"積分 {result}")
print(f"22 / 7 - π {22 / 7 - np.pi}")
