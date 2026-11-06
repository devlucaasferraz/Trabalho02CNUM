"""Contrato HTTP, validação de dados e ausência de recursos de rede externos."""

import json
import re
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from atividade02.exemplos import exemplos
from atividade02.servidor import criar_servidor, PASTA_WEB
from atividade02.servico import simular


class TestServico(unittest.TestCase):
    def test_exemplos_completos_e_json_finito(self):
        for exemplo in exemplos():
            with self.subTest(exemplo=exemplo['id']):
                resultado = simular(exemplo)
                self.assertTrue(resultado['convergiu'])
                self.assertGreater(len(resultado['passos']), 0)
                json.dumps(resultado, allow_nan=False)

    def test_trelica_so_e_desenhada_para_seu_modelo(self):
        entrada = exemplos()[1]
        entrada['b'][3] = '500,0'
        self.assertIn('trelica', simular(entrada))
        entrada['a'][0][0] += 0.1
        self.assertNotIn('trelica', simular(entrada))

    def test_ambas_formas_e_soma_das_parcelas(self):
        for metodo in ('lagrange', 'newton'):
            entrada = exemplos()[2]
            entrada.update(metodo=metodo, grau=4, alvo='1,15')
            resultado = simular(entrada)
            self.assertAlmostEqual(resultado['valor'], 0.3372864, places=7)
            for i, valor in enumerate(resultado['curva_y']):
                soma = sum(curva[i] for curva in resultado['curvas_parcelas'])
                self.assertAlmostEqual(valor, soma)

    def test_rejeita_entradas_invalidas(self):
        casos = [[], {}, {'metodo':'eval'}, {'metodo':'gauss','a':[[1]],'b':[1]},
                 {'metodo':'simpson','xs':[0,1,2],'ys':[1,'nan',1]}]
        for caso in casos:
            with self.subTest(caso=caso), self.assertRaises(ValueError):
                simular(caso)

    def test_arquivos_web_sem_dependencias_remotas(self):
        html = (PASTA_WEB/'index.html').read_text(encoding='utf-8')
        for atributo in re.findall(r'(?:src|href)="([^"]+)"', html):
            self.assertFalse(atributo.startswith(('http:', 'https:', '//')))
        for script in PASTA_WEB.glob('*.js'):
            conteudo = script.read_text(encoding='utf-8')
            self.assertNotRegex(conteudo, r'fetch\([\s]*["\']https?://')
            self.assertNotRegex(conteudo, r'from ["\']https?://')
        css = (PASTA_WEB/'estilos.css').read_text(encoding='utf-8')
        self.assertNotIn('@import', css)
        self.assertNotRegex(css, r'url\([\s]*["\']?https?://')


class TestHTTP(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.servidor = criar_servidor(0)
        cls.thread = threading.Thread(target=cls.servidor.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f'http://127.0.0.1:{cls.servidor.server_port}'

    @classmethod
    def tearDownClass(cls):
        cls.servidor.shutdown()
        cls.servidor.server_close()
        cls.thread.join(timeout=3)

    def test_pagina_e_modulos_locais(self):
        for caminho in ('/', '/app.js', '/editor.js', '/graficos.js', '/util.js', '/estilos.css'):
            with urlopen(self.url+caminho, timeout=5) as resposta:
                self.assertEqual(resposta.status, 200)
                self.assertIn("connect-src 'self'", resposta.headers['Content-Security-Policy'])
                self.assertTrue(resposta.read())

    def test_calculo_via_http(self):
        entrada = json.dumps(exemplos()[0]).encode()
        pedido = Request(self.url+'/api/simular', data=entrada,
                         headers={'Content-Type':'application/json','Origin':self.url})
        with urlopen(pedido, timeout=5) as resposta:
            resultado = json.load(resposta)
        for atual, esperado in zip(resultado['solucao'], [90,60,80]):
            self.assertAlmostEqual(atual, esperado)

    def test_erro_legivel_e_sem_acesso_a_arquivos_do_projeto(self):
        pedido = Request(self.url+'/api/simular', data=b'{"metodo":"invalido"}')
        with self.assertRaises(HTTPError) as capturado:
            urlopen(pedido, timeout=5)
        self.assertEqual(capturado.exception.code, 400)
        self.assertIn('erro', json.load(capturado.exception))
        with self.assertRaises(HTTPError) as capturado:
            urlopen(self.url+'/../main.py', timeout=5)
        self.assertEqual(capturado.exception.code, 404)

    def test_origem_externa_rejeitada(self):
        pedido = Request(self.url+'/api/simular', data=b'{}', headers={'Origin':'https://outro.invalid'})
        with self.assertRaises(HTTPError) as capturado:
            urlopen(pedido, timeout=5)
        self.assertEqual(capturado.exception.code, 403)


if __name__ == '__main__':
    unittest.main()
