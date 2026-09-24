package br.com.estacionamento.test;

import br.com.estacionamento.model.Ticket;
import br.com.estacionamento.model.TipoVeiculo;
import br.com.estacionamento.model.Vaga;
import br.com.estacionamento.model.Veiculo;
import br.com.estacionamento.service.Estacionamento;

import java.time.LocalDateTime;

/**
 * Bateria de testes automatizados para validação do modelo e das regras de negócio.
 */
public class TestEstacionamento {

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println(" INICIANDO TESTES AUTOMATIZADOS DO SISTEMA        ");
        System.out.println("==================================================");

        testarCriacaoVeiculoEModelo();
        testarValidacaoPlacasBrasileiras();
        testarVagasECompatibilidade();
        testarFluxoCompletoEstacionamento();
        testarToleranciaECalculoTarifa();
        testarBloqueioEntradaDuplicada();

        System.out.println("\n>>> TODOS OS TESTES PASSARAM COM SUCESSO! 100% APROVADO! <<<");
        System.out.println("==================================================");
    }

    private static void testarCriacaoVeiculoEModelo() {
        System.out.print("[TESTE 1] Criação e validação de modelos... ");
        Veiculo v = new Veiculo("bra-2e19", "Gol G7", TipoVeiculo.CARRO);
        assert v.getPlaca().equals("BRA2E19") : "Placa deveria estar sem hífen e em maiúsculas";
        assert v.getModelo().equals("Gol G7");
        assert v.getTipo() == TipoVeiculo.CARRO;

        // Modelos válidos
        assert Veiculo.isModeloValido("Corolla");
        assert Veiculo.isModeloValido("CG 160");
        assert Veiculo.isModeloValido("Gol 1.0");
        assert Veiculo.isModeloValido("X1");

        // Modelos inválidos: devem ser rejeitados
        String[] modelosInvalidos = {
            null,
            "",
            "   ",
            "A",        // Menos de 2 caracteres
            "123456",   // Apenas números
            "9999",     // Apenas números
            "1.0"       // Apenas números e pontuação
        };

        for (String invalido : modelosInvalidos) {
            boolean rejeitou = false;
            try {
                new Veiculo("ABC1D23", invalido, TipoVeiculo.CARRO);
            } catch (IllegalArgumentException e) {
                rejeitou = true;
            }
            assert rejeitou : "Deveria ter rejeitado o modelo inválido: " + invalido;
        }

        System.out.println("OK!");
    }

    private static void testarValidacaoPlacasBrasileiras() {
        System.out.print("[TESTE 2] Validação estrita de placas (Mercosul e Tradicional)... ");
        // Placas válidas Mercosul (3 letras, 1 número, 1 letra, 2 números)
        assert Veiculo.isPlacaValida("ABC1D23");
        assert Veiculo.isPlacaValida("xyz-9e87");
        assert Veiculo.isPlacaValida("BRA2E19");
        assert Veiculo.isPlacaValida("SUV2B26");

        // Placas válidas Tradicionais (3 letras, 4 números)
        assert Veiculo.isPlacaValida("ABC1234");
        assert Veiculo.isPlacaValida("abc-1234");
        assert Veiculo.isPlacaValida("KWI9876");

        // Placas inválidas: devem ser rejeitadas
        String[] placasInvalidas = {
            "1234567",     // Apenas números
            "ABCDEFG",     // Apenas letras
            "ABC12D3",     // Letra e número em posições incompatíveis
            "AB1D23",      // Apenas 2 letras
            "ABCD123",     // 4 letras
            "A",           // Muito curta
            "ABC1D2345",   // Muito longa
            "ABC-12345"    // Tamanho arbitrário
        };

        for (String invalida : placasInvalidas) {
            boolean rejeitou = false;
            try {
                new Veiculo(invalida, "Modelo Teste", TipoVeiculo.CARRO);
            } catch (IllegalArgumentException e) {
                rejeitou = true;
            }
            assert rejeitou : "Deveria ter rejeitado a placa inválida: " + invalida;
        }
        System.out.println("OK!");
    }

    private static void testarVagasECompatibilidade() {
        System.out.print("[TESTE 3] Ocupação e compatibilidade de vagas... ");
        Vaga vagaCarro = new Vaga(1, TipoVeiculo.CARRO);
        assert vagaCarro.isDisponivel();
        assert vagaCarro.isCompativel(TipoVeiculo.CARRO);
        assert !vagaCarro.isCompativel(TipoVeiculo.MOTO);

        Veiculo carro = new Veiculo("ABC1C34", "Civic", TipoVeiculo.CARRO);
        vagaCarro.ocupar(carro);
        assert vagaCarro.isOcupada();
        assert !vagaCarro.isDisponivel();
        assert vagaCarro.getVeiculoEstacionado().equals(carro);

        Veiculo desocupado = vagaCarro.desocupar();
        assert desocupado.equals(carro);
        assert vagaCarro.isDisponivel();
        System.out.println("OK!");
    }

    private static void testarFluxoCompletoEstacionamento() {
        System.out.print("[TESTE 4] Fluxo de entrada, permanência e saída... ");
        Estacionamento est = new Estacionamento("Test Auto", 10.0);
        est.inicializarVagasPadrao();

        Veiculo moto = new Veiculo("MOT9B99", "Yamaha MT-03", TipoVeiculo.MOTO);
        LocalDateTime entrada = LocalDateTime.of(2026, 9, 20, 10, 0);
        Ticket ticket = est.registrarEntrada(moto, entrada);

        assert ticket != null;
        assert ticket.getVaga().isOcupada();
        assert est.buscarTicketAtivo("MOT9B99").isPresent();
        assert est.buscarTicketAtivo("mot-9b99").isPresent() : "Busca deve ser insensível a hífen e maiúsculas/minúsculas";

        // Saída após 2 horas (10h às 12h) -> Tarifa: 2h * R$ 10.00 * 0.5 (fator moto) = R$ 10.00
        LocalDateTime saida = LocalDateTime.of(2026, 9, 20, 12, 0);
        Ticket encerrado = est.registrarSaida("mot-9b99", saida);

        assert encerrado.isEncerrado();
        assert encerrado.getValorCobrado() == 10.0 : "Valor deveria ser R$ 10.00, foi: " + encerrado.getValorCobrado();
        assert encerrado.getVaga().isDisponivel() : "A vaga deveria estar desocupada após a saída";
        assert est.buscarTicketAtivo("MOT9B99").isEmpty();
        assert est.getFaturamentoTotal() == 10.0;
        System.out.println("OK!");
    }

    private static void testarToleranciaECalculoTarifa() {
        System.out.print("[TESTE 5] Regra de tolerância (15 min gratuitos)... ");
        Estacionamento est = new Estacionamento("Test Tolerancia", 12.0);
        est.adicionarVaga(new Vaga(1, TipoVeiculo.CARRO));

        Veiculo carro = new Veiculo("RAP0A01", "Kwid", TipoVeiculo.CARRO);
        LocalDateTime entrada = LocalDateTime.now();
        est.registrarEntrada(carro, entrada);

        // Saída com 12 minutos (dentro dos 15 min de cortesia)
        Ticket saidaRapida = est.registrarSaida("RAP0A01", entrada.plusMinutes(12));
        assert saidaRapida.getValorCobrado() == 0.0 : "Permanência de 12 min deveria ser gratuita";
        System.out.println("OK!");
    }

    private static void testarBloqueioEntradaDuplicada() {
        System.out.print("[TESTE 6] Bloqueio de entrada duplicada de veículo... ");
        Estacionamento est = new Estacionamento("Test Bloqueio", 10.0);
        est.adicionarVaga(new Vaga(1, TipoVeiculo.CARRO));
        est.adicionarVaga(new Vaga(2, TipoVeiculo.CARRO));

        Veiculo carro = new Veiculo("DUP1A11", "Onix", TipoVeiculo.CARRO);
        est.registrarEntrada(carro);

        boolean bloqueou = false;
        try {
            est.registrarEntrada(new Veiculo("dup-1a11", "Onix", TipoVeiculo.CARRO));
        } catch (IllegalStateException e) {
            bloqueou = true;
        }
        assert bloqueou : "Sistema deveria ter lançado exceção para entrada duplicada";
        System.out.println("OK!");
    }
}
