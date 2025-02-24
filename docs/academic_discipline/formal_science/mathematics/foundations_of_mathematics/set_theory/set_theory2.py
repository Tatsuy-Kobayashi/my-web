set1 = {1, 2, 3}
set2 = {3, 4, 5}

# 演算子を使用
union_set = set1 | set2

# union() メソッドを使用
union_set = set1.union(set2)

print(f"{set1} と {set2} の和集合: {union_set}")  # 出力: set1 と set2 の和集合: {1, 2, 3, 4, 5}

# 演算子を使用
intersection_set = set1 & set2

# intersection() メソッドを使用
intersection_set = set1.intersection(set2)

print(f"{set1} と {set2} の積集合: {intersection_set}")  # 出力: set1 と set2 の積集合: {3}

# 演算子を使用
difference_set = set1 - set2

# difference() メソッドを使用
difference_set = set1.difference(set2)

print(f"{set1} と {set2} の差集合: {difference_set}")  # 出力: set1 と set2 の差集合: {1, 2}

# 演算子を使用
symmetric_difference_set = set1 ^ set2

# symmetric_difference() メソッドを使用
symmetric_difference_set = set1.symmetric_difference(set2)

print(f"{set1} と {set2} の対称差: {symmetric_difference_set}")  # 出力: set1 と set2 の対称差: {1, 2, 4, 5}

universal_set = {1, 2, 3, 4, 5, 6}
set1 = {1, 2, 3}

complement_set = universal_set - set1

print(f"全体集合 {universal_set} に対する set1 {set1} の補集合: {complement_set}")  # 出力: 全体集合 {1, 2, 3, 4, 5, 6} に対する set1 {1, 2, 3} の補集合: {4, 5, 6}
