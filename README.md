# Cozinha Inteligente

Sistema web para controle de entradas, saidas, estoque e cadastros de uma cozinha.

## Onde encontrar o sistema

O sistema fica neste projeto:

```text
cozinha-app/
```

O arquivo principal da aplicacao e:

```text
index.html
```

As telas ficam em:

```text
assets/pages/
```

Principais telas:

- `assets/pages/dashboard.js`: tela inicial.
- `assets/pages/entradas.js`: registro de entradas de alimentos.
- `assets/pages/saidas.js`: registro de saidas para cozinhas ou doacoes.
- `assets/pages/estoque.js`: visualizacao do estoque atual.
- `assets/pages/cadastros.js`: cadastro de fornecedores, doadores, destinos e beneficiados.
- `assets/pages/relatorio.js`: area de relatorios.

## Como executar

1. Baixe ou clone este repositorio.
2. Abra o arquivo `index.html` no navegador.

O app usa rotas com hash, como `#/estoque`, para funcionar mesmo quando o
arquivo `index.html` e aberto diretamente por duplo clique.

Alguns navegadores podem restringir `type="module"` e importacoes em `file://`.
Se isso acontecer, use a opcao com servidor local abaixo.

## O que precisa ter instalado

Para rodar com servidor local, e necessario ter:

- Node.js instalado.
- npm instalado.
- Navegador atualizado, como Chrome, Edge ou Firefox.
- Conexao com a internet para carregar Bootstrap e SheetJS via CDN.

As dependencias do projeto ficam no `package.json`.

## Como rodar com servidor local

Abra o terminal dentro da pasta do projeto:

```bash
cd c:\xampp\htdocs\cozinha-app
```

Instale as dependencias:

```bash
npm install
```

Inicie o servidor:

```bash
npm start
```

Depois acesse no navegador:

```text
http://localhost:3000/
```

Tambem existe a opcao:

```bash
npm run serve
```

Nesse caso, o sistema tambem deve abrir em uma porta local indicada no terminal.

## Como usar

Na barra superior do sistema existem os atalhos principais:

- `Estoque`: mostra o saldo atual calculado pelas entradas e saidas.
- `Entradas`: registra alimentos recebidos por compra ou doacao.
- `Saidas`: registra alimentos enviados para cozinhas/destinos ou doacoes.
- `Cadastros`: cadastra fornecedores, doadores, destinos e beneficiados.
- `Relatorios`: area reservada para consultas e relatorios.

Antes de registrar entradas e saidas, e recomendado conferir a tela `Cadastros`, pois os campos de fornecedor, doador, destino e beneficiado usam essas listas.

## Dados salvos

Os dados sao salvos no navegador usando IndexedDB.

Isso significa que:

- Os registros ficam no navegador usado no teste.
- Se os dados do site forem apagados no navegador, os cadastros e movimentacoes tambem serao apagados.
- O sistema ja cria alguns fornecedores e destinos iniciais automaticamente.

## Importacao de planilhas

As telas de entradas e saidas aceitam importacao de arquivos:

```text
.xlsx, .xls, .csv
```

A importacao usa a biblioteca SheetJS carregada no `index.html`.

## Estrutura resumida

```text
cozinha-app/
  index.html
  server.js
  package.json
  README.md
  assets/
    js/
      app.js
      db.js
      router.js
    pages/
      dashboard.js
      entradas.js
      saidas.js
      estoque.js
      cadastros.js
      relatorio.js
    services/
      estoqueService.js
    utils/
      excel.js
      importador.js
```
