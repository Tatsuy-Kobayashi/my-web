set1 = {1, 2, 3, 4, 5, 6, 7, 8, 9}
set2 = {1, 2}

# set1 が set2 の部分集合であるかどうかを判定する
is_subset = set1.issubset(set1)
print(f"{set2} は {set1} の部分集合である: {is_subset}")

num_elements = len(set1)
print(f"集合 {set1} の要素数は {num_elements} 個。")

import itertools

def powerset(iterable):
    "べき集合を生成します。"
    s = list(iterable)
    return list(itertools.chain.from_iterable(itertools.combinations(s, r) for r in range(len(s)+1)))

power_set = powerset(set2)
print("set2のべき集合:", power_set)
print(type(power_set[3]))
print(len(power_set))
