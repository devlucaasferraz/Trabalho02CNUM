/** Converte dados numéricos em textos de apresentação, sem refazer os cálculos. */
import { format } from "./util.js";

export const methodNames = {
  gauss: "Eliminação de Gauss",
  gauss_seidel: "Gauss-Seidel",
  lagrange: "Lagrange",
  newton: "Newton",
  trapezio: "Trapézio repetido",
  simpson: "Simpson 1/3 repetido",
};

function descreverPasso(resultado, dados, passo, indice) {
  const f = (valor) => format(valor, 6);
  if (resultado.metodo === "gauss") {
    const linha = passo.linha + 1;
    switch (passo.operacao) {
      case "original":
        return { titulo: "Sistema original", explicacao: "Cada linha representa uma equação; a última coluna contém b." };
      case "troca":
        return { titulo: "Troca de linhas", explicacao: `L${linha} ↔ L${passo.outra_linha + 1}: escolhemos o maior pivô em módulo.` };
      case "eliminacao":
        return {
          titulo: `Eliminar x${passo.pivo + 1} da linha ${linha}`,
          explicacao: `L${linha} ← L${linha} − (${f(passo.fator)}) × L${passo.pivo + 1}. A solução é preservada.`,
        };
      case "substituicao":
        return {
          titulo: `Substituição: x${linha} = ${f(passo.solucao[passo.linha])}`,
          explicacao: "Voltamos da última equação à primeira, usando as incógnitas já calculadas.",
        };
    }
  }
  if (resultado.metodo === "gauss_seidel") {
    return passo.iteracao === 0
      ? { titulo: "Aproximação inicial", explicacao: "Ponto de partida da iteração." }
      : {
          titulo: `Iteração ${passo.iteracao}`,
          explicacao: `Cada incógnita usa imediatamente os valores atualizados nesta iteração. Maior variação: ${f(passo.variacao)}; maior desequilíbrio |Ax − b|: ${f(passo.residuo)}.`,
        };
  }
  if (resultado.metodo === "lagrange" || resultado.metodo === "newton") {
    const i = passo.indice;
    const detalhe = resultado.metodo === "lagrange"
      ? `L${i}(alvo) = ${f(passo.base)}; y${i} × L${i} = ${f(passo.parcela)}.`
      : `Coeficiente de ordem ${i}: ${f(resultado.coeficientes[i])}. Parcela no alvo: ${f(passo.parcela)}.`;
    return {
      titulo: `Somar parcela ${indice + 1} de ${resultado.passos.length}`,
      explicacao: `${detalhe} As parcelas formam o mesmo polinômio em ambas as formas.`,
    };
  }
  const i = passo.inicio;
  const formula = resultado.metodo === "trapezio"
    ? `(${f(resultado.h)}/2) × (${f(dados.ys[i])} + ${f(dados.ys[passo.fim])})`
    : `(${f(resultado.h)}/3) × (${f(dados.ys[i])} + 4 × ${f(dados.ys[i + 1])} + ${f(dados.ys[passo.fim])})`;
  return {
    titulo: `Painel ${indice + 1}: de ${f(dados.xs[i])} a ${f(dados.xs[passo.fim])}`,
    explicacao: `Área do painel = ${formula} = ${f(passo.parcela)}. Soma acumulada: ${f(passo.acumulado)}.`,
  };
}

export function apresentarResultado(resultado, dados) {
  let status;
  switch (resultado.metodo) {
    case "gauss":
      status = "Solução única calculada";
      break;
    case "gauss_seidel":
      status = resultado.convergiu
        ? "Convergência atingida"
        : "Limite atingido: precisão não alcançada";
      break;
    case "lagrange":
    case "newton":
      status = resultado.extrapolacao
        ? "Extrapolação: alvo fora dos dados"
        : "Interpolação calculada";
      break;
    default:
      status = "Integral calculada";
  }
  const quadratura = resultado.metodo === "trapezio" || resultado.metodo === "simpson";
  return {
    ...resultado,
    nome_metodo: methodNames[resultado.metodo],
    status,
    aviso: quadratura && dados.ys.some((y) => y < 0)
      ? "Integral com sinal: valores negativos subtraem área."
      : "",
    passos: resultado.passos.map((passo, i) => ({
      ...passo,
      ...descreverPasso(resultado, dados, passo, i),
    })),
    comparacao: quadratura
      ? resultado.comparacao.map((item) => ({ ...item, metodo: methodNames[item.metodo] }))
      : resultado.comparacao,
  };
}
