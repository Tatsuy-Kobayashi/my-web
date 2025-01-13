KBconst_p = mpmath.nprod(lambda k: mpmath.cos(mpmath.pi / mpmath.mpf(sympy.prime(int(k)))), [2, mpmath.inf])
print(KBconst_p)
