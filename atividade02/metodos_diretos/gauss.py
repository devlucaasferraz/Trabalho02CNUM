"""Eliminação de Gauss com pivotamento parcial e histórico para apresentação."""

from atividade02.validacao import residuo, sistema


def resolver_gauss(matriz, termos):
    original, b_original = sistema(matriz, termos)
    n = len(original)
    aumentada = [linha[:] + [b] for linha, b in zip(original, b_original)]
    passos = []

    def registrar(operacao, pivo=None, solucao=None, **dados):
        passos.append({"operacao": operacao, **dados,
                       "matriz": [linha[:] for linha in aumentada],
                       "pivo": pivo, "solucao": solucao})

    registrar("original")
    for coluna in range(n):
        linha_pivo = max(range(coluna, n), key=lambda i: abs(aumentada[i][coluna]))
        escala = max(abs(v) for v in aumentada[linha_pivo][:-1])
        if escala == 0 or abs(aumentada[linha_pivo][coluna]) <= 1e-14 * escala:
            raise ValueError("O sistema é singular ou numericamente singular; não há solução única confiável.")
        if linha_pivo != coluna:
            aumentada[coluna], aumentada[linha_pivo] = aumentada[linha_pivo], aumentada[coluna]
            registrar("troca", coluna, linha=coluna, outra_linha=linha_pivo)
        for linha in range(coluna+1, n):
            fator = aumentada[linha][coluna] / aumentada[coluna][coluna]
            if fator == 0:
                continue
            for j in range(coluna, n+1):
                aumentada[linha][j] -= fator * aumentada[coluna][j]
            aumentada[linha][coluna] = 0.0
            registrar("eliminacao", coluna, linha=linha, fator=fator)
    solucao = [0.0] * n
    for linha in range(n-1, -1, -1):
        soma = sum(aumentada[linha][j] * solucao[j] for j in range(linha+1, n))
        solucao[linha] = (aumentada[linha][-1] - soma) / aumentada[linha][linha]
        registrar("substituicao", linha, solucao[:], linha=linha)
    return {"solucao": solucao, "residuo": residuo(original, b_original, solucao),
            "passos": passos}
