/** Orquestração da interface única: carregar → editar → calcular → explorar. */
import { $, element, format, table, download, groupOf } from "./util.js";
import { Editor } from "./editor.js";
import { drawChart, initializeTooltips } from "./graficos.js";

const methodNames = {
  gauss: "Eliminação de Gauss",
  gauss_seidel: "Gauss-Seidel",
  lagrange: "Lagrange",
  newton: "Newton",
  trapezio: "Trapézio repetido",
  simpson: "Simpson 1/3 repetido",
};
const topicNames = {
  sistema: "Sistemas lineares",
  interpolacao: "Interpolação polinomial",
  integracao: "Integração numérica",
};
const state = {
  examples: [],
  source: null,
  result: null,
  input: null,
  step: 0,
  view: null,
  timer: null,
  request: 0,
  rows: [],
  history: [],
};
const editor = new Editor(markDirty, showError);

// Apenas a preferência de navegação é persistida; os dados dos cálculos não são.
const sidebarPreference = "entre-pontos-sidebar-collapsed";
function setSidebarCollapsed(collapsed) {
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  $("sidebar-content").hidden = collapsed;
  $("toggle-sidebar").setAttribute("aria-expanded", String(!collapsed));
  $("toggle-sidebar").setAttribute(
    "aria-label",
    collapsed ? "Mostrar exemplos" : "Ocultar exemplos",
  );
  $("toggle-sidebar").title = collapsed
    ? "Mostrar exemplos"
    : "Ocultar exemplos";
  try {
    localStorage.setItem(sidebarPreference, String(collapsed));
  } catch {
    // A navegação continua funcionando se o navegador bloquear armazenamento.
  }
}
try {
  const savedPreference = localStorage.getItem(sidebarPreference);
  setSidebarCollapsed(
    savedPreference === null
      ? window.matchMedia("(max-width: 900px)").matches
      : savedPreference === "true",
  );
} catch {
  setSidebarCollapsed(false);
}
$("toggle-sidebar").addEventListener("click", () => {
  setSidebarCollapsed(!$("sidebar-content").hidden);
});

function showError(message) {
  $("input-error").textContent = message;
  $("input-error").hidden = false;
}
function stop() {
  if (state.timer) clearInterval(state.timer);
  state.timer = null;
  $("play").textContent = "▶";
  $("play").setAttribute("aria-label", "Reproduzir passos");
}
function clearResults(
  message = "Edite a tabela e clique em calcular para explorar o método.",
) {
  stop();
  state.request++;
  state.result = null;
  $("result").hidden = true;
  $("details-panel").hidden = true;
  $("empty").hidden = false;
  $("empty").querySelector("p").textContent = message;
  $("input-error").hidden = true;
  $("calculate").disabled = false;
  $("calculate").firstChild.textContent = "Calcular e explorar ";
}
function markDirty(structureChanged = false) {
  clearResults(
    "Os dados foram alterados. Calcule novamente para atualizar o gráfico e os passos.",
  );
  $("source-badge").textContent = "Dados editados";
  if (structureChanged) {
    editor.data.rotulos = null;
    editor.data.linhas = null;
  }
  document
    .querySelectorAll(".example-button")
    .forEach((button) => button.classList.remove("active"));
}

function setHeader(data) {
  $("title").textContent = data.titulo || "Seu próximo experimento";
  $("description").textContent =
    data.descricao ||
    "Insira seus dados, escolha um método e acompanhe cada etapa do cálculo.";
  $("eyebrow").textContent = data.codigo
    ? `Exemplo ${data.codigo}`
    : "Dados próprios";
  $("topic").textContent = topicNames[groupOf(data.metodo)];
  $("model-note").textContent =
    data.nota ||
    "Os valores da tabela são usados diretamente no método escolhido. Confira unidades, hipóteses e o resíduo antes de interpretar o resultado.";
  $("model-equations").replaceChildren();
  if (data.a) {
    const note = element(
      "p",
      {},
      "Modelo: cada linha i satisfaz aᵢ₁x₁ + … + aᵢₙxₙ = bᵢ.",
    );
    $("model-equations").append(note);
  }
}

