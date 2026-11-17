"""Quadratura composta sobre dados tabulados, com áreas de cada painel."""

import math

from atividade02.validacao import pontos


def integrar_trapezio(
        abscissas: list[float],
        ordenadas: list[float]) -> dict[str, object]:
    xs, ys = pontos(abscissas, ordenadas)
    h = xs[1] - xs[0]
    for i in range(2, len(xs)):
        distancia = xs[i] - xs[i - 1]
        if not math.isclose(distancia, h, rel_tol=1e-8, abs_tol=abs(h) * 1e-10):
            raise ValueError(
                "As regras repetidas deste simulador exigem pontos igualmente espaçados."
            )
    passos = []
    area = 0.0

    for i in range(len(xs) - 1):
        # Área do trapézio: largura × média das duas ordenadas.
        parcial = h * (ys[i] + ys[i + 1]) / 2
        area += parcial

        passos.append({
            "inicio": i,
            "fim": i + 1,
            "parcela": parcial,
            "acumulado": area,
        })

    return {
        "valor": area,
        "passos": passos,
        "h": h,
        "subintervalos": len(xs) - 1,
    }


def integrar_simpson(
        abscissas: list[float],
        ordenadas: list[float]) -> dict[str, object]:

    xs, ys = pontos(abscissas, ordenadas)
    h = xs[1] - xs[0]
    for i in range(2, len(xs)):
        distancia = xs[i] - xs[i - 1]
        if not math.isclose(distancia, h, rel_tol=1e-8, abs_tol=abs(h) * 1e-10):
            raise ValueError(
                "As regras repetidas deste simulador exigem pontos igualmente espaçados."
            )
    if (len(xs) - 1) % 2:
        raise ValueError(
            "Simpson 1/3 exige um número par de subintervalos (3, 5, 7… pontos)."
        )
    passos = []
    area = 0.0

    for i in range(0, len(xs) - 1, 2):
        # Simpson 1/3: três ordenadas com pesos 1, 4 e 1.
        parcial = h * (ys[i] + 4 * ys[i + 1] + ys[i + 2]) / 3
        area += parcial

        passos.append({
            "inicio": i,
            "fim": i + 2,
            "parcela": parcial,
            "acumulado": area,
        })

    return {
        "valor": area,
        "passos": passos,
        "h": h,
        "subintervalos": len(xs) - 1,
    }


def integrar(
        abscissas: list[float],
        ordenadas: list[float],
        metodo: str = "trapezio") -> dict[str, object]:
    if metodo == "trapezio":
        return integrar_trapezio(abscissas, ordenadas)
    if metodo == "simpson":
        return integrar_simpson(abscissas, ordenadas)
    raise ValueError("Escolha trapézio ou Simpson 1/3.")
