from matplotlib_venn import venn2, venn3
import matplotlib.pyplot as plt

# 集合を定義
set1 = {1, 2, 3}
set2 = {3, 4, 5}

# ベン図を作成
v = venn2([set1, set2], set_labels=('Set1', 'Set2'))

# 各領域に要素と要素数を表示
# 要素数はlen()関数で取得し、要素は'\n'.join(map(str, ...))で文字列に変換
# ラベルを追加
v.get_label_by_id('10').set_text(f"Count: {len(set1 - set2)}\nElement: " + '\n'.join(map(str, set1 - set2)))
v.get_label_by_id('01').set_text(f"Count: {len(set2 - set1)}\nElement: " + '\n'.join(map(str, set2 - set1)))
v.get_label_by_id('11').set_text(f"Count: {len(set1 & set2)}\nElement: " + '\n'.join(map(str, set1 & set2)))

plt.title('Venn Diagram with Elements and Counts')
plt.show()

# 集合を定義
set1 = {1, 2, 3}
set2 = {3, 4, 5}
set3 = {1, 3, 5, 6}

# ベン図を作成
v = venn3([set1, set2, set3], set_labels=('Set1', 'Set2', 'Set3'))

# 各領域に要素と要素数を表示
# ラベルを追加
v.get_label_by_id('100').set_text(f"Count: {len(set1 - set2 - set3)}\nElement: " + '\n'.join(map(str, set1 - set2 - set3)))
v.get_label_by_id('010').set_text(f"Count: {len(set2 - set1 - set3)}\nElement: " + '\n'.join(map(str, set2 - set1 - set3)))
v.get_label_by_id('001').set_text(f"Count: {len(set3 - set1 - set2)}\nElement: " + '\n'.join(map(str, set3 - set1 - set2)))
v.get_label_by_id('110').set_text(f"Count: {len((set1 & set2) - set3)}\nElement: null")
v.get_label_by_id('101').set_text(f"Count: {len((set1 & set3) - set2)}\nElement: " + '\n'.join(map(str, (set1 & set3) - set2)))
v.get_label_by_id('011').set_text(f"Count: {len((set2 & set3) - set1)}\nElement: " + '\n'.join(map(str, (set2 & set3) - set1)))
v.get_label_by_id('111').set_text(f"Count: {len(set1 & set2 & set3)}\nElement: " + '\n'.join(map(str, set1 & set2 & set3)))

plt.title('Venn Diagram with Elements and Counts')
plt.show()
