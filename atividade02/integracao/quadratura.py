"""Quadratura composta sobre dados tabulados, com áreas de cada painel."""

import math
from atividade02.validacao import pontos


def integrar(abscissas, ordenadas, metodo="trapezio"):
    xs, ys = pontos(abscissas, ordenadas)
    h = xs[1]-xs[0]
    if any(not math.isclose(xs[i]-xs[i-1], h, rel_tol=1e-8, abs_tol=abs(h)*1e-10)
           for i in range(2, len(xs))):
        raise ValueError("As regras repetidas deste simulador exigem pontos igualmente espaçados.")
    if metodo not in ("trapezio", "simpson"):
        raise ValueError("Escolha trapézio ou Simpson 1/3.")
    if metodo == "simpson" and (len(xs)-1) % 2:
        raise ValueError("Simpson 1/3 exige um número par de subintervalos (3, 5, 7… pontos).")
    passos = []
    area = 0.0
    salto = 1 if metodo == "trapezio" else 2
    for i in range(0, len(xs)-1, salto):
        if metodo == "trapezio":
            parcial = h*(ys[i]+ys[i+1])/2
            formula = f"({h:.6g}/2) × ({ys[i]:.6g} + {ys[i+1]:.6g})"
        else:
            parcial = h*(ys[i]+4*ys[i+1]+ys[i+2])/3
            formula = f"({h:.6g}/3) × ({ys[i]:.6g} + 4 × {ys[i+1]:.6g} + {ys[i+2]:.6g})"
        area += parcial
        passos.append({"titulo": f"Painel {len(passos)+1}: de {xs[i]:g} a {xs[i+salto]:g}",
                       "explicacao": f"Área do painel = {formula} = {parcial:.6g}. Soma acumulada: {area:.6g}.",
                       "inicio": i, "fim": i+salto, "parcela": parcial, "acumulado": area})
    return {"valor": area, "passos": passos, "h": h, "convergiu": True,
            "status": "Integral calculada", "subintervalos": len(xs)-1,
            "aviso": "Integral com sinal: valores negativos subtraem área." if min(ys) < 0 else ""}
