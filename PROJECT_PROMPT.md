# 🍳 Cozinha Inteligente - Prompt do Projeto

## 📋 Visão Geral

**Projeto**: Sistema web para gerenciamento de cozinha
**Stack**: JavaScript (ES6+), HTML5, CSS3 (Bootstrap), IndexedDB
**Tipo**: SPA (Single Page Application)
**Status**: Em desenvolvimento

### Descrição
Aplicação inteligente para controle de:
- ✅ Entradas de alimentos (compra/doação)
- ✅ Saídas para cozinhas/destinos (doações)
- ✅ Visualização de estoque
- ✅ Cadastros de fornecedores, doadores, destinos, beneficiados
- ✅ Relatórios e consultas
- ✅ Importação de planilhas (XLSX, XLS, CSV)

---

## 📁 Estrutura do Projeto (RESPEITAR)

```
cozinha-app/
├── index.html                 # Arquivo principal
├── server.js                  # Servidor Node.js
├── package.json               # Dependências
├── README.md                  # Documentação
├── PROJECT_PROMPT.md          # Este arquivo (diretrizes de desenvolvimento)
│
├── assets/
│   ├── js/
│   │   ├── app.js             # Inicialização e ponto de entrada
│   │   ├── db.js              # Gerenciamento IndexedDB + dados iniciais
│   │   ├── router.js          # Roteamento SPA
│   │   └── [novos arquivos]   # Novos módulos seguem este padrão
│   │
│   ├── pages/
│   │   ├── dashboard.js       # Tela inicial (5 cards com navegação)
│   │   ├── entradas.js        # Registro de entradas
│   │   ├── saidas.js          # Registro de saídas
│   │   ├── estoque.js         # Visualização de estoque
│   │   ├── cadastros.js       # Gerenciamento de dados iniciais
│   │   ├── relatorio.js       # Relatórios
│   │   └── [nova página].js   # Novas páginas seguem este padrão
│   │
│   ├── services/
│   │   ├── estoqueService.js  # Lógica de cálculo de estoque
│   │   └── [novos serviços]   # Novos serviços aqui
│   │
│   ├── utils/
│   │   ├── excel.js           # Importação de planilhas (SheetJS)
│   │   ├── importador.js      # Utilitários de importação
│   │   └── [novos utilitários]
│   │
│   └── tests/                 # TESTES UNITÁRIOS (criar se não existir)
│       ├── db.test.js         # Testes para db.js
│       ├── services/          # Testes para serviços
│       │   └── estoqueService.test.js
│       └── utils/             # Testes para utilitários
│           ├── excel.test.js
│           └── importador.test.js
```

---

## 🎨 Padrões de Código

### 1️⃣ **Módulos JavaScript (ES6+)**

**✅ Sempre use:**
```javascript
// Exportar funções/classes
export function nomeFuncao() {
    // lógica
}

export async function funcaoAssincrona() {
    // lógica com await
}

export class MinhaClasse {
    constructor(param) {
        this.param = param;
    }

    metodo() {
        // implementação
    }
}
```

**❌ Nunca use:**
```javascript
// CommonJS - NÃO USE!
module.exports = { nomeFuncao };
const { algo } = require('./arquivo');
```

### 2️⃣ **Importações**

**✅ Padrão:**
```javascript
// Sempre use .js no final da importação
import { initDB, getAll, add } from './db.js';
import { renderRoute } from './router.js';
import { calcularEstoque } from '../services/estoqueService.js';
```

### 3️⃣ **Funções Async/Await**

**✅ Padrão:**
```javascript
// Use async/await para operações assíncronas
export async function buscarDados(storeName) {
    try {
        const database = await getDB();
        const tx = database.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const req = store.getAll();

        return new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    } catch (error) {
        console.error(`Erro ao buscar ${storeName}:`, error);
        throw error;
    }
}
```

### 4️⃣ **Funções de Renderização (Pages)**

**✅ Padrão para páginas:**
```javascript
// assets/pages/nomeDaPagina.js

export function render() {
    return `
        <div class="container mt-4">
            <h2>Título da Página</h2>
            <!-- conteúdo HTML -->
        </div>
    `;
}

export function setup() {
    // Executar após renderização (listeners, inicializações)
    document.getElementById('btn-salvar').addEventListener('click', salvar);
}

async function salvar() {
    try {
        // lógica de salvamento
    } catch (error) {
        console.error('Erro ao salvar:', error);
    }
}
```

### 5️⃣ **Serviços (Business Logic)**