function loadExample(data, auto = true) {
  clearResults();
  state.source = structuredClone(data);
  editor.render(data, data.metodo);
  $("method").value = data.metodo;
  setHeader(data);
  $("source-badge").textContent = data.codigo
    ? `Exemplo ${data.codigo}`
    : "Dados próprios";
  document
    .querySelectorAll(".example-button")
    .forEach((button) =>
      button.classList.toggle("active", button.dataset.example === data.id),
    );
  $("reset").disabled = !data.codigo;
  if (auto) calculate();
}

function customData(method) {
  const common = {
    id: "custom",
    titulo: "Seu próximo experimento",
    metodo: method,
    descricao:
      "Comece com a tabela abaixo. Cada valor pode ser editado; o gráfico vai acompanhar seus dados.",
  };
  if (groupOf(method) === "sistema")
    return {
      ...common,
      a: [
        [1, 0],
        [0, 1],
      ],
      b: [0, 0],
      normais: false,
    };
  if (groupOf(method) === "interpolacao")
    return {
      ...common,
      xs: [0, 1, 2],
      ys: [0, 1, 4],
      grau: 2,
      alvo: 1.5,
      eixo_x: "x",
      eixo_y: "y",
    };
  return { ...common, xs: [0, 1, 2], ys: [0, 1, 0], eixo_x: "x", eixo_y: "y" };
}

