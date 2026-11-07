# Registro de validação

## Verificações automáticas

Comando: `python -B -m unittest discover -s tests -v`.

21 testes aprovados em Python 3.12 no desenvolvimento:

- Solução de sistemas com pivotamento e reconstrução do termo independente.
- Produção de 90, 60 e 80 componentes, substituída nos consumos originais.
- Rejeição de sistemas singulares e valores não finitos.
- Gauss-Seidel em sistema conhecido, limite de iterações e tolerância inválida.
- Equilíbrio original da treliça, soma das reações e soma dos momentos.
- Comparação da treliça com um método direto independente da iteração.
- Interpolação exata de polinômio conhecido e reprodução dos nós.
- Igualdade de Lagrange e Newton e soma de suas parcelas.
- Escolha de nós com tabela em ordem invertida e rejeição de repetições.
- Exatidão do trapézio para função linear e de Simpson para função cúbica.
- Áreas do rio e rejeição de espaçamento irregular ou Simpson incompatível.
- Contrato HTTP, mensagens de erro e recursos servidos localmente.
- Inspeção de HTML/CSS/JavaScript contra bibliotecas ou fontes remotas.

## Verificações no navegador

Executadas na aplicação real, servida pelo Python em loopback:

- Carregar os quatro exemplos e alternar entre métodos da mesma família.
- Modificar estoques em kg e cargas da treliça.
- Colar o sistema `0;2;4` / `1;3;7`: resultado `(1, 2)` com troca de linhas.
- Deixar um coeficiente vazio: aviso no formulário, sem resultado antigo visível.
- Usar alvo `1,2` com vírgula decimal, grau 4 e método de Newton.
- Alternar entre matriz e solução, estrutura e convergência, polinômio e parcelas.
- Percorrer os passos, ampliar a visualização e retornar ao editor.
- Salvar um cenário JSON, reabri-lo pelo seletor de arquivos e recalcular.
- Baixar CSV e SVG: arquivos efetivamente criados; XML do SVG verificado.
- Conferir o console sem erros nessa rodada.
- Conferir layout em largura de 390 px: sem transbordamento horizontal da página.

As verificações offline se baseiam nos recursos locais, no contrato HTTP e na
política de conteúdo que restringe conexões à própria origem. Não foi necessário
alterar ou desligar a conexão de rede do computador.

## Capturas durante o desenvolvimento

Os arquivos em [capturas](capturas/) registram as primeiras versões, os ajustes
de entrada, os gráficos, o tratamento de erro e o modo de apresentação.
Capturas com “primeira-versao” documentam o progresso, não o estado final.

- [Rio, primeira versão](capturas/01-rio-primeira-versao.jpg)
- [Interpolação, primeira versão](capturas/02-interpolacao-primeira-versao.jpg)
- [Treliça, primeira versão](capturas/03-trelica-primeira-versao.jpg)
- [Rio com legibilidade refinada](capturas/04-rio-interface-refinada.jpg)
- [Construção por parcelas](capturas/05-interpolacao-parcelas.jpg)
- [Estoques editáveis em kg](capturas/06-producao-estoques.jpg)
- [Solução da produção](capturas/07-producao-solucao.jpg)
- [Sistema próprio colado](capturas/08-sistema-personalizado.jpg)
- [Validação de entrada](capturas/09-validacao-de-entrada.jpg)
- [Cargas editáveis da treliça](capturas/10-trelica-cargas-editaveis.jpg)
- [Histórico de convergência](capturas/11-convergencia.jpg)
- [Modo de apresentação](capturas/12-modo-apresentacao.jpg)
- [Tela pequena](capturas/13-tela-pequena.jpg)
- [Rio, versão final](capturas/14-rio-final.jpg)
- [Produção, versão final](capturas/15-producao-final.jpg)
- [Interpolação, versão final](capturas/16-interpolacao-final.jpg)

## Revisão de navegação e legibilidade

- Barra lateral abre e fecha pelo botão Exemplos, com `aria-expanded` atualizado.
- A preferência é mantida após recarregar, sem alterar os dados do cálculo.
- Em telas estreitas, a biblioteca é uma sobreposição e fecha ao selecionar um exemplo.
- Textos de apoio têm pelo menos 14 px; entradas usam 16 px e rótulos, 15 px.
- A escala do SVG é compensada para manter 16 px nos valores e 14 px nos eixos.
- Conferidos layouts de 1440, 1100 e 390 px, sem transbordamento da página.
- Produção recalculada após alternar a navegação: 90, 60 e 80 componentes.
- Console sem erros na rodada de conferência.

Capturas dessa revisão substituem as anteriores como referência da interface:

- [Barra retraída e tipografia revisada](capturas/17-navegacao-retraida-tipografia.jpg)
- [Barra aberta](capturas/18-tipografia-barra-aberta.jpg)
- [Tela estreita](capturas/19-tipografia-mobile.jpg)

## Controle na própria barra

