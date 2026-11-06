package br.com.estacionamento.app;

import br.com.estacionamento.model.Ticket;
import br.com.estacionamento.model.TipoVeiculo;
import br.com.estacionamento.model.Vaga;
import br.com.estacionamento.model.Veiculo;
import br.com.estacionamento.service.Estacionamento;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {
        Estacionamento estacionamento = new Estacionamento("Estacionamento Central", 10.0);
        estacionamento.inicializarVagasPadrao();

        Scanner scanner = new Scanner(System.in);
        boolean rodando = true;

        while (rodando) {
            limparConsole();
            exibirMenu();
            System.out.print("Opção > ");
            String opcao = scanner.nextLine().trim();

            switch (opcao) {
                case "1":
                    limparConsole();
                    cadastrarEntrada(scanner, estacionamento);
                    pausar(scanner);
                    break;
                case "2":
                    limparConsole();
                    processarSaida(scanner, estacionamento);
                    pausar(scanner);
                    break;
                case "3":
                    limparConsole();
                    consultarVagas(estacionamento);
                    pausar(scanner);
                    break;
                case "4":
                    limparConsole();
                    listarVeiculosEstacionados(estacionamento);
                    pausar(scanner);
                    break;
                case "5":
                    limparConsole();
                    System.out.println(estacionamento.gerarRelatorioOcupacao());
                    pausar(scanner);
                    break;
                case "6":
                    limparConsole();
                    executarDemonstracaoAutomatica(estacionamento);
                    pausar(scanner);
                    break;
                case "0":
                    limparConsole();
                    System.out.println("=========================================");
                    System.out.println(" Sistema finalizado com sucesso. Até logo!");
                    System.out.println("=========================================");
                    rodando = false;
                    break;
                default:
                    System.out.println("\n(!) Opção inválida. Digite um número de 0 a 6.");
                    pausar(scanner);
            }
        }
        scanner.close();
    }

    /**
     * Limpa a tela do console de forma compatível com Windows e sistemas Unix (Linux/macOS).
     */
    public static void limparConsole() {
        try {
            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                new ProcessBuilder("cmd", "/c", "cls").inheritIO().start().waitFor();
            } else {
                new ProcessBuilder("clear").inheritIO().start().waitFor();
            }
        } catch (Exception e) {
            // Fallback usando códigos de escape ANSI
            System.out.print("\033[H\033[2J");
            System.out.flush();
        }
    }

    /**
     * Pausa a execução aguardando que o usuário pressione Enter para continuar.
     */
    private static void pausar(Scanner scanner) {
        System.out.print("\nPressione [Enter] para continuar...");
        scanner.nextLine();
    }

    private static void exibirMenu() {
        System.out.println("=========================================");
        System.out.println("   SISTEMA DE ESTACIONAMENTO - 1 3   ");
        System.out.println("   Mariah M. | Vinicius S. | Alan G. | Bernardo R.");
        System.out.println("=========================================");
        System.out.println(" [1] Entrada de Veículo");
        System.out.println(" [2] Saída e Pagamento");
        System.out.println(" [3] Consultar Vagas");
        System.out.println(" [4] Veículos no Pátio");
        System.out.println(" [5] Relatório e Faturamento");
        System.out.println(" [6] Demonstração Completa");
        System.out.println(" [0] Sair");
        System.out.println("-----------------------------------------");
    }

    private static void cadastrarEntrada(Scanner scanner, Estacionamento estacionamento) {
        System.out.println("=== ENTRADA DE VEÍCULO ===");
        System.out.println("(Digite '0' a qualquer momento para cancelar)\n");

        // 1. Loop de validação da Placa
        String placa = "";
        while (true) {
            System.out.print("Informe a placa (Mercosul ex: ABC1D23 ou Tradicional ex: ABC-1234): ");
            String input = scanner.nextLine().trim();

            if (input.equals("0") || input.equalsIgnoreCase("cancelar")) {
                System.out.println("\nOperação cancelada pelo usuário.");
                return;
            }

            if (Veiculo.isPlacaValida(input)) {
                placa = input;
                break;
            }

            System.out.println("(!) Placa inválida! O formato deve ser Mercosul (ex: ABC1D23) ou tradicional (ex: ABC1234).\n");
        }

        // 2. Loop de validação do Modelo
        String modelo = "";
        while (true) {
            System.out.print("Informe o modelo do veículo (ex: Corolla, Civic, CG 160): ");
            String input = scanner.nextLine().trim();

            if (input.equals("0") || input.equalsIgnoreCase("cancelar")) {
                System.out.println("\nOperação cancelada pelo usuário.");
                return;
            }

            if (Veiculo.isModeloValido(input)) {
                modelo = input.trim();
                break;
            }

            System.out.println("(!) Modelo inválido! Não pode ser vazio, ter menos de 2 caracteres ou ser composto apenas por números.\n");
        }

        // 3. Loop de seleção do Tipo
        TipoVeiculo tipo = null;
        while (tipo == null) {
            System.out.print("Tipo do veículo (1 - Carro | 2 - Moto | 3 - SUV): ");
            String tipoOpt = scanner.nextLine().trim();

            if (tipoOpt.equals("0") || tipoOpt.equalsIgnoreCase("cancelar")) {
                System.out.println("\nOperação cancelada pelo usuário.");
                return;
            }

            switch (tipoOpt) {
                case "1": tipo = TipoVeiculo.CARRO; break;
                case "2": tipo = TipoVeiculo.MOTO; break;
                case "3": tipo = TipoVeiculo.CAMINHONETE; break;
                default:
                    System.out.println("(!) Opção inválida. Digite 1 para Carro, 2 para Moto ou 3 para SUV.\n");
            }
        }

        try {
            Veiculo veiculo = new Veiculo(placa, modelo, tipo);
            Ticket ticket = estacionamento.registrarEntrada(veiculo);

            System.out.println("\nEntrada registrada com sucesso!");
            System.out.println(ticket.gerarComprovante());
        } catch (Exception e) {
            System.out.println("\n(!) Erro ao autorizar entrada: " + e.getMessage());
        }
    }

    private static void processarSaida(Scanner scanner, Estacionamento estacionamento) {
        System.out.println("=== SAÍDA E PAGAMENTO ===");
        System.out.println("(Digite '0' a qualquer momento para cancelar)\n");

        String placa = "";
        while (true) {
            System.out.print("Informe a placa do veículo: ");
            String input = scanner.nextLine().trim();

            if (input.equals("0") || input.equalsIgnoreCase("cancelar")) {
                System.out.println("\nOperação cancelada pelo usuário.");
                return;
            }

            if (Veiculo.isPlacaValida(input)) {
                placa = input;
                break;
            }

            System.out.println("(!) Formato de placa inválido. Digite uma placa brasileira válida (ex: ABC1D23 ou ABC-1234).\n");
        }

        try {
            Ticket ticket = estacionamento.registrarSaida(placa);
            System.out.println("\nSaída finalizada e pagamento efetuado!");
            System.out.println(ticket.gerarComprovante());
        } catch (Exception e) {
            System.out.println("\n(!) Erro ao processar saída: " + e.getMessage());
        }
    }

    private static void consultarVagas(Estacionamento estacionamento) {
        System.out.println("=== STATUS DAS VAGAS ===");
        List<Vaga> livres = estacionamento.consultarVagasDisponiveis();
        List<Vaga> ocupadas = estacionamento.consultarVagasOcupadas();
        List<Vaga> todas = estacionamento.getVagas();

        System.out.printf("Total: %d vagas | Livres: %d | Ocupadas: %d\n\n",
                todas.size(), livres.size(), ocupadas.size());

        if (!ocupadas.isEmpty()) {
            System.out.println("Vagas Ocupadas:");
            for (Vaga v : ocupadas) {
                System.out.printf("  Vaga #%02d [%s]: %s\n",
                        v.getNumero(), v.getTipoPermitido().getDescricao(), v.getVeiculoEstacionado());
            }
            System.out.println();
        }

        System.out.println("Vagas Livres:");
        for (Vaga v : livres) {
            System.out.printf("  Vaga #%02d [%s]\n",
                    v.getNumero(), v.getTipoPermitido().getDescricao());
        }
    }

    private static void listarVeiculosEstacionados(Estacionamento estacionamento) {
        System.out.println("=== VEÍCULOS ATUALMENTE NO PÁTIO ===");
        if (estacionamento.getTicketsAtivos().isEmpty()) {
            System.out.println("Nenhum veículo estacionado no momento.");
            return;
        }

        for (Ticket t : estacionamento.getTicketsAtivos()) {
            System.out.printf("  Placa: %-7s | Modelo: %-15s | Vaga: #%02d | Entrada: %s\n",
                    t.getVeiculo().getPlaca(),
                    t.getVeiculo().getModelo(),
                    t.getVaga().getNumero(),
                    t.getEntradaFormatada());
        }
    }

    public static void executarDemonstracaoAutomatica(Estacionamento estacionamento) {
        System.out.println("=========================================");
        System.out.println("   DEMONSTRAÇÃO AUTOMÁTICA EM EXECUÇÃO   ");
        System.out.println("=========================================");

        System.out.println("\n[1] Preparando cenário e liberando vagas anteriores...");
        if (estacionamento.buscarTicketAtivo("ABC1D23").isPresent()) estacionamento.registrarSaida("ABC1D23");
        if (estacionamento.buscarTicketAtivo("XYZ9E87").isPresent()) estacionamento.registrarSaida("XYZ9E87");
        if (estacionamento.buscarTicketAtivo("SUV2B26").isPresent()) estacionamento.registrarSaida("SUV2B26");

        System.out.printf("Vagas disponíveis: %d de %d\n",
                estacionamento.consultarVagasDisponiveis().size(),
                estacionamento.getVagas().size());

        System.out.println("\n[2] Registrando entrada de 3 veículos com placas brasileiras válidas...");
        LocalDateTime horaBase = LocalDateTime.now().minusHours(3);

        Veiculo carro1 = new Veiculo("ABC1D23", "Toyota Corolla", TipoVeiculo.CARRO);
        Veiculo moto1 = new Veiculo("XYZ9E87", "Honda CG 160", TipoVeiculo.MOTO);
        Veiculo suv1 = new Veiculo("SUV2B26", "Jeep Compass", TipoVeiculo.CAMINHONETE);

        Ticket ticketCarro = estacionamento.registrarEntrada(carro1, horaBase);
        System.out.println("-> Entrou: " + carro1 + " | " + ticketCarro.getId() + " na Vaga #" + ticketCarro.getVaga().getNumero());

        Ticket ticketMoto = estacionamento.registrarEntrada(moto1, horaBase.plusHours(1).plusMinutes(45));
        System.out.println("-> Entrou: " + moto1 + " | " + ticketMoto.getId() + " na Vaga #" + ticketMoto.getVaga().getNumero());

        Ticket ticketSuv = estacionamento.registrarEntrada(suv1, LocalDateTime.now().minusMinutes(10));
        System.out.println("-> Entrou: " + suv1 + " | " + ticketSuv.getId() + " na Vaga #" + ticketSuv.getVaga().getNumero());

        System.out.println("\n[3] Situação do pátio após entradas:");
        listarVeiculosEstacionados(estacionamento);

        System.out.println("\n[4] Teste de Validação: Tentativa de placa fora do padrão brasileiro...");
        try {
            new Veiculo("INVALIDA123", "Carro Teste", TipoVeiculo.CARRO);
        } catch (Exception ex) {
            System.out.println("-> Bloqueio operado com sucesso: " + ex.getMessage());
        }

        System.out.println("\n[5] Teste de Validação: Tentativa de modelo com apenas números...");
        try {
            new Veiculo("BRA2E19", "123456", TipoVeiculo.CARRO);
        } catch (Exception ex) {
            System.out.println("-> Bloqueio operado com sucesso: " + ex.getMessage());
        }

        System.out.println("\n[6] Teste de Regra: Tentativa de entrada duplicada...");
        try {
            estacionamento.registrarEntrada(new Veiculo("ABC1D23", "Corolla Clone", TipoVeiculo.CARRO));
        } catch (Exception ex) {
            System.out.println("-> Bloqueio operado com sucesso: " + ex.getMessage());
        }

        System.out.println("\n[7] Saída do Carro (permanência de 3h simuladas)...");
        Ticket ticketCarroEncerrado = estacionamento.registrarSaida(carro1.getPlaca(), LocalDateTime.now());
        System.out.println(ticketCarroEncerrado.gerarComprovante());

        System.out.println("\n[8] Saída da Moto (permanência de 1h15 simulada)...");
        Ticket ticketMotoEncerrado = estacionamento.registrarSaida(moto1.getPlaca(), LocalDateTime.now());
        System.out.println(ticketMotoEncerrado.gerarComprovante());

        System.out.println("\n[9] Saída da SUV (permanência de 10 min - Teste de Tolerância Gratuita)...");
        Ticket ticketSuvEncerrado = estacionamento.registrarSaida(suv1.getPlaca(), LocalDateTime.now());
        System.out.println(ticketSuvEncerrado.gerarComprovante());

        System.out.println("\n[10] Relatório final de ocupação e faturamento:");
        System.out.println(estacionamento.gerarRelatorioOcupacao());

        System.out.println("=========================================");
        System.out.println("   DEMONSTRAÇÃO CONCLUÍDA COM SUCESSO!   ");
        System.out.println("=========================================");
    }
}
