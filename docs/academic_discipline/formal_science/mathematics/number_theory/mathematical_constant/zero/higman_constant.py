import numpy as np
import sympy
import matplotlib.pyplot as plt

Groups_of_order_ = [0, 1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51, 1, 2, 1, 14, 1, 2, 2, 14, 1, 6, 1, 4, 2, 2, 1, 52, 2, 5, 1, 5, 1, 15, 2, 13, 2, 2, 1, 13, 1, 2, 4, 267, 1, 4, 1, 5, 1, 4, 1, 50, 1, 2, 3, 4, 1, 6, 1, 52, 15, 2, 1, 15, 1, 2, 1, 12, 1, 10, 1, 4, 2, 2, 1, 231, 1, 5, 2, 16, 1, 4, 1, 14, 2, 2, 1, 45, 1, 6, 2, 43, 1, 6, 1, 5, 4, 2, 1, 47, 2, 2, 1, 4, 5, 16, 1, 2328, 2, 4, 1, 10, 1, 2, 5, 15, 1, 4, 1, 11, 1, 2, 1, 197, 1, 2, 6, 5, 1, 13, 1, 12, 2, 4, 2, 18, 1, 2, 1, 238, 1, 55, 1, 5, 2, 2, 1, 57, 2, 4, 5, 4, 1, 4, 2, 42, 1, 2, 1, 37, 1, 4, 2, 12, 1, 6, 1, 4, 13, 4, 1, 1543, 1, 2, 2, 12, 1, 10, 1, 52, 2, 2, 2, 12, 2, 2, 2, 51, 1, 12, 1, 5, 1, 2, 1, 177, 1, 2, 2, 15, 1, 6, 1, 197, 6, 2, 1, 15, 1, 4, 2, 14, 1, 16, 1, 4, 2, 4, 1, 208, 1, 5, 67, 5, 2, 4, 1, 12, 1, 15, 1, 46, 2, 2, 1, 56092, 1, 6, 1, 15, 2, 2, 1, 39, 1, 4, 1, 4, 1, 30, 1, 54, 5, 2, 4, 10, 1, 2, 4, 40]

def GO(n):
    result = Groups_of_order_[n]
    return result

print(GO(64))

def A(n, m):
    result = (np.log(GO(sympy.prime(n) ** m)) / np.log(sympy.prime(n))) / (m ** 3)
    return result

print(f"素数 {sympy.prime(1)} のとき、A は {A(1, 3)}")
print(f"素数 {sympy.prime(2)} のとき、A は {A(2, 2)}")
print(f"2 / 27 = {2 / 27}")

# XとZの定義
X_1 = [2**m for m in np.linspace(0, 8, 8 + 1)]
X_2 = [3**m for m in np.linspace(0, 5, 5 + 1)]
X_3 = [5**m for m in np.linspace(0, 3, 3 + 1)]
Z_1 = [GO(int(x)) for x in X_1]
Z_2 = [GO(int(x)) for x in X_2]
Z_3 = [GO(int(x)) for x in X_3]

# グラフの作成
plt.figure(figsize=(15, 5)) # 消すとデフォルトのアスペクト比になる
plt.plot(Groups_of_order_, marker='o')
plt.title('Groups of Order')
plt.xlabel('Order')
plt.ylabel('Value')
plt.xticks(range(0, len(Groups_of_order_), 10)) # 消すと拡大表示でなくなる
plt.xlim(-1, 285)
plt.ylim(0, 400)
plt.grid(True)
# z = GO(2**m) のプロット
plt.plot(X_1, Z_1, label='z = GO(2**m)', color='green')
plt.plot(X_2, Z_2, label='z = GO(3**m)', color='red')
plt.plot(X_3, Z_3, label='z = GO(5**m)', color='yellow')

plt.legend()
plt.show()
