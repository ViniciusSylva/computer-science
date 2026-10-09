# 📑 Especificação de Requisitos de Software (SRS)

## 📌 Projeto: Gestor de Cardápio Digital e Pedidos para Restaurantes (SaaS)

---

## 1. Visão Geral e Escopo

O sistema é uma plataforma voltada para estabelecimentos gastronômicos (restaurantes, hamburguerias, cafeterias e bares), projetada para operar em cenários de **atendimento no salão (mesas)** e **pedidos de delivery/balcão**. 

A solução integra um **Cardápio Digital interativo**, uma **Comanda Digital** para o cliente acompanhar seu consumo e um painel **KDS (Kitchen Display System)** para a equipe de cozinha organizar a fila de pedidos e atualizar os estados de produção em tempo real.

---

## 2. Restrições Técnicas Obrigatórias e Controle de Versões

Para garantir a compatibilidade e a conformidade com as diretrizes da disciplina, o projeto segue estritamente os seguintes limites arquiteturais e tecnológicos:

| Componente | Tecnologia / Ferramenta | Limite de Versão Obrigatório | Justificativa / Uso |
| :--- | :--- | :--- | :--- |
| **Ambiente de Execução** | Node.js | `>= 22.x` e `<= 24.x` (LTS recente) | Compatibilidade com recursos modernos do motor V8 e suporte LTS. |
| **Backend Framework** | Express | `4.21.x` | API REST e máquina de estados dos pedidos. |
| **Dev Tooling** | Nodemon | `^3.1.x` | Hot-reload para agilidade no desenvolvimento local. |
| **ORM** | Prisma ORM | `^5.22.x` | Mapeamento relacional, migrações e schema centralizado. |
| **Banco de Dados** | PostgreSQL | `>= 15` e `<= 16` (via Docker) | Imagem oficial `postgres:16-alpine`. |
| **Infraestrutura** | Docker & Docker Compose | Compose file `v3.8+` | Isolamento e padronização do ambiente de banco de dados. |
| **Frontend** | React (Vite) + Tailwind CSS | React 18 + Vite 5 | Interface moderna, responsiva e performática. |
| **Linguagem** | TypeScript | `^5.6.x` | Tipagem estrita de ponta a ponta no backend e frontend. |

---

## 3. Requisitos Funcionais (RF)

### 3.1. Gestão de Mesas e Salão
* **RF01 - Cadastro e Listagem de Mesas**: O sistema deve permitir listar as mesas do restaurante informando número, capacidade de assentos e status atual.
* **RF02 - Monitoramento de Ocupação**: O sistema deve atualizar o estado da mesa entre `AVAILABLE` (Disponível), `OCCUPIED` (Ocupada) e `RESERVED` (Reservada).
* **RF03 - Liberação Automática de Mesas**: Quando todos os pedidos vinculados a uma mesa forem finalizados (`DELIVERED`) ou cancelados (`CANCELED`), o status da mesa deve retornar automaticamente para `AVAILABLE`.

### 3.2. Gestão de Categorias e Itens do Cardápio
* **RF04 - Categorização do Cardápio**: O sistema deve permitir agrupar produtos em categorias (ex: Entradas, Hambúrgueres, Bebidas, Sobremesas) ordenadas por prioridade de exibição.
* **RF05 - Catálogo de Produtos**: Cada produto do cardápio deve conter: nome, descrição detalhada, preço base, foto/URL e controle booleano de disponibilidade em estoque (`isAvailable`).
* **RF06 - Grupos de Opcionais e Complementos**: Produtos devem suportar grupos de complementos (ex: "Ponto da Carne", "Adicionais Extras", "Tipo de Molho").
* **RF07 - Regras de Seleção de Opcionais**: Cada grupo de adicionais deve definir limites de seleção:
  * Obrigatoriedade (`isRequired: true/false`).
  * Quantidade mínima de itens permitida (`minSelect`).
  * Quantidade máxima de itens permitida (`maxSelect`).
  * Preço adicional individual por complemento (`additionalPrice`).

### 3.3. Comanda Digital e Realização de Pedidos
* **RF08 - Criação de Pedido**: O cliente ou atendente deve poder montar uma comanda selecionando itens, especificando quantidades, escolhendo complementos e adicionando observações personalizadas por item (ex: "sem cebola").
* **RF09 - Cálculo de Total Confiável**: O sistema deve calcular o preço total do pedido no servidor com base nos itens cadastrados e adicionais escolhidos, evitando manipulações no frontend.
* **RF10 - Código Amigável de Acompanhamento**: Cada pedido gerado deve receber um identificador alfanumérico visível (ex: `#PED-101`) para identificação rápida pelo cliente e pela cozinha.
* **RF11 - Consulta de Comanda Digital**: O cliente deve poder consultar o status e os itens da sua comanda ativa informando o ID ou número da mesa.

