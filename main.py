"""Ponto de entrada da estrutura inicial da Atividade 02."""

from atividade02 import PROBLEMAS_SORTEADOS


def main():
    """Apresenta o escopo sem executar métodos ainda não implementados."""
    print("Atividade 02 de cálculo numérico - UNIVASF")
    print("Estrutura inicial; métodos numéricos ainda não implementados.\n")
    for codigo, descricao in PROBLEMAS_SORTEADOS:
        print(f"{codigo}: {descricao}")
    print("\nRequisitos dos problemas: docs/escopo.md.")


if __name__ == "__main__":
    main()
