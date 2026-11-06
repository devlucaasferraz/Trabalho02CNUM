/** Formatação e criação de conteúdo sem inserir texto do usuário como HTML. */
export const $ = (id) => document.getElementById(id);
export function format(value, digits = 5) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  const n = Number(value);
  if (n !== 0 && (Math.abs(n) < 1e-4 || Math.abs(n) > 1e7))
    return n.toExponential(3).replace(".", ",");
  return n.toLocaleString("pt-BR", { maximumFractionDigits: digits });
}
export function numeric(value, label = "Valor") {
  const raw = String(value).trim().replace(",", ".");
  if (!raw || !Number.isFinite(Number(raw)))
    throw new Error(`${label}: informe um número válido.`);
  return Number(raw);
}
export function element(tag, attributes = {}, text = "") {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes))
    node.setAttribute(key, value);
  if (text !== "") node.textContent = text;
  return node;
}
export function table(headers, rows, className = "comparison-table") {
  const node = element("table", { class: className });
  const head = element("thead");
  const tr = element("tr");
  headers.forEach((h) => tr.append(element("th", { scope: "col" }, h)));
  head.append(tr);
  node.append(head);
  const body = element("tbody");
  rows.forEach((row) => {
    const tr = element("tr");
    row.forEach((value) => tr.append(element("td", {}, String(value))));
    body.append(tr);
  });
  node.append(body);
  return node;
}
export function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = element("a", { href: url, download: name });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
export function groupOf(method) {
  if (["gauss", "gauss_seidel"].includes(method)) return "sistema";
  if (["lagrange", "newton"].includes(method)) return "interpolacao";
  return "integracao";
}
