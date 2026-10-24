# Workspace Guidelines — Computer Science Monorepo

Este repositório reúne projetos práticos e acadêmicos desenvolvidos no curso de Ciência da Computação.

---

## 📁 Estrutura do Monorepo

* **`my-node-project/`**:
  * Sistema SaaS para restaurantes: gestão de mesas, cardápio digital, grupos de opcionais, máquina de estados de pedidos (`RECEIVED` → `PREPARING` → `READY` → `DELIVERED` / `CANCELED`) e painel KDS em tempo real via Server-Sent Events (SSE).
  * Stack: Node.js (v22-v24), TypeScript, Express, Prisma ORM, PostgreSQL (Docker), React + Tailwind CSS.
* **`parking-system/`**:
  * Sistema de Gestão de Estacionamento Rotativo orientado a objetos.
  * Stack: Java 11+ (puro, sem frameworks), modelagem UML (Mermaid) e suíte de testes unitários.
* **`programming-laboratory/`**:
  * Laboratório de desenvolvimento integrando frontend PHP com APIs REST em Node.js / Express e Prisma ORM.

---

## 📝 Convenção de Commits (Conventional Commits)

Todos os commits devem seguir a convenção **Conventional Commits**:

```
<tipo>(<escopo opcional>): <descrição no imperativo e minúsculo>
```

### Tipos Permitidos:
* `feat`: Adiciona uma nova funcionalidade ao sistema.
* `fix`: Corrige um bug ou problema existente.
* `docs`: Alterações exclusivamente em documentação (ex: README, diagramas).
* `style`: Ajustes que não afetam a lógica (espaçamento, formatação de código).
* `refactor`: Reestruturação de código que não adiciona recurso nem corrige bug.
* `test`: Adição ou modificação de testes unitários/integração.
* `chore`: Alterações no processo de build, dependências ou ferramentas auxiliares.

### Exemplos:
* `feat(orders): add server-sent events for real-time updates`
* `docs(readme): update setup and execution instructions`
* `chore(git): setup repository configuration and ignore rules`
* `test(parking): add edge-case tests for vehicle stay duration`

---

## 🌿 Padrão de Branching e Pull Requests

1. Crie sempre uma branch específica para cada tarefa:
   * `feat/<nome-da-feature>`
   * `fix/<nome-do-bug>`
   * `test/<nome-do-teste>`
   * `docs/<nome-da-documentacao>`
2. Mantenha os commits atômicos e bem descritos.
3. Abra um Pull Request detalhando o que foi feito, como testar e impactos esperados.

