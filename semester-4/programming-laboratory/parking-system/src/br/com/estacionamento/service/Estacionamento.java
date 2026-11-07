package br.com.estacionamento.service;

import br.com.estacionamento.model.Ticket;
import br.com.estacionamento.model.TipoVeiculo;
import br.com.estacionamento.model.Vaga;
import br.com.estacionamento.model.Veiculo;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Classe de serviço que centraliza as regras de negócio do estacionamento:
 * gerenciamento de vagas, fluxo de entrada e saída, tarifação e relatórios.
 */
public class Estacionamento {
    private final String nome;
    private double tarifaBaseHora;
    private final List<Vaga> vagas;
    private final Map<String, Ticket> ticketsAtivos;
    private final List<Ticket> historicoTickets;
    private int proximoNumeroTicket;

    public Estacionamento(String nome, double tarifaBaseHora) {
        if (nome == null || nome.trim().isEmpty()) {
            throw new IllegalArgumentException("O nome do estacionamento não pode ser vazio.");
        }
        if (tarifaBaseHora <= 0) {
            throw new IllegalArgumentException("A tarifa base por hora deve ser maior que zero.");
        }
        this.nome = nome;
        this.tarifaBaseHora = tarifaBaseHora;
        this.vagas = new ArrayList<>();
        this.ticketsAtivos = new HashMap<>();
        this.historicoTickets = new ArrayList<>();
        this.proximoNumeroTicket = 1001;
    }

    /**
     * Adiciona uma vaga física ao estacionamento.
     */
    public void adicionarVaga(Vaga vaga) {
        if (vaga == null) {
            throw new IllegalArgumentException("Vaga não pode ser nula.");
        }
        boolean numeroJaExiste = vagas.stream().anyMatch(v -> v.getNumero() == vaga.getNumero());
        if (numeroJaExiste) {
            throw new IllegalArgumentException("Já existe uma vaga cadastrada com o número #" + vaga.getNumero());
        }
        this.vagas.add(vaga);
    }

    /**
     * Inicializa o estacionamento com uma configuração padrão de vagas:
     * 5 para Carro, 3 para Moto e 2 para Caminhonete.
     */
    public void inicializarVagasPadrao() {
        int numero = 1;
        // 5 Vagas para Carro
        for (int i = 0; i < 5; i++) {
            adicionarVaga(new Vaga(numero++, TipoVeiculo.CARRO));
        }
        // 3 Vagas para Moto
        for (int i = 0; i < 3; i++) {
            adicionarVaga(new Vaga(numero++, TipoVeiculo.MOTO));
        }
        // 2 Vagas para Caminhonete
        for (int i = 0; i < 2; i++) {
            adicionarVaga(new Vaga(numero++, TipoVeiculo.CAMINHONETE));
        }
    }

    /**
     * Registra a entrada de um veículo no momento atual.
     */
    public Ticket registrarEntrada(Veiculo veiculo) {
        return registrarEntrada(veiculo, LocalDateTime.now());
    }

    /**
     * Registra a entrada de um veículo com data/hora customizada (útil para testes/simulação).
     */
    public Ticket registrarEntrada(Veiculo veiculo, LocalDateTime dataHoraEntrada) {
        if (veiculo == null) {
            throw new IllegalArgumentException("Veículo não pode ser nulo.");
        }
        String placaFormatada = Veiculo.sanitizarPlaca(veiculo.getPlaca());

        if (ticketsAtivos.containsKey(placaFormatada)) {
            throw new IllegalStateException("O veículo de placa " + placaFormatada + " já está dentro do estacionamento!");
        }

        // Busca a primeira vaga disponível compatível com o tipo do veículo
        Vaga vagaDisponivel = vagas.stream()
                .filter(Vaga::isDisponivel)
                .filter(v -> v.isCompativel(veiculo.getTipo()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "Não há vagas disponíveis para a categoria: " + veiculo.getTipo().getDescricao()
                ));

        // Ocupa a vaga
        vagaDisponivel.ocupar(veiculo);

        // Gera o ticket
        String ticketId = "TCK-" + (proximoNumeroTicket++);
        Ticket ticket = new Ticket(ticketId, veiculo, vagaDisponivel, dataHoraEntrada);
        ticketsAtivos.put(placaFormatada, ticket);

        return ticket;
    }

    /**
     * Registra a saída de um veículo no momento atual.
     */
    public Ticket registrarSaida(String placa) {
        return registrarSaida(placa, LocalDateTime.now());
    }

