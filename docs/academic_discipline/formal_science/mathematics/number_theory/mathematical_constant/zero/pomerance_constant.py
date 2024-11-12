def divisor(num):
    total = 1
    for i in range(2, int(num**0.5)+1):
        if num % i == 0:
            total += i
            if i**2 != num:
                total += num // i
    return total

# 一度だけ友愛数のリストを生成する
amical_l = []
for i in range(1, 10 ** 6 + 1):
    amical = divisor(i)
    if amical <= i:
        continue
    if divisor(amical) == i:
        amical_l.append((i, amical))

def amicable_num(n):
    return amical_l[n - 1]

print(len(amical_l))
print(amicable_num(1)[0])

def amicable_recpr_sum(n):
    result = 0
    for i in range(1, n + 1):
        result += 1 / amicable_num(i)[0] + 1 / amicable_num(i)[1]
    return result

print(amicable_recpr_sum(len(amical_l)))
