"""Servidor local sem dependências, templates embutidos ou acesso à internet."""

import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

from atividade02.exemplos import exemplos
from atividade02.servico import simular

PASTA_WEB = Path(__file__).parent / "web"


class ServidorLocal(ThreadingHTTPServer):
    daemon_threads = True


class Requisicao(SimpleHTTPRequestHandler):
    def log_message(self, formato, *args):
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; "
                         "style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; "
                         "connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'")
        super().end_headers()

    def responder_json(self, conteudo, status=200):
        dados = json.dumps(conteudo, ensure_ascii=False, allow_nan=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)

    def do_GET(self):
        caminho = urlsplit(self.path).path
        if caminho == "/api/exemplos":
            self.responder_json(exemplos())
        elif caminho in ("/", "/index.html", "/estilos.css", "/app.js", "/graficos.js", "/editor.js", "/util.js", "/tema.js"):
            self.path = caminho
            super().do_GET()
        else:
            self.send_error(404, "Recurso não encontrado")

    def do_POST(self):
        if self.path != "/api/simular":
            self.responder_json({"erro": "Rota não encontrada."}, 404)
            return
        origem = self.headers.get("Origin")
        if origem and origem != f"http://{self.headers.get('Host')}":
            self.responder_json({"erro": "Origem não permitida."}, 403)
            return
        try:
            tamanho = int(self.headers.get("Content-Length", "0"))
            if not 0 < tamanho <= 250_000:
                raise ValueError("Envie até 250 kB de dados.")
            entrada = json.loads(self.rfile.read(tamanho))
            resultado = simular(entrada)
            # Serializa antes dos cabeçalhos: overflow nunca produz JSON parcial.
            json.dumps(resultado, allow_nan=False)
            self.responder_json(resultado)
        except (ValueError, TypeError, KeyError, OverflowError, ZeroDivisionError) as erro:
            self.responder_json({"erro": str(erro) or "Confira os dados informados."}, 400)


def criar_servidor(porta=5052):
    handler = partial(Requisicao, directory=str(PASTA_WEB))
    return ServidorLocal(("127.0.0.1", porta), handler)
