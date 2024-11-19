import math
from decimal import Decimal, getcontext
import mpmath

# リウヴィル数（空隙級数）liouville number
def liouville_num(k):
  getcontext().prec = 100  # 計算精度を設定
  result = Decimal(0)
  for h in range(1, k + 1):
    result += Decimal(10) ** (-Decimal(math.factorial(h)))
  return result

k = 4
print(f"decimalで計算、{format(liouville_num(k), '.30f')}")

def liouville_30prec(k):
  result = 0
  for h in range(1, k + 1):
    result += 10 ** (-mpmath.gamma(h + 1)) * 10 ** 30
  return result / (10 ** 30)

print(f"30precで計算、{liouville_30prec(k)}")

mpmath.prec = 100  # 計算精度を設定
def liouville_mp():
  mpmath.mp.dps = 100
  result = mpmath.nsum(lambda n: 10 ** (-mpmath.gamma(n + 1)), [2, mpmath.inf])
  return result

print(liouville_mp())
