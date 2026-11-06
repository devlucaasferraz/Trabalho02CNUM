# Escopo da atividade 02

## Fonte

Enunciado: [Atividade_complementar2026.2_LES710C.pdf](../Atividade_complementar2026.2_LES710C.pdf),
localizado na raiz deste projeto. As tabelas e figuras relevantes foram renderizadas
e conferidas visualmente para transcrição dos exemplos.

## Requisitos gerais

- Resolver quatro problemas sorteados, um por tópico.
- Permitir a entrada de novos dados para problemas semelhantes.
- Apresentar as soluções com clareza e permitir novos cálculos ou saída.
- Entregar código e relatório explicativo com a participação de cada integrante.
- Apresentar pelo menos um problema em sala, com participação de toda a equipe.

## Problemas sorteados

| Tópico | Problema sorteado | Objetivo |
| --- | --- | --- |
| 01: métodos diretos | 01.2: componentes elétricos | Determinar a produção de três tipos de componentes a partir dos materiais disponíveis |
| 02: Gauss-Seidel | 02.2: treliça | Determinar as forças nos componentes a partir do equilíbrio das juntas |
| 03: interpolação | 03.2: tensão em resistor | Estimar a tensão para corrente de 1,15 usando Lagrange e Newton |
| 04: integração numérica | 04.1: seção de rio | Calcular a área da seção com trapézio e Simpson repetidos |

## Cuidados por tópico

- 01.2: formular o sistema linear com os coeficientes da tabela do PDF. As
  disponibilidades diárias são 3,89 kg de metal, 0,095 kg de plástico e 0,282 kg
  de borracha. Permitir outros dados; escolher o método direto na implementação.
- 02.2: formular as equações de equilíbrio horizontal e vertical das juntas da
  treliça ilustrada no PDF. Aplicar Gauss-Seidel com precisão de 0,0001,
  registrando aproximação inicial, limite de iterações e convergência.
- 03.2: usar as formas de Lagrange e Newton, dos graus 2 a 4, para estimar a
  tensão em `i = 1,15`. Selecionar pontos próximos e centrados em torno do alvo.
  Os dados fornecidos são:

  | i | 0,25 | 0,75 | 1,25 | 1,5 | 2,0 |
  | --- | --- | --- | --- | --- | --- |
  | V | -0,45 | -0,60 | 0,70 | 1,88 | 6,0 |

- 04.1: transcrever as profundidades e distâncias da figura do PDF e calcular a
  área da seção do rio por ambas as regras repetidas, considerando pontos
  igualmente espaçados. Verificar as condições de aplicação de Simpson.

## Implementação

Os quatro exemplos e as entradas próprias compartilham uma única interface.
Os métodos, históricos, validações, visualizações e exportações estão implementados.
As formulações estão em [modelagem.md](modelagem.md); os testes e as capturas
estão em [validacao.md](validacao.md).

O relatório acadêmico final, o texto sobre a participação de cada integrante e
a escolha do problema a apresentar ficam a cargo da equipe.
