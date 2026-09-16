<?php
// web/index.php
session_start();

$mensagem = $_SESSION['mensagem'] ?? '';
$tipoMensagem = $_SESSION['tipoMensagem'] ?? '';

// Limpa as mensagens da sessão após exibir
unset($_SESSION['mensagem'], $_SESSION['tipoMensagem']);

// 1. PROCESSA O CADASTRO (POST) VIA PHP / cURL
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = $_POST['nome'] ?? '';
    $descricao = $_POST['descricao'] ?? '';

    if (!empty($nome)) {
        $dadosProjeto = [
            'nome' => $nome,
            'descricao' => $descricao
        ];

        $payload = json_encode($dadosProjeto);

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

        if ($httpCode === 201) {
            $_SESSION['mensagem'] = "Projeto cadastrado com sucesso!";
            $_SESSION['tipoMensagem'] = "sucesso";
        } else {
            $_SESSION['mensagem'] = "Erro ao cadastrar projeto. Código HTTP: " . $httpCode;
            $_SESSION['tipoMensagem'] = "erro";
        }
    } else {
        $_SESSION['mensagem'] = "O nome do projeto é obrigatório.";
        $_SESSION['tipoMensagem'] = "erro";
    }

    // REDIRECIONA PARA EVITAR REENVIO AO DAR REFRESH / F5
    header('Location: index.php');
    exit;
}

// 2. BUSCA A LISTA ATUALIZADA DE PROJETOS (GET) VIA API NODE
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
</head>
<body>

    <!-- FORMULÁRIO DE CADASTRO -->
    <div class="box">
        <h2>Cadastrar Novo Projeto</h2>

        <?php if (!empty($mensagem)): ?>
            <div class="alerta <?= $tipoMensagem ?>">
                <?= htmlspecialchars($mensagem) ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="index.php">
            <div class="form-group">
                <label for="nome">Nome do Projeto:*</label>
                <input type="text" id="nome" name="nome" required>
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
                        <div>
                            <strong><?= htmlspecialchars($projeto['nome']) ?></strong>
                            <p style="margin: 4px 0 0; color: #666; font-size: 13px;">
                                <?= htmlspecialchars($projeto['descricao'] ?? 'Sem descrição') ?>
                            </p>
                        </div>
                        <button type="button" class="btn-excluir" onclick="deletarProjeto(event, <?= $projeto['id'] ?>)">Excluir</button>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>

    <!-- FETCH API PARA EXCLUSÃO -->
    <script>
        function deletarProjeto(event, id) {
            event.preventDefault();
            
            console.log("-> Iniciando remoção via Fetch para ID:", id);

            fetch("http://localhost:3000/projetos/" + id, {
                method: "DELETE"
            })
            .then(response => {
                console.log("-> Status HTTP da API Node:", response.status);
                
                if (response.ok) {
                    // Remove o elemento da tela
                    const elemento = document.getElementById("projeto-" + id);
                    if (elemento) {
                        elemento.style.opacity = "0";
                        setTimeout(() => elemento.remove(), 300);
                    }
                    console.log("-> Elemento removido do DOM!");
                } else {
                    alert("Erro " + response.status + " retornado pelo backend.");
                }
            })
            .catch(erro => {
                console.error("-> Erro na conexão Fetch:", erro);
                alert("Não foi possível conectar na API Node (Porta 3000).");
            });
        }
    </script>
</body>
</html>