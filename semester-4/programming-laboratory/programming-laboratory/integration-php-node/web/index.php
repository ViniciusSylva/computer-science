<?php
// web/index.php
session_start();

$mensagem = $_SESSION['mensagem'] ?? '';
$tipoMensagem = $_SESSION['tipoMensagem'] ?? '';
unset($_SESSION['mensagem'], $_SESSION['tipoMensagem']);

// 1. PROCESSA O CADASTRO (POST) VIA PHP / cURL
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim($_POST['nome'] ?? '');
    $descricao = trim($_POST['descricao'] ?? '');

    // Validação inicial no PHP
    if (empty($nome)) {
        $_SESSION['mensagem'] = "O nome do projeto é obrigatório!";
        $_SESSION['tipoMensagem'] = "erro";
    } else {
        $payload = json_encode(['nome' => $nome, 'descricao' => $descricao]);

        $ch = curl_init('http://localhost:3000/projetos');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($payload)
        ]);

        $resposta = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $dadosResposta = json_decode($resposta, true);

        if ($httpCode === 201) {
            $_SESSION['mensagem'] = "Projeto cadastrado com sucesso!";
            $_SESSION['tipoMensagem'] = "sucesso";
        } else {
            // Captura a mensagem de erro enviada pela API Node.js (status 400 ou 500)
            $_SESSION['mensagem'] = $dadosResposta['error'] ?? "Erro ao cadastrar projeto (HTTP $httpCode).";
            $_SESSION['tipoMensagem'] = "erro";
        }
    }

    header('Location: index.php');
    exit;
}

// 2. BUSCA A LISTA ATUALIZADA DE PROJETOS (GET)
$projetosJson = @file_get_contents('http://localhost:3000/projetos');
$projetos = $projetosJson ? json_decode($projetosJson, true) : [];
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel de Projetos</title>
    <link rel="stylesheet" href="style.css">
    <link rel="shortcut icon" href="#">
</head>
<body>

    <div class="container">
        <!-- FORMULÁRIO DE CADASTRO -->
        <div class="box">
            <h2>Cadastrar Novo Projeto</h2>

            <!-- COMPONENTE VISUAL DE ALERTA (SUCESSO / ERRO) -->
            <?php if (!empty($mensagem)): ?>
                <div class="alerta <?= $tipoMensagem ?>">
                    <?= htmlspecialchars($mensagem) ?>
                </div>
            <?php endif; ?>

            <form method="POST" action="index.php">
                <div class="form-group">
                    <label for="nome">Nome do Projeto:*</label>
                    <input type="text" id="nome" name="nome">
                </div>

                <div class="form-group">
                    <label for="descricao">Descrição:</label>
                    <textarea id="descricao" name="descricao" rows="3"></textarea>
                </div>

                <button type="submit" class="btn-primary">Salvar Projeto</button>
            </form>
        </div>

        <!-- LISTA DE PROJETOS -->
        <div class="box">
            <h2>Projetos Cadastrados</h2>

            <div id="lista-projetos">
                <?php if (empty($projetos)): ?>
                    <p id="sem-projetos">Nenhum projeto encontrado.</p>
                <?php else: ?>
                    <?php foreach ($projetos as $projeto): ?>
                        <div class="projeto-card" id="projeto-<?= $projeto['id'] ?>">
                            <div class="projeto-info">
                                <strong><?= htmlspecialchars($projeto['nome']) ?></strong>
                                <p><?= htmlspecialchars($projeto['descricao'] ?? 'Sem descrição') ?></p>
                            </div>
                            <button type="button" class="btn-excluir" onclick="deletarProjeto(event, <?= $projeto['id'] ?>)">Excluir</button>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <script>
        function deletarProjeto(event, id) {
            event.preventDefault();

            fetch("http://localhost:3000/projetos/" + id, {
                method: "DELETE"
            })
            .then(response => {
                if (response.ok) {
                    const elemento = document.getElementById("projeto-" + id);
                    if (elemento) {
                        elemento.style.opacity = "0";
                        setTimeout(() => elemento.remove(), 300);
                    }
                }
            })
            .catch(erro => console.error("Erro na exclusão:", erro));
        }
    </script>
</body>
</html>