O botão foi movido para o cabeçalho da biblioteca. Ao retrair, a barra mantém
uma faixa de 64 px com o botão para reabertura. O conteúdo fica oculto e sai da
navegação por teclado. A preferência continua preservada ao recarregar.
Os textos de funcionamento offline, instituição e localização dos cálculos foram
removidos do rodapé da barra. Conferidos abertura, retração e reabertura no navegador,
sem erros no console.

- [Controle dentro da barra e rodapé removido](capturas/20-controle-na-barra.jpg)
- [Faixa de navegação retraída](capturas/21-barra-retraida.jpg)

## Navegação compacta com ícones

A barra compacta agora preserva os links e botões; somente os rótulos visuais
desaparecem. Conferidos os quatro exemplos, o botão de dados próprios e o retorno
ao início pelo logo, todos com a barra retraída. Os botões têm nomes acessíveis e
identificação ao passar o mouse; o exemplo selecionado permanece destacado.

A largura da barra e o deslocamento do conteúdo usam transições de 280 ms.
Conferidos abertura e fechamento, incluindo a largura intermediária durante a
transição e a preservação dos 64 px após recarregar. A preferência salva é aplicada
sem animação inicial; `prefers-reduced-motion` desativa as transições.
Console sem erros nessa rodada.

- [Logo e ícones clicáveis na barra compacta](capturas/22-navegacao-compacta-clicavel.jpg)

## Temas claro e escuro

Conferidos alternância pela barra compacta, persistência ao recarregar e
preservação de um valor editado durante a troca de tema. Os gráficos de rio,
treliça e interpolação usam uma paleta compartilhada por variáveis CSS.
O SVG exportado no modo escuro foi baixado e validado como XML, com fundo e
paleta incorporados. Console sem erros nessa rodada.

- [Tema escuro](capturas/23-tema-escuro.jpg)
- [Tema claro](capturas/24-tema-claro.jpg)

## Interpolação com foco no alvo

A visualização inicial usa um recorte dos nós escolhidos e do alvo. “Todos os
dados” exibe o conjunto completo; “Construção” mostra as parcelas e a soma
acumulada. A escala da construção considera todos os passos para permanecer
estável durante a reprodução. Medições usadas são pontos azuis; a estimativa é
um losango laranja, com projeção no eixo e valor explicado abaixo do gráfico.

A curva local é amostrada no Python, preservando resolução mesmo quando existem
medições distantes. Um teste com um ponto a um milhão de unidades verifica essa
propriedade contra a função conhecida x². A suíte passou com 22 testes.

Conferidos no navegador o recorte inicial, as três visões, a troca para Newton,
o grau 4 e a visualização no tema escuro, sem erros no console. Na largura de
1725 px, a área SVG normal ficou limitada a 860 × 385 px aproximadamente.

- [Detalhe da estimativa](capturas/25-interpolacao-foco-no-alvo.jpg)
- [Construção do polinômio](capturas/26-interpolacao-construcao.jpg)
- [Newton de grau 4 no tema escuro](capturas/27-interpolacao-escuro.jpg)

## Controles e dimensão do gráfico

Reprodução e pausa agora usam desenhos SVG, sem caracteres de fonte. Conferidos
o estado com duas barras visíveis e o retorno ao ícone de reprodução após pausar.

O teto de 860 px da interpolação foi removido. O SVG usa a largura efetiva do
painel e recalcula os eixos ao redimensionar, preservando textos e marcadores.
Conferidos 1725 e 1280 px, abertura/retração da barra e a visão de construção,
sem erros no console. O SVG exportado também usa as dimensões do gráfico atual.

- [Ícone de pausa em SVG](capturas/28-controle-pausa-svg.jpg)
- [Interpolação ocupando a largura do painel](capturas/29-interpolacao-largura-do-painel.jpg)

## Interpolação sincronizada com os passos

As três visões agora desenham a soma das parcelas até o passo selecionado.
O losango e suas projeções acompanham o valor acumulado; o polinômio final
permanece tracejado como referência durante os passos intermediários.
A escala considera todos os passos para evitar mudanças durante a reprodução.

Conferidos no navegador a mudança da curva e do marcador de −0,056 V para
0,728 V, a chegada ao resultado final de 0,3269333 V, as três visões e Newton.
Medições azuis selecionam parcelas por clique ou Enter. Também foram conferidos
a reprodução automática, o painel em tela ampla e o console sem erros.

- [Primeira parcela somada](capturas/30-interpolacao-primeiro-passo.jpg)
- [Segunda parcela somada](capturas/31-interpolacao-segundo-passo.jpg)

## Identificação do trabalho

Removido o nome “Entre pontos” da interface, do título da página, do CSV e da
apresentação no README. A barra identifica apenas “Atividade 02” e “Cálculo
numérico”, com o número 02 no atalho inicial. Conferido no navegador.

- [Identificação acadêmica](capturas/32-identificacao-academica.jpg)
