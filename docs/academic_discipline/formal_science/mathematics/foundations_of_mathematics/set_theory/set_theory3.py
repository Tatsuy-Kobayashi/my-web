# 2つの集合のベン図
set1 = {1, 2, 3}
set2 = {3, 4, 5}
venn2([set1, set2], set_labels=('Set1', 'Set2'))
plt.show()

# 3つの集合のベン図
set1 = {1, 2, 3}
set2 = {3, 4, 5}
set3 = {1, 3, 5, 6}
venn3([set1, set2, set3], set_labels=('Set1', 'Set2', 'Set3'))
plt.show()
