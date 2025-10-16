def comprehension(predicate, domain):
    return {x for x in domain if predicate(x)}

# ドメインを {1, 2, ..., 9} とする
domain = range(1, 10)

# 命題 A(x): x が偶数である
A = lambda x: x % 2 == 0
even_set = comprehension(A, domain)
print("偶数の集合:", even_set)

# 命題 A(x): x が平方数である
B = lambda x: int(x**0.5)**2 == x
square_set = comprehension(B, domain)
print("平方数の集合:", square_set)

# 命題 A(x): x が3の倍数でない
C = lambda x: x % 3 != 0
non_multiple_of_3 = comprehension(C, domain)
print("3の倍数でない集合:", non_multiple_of_3)
