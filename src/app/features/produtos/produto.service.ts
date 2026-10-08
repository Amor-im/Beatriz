import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, shareReplay, tap, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggerService } from '../../core/services/logger/logger.service';
import { Produto, ProdutoApi, ProdutoMapper } from '../../model/produto';

/** De onde vieram os produtos exibidos: da API ou da cópia local. */
export type OrigemCatalogo = 'api' | 'local';

/** Tempo máximo de espera pela API antes de usar a cópia local. */
const TEMPO_LIMITE_MS = 8000;

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);

  private readonly urlProdutos = `${environment.apiUrl}/products`;

  private readonly _origem = signal<OrigemCatalogo>('api');
  /** Somente leitura para os componentes: quem muda a origem é o service. */
  readonly origem = this._origem.asReadonly();

  /** Lista guardada depois da primeira busca: home, catálogo e cadastro reaproveitam. */
  private catalogo$?: Observable<Produto[]>;

  /**
   * Lista os produtos da API. Se a API falhar, usa o catálogo local (`assets/produtos.json`).
   * Se o arquivo local também falhar, o erro chega ao componente, que mostra a tela de erro.
   *
   * O resultado fica guardado (shareReplay): trocar de página não faz outra requisição.
   * `recarregar = true` força uma busca nova (botão "Tentar de novo").
   */
  listar(recarregar = false): Observable<Produto[]> {
    if (!this.catalogo$ || recarregar) {
      this.logger.info('[ProdutoService] Buscando a lista de produtos');
      this.catalogo$ = this.http.get<ProdutoApi[]>(this.urlProdutos).pipe(
        timeout(TEMPO_LIMITE_MS),
        map((lista) => lista.map((json) => ProdutoMapper.fromApi(json))),
        tap(() => this._origem.set('api')),
        catchError((erro: unknown) => {
          this.logger.warn('[ProdutoService] API indisponível, usando o catálogo local', erro);
          return this.listarLocal();
        }),
        // Guarda a última lista para quem se inscrever depois. Em caso de erro, não guarda:
        // a próxima chamada tenta de novo.
        shareReplay(1),
      );
    }
    return this.catalogo$;
  }

  buscarPorId(id: number): Observable<Produto | undefined> {
    this.logger.info(`[ProdutoService] Buscando o produto ${id}`);
    // Para um id que não existe, a Fake Store API responde 200 com corpo vazio.
    return this.http.get<ProdutoApi | null>(`${this.urlProdutos}/${id}`).pipe(
      timeout(TEMPO_LIMITE_MS),
      map((json) => (json ? ProdutoMapper.fromApi(json) : undefined)),
      tap(() => this._origem.set('api')),
      catchError((erro: unknown) => {
        this.logger.warn(`[ProdutoService] API indisponível ao buscar o produto ${id}`, erro);
        return this.listarLocal().pipe(map((lista) => lista.find((p) => p.id === id)));
      }),
    );
  }

  /** A Fake Store API é de teste: ela responde ao POST com um id, mas não guarda o produto. */
  criar(produto: Produto): Observable<ProdutoApi> {
    return this.http
      .post<ProdutoApi>(this.urlProdutos, ProdutoMapper.toApi(produto))
      .pipe(timeout(TEMPO_LIMITE_MS));
  }

  private listarLocal(): Observable<Produto[]> {
    return this.http.get<ProdutoApi[]>(environment.catalogoLocalUrl).pipe(
      map((lista) => lista.map((json) => ProdutoMapper.fromApi(json))),
      tap(() => this._origem.set('local')),
    );
  }
}
