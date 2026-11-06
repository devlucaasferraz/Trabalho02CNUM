"""Dados do enunciado e modelo de equilíbrio da treliça (tração positiva)."""

from math import sqrt, hypot


def exemplo_trelica(carga_b=500.0, carga_d=100.0):
    """Monta ΣFx = 0 e ΣFy = 0 em A, B, C, D e E.

    A altura unitária apenas fixa a escala do desenho; os ângulos são os do PDF.
    A é apoio fixo (Rx, Ry) e E é apoio móvel (Ry). Cargas verticais para baixo.
    """
    nos = [[0, 0], [1, 1], [2, 0], [2+1/sqrt(3), 1], [2+4/sqrt(3), 0]]
    barras = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [2, 4], [3, 4]]
    a = [[0.0]*10 for _ in range(10)]
    for coluna, (inicio, fim) in enumerate(barras):
        dx, dy = nos[fim][0]-nos[inicio][0], nos[fim][1]-nos[inicio][1]
        comprimento = hypot(dx, dy)
        for no, sinal in ((inicio, 1), (fim, -1)):
            a[2*no][coluna] = sinal*dx/comprimento
            a[2*no+1][coluna] = sinal*dy/comprimento
    a[0][7], a[1][8], a[9][9] = 1.0, 1.0, 1.0
    b = [0.0]*10
    b[3], b[7] = carga_b, carga_d
    return {"id": "trelica", "titulo": "Equilíbrio de uma treliça", "codigo": "02.2",
            "grupo": "iterativos", "metodo": "gauss_seidel", "a": a, "b": b,
            "rotulos": ["AB", "AC", "BC", "BD", "CD", "CE", "DE", "Rx A", "Ry A", "Ry E"],
            "linhas": [f"{no} · {eixo}" for no in "ABCDE" for eixo in ("x", "y")],
            "nos": nos, "barras": barras, "cargas": [carga_b, carga_d],
            "unidade": "unidade de força", "normais": True,
            "descricao": "Duas cargas, cinco juntas e sete barras. Descubra as forças que equilibram a estrutura.",
            "nota": "Tração positiva; compressão negativa. O PDF não informa a unidade das cargas. "
            "Iteramos AᵀA x = Aᵀb, pois a ordem original tem zeros na diagonal; o resíduo é medido em Ax = b. "
            "Equações normais podem piorar o condicionamento: confira sempre o resíduo original."}


def exemplos():
    return [
        {"id": "producao", "codigo": "01.2", "titulo": "Produção de componentes", "grupo": "diretos", "metodo": "gauss",
         "descricao": "Quanto produzir com o metal, o plástico e a borracha disponíveis?",
         "a": [[15, 17, 19], [0.30, 0.40, 0.55], [1.0, 1.2, 1.5]], "b": [3890, 95, 282],
         "rotulos": ["Componente 1", "Componente 2", "Componente 3"], "linhas": ["Metal", "Plástico", "Borracha"],
         "unidade": "componentes/dia", "normais": False,
         "nota": "Coeficientes em g/componente. Estoques convertidos de kg para g: 3890, 95 e 282. "
         "Cada linha é um material e cada coluna um componente. A solução é contínua; não é otimização inteira."},
        exemplo_trelica(),
        {"id": "tensao", "codigo": "03.2", "titulo": "Tensão em um resistor", "grupo": "interpolacao", "metodo": "lagrange",
         "descricao": "Estime a tensão entre as medições e compare os polinômios de graus 2, 3 e 4.",
         "xs": [0.25, 0.75, 1.25, 1.5, 2.0], "ys": [-0.45, -0.60, 0.70, 1.88, 6.0],
         "alvo": 1.15, "grau": 2, "eixo_x": "Corrente i", "eixo_y": "Tensão V", "unidade": "V",
         "nota": "Os nós são escolhidos por proximidade ao alvo, com desempate pelo menor x. "
         "Lagrange e Newton representam o mesmo polinômio para os mesmos nós. Grau maior não garante menor erro."},
        {"id": "rio", "codigo": "04.1", "titulo": "Seção transversal de um rio", "grupo": "integracao", "metodo": "simpson",
         "descricao": "Transforme profundidades medidas em uma estimativa da área da seção do rio.",
         "xs": list(range(0, 21, 2)), "ys": [0, 1.8, 2, 4, 4, 6, 4, 3.6, 3.4, 2.8, 0],
         "eixo_x": "Distância da margem (m)", "eixo_y": "Profundidade (m)", "unidade": "m²",
         "nota": "Pontos lidos da figura: margens com profundidade zero, 10 subintervalos de 2 m. "
         "A profundidade é desenhada para baixo; a área é positiva. Simpson 1/3 usa uma parábola por par de subintervalos."},
    ]
