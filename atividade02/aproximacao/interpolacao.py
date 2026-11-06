"""Lagrange e Newton usam os mesmos nós, escolhidos pela proximidade ao alvo."""

from atividade02.validacao import inteiro, numero, pontos


def avaliar_lagrange(xs, ys, alvo):
    parcelas = []
    bases = []
    for i, xi in enumerate(xs):
        base = 1.0
        for j, xj in enumerate(xs):
            if i != j:
                base *= (alvo-xj)/(xi-xj)
        bases.append(base)
        parcelas.append(ys[i]*base)
    return sum(parcelas), parcelas, bases


def diferencas_divididas(xs, ys):
    tabela = [ys[:]]
    for ordem in range(1, len(xs)):
        anterior = tabela[-1]
        tabela.append([(anterior[i+1]-anterior[i])/(xs[i+ordem]-xs[i])
                       for i in range(len(xs)-ordem)])
    return tabela


def avaliar_newton(xs, coeficientes, alvo):
    produto = 1.0
    parcelas = []
    for i, coeficiente in enumerate(coeficientes):
        parcelas.append(coeficiente*produto)
        produto *= alvo-xs[i]
    return sum(parcelas), parcelas


def interpolar(abscissas, ordenadas, alvo, grau=2, metodo="lagrange"):
    xs, ys = pontos(abscissas, ordenadas, minimo=3)
    alvo = numero(alvo, "Alvo")
    grau = inteiro(grau, 2, min(4, len(xs)-1), "Grau")
    if metodo not in ("lagrange", "newton"):
        raise ValueError("Escolha Lagrange ou Newton.")
    indices = sorted(sorted(range(len(xs)), key=lambda i: (abs(xs[i]-alvo), xs[i]))[:grau+1])
    nos_x, nos_y = [xs[i] for i in indices], [ys[i] for i in indices]
    tabela = diferencas_divididas(nos_x, nos_y)
    coeficientes = [coluna[0] for coluna in tabela]
    valor_l, parcelas_l, bases = avaliar_lagrange(nos_x, nos_y, alvo)
    valor_n, parcelas_n = avaliar_newton(nos_x, coeficientes, alvo)
    parcelas = parcelas_l if metodo == "lagrange" else parcelas_n
    passos = []
    for i, parcela in enumerate(parcelas):
        explicacao = (f"L{i}(alvo) = {bases[i]:.6g}; y{i} × L{i} = {parcela:.6g}."
                      if metodo == "lagrange" else
                      f"Coeficiente de ordem {i}: {coeficientes[i]:.6g}. Parcela no alvo: {parcela:.6g}.")
        passos.append({"titulo": f"Somar parcela {i+1} de {len(parcelas)}", "parcela": parcela,
                       "acumulado": sum(parcelas[:i+1]), "indice": i,
                       "explicacao": explicacao + " As parcelas formam o mesmo polinômio em ambas as formas."})
    minimo, maximo = min(xs[0], alvo), max(xs[-1], alvo)
    margem = (maximo-minimo)*0.08
    curva_x = [minimo-margem+(maximo-minimo+2*margem)*i/240 for i in range(241)]
    avaliar = lambda x: avaliar_newton(nos_x, coeficientes, x)[0]
    parcelas_curva = [avaliar_lagrange(nos_x, nos_y, x)[1] if metodo == "lagrange"
                      else avaliar_newton(nos_x, coeficientes, x)[1] for x in curva_x]
    comparacao = []
    for g in range(2, min(4, len(xs)-1)+1):
        ids = sorted(sorted(range(len(xs)), key=lambda i: (abs(xs[i]-alvo), xs[i]))[:g+1])
        nx, ny = [xs[i] for i in ids], [ys[i] for i in ids]
        vl = avaliar_lagrange(nx, ny, alvo)[0]
        vn = avaliar_newton(nx, [c[0] for c in diferencas_divididas(nx, ny)], alvo)[0]
        comparacao.append({"grau": g, "lagrange": vl, "newton": vn, "nos": nx})
    return {"valor": valor_l if metodo == "lagrange" else valor_n,
            "passos": passos, "nos_x": nos_x, "nos_y": nos_y, "indices": indices,
            "curva_x": curva_x, "curva_y": [avaliar(x) for x in curva_x],
            "curvas_parcelas": [[linha[i] for linha in parcelas_curva] for i in range(grau+1)],
            "coeficientes": coeficientes, "diferencas": tabela, "comparacao": comparacao,
            "extrapolacao": not xs[0] <= alvo <= xs[-1], "convergiu": True,
            "status": "Extrapolação: alvo fora dos dados" if not xs[0] <= alvo <= xs[-1] else "Interpolação calculada"}
