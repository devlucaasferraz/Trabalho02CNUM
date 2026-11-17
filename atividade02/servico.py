"""Casos de uso: a interface recebe o mesmo resultado que gerou os passos."""

from time import perf_counter
from atividade02.exemplos import exemplo_trelica
from atividade02.metodos_diretos.gauss import resolver_gauss
from atividade02.metodos_iterativos.gauss_seidel import resolver_gauss_seidel
from atividade02.aproximacao.interpolacao import interpolar, avaliar_lagrange
from atividade02.integracao.quadratura import integrar
from atividade02.validacao import numero, pontos

METODOS = {"gauss", "gauss_seidel", "lagrange", "newton", "trapezio", "simpson"}


def simular(entrada):
    if not isinstance(entrada, dict):
        raise ValueError("Envie um objeto com os dados da simulação.")
    metodo = entrada.get("metodo")
    if metodo not in METODOS:
        raise ValueError("Método desconhecido.")
    inicio_calculo = perf_counter()
    if metodo == "gauss":
        resultado = resolver_gauss(entrada.get("a"), entrada.get("b"))
    elif metodo == "gauss_seidel":
        if not isinstance(entrada.get("normais", False), bool):
            raise ValueError("A opção AᵀA deve ser booleana.")
        resultado = resolver_gauss_seidel(
            entrada.get("a"), entrada.get("b"), entrada.get("inicial"),
            entrada.get("tolerancia", 1e-4), entrada.get("max_iteracoes", 2000),
            entrada.get("normais", False))
    elif metodo in ("lagrange", "newton"):
        resultado = interpolar(entrada.get("xs"), entrada.get("ys"), entrada.get("alvo"),
                              entrada.get("grau", 2), metodo)
    else:
        resultado = integrar(entrada.get("xs"), entrada.get("ys"), metodo)
        xs, ys = pontos(entrada["xs"], entrada["ys"])
        # A interface recebe as curvas prontas; não interpola os painéis.
        resultado["paineis"] = []
        for passo in resultado["passos"]:
            inicio, fim = passo["inicio"], passo["fim"]
            if metodo == "trapezio":
                curva = [[xs[inicio], ys[inicio]], [xs[fim], ys[fim]]]
            else:
                nos_x, nos_y = xs[inicio:fim+1], ys[inicio:fim+1]
                curva = []
                for j in range(33):
                    x = xs[inicio] + (xs[fim] - xs[inicio]) * j / 32
                    y = avaliar_lagrange(nos_x, nos_y, x)[0]
                    curva.append([x, y])
            resultado["paineis"].append(curva)
        resultado["comparacao"] = []
        for alternativa in ("trapezio", "simpson"):
            try:
                outro = integrar(xs, ys, alternativa)
                resultado["comparacao"].append({"metodo": alternativa, "valor": outro["valor"]})
            except ValueError as erro:
                resultado["comparacao"].append({"metodo": alternativa, "erro": str(erro)})
    resultado["tempo_ms"] = (perf_counter()-inicio_calculo)*1000
    resultado["metodo"] = metodo
    # Desenhar a treliça só é válido quando os coeficientes ainda são os do modelo.
    if metodo in ("gauss", "gauss_seidel"):
        trelica = exemplo_trelica()
        a, b = entrada.get("a", []), entrada.get("b", [])
        modelo_preservado = (len(a) == 10 and len(b) == 10
                            and all(len(linha) == 10 for linha in a)
                            and all(abs(numero(a[i][j])-trelica['a'][i][j]) < 1e-12
                                    for i in range(10) for j in range(10))
                            and all(numero(b[i]) == 0 for i in range(10) if i not in (3, 7)))
        if modelo_preservado:
            resultado["trelica"] = {"nos": trelica["nos"], "barras": trelica["barras"],
                                    "rotulos": trelica["rotulos"], "cargas": [numero(b[3]), numero(b[7])]}
    return resultado
