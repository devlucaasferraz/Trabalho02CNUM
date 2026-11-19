from atividade02.validacao import residuo, sistema


def resolver_gauss(matriz, termos):
    A, b = sistema(matriz, termos)
    n = len(A)

    # matriz aumentada [A | b]
    M = [A[i][:] + [b[i]] for i in range(n)]

    passos = []

    def salvar_passo(operacao, pivo=None, solucao=None, **extra):
        passo = {
            "operacao": operacao,
            "matriz": [linha[:] for linha in M],
            "pivo": pivo,
            "solucao": solucao,
        }
        passo.update(extra)
        passos.append(passo)

    salvar_passo("original")

    # aq ocorre o escalonamento
    for k in range(n):
        # pivotamento
        p = k
        for i in range(k + 1, n):
            if abs(M[i][k]) > abs(M[p][k]):
                p = i

        # verfifica se o pivo é zero
        maior = max(abs(x) for x in M[p][:-1])
        if maior == 0 or abs(M[p][k]) <= 1e-14 * maior:
            raise ValueError("Sistema singular: não tem solução única.")

        if p != k:
            M[k], M[p] = M[p], M[k]
            salvar_passo("troca", k, linha=k, outra_linha=p)

        for i in range(k + 1, n):
            fator = M[i][k] / M[k][k]
            if fator == 0:
                continue

            for j in range(k, n + 1):
                M[i][j] -= fator * M[k][j]
            M[i][k] = 0.0 

            salvar_passo("eliminacao", k, linha=i, fator=fator)

    # substituição regressiva
    x = [0.0] * n
    for i in range(n - 1, -1, -1):
        soma = 0.0
        for j in range(i + 1, n):
            soma += M[i][j] * x[j]
        x[i] = (M[i][n] - soma) / M[i][i]
        salvar_passo("substituicao", i, x[:], linha=i)

    return {
        "solucao": x,
        "residuo": residuo(A, b, x),
        "passos": passos,
    }