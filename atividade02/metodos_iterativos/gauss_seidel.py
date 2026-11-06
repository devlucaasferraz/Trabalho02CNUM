"""Gauss-Seidel: atualizações sequenciais e verificação no sistema original."""

import math
from atividade02.validacao import inteiro, numero, residuo, sistema


def resolver_gauss_seidel(matriz, termos, inicial=None, tolerancia=1e-4,
                         max_iteracoes=2000, equacoes_normais=False):
    original, b_original = sistema(matriz, termos)
    n = len(original)
    tol = numero(tolerancia, "Tolerância")
    if not 0 < tol <= 1:
        raise ValueError("A tolerância deve ser maior que zero e no máximo 1.")
    limite = inteiro(max_iteracoes, 1, 10000, "Limite de iterações")
    if inicial is None:
        x = [0.0] * n
    elif not isinstance(inicial, list) or len(inicial) != n:
        raise ValueError("A aproximação inicial deve ter um valor para cada incógnita.")
    else:
        x = [numero(v, "Aproximação inicial") for v in inicial]
    a, b = original, b_original
    if equacoes_normais:
        # A treliça tem zeros na diagonal do sistema de equilíbrio. AᵀA preserva
        # sua solução única e permite aplicar Gauss-Seidel com diagonal positiva.
        a = [[sum(original[k][i]*original[k][j] for k in range(n))
              for j in range(n)] for i in range(n)]
        b = [sum(original[k][i]*b_original[k] for k in range(n)) for i in range(n)]
    if any(a[i][i] == 0 for i in range(n)):
        raise ValueError("Há zero na diagonal. Reordene as equações ou ative AᵀA nas opções.")
    passos = [{"titulo": "Aproximação inicial", "explicacao": "Ponto de partida da iteração.",
               "solucao": x[:], "residuo": residuo(original, b_original, x), "variacao": 0}]
    convergiu = passos[0]["residuo"] <= tol
    for iteracao in range(1, limite+1):
        if convergiu:
            break
        anterior = x[:]
        for i in range(n):
            soma = sum(a[i][j]*x[j] for j in range(n) if j != i)
            x[i] = (b[i]-soma) / a[i][i]
        if any(not math.isfinite(v) or abs(v) > 1e100 for v in x):
            raise ValueError("As aproximações divergiram. Revise o sistema ou use AᵀA para um sistema não singular.")
        erro = residuo(original, b_original, x)
        variacao = max(abs(v-u) for v, u in zip(x, anterior))
        passos.append({"titulo": f"Iteração {iteracao}", "solucao": x[:],
                       "residuo": erro, "variacao": variacao,
                       "explicacao": "Cada incógnita usa imediatamente os valores atualizados nesta iteração. "
                       f"Maior variação: {variacao:.4g}; maior desequilíbrio |Ax − b|: {erro:.4g}."})
        convergiu = erro <= tol and variacao <= tol
    return {"solucao": x, "residuo": passos[-1]["residuo"], "passos": passos,
            "iteracoes": len(passos)-1, "convergiu": convergiu,
            "status": "Convergência atingida" if convergiu else "Limite atingido: precisão não alcançada",
            "equacoes_normais": equacoes_normais,
            "diagonal_dominante": all(abs(a[i][i]) >= sum(abs(a[i][j]) for j in range(n) if j != i) for i in range(n)),
            "matriz_iterada": a, "termos_iterados": b}
