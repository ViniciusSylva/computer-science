# Guia de Contribuição: Do Código ao Pull Request

Bem-vindo ao repositório **Computer Science Monorepo**! Para manter a organização, a qualidade do código e o histórico limpo, siga este passo a passo para qualquer contribuição.

---

## 1. 🔄 Preparar o Ambiente Local (Terminal)

Antes de começar qualquer alteração, garanta que está a trabalhar com o código mais recente da branch principal:

```bash
# Volta para a branch principal e atualiza o repositório
git checkout main
git pull origin main
```

---

## 2. 🌿 Criar uma Nova Branch

Nunca faça alterações diretamente na `main`. Crie uma branch dedicada para a funcionalidade, correção ou documentação:

```bash
# Cria e muda para a nova branch (substitua 'nome-da-sua-branch' por algo descritivo)
git checkout -b nome-da-sua-branch
```

> **Dica de Nomenclatura:**
> - `feat/<nome>` para novas funcionalidades
> - `fix/<nome>` para correção de bugs
> - `docs/<nome>` para documentação
> - `test/<nome>` para testes

---

## 3. 💻 Desenvolver e Fazer Commit

Trabalhe nas suas alterações e registre os commits localmente seguindo a convenção de **[Conventional Commits](GEMINI.md#📝-convenção-de-commits-conventional-commits)**:

```bash
# Adiciona os ficheiros alterados ao staging
git add .

# Regista o commit com uma mensagem clara e padronizada
git commit -m "feat: descrição curta da alteração efetuada"
```

*Exemplos:*
- `feat(orders): add server-sent events for real-time updates`
- `fix(parking): fix calculation for commercial rounding`
- `docs(contributing): add contribution guide for pull requests`

---

## 4. 🚀 Enviar a Branch para o GitHub

Suba a sua nova branch para o repositório remoto:

```bash
# Envia a branch para o GitHub (o parâmetro -u só é necessário no primeiro push da branch)
git push -u origin nome-da-sua-branch
```

---

## 5. 🔀 Abrir o Pull Request (GitHub)

1. Acesse a página principal do repositório no GitHub: [`ViniciusSylva/computer-science`](https://github.com/ViniciusSylva/computer-science).
2. Você verá um destaque amarelo com o botão **Compare & pull request**. Clique nele.
3. Preencha o **Título** seguindo o padrão de commit e adicione uma **Descrição** clara sobre o que foi implementado ou corrigido:
   - **O que foi feito:** Breve resumo das mudanças.
   - **Como testar:** Passos para reproduzir e validar a alteração.
   - **Impactos:** Sistemas afetados ou novas dependências.
4. Clique no botão **Create pull request**.

---

## 6. 👀 Revisão e Aprovação

1. O Pull Request fica aguardando a revisão do responsável pelo projeto.
2. Caso sejam solicitados ajustes:
   - Faça as alterações na mesma branch no seu computador;
   - Execute o `git commit` e dê `git push` novamente;
   - O PR no GitHub será atualizado automaticamente!
3. Assim que for aprovado, o responsável fará o merge para a branch principal (`main`).

