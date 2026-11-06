"""Inicia o laboratório no navegador; toda a aplicação funciona offline."""

import argparse
import threading
import webbrowser
from atividade02.servidor import criar_servidor


def main():
    parser = argparse.ArgumentParser(description="Laboratório offline de cálculo numérico")
    parser.add_argument("--porta", type=int, default=5052, help="Porta local (padrão: 5052)")
    parser.add_argument("--sem-navegador", action="store_true", help="Iniciar apenas o servidor")
    args = parser.parse_args()
    if not 0 <= args.porta <= 65535:
        parser.error("A porta deve estar entre 0 e 65535.")
    try:
        servidor = criar_servidor(args.porta)
    except OSError as erro:
        parser.exit(1, f"Não foi possível abrir a porta {args.porta}: {erro}. Use --porta com outro número.\n")
    url = f"http://127.0.0.1:{servidor.server_port}"
    print(f"Laboratório de cálculo numérico: {url}\nCtrl+C para encerrar.", flush=True)
    if not args.sem_navegador:
        threading.Timer(0.4, webbrowser.open, args=(url,)).start()
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nLaboratório encerrado.")
    finally:
        servidor.server_close()


if __name__ == "__main__":
    main()
