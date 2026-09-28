# Sistema de Estacionamento — Orientação a Objetos em Java
### Trabalho em Grupo: Abstração, Identificação de Objetos e UML

**Grupo 3:**
- Mariah M.
- Vinicius S.
- Alan G.
- Bernardo R.

**Data de Apresentação:** 24/09/2026 às 19h30min

---

## 📌 Sobre o Projeto

Este projeto foi desenvolvido para atender integralmente aos requisitos da atividade prática de **Abstração, Identificação de Objetos e UML**, modelando e implementando um **Sistema de Gestão de Estacionamento Rotativo** em Java puro (sem dependências externas).

### 🎯 Resumo das 5 Tarefas Concluídas:
1. **Descrição do Problema e Abstração do Domínio:** Separação criteriosa entre elementos essenciais (placa, categoria, vagas, horário de entrada/saída, tarifas) e ruídos do mundo real ignorados (cor do veículo, dados do motorista, etc.).
2. **Definição das Classes e Responsabilidades:** Implementação das entidades `TipoVeiculo`, `Veiculo`, `Vaga`, `Ticket` e `Estacionamento` com alto encapsulamento e coesão.
3. **Diagrama de Classes UML:** Especificação formal com atributos, métodos, multiplicidades e relações de Composição, Agregação e Associação.
4. **Implementação em Java:** Aplicação funcional com controle de entrada, saída, tolerância de 15 minutos, arredondamento comercial de horas, cálculo por categoria e emissão de comprovantes.
5. **Comparação UML vs Código e Análise de Abstração:** Discussão documentada sobre redução de complexidade e arquitetura de software.

---

## 📂 Estrutura de Diretórios

```
sistema-estacionamento/
├── src/
│   └── br/com/estacionamento/
│       ├── model/
│       │   ├── TipoVeiculo.java       # Enum com tipos e fatores multiplicadores
│       │   ├── Veiculo.java           # Entidade veículo (placa, modelo, tipo)
│       │   ├── Vaga.java              # Controle físico e ocupação de vagas
│       │   └── Ticket.java            # Registro temporal, permanência e cálculo
│       ├── service/
│       │   └── Estacionamento.java    # Regras de negócio, busca e faturamento
│       ├── test/
│       │   └── TestEstacionamento.java# Bateria de testes automatizados com assert
│       └── app/
│           └── Main.java              # Ponto de entrada com menu e modo apresentação
├── docs/
│   ├── diagrama-classes.mermaid       # Diagrama de Classes UML em formato Mermaid
│   ├── relatorio-abstracao-uml.md     # Relatório acadêmico completo para entrega
│   └── roteiro-apresentacao.md        # Roteiro slide-a-slide com falas da equipe
└── README.md
```

---

## 🚀 Como Compilar e Executar

### Pré-requisito:
- Java JDK 11 ou superior (instalado e configurado no PATH).

### 1. Compilando as Classes:
Abra o terminal (PowerShell ou Bash) na pasta `sistema-estacionamento` e execute:

```powershell
javac -d bin (Get-ChildItem -Path src -Filter *.java -Recurse).FullName
```

*(No Linux / macOS / Bash: `javac -d bin $(find src -name "*.java")`)*

---

### 2. Executando o Sistema Principal:
```powershell
java -cp bin br.com.estacionamento.app.Main
```

### 3. Executando os Testes Automatizados:
```powershell
java -ea -cp bin br.com.estacionamento.test.TestEstacionamento
```

---

## 🎤 Dica para a Apresentação ao Vivo (24/09 às 19h30)

Ao iniciar o programa principal (`Main`):
- Selecione a opção **`[6] EXECUTAR DEMONSTRAÇÃO COMPLETA`**.
- O sistema executará automaticamente um fluxo sem falhas:
  1. Mostra 10 vagas livres iniciais;
  2. Registra entrada de 3 veículos (Carro, Moto e SUV);
  3. Exibe o pátio com os veículos estacionados;
  4. Testa uma tentativa inválida (duplicidade ou falta de vaga);
  5. Processa a saída do carro com 3h de permanência (R$ 30,00);
  6. Processa a saída da moto com 1h15 de permanência (R$ 10,00);
  7. Exibe o relatório final de ocupação e faturamento.

---

## 📄 Documentação Complementar

- Consulte `docs/roteiro-apresentacao.md` para a divisão exata de falas entre **Mariah M.**, **Vinicius S.**, **Alan G.** e **Bernardo R.**
- Consulte `docs/relatorio-abstracao-uml.md` para o texto acadêmico detalhado das 5 tarefas.
- Abra `docs/diagrama-classes.mermaid` no VS Code (com extensão Markdown Preview Mermaid Support) ou no [Mermaid Live Editor](https://mermaid.live).
