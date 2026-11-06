"""Eliminação de Gauss com pivotamento parcial e histórico para apresentação."""

from atividade02.validacao import residuo, sistema


def resolver_gauss(matriz, termos):
    original, b_original = sistema(matriz, termos)
    n = len(original)
    aumentada = [linha[:] + [b] for linha, b in zip(original, b_original)]
    passos = []

    def registrar(titulo, explicacao, pivo=None, solucao=None):
        passos.append({"titulo": titulo, "explicacao": explicacao,
                       "matriz": [linha[:] for linha in aumentada],
                       "pivo": pivo, "solucao": solucao})

    registrar("Sistema original", "Cada linha representa uma equação; a última coluna contém b.")
    for coluna in range(n):
        linha_pivo = max(range(coluna, n), key=lambda i: abs(aumentada[i][coluna]))
        escala = max(abs(v) for v in aumentada[linha_pivo][:-1])
        if escala == 0 or abs(aumentada[linha_pivo][coluna]) <= 1e-14 * escala:
            raise ValueError("O sistema é singular ou numericamente singular; não há solução única confiável.")
        if linha_pivo != coluna:
            aumentada[coluna], aumentada[linha_pivo] = aumentada[linha_pivo], aumentada[coluna]
            registrar("Troca de linhas", f"L{coluna+1} ↔ L{linha_pivo+1}: escolhemos o maior pivô em módulo.", coluna)
        for linha in range(coluna+1, n):
            fator = aumentada[linha][coluna] / aumentada[coluna][coluna]
            if fator == 0:
                continue
            for j in range(coluna, n+1):
                aumentada[linha][j] -= fator * aumentada[coluna][j]
            aumentada[linha][coluna] = 0.0
            registrar(f"Eliminar x{coluna+1} da linha {linha+1}",
                      f"L{linha+1} ← L{linha+1} − ({fator:.6g}) × L{coluna+1}. A solução é preservada.", coluna)
    solucao = [0.0] * n
    for linha in range(n-1, -1, -1):
        soma = sum(aumentada[linha][j] * solucao[j] for j in range(linha+1, n))
        solucao[linha] = (aumentada[linha][-1] - soma) / aumentada[linha][linha]
        registrar(f"Substituição: x{linha+1} = {solucao[linha]:.6g}",
                  "Voltamos da última equação à primeira, usando as incógnitas já calculadas.", linha, solucao[:])
    return {"solucao": solucao, "residuo": residuo(original, b_original, solucao),
            "passos": passos, "convergiu": True, "status": "Solução única calculada"}
