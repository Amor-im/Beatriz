// Configuração usada no build de produção (`ng build`).
export const environment = {
  production: true,
  /** Endereço base da Fake Store API. */
  apiUrl: 'https://fakestoreapi.com',
  /** Cópia local do catálogo, usada quando a API não responde. */
  catalogoLocalUrl: 'assets/produtos.json',
};
