# 🍽️ Gestor de Cardápio Digital e Pedidos para Restaurantes (SaaS)

Sistema para gestão completa de restaurantes, integrando mesas, cardápios categorizados, grupos de opcionais/complementos, máquina de estados para pedidos e painel **KDS (Kitchen Display System)** em tempo real.

---

## 🛠️ Stack Tecnológica & Versões Obrigatórias

* **Node.js**: `v24.19.0` (Respeitando a faixa exigida de `22.x` a `24.x`)
* **Framework Backend**: Express com recarregamento em tempo real via **nodemon**
* **Banco de Dados**: PostgreSQL 16 provisionado via **Docker Compose** (`postgres:16-alpine`)
* **Mapeamento Objeto-Relacional (ORM)**: Prisma ORM (Client, Migrations, Studio e Seed)
* **Linguagem**: TypeScript (com checagem estrita de tipos)

---

## 🏗️ Estrutura do Projeto

```text
my-node-project/
├── docker-compose.yml          # Provisionamento do PostgreSQL 16
├── .env.example                # Template de variáveis de ambiente
├── package.json                # Scripts centralizados de orquestração
├── README.md                   # Instruções do projeto
├── backend/                    # API Express + Prisma
│   ├── .env                    # Variáveis locais de execução
│   ├── nodemon.json            # Configuração do Nodemon para desenvolvimento
│   ├── tsconfig.json           # Configuração do TypeScript
│   ├── package.json            # Dependências e scripts do backend
│   ├── prisma/
│   │   ├── schema.prisma       # Modelagem relacional rica
│   │   └── seed.ts             # Carga inicial de dados (mesas, itens, pedidos)
│   └── src/
│       ├── prisma.ts           # Instância singleton do Prisma Client
│       ├── app.ts              # Configuração do Express, CORS e rotas
│       ├── server.ts           # Inicialização do servidor HTTP
│       ├── services/
│       │   └── order-state-machine.ts # Regras da máquina de estados
│       ├── controllers/        # Controladores REST (Category, MenuItem, Table, Order)
│       └── routes/             # Definição dos endpoints REST
└── frontend/                   # Frontend KDS + Comanda Digital (próxima etapa)
```

---

## 📊 Modelagem Relacional (Prisma Schema)

* **`Table`**: Gestão de mesas com capacidade e status (`AVAILABLE`, `OCCUPIED`, `RESERVED`).
* **`Category`**: Categorias do cardápio (ex: Hambúrgueres, Bebidas, Petiscos, Sobremesas).
* **`MenuItem`**: Produtos com foto, preço, descrição e disponibilidade.
* **`OptionGroup`**: Grupos de complementos com regras de `minSelect` e `maxSelect` (ex: "Ponto da Carne", "Molhos").
* **`OptionItem`**: Opções com preços adicionais individuais (ex: "Bacon Crocante +R$ 5,00").
* **`Order`**: Pedidos vinculados a mesas ou delivery, com código amigável (`#PED-101`), observações e total.
* **`OrderItem` & `OrderItemOption`**: Itens do pedido com snapshot histórico dos preços e opcionais.

---

## 🔄 Máquina de Estados dos Pedidos

O ciclo de vida dos pedidos segue rigorosamente a esteira de produção gastronômica:

```
[ RECEIVED ] ──► [ PREPARING ] ──► [ READY ] ──► [ DELIVERED ]
      │               │               │
      └───────────────┴───────────────┴───────────► [ CANCELED ]
```

* **`RECEIVED`**: Pedido criado pelo cliente/mesa, entra na fila da cozinha.
* **`PREPARING`**: Cozinha inicia o preparo.
* **`READY`**: Prato pronto na bancada para entrega pelo garçom/expedição.
* **`DELIVERED`**: Pedido entregue na mesa ou enviado para delivery.
* **`CANCELED`**: Cancelamento permitido antes da entrega final.

---

## 🚀 Como Executar o Projeto

### 1. Iniciar o Banco de Dados com Docker
Com o Docker Desktop ou WSL em execução, execute na raiz (`my-node-project`):

```bash
docker compose up -d
```

### 2. Rodar Migrações e Seed Inicial
Para criar as tabelas e popular o banco com dados de teste (mesas, hambúrgueres, acompanhamentos e pedidos iniciais):

```bash
cd backend
npx prisma migrate dev --name init
npm run prisma:seed
```

*(Opcional) Para visualizar o banco de dados graficamente no navegador:*
```bash
npm run prisma:studio
```

### 3. Iniciar o Backend com Nodemon
Para rodar a API com recarregamento automático a cada alteração:

```bash
npm run dev
```

O servidor estará disponível em: **`http://localhost:3001`**

---

## 📡 Principais Endpoints da API

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verificação de status da API |
| `GET` | `/api/categories` | Lista categorias com itens e opcionais |
| `GET` | `/api/tables` | Lista mesas e pedidos em andamento |
| `GET` | `/api/orders` | Fila de pedidos (filtros por `status`, `tableId`) |
| `POST` | `/api/orders` | Criação de novo pedido (comanda/cliente) |
| `PATCH` | `/api/orders/:id/status` | Transição de estado com validação |
| `POST` | `/api/orders/:id/advance` | Atalho de avanço rápido para o KDS |

