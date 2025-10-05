from sympy import symbols, factorial, exp, simplify

# 定義するシンボル
m, r, s = symbols('m r s', integer=True)

# 定数部分
term1 = -3
term2 = -(factorial(2 * m - 2)) / (2**(2 * m - 1) * factorial(m) * factorial(m - 1))

# 二重和の部分を関数化
def calculate_term3(m_value):
    result = 0
    for r_value in range(1, m_value + 1):
        for s_value in range(0, m_value - r_value + 1):
            term = (
                (-1)**s_value * (4 * r_value)**s_value * exp(2 * r_value)
                / (2**(2 * m_value - 1) * factorial(s_value) * factorial(m_value - r_value - s_value))
                * (
                    factorial(2 * m_value - s_value) / factorial(m_value + r_value)
                    - 4 * factorial(2 * m_value - s_value - 1) / factorial(m_value + r_value - 1)
                    + 4 * factorial(2 * m_value - s_value - 2) / factorial(m_value + r_value - 2)
                )
            )
            result += term
    return result

# m の値を指定して計算
for m_value in range(1, 4):
    term3_value = calculate_term3(m_value)

    # c_{2m} の式
    c_2m = term1 + term2.subs(m, m_value) + term3_value
    print(f"c_{{2m}} for m={m_value}: {c_2m}")