    /**
     * Registra a saída de um veículo com data/hora customizada (útil para testes/simulação).
     */
    public Ticket registrarSaida(String placa, LocalDateTime dataHoraSaida) {
        if (placa == null || placa.trim().isEmpty()) {
            throw new IllegalArgumentException("A placa deve ser informada para registrar a saída.");
        }
        String placaFormatada = Veiculo.sanitizarPlaca(placa);

        Ticket ticket = ticketsAtivos.get(placaFormatada);
        if (ticket == null) {
            throw new NoSuchElementException("Nenhum veículo com a placa " + placaFormatada + " encontrado no estacionamento.");
        }

        // Libera a vaga física
        ticket.getVaga().desocupar();

        // Encerra o ticket e calcula valor
        ticket.encerrar(dataHoraSaida, tarifaBaseHora);

        // Atualiza coleções
        ticketsAtivos.remove(placaFormatada);
        historicoTickets.add(ticket);

        return ticket;
    }

    /**
     * Retorna a lista de vagas que estão livres.
     */
    public List<Vaga> consultarVagasDisponiveis() {
        return vagas.stream()
                .filter(Vaga::isDisponivel)
                .collect(Collectors.toList());
    }

    /**
     * Retorna a lista de vagas ocupadas.
     */
    public List<Vaga> consultarVagasOcupadas() {
        return vagas.stream()
                .filter(v -> !v.isDisponivel())
                .collect(Collectors.toList());
    }

    /**
     * Retorna as vagas disponíveis para um tipo específico de veículo.
     */
    public List<Vaga> consultarVagasDisponiveisPorTipo(TipoVeiculo tipo) {
        return vagas.stream()
                .filter(Vaga::isDisponivel)
                .filter(v -> v.isCompativel(tipo))
                .collect(Collectors.toList());
    }

    /**
     * Busca o ticket ativo de um veículo pela placa.
     */
    public Optional<Ticket> buscarTicketAtivo(String placa) {
        if (placa == null) return Optional.empty();
        return Optional.ofNullable(ticketsAtivos.get(Veiculo.sanitizarPlaca(placa)));
    }

    /**
     * Calcula o faturamento total acumulado pelos tickets encerrados.
     */
    public double getFaturamentoTotal() {
        return historicoTickets.stream()
                .mapToDouble(Ticket::getValorCobrado)
                .sum();
    }

    /**
     * Gera um resumo textual do status do estacionamento.
     */
    public String gerarRelatorioOcupacao() {
        int totalVagas = vagas.size();
        int vagasOcupadas = consultarVagasOcupadas().size();
        int vagasLivres = totalVagas - vagasOcupadas;
        double taxaOcupacao = totalVagas > 0 ? ((double) vagasOcupadas / totalVagas) * 100.0 : 0.0;

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("\n=== RELATÓRIO DO %s ===\n", nome.toUpperCase()));
        sb.append(String.format(" Tarifa Base:           R$ %.2f / hora\n", tarifaBaseHora));
        sb.append(String.format(" Capacidade Total:      %d vagas\n", totalVagas));
        sb.append(String.format(" Vagas Ocupadas:        %d\n", vagasOcupadas));
        sb.append(String.format(" Vagas Livres:          %d\n", vagasLivres));
        sb.append(String.format(" Taxa de Ocupação:      %.1f%%\n", taxaOcupacao));
        sb.append(String.format(" Veículos no Pátio:     %d\n", ticketsAtivos.size()));
        sb.append(String.format(" Atendimentos Concluídos: %d\n", historicoTickets.size()));
        sb.append(String.format(" Faturamento Acumulado: R$ %.2f\n", getFaturamentoTotal()));
        sb.append("=========================================\n");
        return sb.toString();
    }

    public String getNome() {
        return nome;
    }

    public double getTarifaBaseHora() {
        return tarifaBaseHora;
    }

    public void setTarifaBaseHora(double tarifaBaseHora) {
        if (tarifaBaseHora <= 0) {
            throw new IllegalArgumentException("A tarifa deve ser maior que zero.");
        }
        this.tarifaBaseHora = tarifaBaseHora;
    }

    public List<Vaga> getVagas() {
        return Collections.unmodifiableList(vagas);
    }

    public Collection<Ticket> getTicketsAtivos() {
        return Collections.unmodifiableCollection(ticketsAtivos.values());
    }

    public List<Ticket> getHistoricoTickets() {
        return Collections.unmodifiableList(historicoTickets);
    }
}
