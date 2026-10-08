import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Produto } from '../../model/produto';
import { PRODUTOS_API } from '../../../testing/produtos-fake';
import { ProdutoService } from './produto.service';

describe('ProdutoService', () => {
  let service: ProdutoService;
  let http: HttpTestingController;

  const URL_API = `${environment.apiUrl}/products`;
  const URL_LOCAL = environment.catalogoLocalUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // provideHttpClientTesting troca o HttpClient real por um "dublê":
      // nenhuma requisição sai de verdade, e o teste decide a resposta.
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProdutoService);
    http = TestBed.inject(HttpTestingController);
    spyOn(console, 'info');
    spyOn(console, 'warn');
  });

  // Garante que nenhuma requisição ficou sem resposta ou foi feita sem o teste esperar.
  afterEach(() => http.verify());

  describe('listar', () => {
    it('busca na API e converte para o formato da loja', () => {
      let recebido: Produto[] = [];
      service.listar().subscribe((lista) => (recebido = lista));

      const req = http.expectOne(URL_API);
      expect(req.request.method).toBe('GET');
      req.flush(PRODUTOS_API);

      expect(recebido.length).toBe(4);
      expect(recebido[0]).toEqual(
        jasmine.objectContaining({
          id: 1,
          nome: 'Fjallraven - Foldsack No. 1 Backpack', // espaço do fim removido
          preco: 109.95,
          categoria: 'moda-masculina',
          avaliacao: { nota: 3.9, total: 120 },
        }),
      );
      expect(service.origem()).toBe('api');
    });

    it('usa o catálogo local quando a API falha', () => {
      let recebido: Produto[] = [];
      service.listar().subscribe((lista) => (recebido = lista));

      http.expectOne(URL_API).flush('erro', { status: 500, statusText: 'Server Error' });
      http.expectOne(URL_LOCAL).flush(PRODUTOS_API.slice(0, 2));

      expect(recebido.map((p) => p.id)).toEqual([1, 5]);
      expect(service.origem()).toBe('local');
    });

    it('entrega o erro ao componente se a API e o arquivo local falharem', () => {
      let falhou = false;
      service.listar().subscribe({ error: () => (falhou = true) });

      http.expectOne(URL_API).error(new ProgressEvent('network error'));
      http.expectOne(URL_LOCAL).flush('não encontrado', { status: 404, statusText: 'Not Found' });

      expect(falhou).toBeTrue();
    });
  });

  describe('lista guardada (shareReplay)', () => {
    it('reaproveita a lista: a segunda chamada não faz outra requisição', () => {
      service.listar().subscribe();
      http.expectOne(URL_API).flush(PRODUTOS_API);

      let recebido: Produto[] = [];
      service.listar().subscribe((lista) => (recebido = lista));

      http.expectNone(URL_API);
      expect(recebido.length).toBe(4);
    });

    it('com recarregar = true, busca de novo', () => {
      service.listar().subscribe();
      http.expectOne(URL_API).flush(PRODUTOS_API);

      service.listar(true).subscribe();
      http.expectOne(URL_API).flush(PRODUTOS_API);
    });

    it('não guarda erro: depois de falhar, a próxima chamada tenta de novo', () => {
      service.listar().subscribe({ error: () => undefined });
      http.expectOne(URL_API).error(new ProgressEvent('network error'));
      http.expectOne(URL_LOCAL).error(new ProgressEvent('network error'));

      service.listar().subscribe();
      http.expectOne(URL_API).flush(PRODUTOS_API);
    });
  });

  describe('buscarPorId', () => {
    it('busca um produto pelo id', () => {
      let recebido: Produto | undefined;
      service.buscarPorId(5).subscribe((p) => (recebido = p));

      http.expectOne(`${URL_API}/5`).flush(PRODUTOS_API[1]);

      expect(recebido?.nome).toBe('John Hardy Bracelet');
      expect(recebido?.categoria).toBe('joias');
    });

    it('devolve undefined quando a API responde vazio (id inexistente)', () => {
      let recebido: Produto | undefined = produtoQualquer();
      service.buscarPorId(999).subscribe((p) => (recebido = p));

      http.expectOne(`${URL_API}/999`).flush(null);

      expect(recebido).toBeUndefined();
    });

    it('procura no catálogo local quando a API falha', () => {
      let recebido: Produto | undefined;
      service.buscarPorId(10).subscribe((p) => (recebido = p));

      http.expectOne(`${URL_API}/10`).error(new ProgressEvent('network error'));
      http.expectOne(URL_LOCAL).flush(PRODUTOS_API);

      expect(recebido?.nome).toBe('SanDisk SSD PLUS 1TB');
      expect(service.origem()).toBe('local');
    });
  });

  describe('criar', () => {
    it('envia um POST com os campos no formato da API', () => {
      service
        .criar({
          id: 0,
          nome: 'Caneca',
          preco: 39.9,
          descricao: 'Caneca de cerâmica',
          categoria: 'joias',
          imageUrl: 'https://exemplo.com/caneca.jpg',
        })
        .subscribe();

      const req = http.expectOne(URL_API);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        title: 'Caneca',
        price: 39.9,
        description: 'Caneca de cerâmica',
        category: 'jewelery',
        image: 'https://exemplo.com/caneca.jpg',
      });
      req.flush({ id: 21, ...req.request.body });
    });
  });
});

function produtoQualquer(): Produto {
  return { id: 1, nome: 'x', preco: 1, descricao: 'x', categoria: 'x' };
}