**✅ Padrão para serviços:**
```javascript
// assets/services/nomeService.js

export async function operacaoPrincipal(param1, param2) {
    // Validar entrada
    if (!param1) {
        throw new Error('param1 é obrigatório');
    }

    // Lógica principal
    const resultado = await processarDados(param1, param2);

    // Retornar resultado estruturado
    return resultado;
}

// Funções privadas com _ prefixo (convenção)
async function _processarInterno(dados) {
    // implementação
}
```

### 6️⃣ **Tratamento de Erros**

**✅ Padrão:**
```javascript
try {
    const resultado = await operacao();
    return resultado;
} catch (error) {
    console.error('Contexto do erro:', error);
    // Opcionalmente relançar
    throw new Error(`Erro em operacao: ${error.message}`);
}
```

### 7️⃣ **Nomes e Convenções**

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Funções | camelCase | `calcularEstoque()`, `buscarFornecedores()` |
| Classes | PascalCase | `class EstoqueCalculador {}` |
| Constantes | UPPER_SNAKE_CASE | `DB_NAME`, `COLUNA_LARGURA` |
| Variáveis | camelCase | `minhaVariavel`, `resultado` |
| Funções privadas | \_prefix ou # | `_funcaoPrivada()`, `#metodoPrivado()` |
| Booleanos | is/has prefix | `isValido`, `hasErro` |

### 8️⃣ **Organização de Linhas**

**✅ Máximo de 100-120 caracteres por linha**
**✅ Use quebras de linha para melhor legibilidade**

```javascript
// ❌ Ruim
const resultado = processarDados(param1, param2, param3, param4, param5, param6, param7, param8);

// ✅ Bom
const resultado = processarDados(
    param1,
    param2,
    param3,
    param4
);
```

---

## 🧪 Padrões de Testes Unitários

### Setup Inicial

**Instalar dependências de teste (quando necessário):**
```bash
npm install --save-dev vitest @vitest/ui
```

### Estrutura de Teste

**✅ Arquivo de teste: `assets/tests/utils/excel.test.js`**

```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { processarPlanilha } from '../../utils/excel.js';

describe('excel.js - Processamento de Planilhas', () => {
    
    describe('processarPlanilha()', () => {
        it('deve processar planilha válida corretamente', () => {
            // Arrange
            const dados = [
                { nome: 'Item1', quantidade: 10 },
                { nome: 'Item2', quantidade: 20 }
            ];

            // Act
            const resultado = processarPlanilha(dados);

            // Assert
            expect(resultado).toBeDefined();
            expect(resultado).toHaveLength(2);
            expect(resultado[0].nome).toBe('Item1');
        });

        it('deve lançar erro quando dados são nulos', () => {
            // Act & Assert
            expect(() => {
                processarPlanilha(null);
            }).toThrow('Dados inválidos');
        });

        it('deve retornar array vazio para entrada vazia', () => {
            // Act
            const resultado = processarPlanilha([]);

            // Assert
            expect(resultado).toEqual([]);
        });
    });

    describe('validarPlanilha()', () => {
        it('deve validar estrutura correta', () => {
            // Arrange
            const planilha = {
                colunas: ['nome', 'quantidade'],
                dados: []
            };

            // Act
            const isValida = validarPlanilha(planilha);

            // Assert
            expect(isValida).toBe(true);
        });
    });
});
```

### Padrão AAA (Arrange, Act, Assert)

```javascript
it('descrição do que deve fazer', () => {
    // ARRANGE: Preparar dados e contexto
    const entrada = { id: 1, valor: 100 };

    // ACT: Executar a ação
    const resultado = funcao(entrada);

    // ASSERT: Verificar resultado
    expect(resultado).toBe(esperado);
});
```

### Testes para Serviços (com async)

```javascript
import { describe, it, expect, vi } from 'vitest';
import { calcularEstoque } from '../../services/estoqueService.js';

describe('estoqueService.js - Cálculos de Estoque', () => {
    
    it('deve calcular saldo corretamente', async () => {
        // Arrange
        const entradas = 100;
        const saidas = 30;

        // Act
        const saldo = await calcularEstoque(entradas, saidas);

        // Assert
        expect(saldo).toBe(70);
    });

    it('deve retornar erro se dados forem inválidos', async () => {
        // Act & Assert
        await expect(calcularEstoque(null, 30))
            .rejects
            .toThrow('Entrada inválida');
    });
});
```

### Testes com Mock (simulação)

```javascript
import { vi } from 'vitest';
import { getAll } from '../../js/db.js';

// Mock da função de banco de dados
vi.mock('../../js/db.js', () => ({
    getAll: vi.fn()
}));

describe('Teste com mock', () => {
    it('deve chamar getAll quando buscar fornecedores', async () => {
        // Arrange
        getAll.mockResolvedValueOnce([
            { id: 1, nome: 'Fornecedor 1' }
        ]);

        // Act
        const resultado = await buscarFornecedores();

        // Assert
        expect(getAll).toHaveBeenCalledWith('fornecedores');
        expect(resultado).toHaveLength(1);
    });
});
```

