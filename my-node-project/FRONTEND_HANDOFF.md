# 🍽️ Guia de Arquitetura e Contexto do Projeto (Handoff para o Frontend)

> **Documento de Contexto do Projeto**: Desenvolvido para servir de instrução e referência completa para o desenvolvimento do Frontend (Cardápio Digital, Comanda e Painel KDS) e testes do sistema.

---

## 1. Visão Geral da Solução

O projeto é um **SaaS para Gestão de Restaurantes, Cardápio Digital e Fila de Cozinha (KDS)** para atendimento presencial (mesas) e delivery.

A stack e infraestrutura já implementadas no Backend e Banco de Dados são:
* **Node.js**: `v24.19.0` (atendendo à faixa obrigatória de `22.x` a `24.x`).
* **Framework Backend**: Express com TypeScript (`backend/`).
* **Banco de Dados**: PostgreSQL 16 provisionado via Docker (`postgres:16-alpine`), rodando na porta `5432`.
* **ORM**: Prisma ORM v5 com migração executada (`20261020222605_init`) e `seed` com dados realistas já populados.
* **Comunicação em Tempo Real**: Server-Sent Events (SSE) nativo via endpoint `GET /api/orders/stream`.
* **Qualidade**: 21 testes automatizados (unitários da máquina de estados + integração HTTP via `supertest`) com 100% de aprovação.
* **Middlewares Ativos**: CORS configurado (`http://localhost:5173` ou wildcard), JSON body parser, Request Logger no console e Error Handler global.

---

## 2. Status Atual da Infraestrutura Local

* **Docker**: Container `restaurant_postgres` está ativo e saudável (`Up - healthy`) na porta `5432`.
* **Banco de Dados**: Tabelas migradas e populadas:
  * 6 Mesas criadas (Mesas 1, 2 e 3 com pedidos de teste; Mesas 4, 5 e 6 disponíveis).
  * 4 Categorias (Entradas & Petiscos, Hambúrgueres Artesanais, Bebidas, Sobremesas).
  * Vários itens cadastrados com grupos de opcionais (`Ponto da Carne`, `Adicionais Extras`, `Molhos`, `Adoçar`).
  * Pedidos nos estados `RECEIVED`, `PREPARING` e `READY`.
* **Backend**: Pode ser iniciado a qualquer momento com:
  ```bash
  cd my-node-project/backend
  npm run dev
  ```
  Ou a partir da raiz: `npm run backend:dev` (escutando em `http://localhost:3001`).

---

## 3. Máquina de Estados dos Pedidos (Regra Crítica)

O ciclo de vida dos pedidos é estrito e validado pelo backend (`OrderStateMachine`):

$$\text{RECEIVED} \longrightarrow \text{PREPARING} \longrightarrow \text{READY} \longrightarrow \text{DELIVERED}$$

* **RECEIVED**: Pedido recebido na fila (cor amarela / laranja).
* **PREPARING**: Cozinha iniciou a confecção (cor azul).
* **READY**: Cozinha finalizou; pronto na bancada para o garçom entregar (cor verde).
* **DELIVERED**: Pedido entregue ao cliente. Se for o último pedido ativo da mesa, o status da mesa é alterado automaticamente para `AVAILABLE`.
* **CANCELED**: Permitido a partir de `RECEIVED`, `PREPARING` ou `READY`.

---

## 4. Catálogo de Endpoints da API (`http://localhost:3001/api`)

### 4.1. Pedidos & KDS
| Método | Endpoint | Descrição |
|:---|:---|:---|
| `GET` | `/api/orders` | Retorna lista de pedidos ordenados por data (`?status=RECEIVED`, `?tableId=1`, `?type=DINE_IN`). |
| `GET` | `/api/orders/:id` | Retorna o pedido completo com itens, adicionais escolhidos e mesa associada. |
| `POST` | `/api/orders` | Cria novo pedido. Se for `DINE_IN`, atualiza a mesa para `OCCUPIED`. |
| `PATCH` | `/api/orders/:id/status` | Altera status validando transição via máquina de estados (`{ "status": "PREPARING" }`). |
| `POST` | `/api/orders/:id/advance` | **Atalho KDS de 1-Clique**: Avança automaticamente o pedido para o próximo estágio natural. |
| `GET` | `/api/orders/stream` | **Server-Sent Events (SSE)**: Conexão em tempo real. Dispara eventos `ORDER_CREATED` e `ORDER_UPDATED`. |

