"""Validações compartilhadas: entradas inválidas nunca viram resultados silenciosos."""

import math


def numero(valor, nome="Valor"):
    """Aceita notação científica e vírgula decimal, mas rejeita NaN e infinito."""
    try:
        if isinstance(valor, bool):
            raise ValueError
        resultado = float(str(valor).strip().replace(",", "."))
    except (ValueError, TypeError):
        raise ValueError(f"{nome}: informe um número válido.") from None
    if not math.isfinite(resultado) or abs(resultado) > 1e100:
        raise ValueError(f"{nome}: informe um número finito de módulo até 1e100.")
    return resultado


def inteiro(valor, minimo, maximo, nome):
    resultado = numero(valor, nome)
    if not resultado.is_integer() or not minimo <= resultado <= maximo:
        raise ValueError(f"{nome}: use um inteiro entre {minimo} e {maximo}.")
    return int(resultado)


def sistema(matriz, termos):
    if not isinstance(matriz, list) or not 2 <= len(matriz) <= 12:
        raise ValueError("O sistema deve ter de 2 a 12 equações.")
    n = len(matriz)
    if any(not isinstance(linha, list) or len(linha) != n for linha in matriz):
        raise ValueError("A matriz dos coeficientes deve ser quadrada.")
    if not isinstance(termos, list) or len(termos) != n:
        raise ValueError("Informe um termo independente para cada equação.")
    a = [[numero(v, f"Coeficiente ({i+1}, {j+1})") for j, v in enumerate(linha)]
         for i, linha in enumerate(matriz)]
    b = [numero(v, f"Termo {i+1}") for i, v in enumerate(termos)]
    return a, b


def pontos(abscissas, ordenadas, minimo=2):
    if not isinstance(abscissas, list) or not isinstance(ordenadas, list):
        raise ValueError("Informe duas listas de pontos.")
    if len(abscissas) != len(ordenadas) or not minimo <= len(abscissas) <= 100:
        raise ValueError(f"Informe de {minimo} a 100 pares de pontos.")
    pares = sorted((numero(x, "Coordenada x"), numero(y, "Coordenada y"))
                   for x, y in zip(abscissas, ordenadas))
    xs, ys = map(list, zip(*pares))
    if any(xs[i] == xs[i-1] for i in range(1, len(xs))):
        raise ValueError("As coordenadas x devem ser distintas.")
    return xs, ys


def residuo(matriz, termos, solucao):
    """Norma infinita do resíduo no sistema original: max |Ax - b|."""
    return max(abs(sum(c*x for c, x in zip(linha, solucao))-b)
               for linha, b in zip(matriz, termos))