### Executar Testes

```bash
# Rodando testes
npm test

# Com interface visual
npm run test:ui

# Com cobertura
npm run test:coverage
```

### Cobertura Esperada

- **Utilitários**: 90%+
- **Serviços**: 85%+
- **Pages (UI)**: 60%+ (testes de lógica, não renderização)
- **DB**: 80%+

---

## 🔧 Dados Iniciais (IMUTÁVEL)

### Fornecedores Iniciais (db.js)
```javascript
FORNECEDORES_INICIAIS = [
    { nome: "COOPERFAMILIA", cnpj: "09.263.339/0001-55" },
    { nome: "COOP OURO DO SUL", cnpj: "91.360.420/0001-34" },
    // ... mais 6 fornecedores
];
```

### Destinos Iniciais (db.js)
```javascript
DESTINOS_INICIAIS = [
    { nome: "CSA" },
    { nome: "MARISTAS" },
    // ... mais 4 destinos
];
```

**⚠️ Nunca modificar estes dados sem avisar!**

---

## 📊 Banco de Dados (IndexedDB)

### Stores Existentes:
1. **entradas** - Registros de entrada de alimentos
2. **saidas** - Registros de saída/doação
3. **insumos** - Catálogo de insumos/alimentos
4. **fornecedores** - Dados de fornecedores
5. **doadores** - Dados de doadores
6. **destinos** - Dados de destinos/cozinhas
7. **beneficiados** - Dados de beneficiados

### Padrão de Acesso:
```javascript
// Buscar todos
const todos = await getAll('storeName');

// Adicionar novo
const id = await add('storeName', { nome: 'novo', ... });
```

---

## 🎯 Checklist Antes de Novo Desenvolvimento

Ao adicionar **nova funcionalidade**, sempre:

- [ ] Seguir padrão de estrutura de pastas
- [ ] Usar ES6+ com export/import
- [ ] Adicionar comentários em lógica complexa
- [ ] Criar função de `render()` + `setup()` para páginas
- [ ] Implementar tratamento de erros com try/catch
- [ ] Adicionar testes unitários (mínimo 80% de cobertura)
- [ ] Testar no navegador antes de commit
- [ ] Atualizar `README.md` se necessário
- [ ] Verificar se não quebrou funcionalidades existentes
- [ ] Fazer commits com mensagens descritivas em português

---

## 📝 Exemplos de Commits

```bash
# Novo recurso
git commit -m "feat: adicionar filtro de estoque por fornecedor"

# Correção
git commit -m "fix: corrigir cálculo de saldo em estoque"

# Testes
git commit -m "test: adicionar testes para excel.js"

# Documentação
git commit -m "docs: atualizar README com novas instruções"

# Refatoração
git commit -m "refactor: reorganizar estrutura de serviços"
```

---

## 🚀 Próximos Passos (Diretrizes)

Quando adicionando novas features:

1. **Criar arquivo em pasta apropriada** (utils/, services/, pages/)
2. **Implementar com padrão definido acima**
3. **Adicionar arquivo .test.js correspondente**
4. **Implementar testes antes ou junto com código**
5. **Testar manualmente no navegador**
6. **Atualizar documentação**

---

## ⚠️ IMPORTANTE: O QUE JÁ FUNCIONA

**NÃO MODIFICAR/QUEBRAR:**
- ✅ IndexedDB e inicialização de dados
- ✅ Roteamento SPA (hash-based)
- ✅ Dashboard com 5 cards principais
- ✅ Estrutura de pastas
- ✅ Importação de planilhas (SheetJS)

**OK PARA EVOLUIR:**
- ✅ Adicionar novos serviços
- ✅ Criar novas páginas
- ✅ Expandir validações
- ✅ Melhorar UI/UX
- ✅ Adicionar testes

---

## 📞 Referência Rápida

| Necessidade | Arquivo | Função |
|------------|---------|--------|
| Acessar DB | db.js | `getAll()`, `add()` |
| Renderizar Página | pages/*.js | `render()` |
| Lógica de Negócio | services/*.js | funções exportadas |
| Utilitários | utils/*.js | funções exportadas |
| Testes | tests/**/*.test.js | descrever testes |

---

**Última atualização**: 2026-07-17
**Versão do Projeto**: 1.0.0
**Stack**: JavaScript ES6+, HTML5, CSS3 (Bootstrap), IndexedDB
