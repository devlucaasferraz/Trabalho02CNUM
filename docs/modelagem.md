# Modelagem e critérios numéricos

## Produção de componentes (01.2)

As colunas representam os componentes 1, 2 e 3. As linhas representam metal,
plástico e borracha. Os consumos são dados em gramas por componente;
os estoques de 3,89; 0,095 e 0,282 kg são multiplicados por 1000:

```text
15 x₁ + 17 x₂ + 19 x₃ = 3890
0,30 x₁ + 0,40 x₂ + 0,55 x₃ = 95
1,0 x₁ + 1,2 x₂ + 1,5 x₃ = 282
```

A solução é `(90, 60, 80)` componentes por dia. O método escolhido é eliminação
de Gauss com pivotamento parcial: escolhe-se o maior pivô em módulo, eliminam-se
os coeficientes abaixo dele e resolve-se o sistema triangular por substituição
regressiva. Cada operação guarda uma cópia da matriz aumentada para os passos.
Um pivô nulo ou numericamente desprezível relativamente à linha provoca um aviso
de ausência de solução única confiável. Não se arredonda uma solução fracionária
para produção inteira: isso violaria, em geral, as equações de consumo.

## Treliça (02.2)

Nomeamos as juntas da esquerda para a direita: A (apoio fixo), B (superior),
C (inferior central), D (superior) e E (apoio móvel). As barras são
`AB, AC, BC, BD, CD, CE, DE`. Tração é positiva; compressão é negativa.

Os ângulos do PDF são 45°, 45°, 60° e 30°. Fixando a altura como 1:

```text
A = (0, 0)             B = (1, 1)           C = (2, 0)
D = (2 + 1/√3, 1)      E = (2 + 4/√3, 0)
```

A escala dos comprimentos não altera os cossenos diretores ou as forças desta
treliça ideal. Escrevendo `c = cos(45°)`, `s = sin(60°)` e `q = cos(30°)`, o
equilíbrio horizontal e vertical de cada junta produz:

```text
A horizontal:  c AB + AC + RxA = 0
A vertical:    c AB + RyA = 0
B horizontal: -c AB + c BC + BD = 0
B vertical:   -c AB - c BC = cargaB
C horizontal: -AC - c BC + 0,5 CD + CE = 0
C vertical:    c BC + s CD = 0
D horizontal: -BD - 0,5 CD + q DE = 0
D vertical:   -s CD - 0,5 DE = cargaD
E horizontal: -CE - q DE = 0
E vertical:    0,5 DE + RyE = 0
```

O vetor de incógnitas é `[AB, AC, BC, BD, CD, CE, DE, RxA, RyA, RyE]`.
O PDF traz cargas 500 e 100, sem indicar sua unidade. Valores positivos nos
campos de carga significam forças para baixo.

Na ordem original, a matriz de equilíbrio tem zeros na diagonal. Para o exemplo,
iteramos **Gauss-Seidel em AᵀA x = Aᵀb**, com aproximação inicial zero.
Para A de posto completo, AᵀA é simétrica definida positiva e a iteração converge.
O condicionamento pode piorar, por isso esse recurso é explícito e opcional para
sistemas próprios. Ser esparsa, por si só, não garante convergência da matriz A.

Em cada linha i:

```text
xᵢ ← (bᵢ − Σⱼ≠ᵢ aᵢⱼ xⱼ) / aᵢᵢ
```

As componentes já atualizadas são imediatamente reutilizadas. Só se declara
convergência quando `max |Ax − b| ≤ tolerância` **no sistema original** e a maior
variação entre aproximações também é menor ou igual à tolerância. O exemplo usa
`1e-4` e até 2000 iterações. A interface informa quando o limite é insuficiente.

Uma verificação independente usa equilíbrio global: `RxA = 0`,
`RyA + RyE = 600` e `RyE × xE = 500 × xB + 100 × xD`.
As reações são aproximadamente 424,16698 e 175,83302.

## Interpolação de tensão (03.2)

Dados `(i, V)`: `(0,25; -0,45)`, `(0,75; -0,60)`, `(1,25; 0,70)`,
`(1,5; 1,88)` e `(2; 6)`. O alvo original é 1,15.

Para cada grau de 2 a 4, escolhemos grau + 1 nós pela distância ao alvo; empates
são resolvidos pelo menor x. Depois, os nós são ordenados por x. As duas formas
usam exatamente os mesmos nós:

```text
Lagrange: P(x) = Σ yᵢ × ∏ⱼ≠ᵢ (x − xⱼ)/(xᵢ − xⱼ)
Newton:   P(x) = c₀ + c₁(x − x₀) + c₂(x − x₀)(x − x₁) + …
```

Os coeficientes de Newton são as primeiras entradas de cada coluna da tabela
de diferenças divididas. As curvas das parcelas são calculadas na mesma camada
numérica e enviadas ao gráfico: a aba Parcelas mostra a contribuição em foco,
a soma até o passo atual e o polinômio completo tracejado.

| Grau | Nós | Estimativa em 1,15 |
| --- | --- | --- |
| 2 | 0,75; 1,25; 1,5 | 0,3269333333 |
| 3 | 0,75; 1,25; 1,5; 2 | 0,34784 |
| 4 | Todos | 0,3372864 |

A concordância entre Newton e Lagrange não determina o erro real em relação à
função física. As medições não fornecem essa função. A interface identifica
extrapolação quando o alvo fica fora do intervalo dos dados.

## Área da seção do rio (04.1)

A figura tem margens com profundidade zero e dez subintervalos de 2 m:

```text
x (m):  0   2    4   6   8   10  12  14   16   18   20
d (m):  0   1,8  2   4   4   6   4   3,6  3,4  2,8  0
```

O trapézio composto usa `h/2 × [d₀ + 2Σ dᵢ + dₙ]`, resultando em **63,2 m²**.
Simpson 1/3 composto usa `h/3 × [d₀ + 4Σ dᵢ ímpares + 2Σ dᵢ pares internos + dₙ]`,
resultando em **66,4 m²**. Cada painel de Simpson interpola três profundidades
por uma parábola. O gráfico desenha profundidades para baixo e calcula a área
positiva sob a superfície.

Para entradas próprias, a integração é com sinal. Valores negativos subtraem área.
As regras exigem espaçamento uniforme; Simpson exige número par de subintervalos.
Pontos repetidos ou intervalos incompatíveis são rejeitados.
