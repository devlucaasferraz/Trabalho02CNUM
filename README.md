# Atividade 02 de cálculo numérico

Projeto da atividade complementar de Cálculo Numérico (LES710C), UNIVASF.
Esta pasta contém um projeto independente da Atividade 01.

## Estado inicial

Estrutura criada para desenvolver os quatro tópicos do enunciado. Os métodos
numéricos, a entrada de dados e os relatórios ainda não estão implementados.
Os problemas sorteados são **01.2, 02.2, 03.2 e 04.1**: produção de componentes
elétricos, treliça, interpolação de tensão e área da seção de um rio.
Os requisitos estão registrados em [docs/escopo.md](docs/escopo.md).

## Como executar

Requisito: Python 3.10 ou superior. A estrutura inicial usa apenas a biblioteca
padrão e não exige instalação de dependências.

Na pasta deste projeto, execute:

```bash
python main.py
```

O comando apresenta os tópicos previstos e o estado do projeto.

## Organização

```text
main.py                         Entrada da aplicação
atividade02/
    __init__.py                 Identificação do pacote
    metodos_diretos/             Sistemas lineares por métodos diretos
    metodos_iterativos/          Sistemas lineares por Gauss-Seidel
    aproximacao/                 Interpolação e mínimos quadrados
    integracao/                 Trapézio e Simpson repetidos
docs/
    escopo.md                   Requisitos e problemas sorteados
requirements.txt                Dependências externas, quando necessárias
```

## Direção de desenvolvimento

- Implementar os métodos em seus módulos, separados da interface.
- Produzir resultados e históricos a partir da mesma implementação numérica.
- Permitir novas entradas para problemas semelhantes.
- Validar os dados e informar falhas ou ausência de convergência.
- Preparar resultados para o relatório explicativo e a apresentação.

Arquivos gerados pela aplicação deverão ser salvos em `output/`, ignorado pelo Git.