#### Exemplo de Payload para `POST /api/orders`:
```json
{
  "type": "DINE_IN",
  "tableId": 1,
  "customerName": "Lucas Silva",
  "notes": "Caprichar no molho",
  "items": [
    {
      "menuItemId": 1,
      "quantity": 1,
      "selectedOptionIds": [1, 4],
      "notes": "Sem cebola"
    }
  ]
}
```

### 4.2. Cardápio & Categorias
| Método | Endpoint | Descrição |
|:---|:---|:---|
| `GET` | `/api/categories` | Lista categorias com os respectivos `items` disponíveis e seus `optionGroups` e `options`. |
| `POST` | `/api/categories` | Cria uma categoria (`{ "name": "Sobremesas", "icon": "🍰" }`). |
| `GET` | `/api/menu-items` | Lista itens do cardápio (`?categoryId=2&availableOnly=true`). |
| `GET` | `/api/menu-items/:id` | Retorna item detalhado com todos os grupos de adicionais. |

### 4.3. Mesas
| Método | Endpoint | Descrição |
|:---|:---|:---|
| `GET` | `/api/tables` | Lista todas as mesas, status (`AVAILABLE`, `OCCUPIED`, `RESERVED`) e pedidos em aberto. |
| `GET` | `/api/tables/:id` | Detalhes da mesa com comanda ativa. |
| `PATCH` | `/api/tables/:id/status` | Altera status manualmente (`{ "status": "AVAILABLE" }`). |

---

## 5. Estrutura Modular das Telas Criadas (Prontas para Extensão)

A arquitetura do frontend foi organizada em páginas e componentes modulares dentro de `frontend/src`:

```text
my-node-project/frontend/src/
├── components/
│   ├── Header.tsx             # Navbar com abas (KDS, Cardápio, Comanda, Mesas) e badge de status da API
│   ├── ModalOptionSelect.tsx  # Modal de personalização (ponto da carne, adicionais pagos, observações)
│   └── CartDrawer.tsx         # Carrinho de compras lateral (itens, total e envio do pedido)
├── pages/
│   ├── KDSPage.tsx            # TELA 1: Painel KDS (Kanban de 4 colunas + conexão SSE + avanço de 1 clique)
│   ├── MenuPage.tsx           # TELA 2: Cardápio Digital (seletor de mesa, categorias e produtos)
│   ├── OrderTrackingPage.tsx  # TELA 3: Comanda Digital (linha do tempo visual do pedido e extrato)
│   └── TablesPage.tsx         # TELA 4: Gestão do Salão (grid visual das mesas livres vs ocupadas)
├── services/
│   └── api.ts                 # Cliente HTTP centralizado e helper de subscrição SSE (subscribeToOrderStream)
├── types.ts                   # Interfaces TypeScript completas (Order, MenuItem, Category, Table, etc.)
├── App.tsx                    # Orquestrador principal que renderiza a Header e alterna as páginas
├── main.tsx
└── index.css                  # Tailwind CSS
```

---

## 6. Instruções para o Novo Chat (Frontend)

O novo chat deve abrir a pasta `my-node-project/frontend`:
* Para rodar o frontend em modo desenvolvimento:
  ```bash
  cd my-node-project/frontend
  npm run dev
  ```
  (Acessível no navegador em `http://localhost:5173`).
* Para rodar o backend localmente:
  ```bash
  cd my-node-project/backend
  npm run dev
  ```
  (Acessível em `http://localhost:3001`).

### O que o novo chat pode aprofundar em cada tela:
1. **`KDSPage.tsx`**:
   * Já possui a estrutura Kanban, chamada de `getOrders()` e conexão SSE via `subscribeToOrderStream`.
   * Pode adicionar efeitos visuais de alerta sonoro ao receber novo pedido e temporizadores de contagem regressiva por pedido.
2. **`MenuPage.tsx` + `ModalOptionSelect.tsx` + `CartDrawer.tsx`**:
   * Já listam as categorias e produtos de `GET /api/categories`.
   * Integrar o estado do carrinho global para que, ao clicar em "Personalizar", abra o `ModalOptionSelect`, adicione ao `CartDrawer` e dispare `api.createOrder(...)`.
3. **`OrderTrackingPage.tsx`**:
   * Já possui a linha do tempo visual de 4 estágios (`RECEBIDO` ➔ `NA COZINHA` ➔ `PRONTO` ➔ `ENTREGUE`) e extrato da conta.
   * Pode ser vinculado diretamente ao ID da última comanda criada pelo cliente.
4. **`TablesPage.tsx`**:
   * Já exibe o grid de mesas identificando mesas livres (`AVAILABLE`) e ocupadas (`OCCUPIED`).
   * Pode adicionar ação de fechar comanda ou abrir comanda diretamente da mesa.


