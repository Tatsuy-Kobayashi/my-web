def KB_const(n):
    prod = 1
    for k in range(3, n + 1):
        prod *= np.cos(np.pi / k)
    return prod

print(KB_const(10 ** 3))

KBconst = mpmath.nprod(lambda n: mpmath.cos(mpmath.pi / n), [3, mpmath.inf])
print(KBconst)
