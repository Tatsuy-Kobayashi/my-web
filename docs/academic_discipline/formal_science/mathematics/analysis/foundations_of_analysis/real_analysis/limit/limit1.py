print(f"高さが無限大のテトレーションはe^-e ({np.exp(-np.e)}) ≦ x ≦e^(1/e) ({np.exp(1 / np.e)}) で収束する。")
def zzz_inf(z):
  result = scipy.special.lambertw(-np.log(z)) / (-np.log(z))
  return result

print(f"zzz_inf(np.exp(-np.e)) = {zzz_inf(np.exp(-np.e))}")
print(f"zzz_inf(1.1) = {zzz_inf(1.1)}")
print(f"1.1^zzz_inf(1.1) = {1.1 ** zzz_inf(1.1)}")
print(f"zzz_inf(√2) = {zzz_inf(np.sqrt(2))}")
print(f"zzz_inf(np.exp(1 / np.e)) = {zzz_inf(np.exp(1 / np.e))}")
