# Roteiro de Apresentação: Sistema de Estacionamento
### Abstração, Identificação de Objetos e UML em Java

**Grupo 3:** Mariah M. | Vinicius S. | Alan G. | Bernardo R.  
**Data:** 24/09/2026 às 19h30min  
**Tempo Estimado:** 12 a 15 minutos  

---

## Estrutura da Apresentação e Divisão de Papéis

| Integrante | Bloco de Apresentação | Tópicos Cobertos | Tempo Sugerido |
| :--- | :--- | :--- | :--- |
| **Mariah M.** | Introdução e Tarefa 1 | Abertura, Contexto do Problema e Abstração (Essencial vs. Ruído) | 3 min |
| **Vinicius S.** | Tarefa 2 | Identificação dos Objetos, Classes, Atributos e Responsabilidades | 3 min |
| **Alan G.** | Tarefa 3 | Apresentação do Diagrama de Classes UML e Relacionamentos | 3 min |
| **Bernardo R.** | Tarefas 4 e 5 | Demonstração do Código Java, Comparação UML vs Código e Conclusão | 4 a 5 min |

---

## Roteiro Slide a Slide (Falas e Dicas)

### SLIDE 1: Capa
- **Título:** Sistema de Estacionamento: Abstração, Identificação de Objetos e UML
- **Subtítulo:** Aplicação Prática dos Fundamentos de Orientação a Objetos em Java
- **Grupo 3:** Mariah M., Vinicius S., Alan G., Bernardo R.
- **Fala (Mariah):**
  > "Boa noite a todos, professor e colegas. Nós somos o Grupo 3, composto por mim (Mariah), pelo Vinicius, pelo Alan e pelo Bernardo. Hoje vamos apresentar o projeto de um Sistema de Gestão de Estacionamento. O nosso foco principal foi vivenciar na prática o ciclo completo da engenharia de software: desde a abstração do mundo real e identificação de objetos, passando pelo diagrama UML, até a implementação funcional em Java."

---

### SLIDE 2: Contexto do Problema e O Desafio (Tarefa 1)
- **Conteúdo do Slide:**
  - O que faz um estacionamento comercial rotativo?
  - Controle de fluxo: vagas limitadas e categorias distintas (carros, motos, SUVs).
  - Controle temporal e financeiro de permanência.
- **Fala (Mariah):**
  > "Para iniciar, analisamos o problema de um estacionamento rotativo. O negócio precisa garantir que veículos entrem apenas se houver vagas compatíveis, calcular com precisão quanto tempo ficaram estacionados e aplicar a tarifa correspondente. Mas diante da complexidade do mundo físico, como decidir o que realmente precisa entrar no software? É aqui que entra a **Abstração**."

---

### SLIDE 3: O Princípio da Abstração no Domínio (Tarefa 1)
- **Conteúdo do Slide:**
  - Conceito de Abstração: isolar o essencial e descartar o incidental.
  - Tabela comparativa:
    - *Essencial:* Placa, Categoria, Número da Vaga, Estado (Livre/Ocupada), Horário Entrada/Saída, Tarifa.
    - *Descartado:* Cor, quilometragem, marca dos pneus, dados do condutor, iluminação do pátio.
- **Fala (Mariah):**
  > "A abstração é a nossa principal ferramenta de defesa contra a complexidade. Como vemos na tabela, filtramos rigorosamente o que é relevante. Para o sistema cobrar a permanência e controlar o pátio, não importa a cor do carro, se o pneu está calibrado ou quem é o motorista. Focamos estritamente na placa, na categoria e nos registros de tempo. Passarei a palavra para o Vinicius, que vai explicar como essas ideias viraram classes."

---

### SLIDE 4: Definição das Classes e Responsabilidades (Tarefa 2)
- **Conteúdo do Slide:**
  - Princípio da Responsabilidade Única (SRP).
  - As 5 peças centrais: `TipoVeiculo` (Enum), `Veiculo`, `Vaga`, `Ticket` e `Estacionamento`.
- **Fala (Vinicius):**
  > "Boa noite a todos. Com base nos elementos essenciais levantados pela Mariah, definimos 5 classes fundamentais, distribuindo as responsabilidades de forma que cada uma faça apenas uma coisa muito bem feita."

---

### SLIDE 5: Detalhamento Técnico das Classes (Tarefa 2)
- **Conteúdo do Slide:**
  - `TipoVeiculo`: Categorias (Carro, Moto, Caminhonete) e fatores de cálculo da tarifa.
  - `Veiculo`: Armazena placa, modelo e tipo, com validações de integridade.
  - `Vaga`: Conhece seu número, sua restrição de tipo e seu estado de ocupação (`ocupar()`, `desocupar()`).
  - `Ticket`: A ponte temporal entre veículo e vaga; calcula minutos e valores com tolerância de cortesia.
  - `Estacionamento`: A fachada do sistema, responsável por gerenciar a coleção de vagas, tickets e faturamento.
- **Fala (Vinicius):**
  > "Notem o cuidado com o desacoplamento: o `Veiculo` não sabe o valor da hora; a `Vaga` apenas sabe se está ocupada e se o veículo cabe nela; e o `Ticket` encapsula as regras de contagem de tempo e cobrança. Agora o Alan vai demonstrar como tudo isso se conecta graficamente no diagrama UML."

