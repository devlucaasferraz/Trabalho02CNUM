/** Gráficos SVG locais. Os números vêm do serviço; aqui cuidamos da geometria. */
import { $, format } from "./util.js";

const NS = "http://www.w3.org/2000/svg";
const colors = {
  green: "var(--plot-green)",
  light: "var(--plot-light)",
  orange: "var(--plot-orange)",
  blue: "var(--plot-blue)",
  grid: "var(--plot-grid)",
  text: "var(--plot-text)",
  red: "var(--plot-red)",
};
function svg(tag, attributes = {}, text = "") {
  const node = document.createElementNS(NS, tag);
  Object.entries(attributes).forEach(([key, value]) =>
    node.setAttribute(key, String(value)),
  );
  if (text !== "") node.textContent = text;
  return node;
}
function add(tag, attributes, text) {
  const node = svg(tag, attributes, text);
  $("chart").append(node);
  return node;
}
function line(x1, y1, x2, y2, attributes = {}) {
  return add("line", { x1, y1, x2, y2, ...attributes });
}
function text(x, y, label, attributes = {}) {
  return add("text", { x, y, ...attributes }, label);
}
function path(points, attributes = {}) {
  return add("path", {
    d: points
      .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`)
      .join(" "),
    fill: "none",
    ...attributes,
  });
}
function tip(node, label) {
  node.setAttribute("data-tip", label);
  node.setAttribute("tabindex", "0");
  node.setAttribute("aria-label", label);
  return node;
}

function axes(
  xs,
  ys,
  xLabel,
  yLabel,
  { down = false, log = false, categorical = false } = {},
) {
  let xmin = Math.min(...xs),
    xmax = Math.max(...xs),
    ymin = Math.min(0, ...ys),
    ymax = Math.max(0, ...ys);
  if (log) {
    ymin = Math.min(...ys);
    ymax = Math.max(...ys);
  }
  if (xmin === xmax) {
    xmin -= 1;
    xmax += 1;
  }
  if (ymin === ymax) {
    ymin -= 1;
    ymax += 1;
  }
  const dy = (ymax - ymin) * 0.14;
  if (!down) {
    if (ymin < 0 || log) ymin -= dy;
    ymax += dy;
  } else ymax += dy;
  const left = 66,
    right = 724,
    top = 27,
    bottom = 289;
  const X = (x) => left + ((x - xmin) / (xmax - xmin)) * (right - left);
  const Y = (y) =>
    down
      ? top + ((y - ymin) / (ymax - ymin)) * (bottom - top)
      : bottom - ((y - ymin) / (ymax - ymin)) * (bottom - top);
  for (let i = 0; i <= 5; i++) {
    const y = ymin + ((ymax - ymin) * i) / 5;
    line(left, Y(y), right, Y(y), {
      stroke: colors.grid,
      "stroke-dasharray": "3 5",
    });
    text(left - 12, Y(y) + 4, log ? `10^${format(y, 1)}` : format(y, 1), {
      "text-anchor": "end",
    });
    const x = xmin + ((xmax - xmin) * i) / 5;
    if (!categorical)
      text(X(x), bottom + 20, format(x, 2), { "text-anchor": "middle" });
  }
  line(left, Y(0), right, Y(0), {
    stroke: log ? "none" : "var(--plot-baseline)",
    "stroke-width": 1,
  });
  text((left + right) / 2, 332, xLabel, {
    "text-anchor": "middle",
    class: "axis-label",
  });
  text(17, (top + bottom) / 2, yLabel, {
    transform: `rotate(-90 17 ${(top + bottom) / 2})`,
    "text-anchor": "middle",
    class: "axis-label",
  });
  return { X, Y, left, right, top, bottom };
}

function drawInterpolation(result, data, index, view) {
  const contributions = view === "parcelas";
  const activeCurve = result.curvas_parcelas[index];
  const accumulatedCurve = result.curva_x.map((_, j) =>
    result.curvas_parcelas
      .slice(0, index + 1)
      .reduce((sum, curve) => sum + curve[j], 0),
  );
  const { X, Y } = axes(
    result.curva_x,
    [
      ...data.ys,
      ...result.curva_y,
      result.valor,
      ...(contributions ? [...activeCurve, ...accumulatedCurve] : []),
    ],
    data.eixo_x || "x",
    data.eixo_y || "y",
  );
  path(
    result.curva_x.map((x, i) => [X(x), Y(result.curva_y[i])]),
    {
      stroke: contributions ? "var(--plot-reference)" : colors.green,
      "stroke-width": 2.6,
      "stroke-dasharray": contributions ? "5 4" : "none",
    },
  );
  if (contributions) {
    path(
      result.curva_x.map((x, j) => [X(x), Y(activeCurve[j])]),
      {
        stroke: colors.orange,
        "stroke-width": 2.3,
      },
    );
    path(
      result.curva_x.map((x, j) => [X(x), Y(accumulatedCurve[j])]),
      {
        stroke: colors.green,
        "stroke-width": 2.6,
      },
    );
  }
  const alvo = Number(String(data.alvo).replace(",", "."));
  line(X(alvo), Y(0), X(alvo), Y(result.valor), {
    stroke: colors.orange,
    "stroke-dasharray": "5 4",
    "stroke-width": 1.4,
  });
  line(X(Math.min(...data.xs)), Y(result.valor), X(alvo), Y(result.valor), {
    stroke: colors.orange,
    "stroke-dasharray": "5 4",
  });
  data.xs.forEach((x, i) => {
    const selected = result.indices.includes(i),
      active = i === result.indices[index];
    if (active)
      add("circle", {
        cx: X(x),
        cy: Y(data.ys[i]),
        r: 12,
        fill: "var(--plot-halo)",
      });
    tip(
      add("circle", {
        cx: X(x),
        cy: Y(data.ys[i]),
        r: selected ? 5.5 : 4,
        fill: active
          ? colors.orange
          : selected
            ? colors.green
            : "var(--plot-unused)",
        stroke: "var(--plot-surface)",
        "stroke-width": 2,
      }),
      `Ponto ${i + 1}: x = ${format(x)}; y = ${format(data.ys[i])}${selected ? " · nó utilizado" : ""}`,
    );
  });
  tip(
    add("circle", {
      cx: X(alvo),
      cy: Y(result.valor),
      r: 6,
      fill: colors.orange,
      stroke: "var(--plot-surface)",
      "stroke-width": 2,
    }),
    `Estimativa: P(${format(alvo)}) = ${format(result.valor)}`,
  );
  text(
    X(alvo) + 11,
    Y(result.valor) - 14,
    `P(${format(alvo)}) = ${format(result.valor)}`,
    { class: "strong" },
  );
  return {
    title: contributions
      ? "Some as parcelas e veja o polinômio nascer"
      : "Dos pontos ao polinômio",
    subtitle: `Grau ${data.grau} · ${result.nos_x.length} nós escolhidos perto de x = ${format(alvo)}`,
    legend: contributions
      ? [
          ["Soma até este passo", "green"],
          ["Parcela em foco", "orange"],
          ["Polinômio completo (tracejado)", "gray"],
        ]
      : [
          ["Polinômio interpolador", "green"],
          ["Nós utilizados", "green"],
          ["Parcela / estimativa", "orange"],
          ["Outras medições", "gray"],
        ],
  };
}

function drawIntegration(result, data, index) {
  const down = data.id === "rio";
  const panels = result.passos.map((step) => {
    const points = [];
    if (result.metodo === "trapezio") {
      points.push(
        [data.xs[step.inicio], data.ys[step.inicio]],
        [data.xs[step.fim], data.ys[step.fim]],
      );
    } else {
      const i = step.inicio,
        x0 = data.xs[i],
        x1 = data.xs[i + 1],
        x2 = data.xs[i + 2];
      // Parábola local de três nós: usada apenas para desenhar o painel de Simpson.
      for (let j = 0; j <= 32; j++) {
        const x = x0 + ((x2 - x0) * j) / 32;
        const y =
          (data.ys[i] * (x - x1) * (x - x2)) / ((x0 - x1) * (x0 - x2)) +
          (data.ys[i + 1] * (x - x0) * (x - x2)) / ((x1 - x0) * (x1 - x2)) +
          (data.ys[i + 2] * (x - x0) * (x - x1)) / ((x2 - x0) * (x2 - x1));
        points.push([x, y]);
      }
    }
    return points;
  });
  const { X, Y } = axes(
    data.xs,
    [...data.ys, ...panels.flatMap((panel) => panel.map((point) => point[1]))],
    data.eixo_x || "x",
    data.eixo_y || "y",
    { down },
  );
  result.passos.forEach((step, k) => {
    const points = panels[k].map(([x, y]) => [X(x), Y(y)]);
    const polygon = [
      [X(data.xs[step.inicio]), Y(0)],
      ...points,
      [X(data.xs[step.fim]), Y(0)],
    ];
    const fill =
      k === index
        ? "var(--plot-panel-active)"
        : k < index
          ? "var(--plot-panel-done)"
          : "var(--plot-panel-future)";
    tip(
      add("polygon", {
        points: polygon.map((p) => p.join(",")).join(" "),
        fill,
        stroke: "var(--plot-surface)",
        "stroke-width": 1,
      }),
      `Painel ${k + 1}: ${format(step.parcela)} ${data.unidade || "unidades²"}; acumulado ${format(step.acumulado)}`,
    );
    path(points, {
      stroke:
        k === index
          ? colors.orange
          : k < index
            ? colors.green
            : "var(--plot-future-line)",
      "stroke-width": k === index ? 3 : 1.8,
    });
    line(
      X(data.xs[step.inicio]),
      Y(0),
      X(data.xs[step.inicio]),
      Y(data.ys[step.inicio]),
      { stroke: "var(--plot-divider)", "stroke-dasharray": "3 3" },
    );
  });
  line(X(data.xs[0]), Y(0), X(data.xs.at(-1)), Y(0), {
    stroke: colors.blue,
    "stroke-width": 1.7,
  });
  if (down)
    text(
      X((data.xs[0] + data.xs.at(-1)) / 2),
      Y(0) - 10,
      "superfície da água",
      {
        "text-anchor": "middle",
        class: "point-label",
      },
    );
  data.xs.forEach((x, i) => {
    tip(
      add("circle", {
        cx: X(x),
        cy: Y(data.ys[i]),
        r: 4.2,
        fill: colors.green,
        stroke: "var(--plot-surface)",
        "stroke-width": 1.5,
      }),
      `x = ${format(x)}; ${down ? "profundidade" : "y"} = ${format(data.ys[i])}`,
    );
    if (data.xs.length <= 15)
      text(X(x), Y(data.ys[i]) + (down ? 19 : -12), format(data.ys[i], 2), {
        "text-anchor": "middle",
        class: "point-label",
      });
  });
  return {
    title: down
      ? "A área escondida sob a superfície"
      : "A integral, painel por painel",
    subtitle: down
      ? "Profundidades para baixo · áreas positivas · passe sobre os painéis para ler os valores"
      : "Cada faixa representa a contribuição de um painel para a integral com sinal",
    legend: [
      ["Painéis somados", "green"],
      ["Painel em foco", "orange"],
      ["Ainda não somados", "gray"],
      [down ? "Superfície da água" : "Linha de base", "blue"],
    ],
  };
}

function drawMatrix(result, data, index) {
  const step = result.passos[index],
    matrix = step.matriz,
    n = matrix.length;
  const cellW = Math.min(115, 640 / (n + 1)),
    cellH = Math.min(52, 245 / n);
  const x0 = (760 - cellW * (n + 1)) / 2,
    y0 = (315 - cellH * n) / 2;
  matrix.forEach((row, i) => {
    text(x0 - 14, y0 + i * cellH + cellH * 0.62, `L${i + 1}`, {
      "text-anchor": "end",
    });
    row.forEach((v, j) => {
      const pivot = i === step.pivo && j === step.pivo;
      add("rect", {
        x: x0 + j * cellW + 2,
        y: y0 + i * cellH + 2,
        width: cellW - 4,
        height: cellH - 4,
        rx: 5,
        fill: pivot
          ? "var(--plot-pivot)"
          : j === n
            ? "var(--plot-rhs)"
            : Math.abs(v) < 1e-12
              ? "var(--plot-zero)"
              : "var(--plot-cell)",
      });
      tip(
        text(
          x0 + (j + 0.5) * cellW,
          y0 + (i + 0.61) * cellH,
          format(v, n > 6 ? 3 : 5),
          { "text-anchor": "middle", class: pivot ? "strong" : "" },
        ),
        `Linha ${i + 1}, ${j === n ? "b" : `x${j + 1}`} = ${format(v, 10)}`,
      );
    });
  });
  for (let j = 0; j <= n; j++)
    text(x0 + (j + 0.5) * cellW, y0 - 10, j === n ? "b" : `x${j + 1}`, {
      "text-anchor": "middle",
      class: "strong",
    });
  return {
    title: "Transformar sem mudar a solução",
    subtitle: "A matriz aumentada acompanha cada operação de linha",
    legend: [
      ["Pivô em foco", "green"],
      ["Termos independentes", "gray"],
    ],
  };
}

function drawBars(result, data) {
  const xs = result.solucao.map((_, i) => i),
    { X, Y } = axes(
      [-0.6, ...xs, xs.length - 0.4],
      result.solucao,
      "Incógnitas",
      "Valor calculado",
      { categorical: true },
    );
  const w = Math.min(70, 440 / xs.length);
  result.solucao.forEach((value, i) => {
    tip(
      add("rect", {
        x: X(i) - w / 2,
        y: Math.min(Y(value), Y(0)),
        width: w,
        height: Math.max(1, Math.abs(Y(value) - Y(0))),
        rx: 4,
        fill: value < 0 ? colors.orange : colors.green,
      }),
      `${data.rotulos?.[i] || `x${i + 1}`} = ${format(value)}`,
    );
    text(X(i), Y(value) + (value < 0 ? 17 : -10), format(value, 3), {
      "text-anchor": "middle",
      class: "strong",
    });
    text(X(i), 315, data.rotulos?.[i] || `x${i + 1}`, {
      "text-anchor": "middle",
      class: "point-label",
    });
  });
  return {
    title: "O que a solução representa",
    subtitle: "Valores contínuos das incógnitas no sistema informado",
    legend: [
      ["Valor positivo", "green"],
      ["Valor negativo", "orange"],
    ],
  };
}

function drawConvergence(result, data, index) {
  const errors = result.passos.map((step) =>
    Math.log10(Math.max(step.residuo, 1e-16)),
  );
  const tolerance = Math.log10(
    Number(String(data.tolerancia ?? 0.0001).replace(",", ".")),
  );
  const { X, Y } = axes(
    [0, result.passos.length - 1],
    [...errors, tolerance],
    "Iteração",
    "Resíduo máximo |Ax − b| (log)",
    { log: true },
  );
  path(
    errors.map((y, i) => [X(i), Y(y)]),
    { stroke: "var(--plot-history)", "stroke-width": 2 },
  );
  path(
    errors.slice(0, index + 1).map((y, i) => [X(i), Y(y)]),
    { stroke: colors.green, "stroke-width": 2.5 },
  );
  line(X(0), Y(tolerance), X(errors.length - 1), Y(tolerance), {
    stroke: colors.orange,
    "stroke-dasharray": "6 4",
  });
  text(
    X(errors.length - 1),
    Y(tolerance) - 8,
    `tolerância ${format(data.tolerancia ?? 0.0001)}`,
    { "text-anchor": "end", class: "point-label" },
  );
  tip(
    add("circle", {
      cx: X(index),
      cy: Y(errors[index]),
      r: 5.5,
      fill: colors.orange,
      stroke: "var(--plot-surface)",
      "stroke-width": 2,
    }),
    `Iteração ${index}: resíduo ${format(result.passos[index].residuo)}`,
  );
  return {
    title: "Acompanhe o desequilíbrio diminuir",
    subtitle:
      "Escala logarítmica · o resíduo é sempre medido nas equações originais",
    legend: [
      ["Iterações percorridas", "green"],
      ["Iteração em foco", "orange"],
      ["Histórico completo", "gray"],
    ],
  };
}

function drawTruss(result, data, index) {
  const model = result.trelica,
    values = result.passos[index].solucao;
  const X = (x) => 90 + (x / 4.309401) * 570,
    Y = (y) => 248 - y * 137;
  const maximum = Math.max(1, ...values.slice(0, 7).map(Math.abs));
  model.barras.forEach(([a, b], i) => {
    const p = model.nos[a],
      q = model.nos[b],
      value = values[i];
    const stroke =
      Math.abs(value) < 1e-5
        ? "var(--plot-neutral)"
        : value > 0
          ? colors.blue
          : colors.orange;
    tip(
      line(X(p[0]), Y(p[1]), X(q[0]), Y(q[1]), {
        stroke,
        "stroke-width": 3 + (Math.abs(value) / maximum) * 5,
        "stroke-linecap": "round",
      }),
      `${model.rotulos[i]}: ${format(value)} · ${value >= 0 ? "tração" : "compressão"}`,
    );
    const mx = (X(p[0]) + X(q[0])) / 2,
      my = (Y(p[1]) + Y(q[1])) / 2;
    add("rect", {
      x: mx - 40,
      y: my - 19,
      width: 80,
      height: 17,
      rx: 4,
      fill: "var(--plot-surface)",
      opacity: 0.92,
    });
    text(mx, my - 7, `${model.rotulos[i]} ${format(value, 1)}`, {
      "text-anchor": "middle",
      class: "point-label",
    });
  });
  model.nos.forEach(([x, y], i) => {
    add("circle", {
      cx: X(x),
      cy: Y(y),
      r: 5.5,
      fill: "var(--plot-surface)",
      stroke: "var(--plot-joint)",
      "stroke-width": 2,
    });
    text(
      X(x) + (i === 3 ? 12 : 0),
      Y(y) + (i === 1 || i === 3 ? -18 : 23),
      "ABCDE"[i],
      { "text-anchor": "middle", class: "strong" },
    );
  });
  for (const [node, load] of [
    [1, model.cargas[0]],
    [3, model.cargas[1]],
  ]) {
    const x = X(model.nos[node][0]),
      y = Y(model.nos[node][1]);
    line(x, y - 58, x, y - 10, { stroke: colors.red, "stroke-width": 2 });
    const arrowTip = load >= 0 ? y - 8 : y - 58;
    const arrowBase = load >= 0 ? y - 19 : y - 47;
    add("polygon", {
      points: `${x - 5},${arrowBase} ${x + 5},${arrowBase} ${x},${arrowTip}`,
      fill: colors.red,
    });
    text(x, y - 65, format(load), { "text-anchor": "middle", class: "strong" });
  }
  for (const node of [0, 4]) {
    const x = X(model.nos[node][0]),
      y = Y(0);
    add("polygon", {
      points: `${x},${y + 7} ${x - 12},${y + 24} ${x + 12},${y + 24}`,
      fill: "var(--plot-support)",
      stroke: "var(--plot-support-line)",
    });
    line(x - 19, y + 30, x + 19, y + 30, {
      stroke: "var(--plot-ground)",
      "stroke-width": 2,
    });
  }
  text(
    380,
    310,
    `Reações: Rx A = ${format(values[7], 2)}  ·  Ry A = ${format(values[8], 2)}  ·  Ry E = ${format(values[9], 2)}`,
    { "text-anchor": "middle", class: "point-label" },
  );
  return {
    title: "Cada barra conta uma parte do equilíbrio",
    subtitle: `Tração positiva · compressão negativa · iteração ${index} · unidade de força não indicada no enunciado`,
    legend: [
      ["Tração", "blue"],
      ["Compressão", "orange"],
      ["Valor próximo de zero", "gray"],
    ],
  };
}

export function drawChart(result, data, index, view) {
  // Matrizes grandes precisam de espaço para os números, não de fontes menores.
  $("chart").style.minWidth =
    result.metodo === "gauss" && view !== "solucao"
      ? `${Math.max(620, data.a.length * 85)}px`
      : "620px";
  $("chart").replaceChildren(
    svg("title", {}, `${result.nome_metodo} · visualização didática`),
  );
  let meta;
  if (["lagrange", "newton"].includes(result.metodo))
    meta = drawInterpolation(result, data, index, view);
  else if (["trapezio", "simpson"].includes(result.metodo))
    meta = drawIntegration(result, data, index);
  else if (result.metodo === "gauss")
    meta =
      view === "solucao"
        ? result.trelica
          ? drawTruss(
              { ...result, passos: [{ solucao: result.solucao }] },
              data,
              0,
            )
          : drawBars(result, data)
        : drawMatrix(result, data, index);
  else
    meta =
      view === "estrutura" && result.trelica
        ? drawTruss(result, data, index)
        : drawConvergence(result, data, index);
  $("chart-title").textContent = meta.title;
  $("chart-subtitle").textContent = meta.subtitle;
  $("legend").replaceChildren();
  meta.legend.forEach(([label, color]) => {
    const span = document.createElement("span"),
      dot = document.createElement("i");
    dot.style.background = colors[color] || "var(--plot-gray)";
    span.append(dot, document.createTextNode(label));
    $("legend").append(span);
  });
}

export function initializeTooltips() {
  const chart = $("chart"),
    tooltip = $("tooltip");
  // O viewBox escala os textos com o gráfico. Compensamos essa escala para
  // preservar 16 px nos valores e 14 px nos rótulos ao retrair a navegação.
  new ResizeObserver(([entry]) => {
    const width = entry.contentRect.width;
    if (!width) return;
    chart.style.setProperty("--chart-font-size", `${(16 * 760) / width}px`);
    chart.style.setProperty("--chart-label-size", `${(14 * 760) / width}px`);
  }).observe(chart);
  function show(event) {
    const node = event.target.closest("[data-tip]");
    if (!node) return;
    tooltip.textContent = node.getAttribute("data-tip");
    tooltip.hidden = false;
    const box = chart.parentElement.getBoundingClientRect(),
      target = node.getBoundingClientRect();
    tooltip.style.left = `${Math.max(0, Math.min(box.width - 200, target.left - box.left))}px`;
    tooltip.style.top = `${Math.max(0, target.top - box.top - 40)}px`;
  }
  chart.addEventListener("pointerover", show);
  chart.addEventListener("focusin", show);
  chart.addEventListener("pointerout", () => {
    tooltip.hidden = true;
  });
  chart.addEventListener("focusout", () => {
    tooltip.hidden = true;
  });
}
