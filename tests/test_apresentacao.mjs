/** Verifica o contrato entre os cálculos Python e a apresentação JavaScript.
 * Executar: node tests/test_apresentacao.mjs (somente para desenvolvimento).
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { apresentarResultado } from "../atividade02/web/apresentacao.js";

const raiz = fileURLToPath(new URL("../", import.meta.url));
const casos = JSON.parse(execFileSync("python", ["-B", "-c", `
import json
from atividade02.exemplos import exemplos
from atividade02.servico import simular
casos = []
for exemplo in exemplos():
    for metodo in {
        'gauss': ['gauss'], 'gauss_seidel': ['gauss_seidel'],
        'lagrange': ['lagrange', 'newton'], 'newton': ['lagrange', 'newton'],
        'trapezio': ['trapezio', 'simpson'], 'simpson': ['trapezio', 'simpson'],
    }[exemplo['metodo']]:
        entrada = dict(exemplo, metodo=metodo)
        casos.append([entrada, simular(entrada)])
entrada = dict(exemplos()[1], max_iteracoes=1)
casos.append([entrada, simular(entrada)])
entrada = {'metodo': 'trapezio', 'xs': [0, 1], 'ys': [-1, -1]}
casos.append([entrada, simular(entrada)])
print(json.dumps(casos, allow_nan=False))
`], { cwd: raiz, encoding: "utf8" }));

for (const [entrada, bruto] of casos) {
  const copia = JSON.stringify(bruto);
  const exibido = apresentarResultado(bruto, entrada);
  assert.equal(JSON.stringify(bruto), copia, "A apresentação não deve alterar a resposta original");
  assert.ok(exibido.nome_metodo);
  assert.ok(exibido.status);
  for (const [i, passo] of exibido.passos.entries()) {
    assert.ok(passo.titulo);
    assert.ok(passo.explicacao);
    for (const [chave, valor] of Object.entries(bruto.passos[i])) {
      assert.deepEqual(passo[chave], valor, "Os dados do cálculo devem ser preservados");
    }
  }
  if (entrada.metodo !== "gauss_seidel") assert.ok(!("convergiu" in exibido));
  else if (!bruto.convergiu) assert.match(exibido.status, /Limite atingido/);
  if (entrada.metodo === "trapezio" || entrada.metodo === "simpson") {
    assert.equal(exibido.valor, bruto.valor);
    assert.ok(exibido.comparacao.every((item) => item.metodo !== "simpson"));
    assert.equal(Boolean(exibido.aviso), entrada.ys.some((y) => y < 0));
    assert.ok(exibido.passos.every((passo) => !passo.explicacao.includes("undefined")));
  }
}
console.log(`Apresentação validada em ${casos.length} cenários.`);