### 3.4. Máquina de Estados e Painel KDS (Kitchen Display System)
* **RF12 - Máquina de Estados dos Pedidos**: Todo pedido criado deve obedecer obrigatoriamente ao seguinte ciclo de vida:
  $$\text{RECEIVED} \longrightarrow \text{PREPARING} \longrightarrow \text{READY} \longrightarrow \text{DELIVERED}$$
* **RF13 - Validação de Transições de Estado**: O sistema deve impedir transições de status inválidas (ex: não permitir pular de `RECEIVED` diretamente para `DELIVERED` sem passar por `PREPARING` e `READY`).
* **RF14 - Cancelamento de Pedidos**: Deve ser possível cancelar pedidos no status `RECEIVED`, `PREPARING` ou `READY`. Pedidos já entregues (`DELIVERED`) não podem ser cancelados.
* **RF15 - Fila da Cozinha (KDS)**: O painel KDS deve exibir a fila de pedidos ativos ordenados cronologicamente (pedidos mais antigos primeiro).
* **RF16 - Avanço Rápido de Etapa no KDS**: O painel da cozinha deve fornecer botão de clique único para avançar o pedido para o próximo estado natural de produção (`/api/orders/:id/advance`).

---

## 4. Requisitos Não Funcionais (RNF)

* **RNF01 - Isolamento em Containers**: O banco de dados PostgreSQL deve rodar exclusivamente via Docker Compose, sem necessidade de instalação local do SGBD na máquina do avaliador.
* **RNF02 - Integridade Referencial**: O banco de dados deve manter integridade através de chaves estrangeiras com regras de remoção em cascata (`Cascade`) ou preservação (`SetNull`) adequadas.
* **RNF03 - Hot-Reload no Desenvolvimento**: O backend deve utilizar `nodemon` configurado com `tsx` para compilar e recarregar instantaneamente após alterações nos arquivos TypeScript.
* **RNF04 - Padronização RESTful**: A API deve seguir as convenções REST, utilizando métodos HTTP apropriados (`GET`, `POST`, `PATCH`, `DELETE`) e códigos de status HTTP corretos (`200`, `201`, `400`, `404`, `500`).
* **RNF05 - Segurança e CORS**: A API deve implementar middleware de CORS permitindo conexões da aplicação frontend local (`http://localhost:5173`).
* **RNF06 - Separação em Camadas**: O código do backend deve ser estritamente modularizado em:
  * Camada de Acesso a Dados (`Prisma Client`).
  * Camada de Regras de Negócio e Serviços (`OrderStateMachine`).
  * Camada de Controladores (`Controllers`).
  * Camada de Rotas (`Routes`).

---

## 5. Regras de Negócio (RN)

* **RN01 - Bloqueio de Itens Indisponíveis**: Itens com `isAvailable = false` não podem ser adicionados em novos pedidos.
* **RN02 - Validação de Complementos**: Se um grupo de opcionais exigir seleção obrigatória (`isRequired = true`), o pedido será rejeitado se a seleção for omitida.
* **RN03 - Persistência Histórica de Preços**: Os preços cobrados em um pedido (`unitPrice` e `price` do adicional) devem ser gravados no registro do `OrderItem` no momento da compra, garantindo que alterações futuras no cardápio não alterem o histórico financeiro de pedidos passados.
* **RN04 - Ocupação de Mesa**: Ao cadastrar um pedido para atendimento presencial (`DINE_IN`), o status da mesa associada deve mudar automaticamente para `OCCUPIED`.
* **RN05 - Ciclo Estrito de Produção**: Nenhum pedido pode ser marcado como `DELIVERED` sem antes ter sido marcado como `READY`.

---

## 6. Modelo Conceitual de Dados

```text
+----------------+       +-------------------+       +---------------------+
|    Category    | 1---N |     MenuItem      | 1---N |     OptionGroup     |
+----------------+       +-------------------+       +---------------------+
| id             |       | id                |       | id                  |
| name           |       | categoryId (FK)   |       | menuItemId (FK)     |
| orderIndex     |       | name              |       | title               |
+----------------+       | price             |       | minSelect/maxSelect |
                         | isAvailable       |       +----------+----------+
                         +---------+---------+                  | 1
                                   | 1                          | N
                                   | N               +----------v----------+
+----------------+       +---------v---------+       |     OptionItem      |
|     Table      |       |     OrderItem     |       +---------------------+
+----------------+       +-------------------+       | id                  |
| id             |       | id                |       | optionGroupId (FK)  |
| number         |       | orderId (FK)      |       | name                |
| status         |       | menuItemId (FK)   |       | additionalPrice     |
+--------+-------+       | quantity          |       +----------+----------+
         | 1             | unitPrice         |                  | 1
         | N             +---------+---------+                  | N
+--------v-------+                 | 1               +----------v----------+
|     Order      | 1-------------N |                 |   OrderItemOption   |
+----------------+                                   +---------------------+
| id             |                                   | id                  |
| code (#PED-101)|                                   | orderItemId (FK)    |
| status (Enum)  |                                   | optionItemId (FK)   |
| totalAmount    |                                   | name                |
+----------------+                                   | price               |
                                                     +---------------------+
```