---

### SLIDE 6: O Diagrama de Classes UML (Tarefa 3)
- **Conteúdo do Slide:**
  - Projeção do Diagrama de Classes UML completo.
  - Destaque para atributos privados (`-`), métodos públicos (`+`) e tipos de retorno.
- **Fala (Alan):**
  > "Boa noite. Este é o Diagrama de Classes que construímos antes de começar a codificar em Java. Ele atua como a planta baixa do nosso sistema. Nele podemos ver claramente a visibilidade dos atributos — todos privados para garantir o encapsulamento — e os métodos públicos que representam o comportamento do sistema."

---

### SLIDE 7: Relacionamentos Estruturais no UML (Tarefa 3)
- **Conteúdo do Slide:**
  - **Composição (`Estacionamento *-- Vaga` e `Ticket`):** Vagas e tickets existem em função do estacionamento.
  - **Agregação (`Vaga o-- Veiculo`):** O veículo existe independentemente da vaga.
  - **Associação Simples (`Ticket --> Veiculo`, `Ticket --> Vaga`).
- **Fala (Alan):**
  > "Um ponto alto da nossa modelagem foi diferenciar Composição de Agregação. As vagas possuem relação de **Composição** com o estacionamento: se o estacionamento fechar, as vagas do sistema deixam de existir. Já a relação entre Vaga e Veículo é de **Agregação**: quando um carro sai do estacionamento, a vaga fica livre, mas o veículo continua existindo. Passo agora para o Bernardo, que apresentará a implementação prática em Java."

---

### SLIDE 8: Implementação em Java e Demonstração ao Vivo (Tarefa 4)
- **Conteúdo do Slide:**
  - Código limpo em pacotes: `model`, `service`, `app`.
  - Uso de Java 21 moderno com a API `java.time` (`LocalDateTime`, `Duration`).
  - Demonstração no terminal.
- **Fala (Bernardo):**
  > "Boa noite, pessoal. Traduzimos fielmente o modelo UML para código Java, sem uso de bibliotecas externas complexas, priorizando legibilidade e segurança. Vou rodar agora uma demonstração rápida pelo terminal."
  > *(Bernardo executa o programa e aciona a Opção 6 - Demonstração Automática).*
  > "Observem no terminal: o sistema inicializou com vagas livres, registrou a entrada de um Corolla e de uma moto com tickets individuais, validou a tentativa de entrada inválida, simulou a permanência e calculou o valor exato com fração de horas, gerando o comprovante e liberando a vaga instantaneamente."

---

### SLIDE 9: Comparação UML vs. Código Java (Tarefa 5)
- **Conteúdo do Slide:**
  - Tabela comparativa: Do Diagrama para o Código.
  - UML `- vagas : List<Vaga>` ➔ Java `private final List<Vaga> vagas;`.
  - UML `+ ocupar(veiculo : Veiculo) : void` ➔ Java `public void ocupar(Veiculo veiculo) { ... }`.
- **Fala (Bernardo):**
  > "Comparando o UML com o código Java produzido, a correspondência foi direta e cirúrgica. Ter o diagrama pronto antes da codificação nos poupou de discussões sobre onde colocar regras de validação ou cálculo. Cada método tinha seu lugar correto desde o início."

---

### SLIDE 10: Como a Abstração Reduziu a Complexidade & Conclusão (Tarefa 5)
- **Conteúdo do Slide:**
  - **Carga Cognitiva Menor:** Foco apenas no essencial do negócio.
  - **Baixo Acoplamento:** Módulos independentes e fáceis de testar.
  - **Extensibilidade:** Fácil adicionar novas categorias (ex: carro elétrico) sem quebrar o sistema.
- **Fala (Bernardo / Grupo):**
  > "Para concluir: a Abstração foi a grande responsável por tornar um problema que poderia ser confuso em uma solução limpa, elegante e testável. Reduzimos o ruído, protegemos os dados com encapsulamento e entregamos um sistema robusto e funcional. Agradecemos a atenção de todos e estamos abertos a perguntas!"

---

## Dicas para o Grupo durante a Apresentação
1. **Postura e Transição:** Ao passar a fala, faça uma ponte breve citando o nome do colega seguinte.
2. **Demonstração Segura:** Utilize a **Opção 6** do menu na demonstração. Ela foi programada para rodar em 5 segundos, mostrando entradas, saídas com cálculo e relatórios, sem risco de digitação incorreta na frente da turma.
3. **Respostas a Perguntas Frequentes:**
   - *Se o professor perguntar: "Por que usaram LocalDateTime em vez de Date?"*  
     **Resposta:** Porque o pacote `java.time` é thread-safe, imutável e calcula durações (`Duration`) de forma nativa e sem bugs de fuso horário.
   - *Se perguntarem: "Onde está a regra de cálculo da tarifa?"*  
     **Resposta:** Está encapsulada dentro da classe `Ticket`, que pondera os minutos pelo fator de categoria do `TipoVeiculo`.
