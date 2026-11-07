"""Verificações matemáticas independentes da interface e dos históricos."""

import unittest
from atividade02.metodos_diretos.gauss import resolver_gauss
from atividade02.metodos_iterativos.gauss_seidel import resolver_gauss_seidel
from atividade02.aproximacao.interpolacao import interpolar
from atividade02.integracao.quadratura import integrar
from atividade02.exemplos import exemplos, exemplo_trelica


class TestGauss(unittest.TestCase):
    def test_pivotamento_e_reconstrucao(self):
        resultado = resolver_gauss([[0, 2], [1, 3]], [4, 7])
        self.assertEqual(resultado['solucao'], [1, 2])
        self.assertEqual(resultado['passos'][1]['titulo'], 'Troca de linhas')
        self.assertLess(resultado['residuo'], 1e-12)

    def test_producao(self):
        p = exemplos()[0]
        r = resolver_gauss(p['a'], p['b'])
        for obtido, esperado in zip(r['solucao'], [90, 60, 80]):
            self.assertAlmostEqual(obtido, esperado, places=7)

    def test_singular_e_nao_finito(self):
        for a in ([[1, 2], [2, 4]], [[float('nan'), 1], [2, 3]]):
            with self.assertRaises(ValueError):
                resolver_gauss(a, [1, 2])


class TestSeidel(unittest.TestCase):
    def test_sistema_conhecido(self):
        r = resolver_gauss_seidel([[4, 1], [2, 3]], [6, 8], tolerancia=1e-9)
        self.assertTrue(r['convergiu'])
        for v, esperado in zip(r['solucao'], [1, 2]):
            self.assertAlmostEqual(v, esperado, places=7)
        self.assertLess(r['residuo'], 1e-9)

    def test_trelica_equilibrio_e_reacoes(self):
        p = exemplo_trelica()
        r = resolver_gauss_seidel(p['a'], p['b'], equacoes_normais=True)
        self.assertTrue(r['convergiu'])
        self.assertLess(r['residuo'], 1e-4)
        x = r['solucao']
        self.assertAlmostEqual(x[8]+x[9], 600, places=3)
        self.assertAlmostEqual(x[9]*p['nos'][4][0], 500+100*p['nos'][3][0], delta=0.001)
        referencia = resolver_gauss(p['a'], p['b'])['solucao']
        for atual, esperado in zip(x, referencia):
            self.assertAlmostEqual(atual, esperado, delta=0.002)

    def test_nao_convergencia_e_parametros(self):
        r = resolver_gauss_seidel([[4, 1], [2, 3]], [6, 8], max_iteracoes=1)
        self.assertFalse(r['convergiu'])
        for tol in (0, -1, 'nan'):
            with self.assertRaises(ValueError):
                resolver_gauss_seidel([[4, 1], [2, 3]], [6, 8], tolerancia=tol)


class TestInterpolacao(unittest.TestCase):
    def test_polinomio_conhecido_e_nos(self):
        xs = [-2, -1, 0, 1, 2]
        ys = [x**4-2*x+3 for x in xs]
        for metodo in ('lagrange', 'newton'):
            r = interpolar(xs, ys, 0.3, 4, metodo)
            self.assertAlmostEqual(r['valor'], 0.3**4-0.6+3)
            for x, y in zip(xs, ys):
                self.assertAlmostEqual(interpolar(xs, ys, x, 4, metodo)['valor'], y)

    def test_comparacao_e_ordenacao(self):
        p = exemplos()[2]
        r = interpolar(p['xs'][::-1], p['ys'][::-1], 1.15)
        self.assertEqual(r['nos_x'], [0.75, 1.25, 1.5])
        for item in r['comparacao']:
            self.assertAlmostEqual(item['lagrange'], item['newton'])

    def test_nos_repetidos(self):
        with self.assertRaises(ValueError):
            interpolar([1, 1, 2], [1, 2, 3], 1.5)

    def test_recorte_local_preserva_resolucao_com_medicao_distante(self):
        resultado = interpolar([0, 1, 2, 1000000], [0, 1, 4, 1000000000000], 1)
        self.assertEqual(resultado['nos_x'], [0, 1, 2])
        self.assertEqual(len(resultado['curva_local_x']), 241)
        self.assertLess(resultado['curva_local_x'][-1]-resultado['curva_local_x'][0], 3)
        for x, y in zip(resultado['curva_local_x'], resultado['curva_local_y']):
            self.assertAlmostEqual(y, x*x)


class TestIntegracao(unittest.TestCase):
    def test_exatidao(self):
        self.assertAlmostEqual(integrar([0, 1, 2], [1, 3, 5])['valor'], 6)
        self.assertAlmostEqual(integrar([0, 1, 2], [0, 1, 8], 'simpson')['valor'], 4)

    def test_rio(self):
        p = exemplos()[3]
        self.assertAlmostEqual(integrar(p['xs'], p['ys'])['valor'], 63.2)
        # h/3 × [4(1.8+4+6+3.6+2.8) + 2(2+4+4+3.4)] = 66.4
        self.assertAlmostEqual(integrar(p['xs'], p['ys'], 'simpson')['valor'], 66.4)

    def test_restricoes(self):
        for xs, ys, metodo in (([0, 1, 3], [0, 1, 2], 'trapezio'),
                               ([0, 1], [0, 1], 'simpson')):
            with self.assertRaises(ValueError):
                integrar(xs, ys, metodo)


if __name__ == '__main__':
    unittest.main()
