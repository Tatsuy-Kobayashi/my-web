import sympy
import mpmath

# 変数を定義
t, m = sympy.symbols('t m')

# fのtに関する微分
df_sympy = sympy.diff((sympy.sin(t) / t) ** m, t)

# 被積分関数の定義
def integrand(t_val, m_val):
  # sympyの式をmpmathの式に変換
  df_mpmath = sympy.lambdify(t, df_sympy, 'mpmath')

  # tに値を代入して数値計算
  result = abs(df_mpmath(t_val).subs({m: m_val}))
  return result

# 0からinfまで積分
def duBR(m_val):
  result = mpmath.quad(lambda t_val: integrand(t_val, m_val), [0, mpmath.inf])
  return result - 1

print(f"duBR(2) : {duBR(2)}")
print("2番目の定数の真の値 : ", (mpmath.e ** 2 - 7) / 2)
print(f"duBR(3) : {duBR(3)}")
print(f"duBR(4) : {duBR(4)}")
print("4番目の定数の真の値 : ", (mpmath.e ** 4 - 4 * mpmath.e ** 2 - 25) / 8)
print(f"duBR(5) : {duBR(5)}")
print(f"duBR(6) : {duBR(6)}")
print("6番目の定数の真の値 : ", (mpmath.e ** 6 - 6 * mpmath.e ** 4 + 3 * mpmath.e ** 2 - 98) / 32)
