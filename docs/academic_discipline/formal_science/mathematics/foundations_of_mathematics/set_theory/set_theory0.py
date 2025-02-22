print(f"集合型:   ", end='')
print({1, 2, 3, 4, 5, 6, 7, 8, 9})
print(f"内包表記: ", end='')
print({i for i in range(1, 10)})
print(f"関数:     {set(range(1, 10))}")

my_set = set()  # 空集合
for i in range(1, 10):
    my_set.add(i)
print(f"for文のブロックで定義: {my_set}")

print({1, 1, 2})

print(f"集合族: ", end='')
print({1, frozenset({1, 2})})

set1 = {1, 2, 3, 4, 5, 6, 7, 8, 9}
set2 = {1, 2}
print(f"2 は {set1} に属する: {2 in set1}")
print(f"10 は {set1} に属する: {10 in set1}")
