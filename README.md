# Atividade 02 de cálculo numérico

Trabalho acadêmico de LES710C, UNIVASF. Um único simulador reúne os quatro
exemplos da atividade e permite calcular com dados informados pelo usuário.

## Executar sem internet

É necessário apenas **Python 3.10 ou superior** e um navegador moderno.
Não é preciso instalar bibliotecas, Node.js ou baixar recursos da internet.

Na pasta deste projeto:

```bash
python main.py
```

O navegador abre em `http://127.0.0.1:5052`. No Windows, também é possível dar
dois cliques em `iniciar.bat`. Mantenha o processo Python aberto durante o uso.
Para sair, feche a aba e pressione `Ctrl+C` no terminal do servidor.

Se a porta estiver ocupada:

```bash
python main.py --porta 5053
```

Para iniciar sem abrir automaticamente o navegador:

```bash
python main.py --sem-navegador
```

O servidor atende somente neste computador. HTML, CSS, JavaScript, fontes do
sistema e gráficos SVG são locais. Nenhum CDN ou serviço remoto é usado.

## Explorar os dados

1. Escolha um exemplo na biblioteca ou clique em **Usar meus dados**.
   O botão no cabeçalho da própria barra mostra ou retrai a biblioteca e lembra sua
   escolha. Em telas estreitas ela abre sobre o conteúdo e fecha após a seleção.
   Retraída, mantém o atalho inicial, o botão de dados próprios e os quatro exemplos
   acessíveis por ícones, com identificação ao passar o mouse. A transição é
   animada e respeita a preferência por movimento reduzido.
   O botão de sol/lua na base da barra alterna entre os temas claro e escuro.
   A escolha fica salva; sem uma escolha, é seguida a preferência do sistema.
2. Selecione o método. Ao mudar para outra família de problemas, o editor abre
   uma tabela inicial apropriada para seus dados.
3. Edite as células ou cole uma tabela separada por Tab ou ponto e vírgula.
   Vírgula decimal e notação científica são aceitas. Os pontos são ordenados por x
   ao calcular. Não inclua cabeçalhos na colagem.
4. Clique em **Calcular e explorar**. Depois de qualquer edição, os resultados
   anteriores são ocultados para impedir a leitura de um gráfico desatualizado.
5. Use o controle de passos, anterior/próximo ou reprodução. Passe sobre os
   elementos do gráfico, ou use Tab, para consultar os valores.
6. Use **Ampliar** para apresentar. Escape retorna ao editor.

Os exemplos de produção e treliça começam com entradas do domínio: estoques
em kg e cargas verticais. O sistema completo continua editável na seção expansível.
Sistemas próprios aceitam de 2 a 12 equações; tabelas aceitam até 100 pontos.

## Exemplos e métodos

| Exemplo | Método e visualização |
| --- | --- |
| 01.2: componentes elétricos | Gauss com pivotamento parcial; operações na matriz e solução em barras |
| 02.2: treliça | Gauss-Seidel; forças por barra, reações e curva de convergência |
| 03.2: tensão no resistor | Lagrange e Newton, graus 2 a 4; detalhe do alvo, visão geral, construção e comparação dos graus |
| 04.1: seção de rio | Trapézio e Simpson 1/3 repetidos; áreas por painel e soma acumulada |

Na treliça, Gauss-Seidel é aplicado a `AᵀA x = Aᵀb` para contornar os zeros
na diagonal da ordem original. A transformação é indicada na interface e o resíduo
é verificado em `Ax = b`. Para sistemas não singulares ela preserva a solução,
mas pode piorar o condicionamento. O histórico inclui o sistema efetivamente iterado.

Veja [modelagem e critérios numéricos](docs/modelagem.md) e
[escopo do enunciado](docs/escopo.md).

## Guardar e compartilhar

- **Salvar cenário:** baixa um JSON com as entradas e opções. **Abrir cenário**
  restaura os dados para edição; clique em calcular para executar novamente.
- **Resultados CSV:** baixa os resultados, o histórico completo e os dados de
  entrada. O separador é ponto e vírgula e a codificação é UTF-8 com BOM.
- **Salvar gráfico:** baixa o SVG do passo e da visualização atuais, editável e
  independente da aplicação.
- **Imprimir relatório:** abre a impressão do navegador. É possível salvar em PDF.
  O resultado final é mostrado no gráfico durante a impressão. Abra o histórico
  antes de imprimir se quiser incluir sua formulação e seus registros.

Os arquivos são baixados pelo navegador. A aplicação não sobrescreve arquivos
do projeto nem envia os dados para serviços externos.

## Organização do código

```text
main.py                         Inicialização e argumentos de execução
atividade02/
    validacao.py                Números, matrizes, pontos e cálculo de resíduo
    exemplos.py                 Dados do PDF e montagem do equilíbrio da treliça
    servico.py                  Casos de uso e contrato comum de resultados
    servidor.py                 HTTP local e entrega dos recursos estáticos
    metodos_diretos/gauss.py     Eliminação e substituição regressiva
    metodos_iterativos/
        gauss_seidel.py         Atualizações, convergência e histórico
    aproximacao/interpolacao.py Lagrange e diferenças divididas de Newton
    integracao/quadratura.py     Trapézio e Simpson compostos
    web/
        index.html              Estrutura sem templates Python embutidos
        estilos.css             Tema, responsividade, ampliação e impressão
        app.js                  Fluxo da interface e apresentação dos resultados
        editor.js               Matrizes, pontos, colagem e validação dos campos
        graficos.js             Desenho SVG e informações ao passar o cursor
        util.js                 Formatação, elementos e downloads
tests/                          Testes numéricos e do contrato HTTP
docs/capturas/                  Registros das etapas de desenvolvimento
```

Os métodos não conhecem o navegador nem o HTTP. O histórico é produzido junto
com o resultado em cada algoritmo; não existe uma segunda implementação para
animar a resolução. `servico.py` conecta essa camada à interface. A geometria SVG
serve à explicação visual, sem substituir os resultados calculados no Python.

## Verificar

```bash
python -B -m unittest discover -s tests -v
```

Os 22 testes cobrem exatidão, resíduo, equilíbrio de forças e momentos,
interpolação de polinômios conhecidos, restrições de Simpson, erros de entrada,
API local e ausência de dependências remotas. Os testes HTTP abrem uma porta
temporária somente em loopback.

O registro de testes no navegador está em [docs/validacao.md](docs/validacao.md).

## Limites para interpretar os resultados

- A produção é uma solução contínua de um sistema linear, sem otimização inteira.
- O resíduo não é uma estimativa direta do erro na solução; condicionamento importa.
- Interpolação não fornece o erro real quando a função de origem é desconhecida.
  Extrapolação recebe um aviso e grau maior não garante maior acurácia.
- As regras compostas exigem espaçamento uniforme. Simpson 1/3 exige número par
  de subintervalos. A diferença entre as regras não é um erro certificado.
- A treliça tem geometria fixa. Alterar seus coeficientes transforma a entrada em
  um sistema genérico, e o desenho estrutural deixa de ser utilizado.