async function calculate(event) {
  event?.preventDefault();
  stop();
  $("input-error").hidden = true;
  let data;
  try {
    data = editor.read();
    if (data.xs) {
      const pairs = data.xs
        .map((x, i) => [x, data.ys[i]])
        .sort((a, b) => a[0] - b[0]);
      data.xs = pairs.map((p) => p[0]);
      data.ys = pairs.map((p) => p[1]);
    }
  } catch (error) {
    showError(error.message);
    return;
  }
  const request = ++state.request;
  $("calculate").disabled = true;
  $("calculate").firstChild.textContent = "Calculando… ";
  try {
    const response = await fetch("/api/simular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (request !== state.request) return;
    if (!response.ok || result.erro)
      throw new Error(result.erro || "Não foi possível calcular.");
    state.input = data;
    state.result = result;
    state.step = result.passos.length - 1;
    state.view =
      result.metodo === "gauss"
        ? "processo"
        : result.trelica
          ? "estrutura"
          : "convergencia";
    editor.render(data, data.metodo);
    $("empty").hidden = true;
    $("result").hidden = false;
    $("details-panel").hidden = false;
    $("step").max = String(result.passos.length - 1);
    $("step").value = String(state.step);
    renderMetrics();
    renderChartTabs();
    renderStep();
    renderComparison();
    const warnings = [];
    if (data.id === "trelica" && !result.trelica)
      warnings.push(
        "O sistema foi alterado e já não corresponde à geometria da treliça. A visualização mostra o sistema genérico informado.",
      );
    if (result.equacoes_normais)
      warnings.push(
        "Gauss-Seidel aplicado a AᵀA x = Aᵀb. O resíduo exibido verifica Ax = b; equações normais podem piorar o condicionamento.",
      );
    if (result.extrapolacao)
      warnings.push(
        "O alvo está fora do intervalo medido. Isto é extrapolação; não há garantia de acurácia.",
      );
    if (result.aviso) warnings.push(result.aviso);
    if (
      result.metodo === "gauss_seidel" &&
      !result.diagonal_dominante &&
      !result.equacoes_normais
    )
      warnings.push(
        "A matriz não é diagonalmente dominante por linhas. Essa condição suficiente não foi satisfeita; acompanhe a convergência.",
      );
    if (!result.convergiu)
      warnings.push(
        "O limite de iterações foi atingido. Os valores são aproximações que ainda não satisfazem os critérios de parada.",
      );
    if (data.id === "producao" && result.solucao?.some((v) => v < 0))
      warnings.push(
        "Há produção negativa. A solução algébrica não representa uma produção fisicamente viável.",
      );
    $("result-warning").textContent = warnings.join(" ");
    $("result-warning").hidden = !warnings.length;
    $("status").textContent =
      `${result.status} · ${format(result.tempo_ms, 3)} ms`;
  } catch (error) {
    if (request === state.request) {
      clearResults("Revise os dados para gerar uma nova simulação.");
      showError(error.message || "Falha na conexão com o servidor local.");
    }
  } finally {
    if (request === state.request || !state.result) {
      $("calculate").disabled = false;
      $("calculate").firstChild.textContent = "Calcular e explorar ";
    }
  }
}

function metric(label, value, unit, caption) {
  const node = element("div", { class: "metric" });
  node.append(element("small", {}, label));
  const strong = element("b", {}, value);
  node.append(
    strong,
    element("span", { class: "metric-unit" }, unit),
    element("div", { class: "metric-caption" }, caption),
  );
  return node;
}
function renderMetrics() {
  const r = state.result,
    d = state.input;
  $("metrics").replaceChildren();
  if (r.solucao) {
    $("metrics").append(
      metric(
        "Incógnitas",
        String(r.solucao.length),
        "valores",
        r.metodo === "gauss"
          ? "Pivotamento parcial"
          : "Atualizações sequenciais",
      ),
      metric(
        "Resíduo máximo",
        format(r.residuo),
        "",
        "max |Ax − b| no sistema original",
      ),
      metric(
        r.metodo === "gauss" ? "Operações" : "Iterações",
        String(r.metodo === "gauss" ? r.passos.length - 1 : r.iteracoes),
        "",
        r.convergiu ? "Resultado verificado" : "Precisão não atingida",
      ),
    );
  } else if (groupOf(r.metodo) === "interpolacao") {
    $("metrics").append(
      metric(
        "Estimativa no alvo",
        format(r.valor),
        d.unidade || "",
        "P(x) no ponto informado",
      ),
      metric("Alvo", format(d.alvo), "", d.eixo_x || "Coordenada x"),
      metric("Grau", String(d.grau), "", `${r.nos_x.length} nós utilizados`),
    );
  } else {
    $("metrics").append(
      metric(
        d.id === "rio" ? "Área da seção" : "Integral com sinal",
        format(r.valor),
        d.unidade || "",
        "Estimativa numérica",
      ),
      metric(
        "Espaçamento",
        format(r.h),
        d.id === "rio" ? "m" : "",
        "Passo h entre medições",
      ),
      metric(
        "Subintervalos",
        String(r.subintervalos),
        "",
        `${r.passos.length} painéis do método`,
      ),
    );
  }
}

function renderChartTabs() {
  const r = state.result;
  $("chart-tabs").replaceChildren();
  const views =
    groupOf(r.metodo) === "interpolacao"
      ? [
          ["polinomio", "Polinômio"],
          ["parcelas", "Parcelas"],
        ]
      : r.metodo === "gauss"
        ? [
            ["processo", "Matriz"],
            ["solucao", r.trelica ? "Estrutura" : "Solução"],
          ]
        : r.trelica
          ? [
              ["estrutura", "Estrutura"],
              ["convergencia", "Convergência"],
            ]
          : [];
  views.forEach(([id, label]) => {
    const button = element(
      "button",
      {
        type: "button",
        class: id === state.view ? "active" : "",
        "aria-pressed": id === state.view,
      },
      label,
    );
    button.addEventListener("click", () => {
      state.view = id;
      renderChartTabs();
      renderStep();
    });
    $("chart-tabs").append(button);
  });
}

function renderStep() {
  if (!state.result) return;
  const r = state.result,
    step = r.passos[state.step];
  $("step").value = String(state.step);
  $("step-counter").textContent = `${state.step + 1} / ${r.passos.length}`;
  $("previous").disabled = state.step === 0;
  $("next").disabled = state.step === r.passos.length - 1;
  $("step-title").textContent = step.titulo;
  $("step-text").textContent = step.explicacao;
  $("step-extra").replaceChildren();
  if (step.acumulado != null)
    $("step-extra").append(
      element(
        "p",
        { class: "strong" },
        `Soma até aqui: ${format(step.acumulado)}${state.input.unidade ? ` ${state.input.unidade}` : ""}`,
      ),
    );
  drawChart(r, state.input, state.step, state.view);
}

function renderComparison() {
  const r = state.result,
    d = state.input;
  let headers, rows;
  if (r.solucao) {
    headers = ["Incógnita", "Valor calculado", "Interpretação"];
    rows = r.solucao.map((v, i) => [
      d.rotulos?.[i] || `x${i + 1}`,
      format(v, 7),
      r.trelica
        ? i < 7
          ? v > 0
            ? "Tração"
            : v < 0
              ? "Compressão"
              : "Nula"
          : "Reação de apoio"
        : d.unidade || "Valor no sistema",
    ]);
  } else if (groupOf(r.metodo) === "interpolacao") {
    headers = ["Grau", "Lagrange", "Newton", "Nós escolhidos"];
    rows = r.comparacao.map((item) => [
      String(item.grau),
      format(item.lagrange, 7),
      format(item.newton, 7),
      item.nos.map((v) => format(v)).join(" · "),
    ]);
  } else {
    headers = ["Método", "Integral", "Leitura"];
    rows = r.comparacao.map((item) => [
      item.metodo,
      item.erro
        ? "Indisponível"
        : `${format(item.valor, 7)} ${d.unidade || ""}`,
      item.erro || "Mesmo conjunto de medições",
    ]);
  }
  state.rows = [headers, ...rows];
  $("comparison").replaceChildren(table(headers, rows));
  if (groupOf(r.metodo) === "interpolacao")
    $("comparison").append(
      element(
        "p",
        { class: "field-hint" },
        "A concordância entre as formas verifica a implementação, mas não mede o erro em relação à função real, que é desconhecida.",
      ),
    );
  if (groupOf(r.metodo) === "integracao")
    $("comparison").append(
      element(
        "p",
        { class: "field-hint" },
        "A diferença entre as regras não é uma medida garantida do erro real. O resultado depende das medições e da aproximação entre elas.",
      ),
    );
  renderHistory();
}

function renderHistory() {
  const r = state.result,
    d = state.input;
  let headers, rows;
  if (r.metodo === "gauss_seidel") {
    headers = [
      "Iteração",
      "Resíduo máximo",
      "Maior variação",
      ...r.solucao.map((_, i) => d.rotulos?.[i] || `x${i + 1}`),
    ];
    rows = r.passos.map((step, i) => [
      String(i),
      format(step.residuo, 9),
      format(step.variacao, 9),
      ...step.solucao.map((v) => format(v, 7)),
    ]);
  } else if (r.metodo === "gauss") {
    headers = ["Passo", "Operação", "Explicação"];
    rows = r.passos.map((step, i) => [
      String(i + 1),
      step.titulo,
      step.explicacao,
    ]);
  } else {
    headers = ["Passo", "Descrição", "Parcela", "Acumulado"];
    rows = r.passos.map((step, i) => [
      String(i + 1),
      step.titulo,
      format(step.parcela, 9),
      format(step.acumulado, 9),
    ]);
  }
  state.history = [headers, ...rows];
  $("history").replaceChildren();
  const note = element(
    "p",
    {},
    `${d.titulo || "Dados próprios"} · ${r.nome_metodo}. ${d.nota || ""}`,
  );
  $("history").append(note);
  if (d.a) {
    $("history").append(
      element("p", {}, "Sistema informado (coeficientes e b):"),
      table(
        [...d.a.map((_, i) => `x${i + 1}`), "b"],
        d.a.map((row, i) => [
          ...row.map((v) => format(v, 8)),
          format(d.b[i], 8),
        ]),
      ),
    );
    if (r.matriz_iterada)
      $("history").append(
        element("p", {}, "Sistema efetivamente iterado:"),
        table(
          [...d.a.map((_, i) => `x${i + 1}`), "b"],
          r.matriz_iterada.map((row, i) => [
            ...row.map((v) => format(v, 6)),
            format(r.termos_iterados[i], 6),
          ]),
        ),
      );
  } else
    $("history").append(
      element("p", {}, "Pontos informados:"),
      table(
        ["x", "y"],
        d.xs.map((x, i) => [format(x, 8), format(d.ys[i], 8)]),
      ),
    );
  if (r.diferencas)
    $("history").append(
      element(
        "p",
        {},
        "Tabela de diferenças divididas de Newton (cada coluna aumenta a ordem):",
      ),
      table(
        ["x", ...r.diferencas.map((_, i) => `Ordem ${i}`)],
        r.nos_x.map((x, i) => [
          format(x),
          ...r.diferencas.map((col) =>
            col[i] === undefined ? "—" : format(col[i], 8),
          ),
        ]),
      ),
    );
  if (rows.length > 150)
    $("history").append(
      element(
        "p",
        {},
        `Exibindo 150 de ${rows.length} registros. O CSV contém o histórico completo.`,
      ),
    );
  $("history").append(table(headers, rows.slice(0, 150)));
}

function csvCell(value) {
  const text = String(value);
  const safe = /^[=+@]/.test(text) || /^-[^\d]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}
function exportCsv() {
  if (!state.result) return;
  const d = state.input,
    r = state.result;
  const lines = [
    ["Entre pontos", d.titulo || "Dados próprios"],
    ["Método", r.nome_metodo],
    ["Status", r.status],
    ["Resíduo máximo", r.residuo == null ? "" : format(r.residuo, 12)],
    [],
    ...state.rows,
    [],
    ["Histórico"],
    ...state.history,
    [],
    ["Dados de entrada"],
  ];
  if (d.a)
    lines.push(
      [...d.a.map((_, i) => `x${i + 1}`), "b"],
      ...d.a.map((row, i) => [
        ...row.map((v) => format(v, 12)),
        format(d.b[i], 12),
      ]),
    );
  else
    lines.push(
      ["x", "y"],
      ...d.xs.map((x, i) => [format(x, 12), format(d.ys[i], 12)]),
    );
  download(
    "resultados-calculo-numerico.csv",
    "\uFEFF" + lines.map((row) => row.map(csvCell).join(";")).join("\r\n"),
    "text/csv;charset=utf-8",
  );
}

$("simulation-form").addEventListener("submit", calculate);
$("examples").addEventListener("click", (event) => {
  const button = event.target.closest("[data-example]");
  if (button)
    loadExample(
      state.examples.find((item) => item.id === button.dataset.example),
    );
  if (button && window.matchMedia("(max-width: 900px)").matches) {
    setSidebarCollapsed(true);
    $("toggle-sidebar").focus();
  }
});
$("method").addEventListener("change", () => {
  const next = $("method").value;
  if (groupOf(next) !== groupOf(editor.method)) {
    loadExample(customData(next), false);
    return;
  }
  const raw =
    groupOf(next) === "sistema" ? editor.rawMatrix() : editor.rawPoints();
  const data = { ...editor.data, ...raw, ...editor.rawOptions(), metodo: next };
  editor.render(data, next);
  $("topic").textContent = topicNames[groupOf(next)];
  markDirty();
});
$("custom").addEventListener("click", () => {
  loadExample(customData($("method").value), false);
  if (window.matchMedia("(max-width: 900px)").matches)
    setSidebarCollapsed(true);
  $("editor").querySelector("input")?.focus();
});
$("reset").addEventListener("click", () => {
  if (state.source) loadExample(state.source);
});
$("help").addEventListener("click", () => {
  $("guide").hidden = !$("guide").hidden;
  $("help").setAttribute("aria-expanded", String(!$("guide").hidden));
});
$("previous").addEventListener("click", () => {
  stop();
  state.step = Math.max(0, state.step - 1);
  renderStep();
});
$("next").addEventListener("click", () => {
  stop();
  state.step = Math.min(state.result.passos.length - 1, state.step + 1);
  renderStep();
});
$("step").addEventListener("input", () => {
  stop();
  state.step = Number($("step").value);
  renderStep();
});
function play() {
  if (!state.result) return;
  if (state.timer) {
    stop();
    return;
  }
  if (state.step === state.result.passos.length - 1) state.step = 0;
  renderStep();
  $("play").textContent = "Ⅱ";
  $("play").setAttribute("aria-label", "Pausar passos");
  state.timer = setInterval(
    () => {
      if (state.step >= state.result.passos.length - 1) {
        stop();
        return;
      }
      state.step++;
      renderStep();
    },
    Number($("speed").value),
  );
}
$("play").addEventListener("click", play);
$("speed").addEventListener("change", () => {
  if (state.timer) {
    stop();
    play();
  }
});
$("presentation").addEventListener("click", () => {
  const active = document.body.classList.toggle("enlarged");
  $("presentation").textContent = active ? "× Voltar ao editor" : "⛶ Ampliar";
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.body.classList.remove("enlarged");
    $("presentation").textContent = "⛶ Ampliar";
  }
});
$("export-csv").addEventListener("click", exportCsv);
$("save-scenario").addEventListener("click", () => {
  if (state.input)
    download(
      "cenario-calculo-numerico.json",
      JSON.stringify({ versao: 1, dados: state.input }, null, 2),
      "application/json",
    );
});
$("download-svg").addEventListener("click", () => {
  const copy = $("chart").cloneNode(true);
  copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent =
    "text{font-family:Arial,sans-serif;font-size:var(--chart-font-size,16px);fill:#415c49}.strong{fill:#315c45;font-weight:bold}.point-label,.axis-label{font-size:var(--chart-label-size,14px)}";
  copy.prepend(style);
  copy.setAttribute(
    "aria-label",
    `${state.result.nome_metodo}: ${state.input.titulo || "Dados próprios"}`,
  );
  download(
    "grafico-calculo-numerico.svg",
    new XMLSerializer().serializeToString(copy),
    "image/svg+xml",
  );
});
$("print").addEventListener("click", () => {
  const old = state.step;
  stop();
  state.step = state.result.passos.length - 1;
  renderStep();
  window.print();
  state.step = old;
  renderStep();
});
$("import").addEventListener("click", () => $("file-input").click());
$("file-input").addEventListener("change", async () => {
  try {
    const file = $("file-input").files[0];
    if (!file) return;
    if (file.size > 250000) throw new Error("O cenário deve ter até 250 kB.");
    const scenario = JSON.parse(await file.text()),
      data = scenario.dados;
    if (
      scenario.versao !== 1 ||
      !data ||
      !Object.hasOwn(methodNames, data.metodo)
    )
      throw new Error(
        "Arquivo incompatível. Abra um cenário salvo neste laboratório.",
      );
    if (groupOf(data.metodo) === "sistema") {
      if (
        !Array.isArray(data.a) ||
        data.a.length < 2 ||
        data.a.length > 12 ||
        !data.a.every(
          (row) => Array.isArray(row) && row.length === data.a.length,
        ) ||
        !Array.isArray(data.b) ||
        data.b.length !== data.a.length
      )
        throw new Error("Matriz inválida no cenário.");
    } else if (
      !Array.isArray(data.xs) ||
      !Array.isArray(data.ys) ||
      data.xs.length !== data.ys.length ||
      data.xs.length < 2 ||
      data.xs.length > 100
    )
      throw new Error("Pontos inválidos no cenário.");
    loadExample(data, false);
    $("source-badge").textContent = "Cenário aberto";
  } catch (error) {
    showError(`Não foi possível abrir: ${error.message}`);
  } finally {
    $("file-input").value = "";
  }
});

async function start() {
  initializeTooltips();
  try {
    const response = await fetch("/api/exemplos");
    if (!response.ok) throw new Error("Servidor local indisponível.");
    state.examples = await response.json();
    const names = {
      producao: ["▥", "Componentes elétricos", "Sistemas · métodos diretos"],
      trelica: ["△", "Equilíbrio da treliça", "Sistemas · Gauss-Seidel"],
      tensao: ["⌁", "Tensão no resistor", "Interpolação · Lagrange / Newton"],
      rio: ["≋", "Seção de um rio", "Integração · trapézio / Simpson"],
    };
    state.examples.forEach((data) => {
      const [icon, title, subtitle] = names[data.id];
      const button = element("button", {
        class: "example-button",
        "data-example": data.id,
      });
      button.append(
        element("span", { class: "example-icon", "aria-hidden": "true" }, icon),
      );
      const description = element("span");
      description.append(
        element("strong", {}, title),
        element("small", {}, subtitle),
      );
      button.append(description);
      $("examples").append(button);
    });
    loadExample(state.examples.find((item) => item.id === "rio"));
  } catch (error) {
    showError(`Não foi possível iniciar o laboratório: ${error.message}`);
  }
}
start();
