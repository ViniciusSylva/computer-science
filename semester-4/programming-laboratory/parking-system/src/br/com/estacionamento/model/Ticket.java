package br.com.estacionamento.model;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Representa o registro de permanência e cobrança de um veículo no estacionamento.
 * Faz a mediação entre Veiculo, Vaga e o tempo decorrido.
 */
public class Ticket {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private final String id;
    private final Veiculo veiculo;
    private final Vaga vaga;
    private final LocalDateTime dataHoraEntrada;
    private LocalDateTime dataHoraSaida;
    private double valorCobrado;
    private boolean encerrado;

    public Ticket(String id, Veiculo veiculo, Vaga vaga, LocalDateTime dataHoraEntrada) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("O ID do ticket não pode ser nulo.");
        }
        if (veiculo == null) {
            throw new IllegalArgumentException("O veículo associado ao ticket não pode ser nulo.");
        }
        if (vaga == null) {
            throw new IllegalArgumentException("A vaga associada ao ticket não pode ser nula.");
        }
        this.id = id;
        this.veiculo = veiculo;
        this.vaga = vaga;
        this.dataHoraEntrada = (dataHoraEntrada != null) ? dataHoraEntrada : LocalDateTime.now();
        this.dataHoraSaida = null;
        this.valorCobrado = 0.0;
        this.encerrado = false;
    }

    /**
     * Calcula o total de minutos decorridos entre a entrada e a data informada.
     */
    public long calcularMinutosPermanencia(LocalDateTime momentoFinal) {
        LocalDateTime fim = (momentoFinal != null) ? momentoFinal : LocalDateTime.now();
        if (fim.isBefore(dataHoraEntrada)) {
            throw new IllegalArgumentException("A data/hora de saída não pode ser anterior à data/hora de entrada.");
        }
        return Duration.between(dataHoraEntrada, fim).toMinutes();
    }

    /**
     * Calcula o valor a ser pago com base no tempo de permanência,
     * na tarifa base por hora e no tipo de veículo.
     * Regra adotada: Tolerância inicial de 15 minutos gratuita.
     * Após isso, cobra-se no mínimo 1 hora, arredondando frações para a próxima hora cheia.
     */
    public double calcularValor(LocalDateTime momentoFinal, double tarifaBaseHora) {
        long minutos = calcularMinutosPermanencia(momentoFinal);

        // Tolerância de 15 minutos de cortesia
        if (minutos <= 15) {
            return 0.0;
        }

        // Frações de hora arredondadas para cima (mínimo de 1 hora)
        long horasCobradas = (long) Math.ceil(minutos / 60.0);
        if (horasCobradas < 1) {
            horasCobradas = 1;
        }

        double multiplicador = veiculo.getTipo().getMultiplicadorTarifa();
        return horasCobradas * tarifaBaseHora * multiplicador;
    }

    /**
     * Encerra o ticket registrando o horário de saída e o valor final.
     */
    public double encerrar(LocalDateTime momentoSaida, double tarifaBaseHora) {
        if (encerrado) {
            throw new IllegalStateException("Este ticket já foi encerrado.");
        }
        this.dataHoraSaida = (momentoSaida != null) ? momentoSaida : LocalDateTime.now();
        this.valorCobrado = calcularValor(this.dataHoraSaida, tarifaBaseHora);
        this.encerrado = true;
        return this.valorCobrado;
    }

    public String getId() {
        return id;
    }

    public Veiculo getVeiculo() {
        return veiculo;
    }

    public Vaga getVaga() {
        return vaga;
    }

    public LocalDateTime getDataHoraEntrada() {
        return dataHoraEntrada;
    }

    public LocalDateTime getDataHoraSaida() {
        return dataHoraSaida;
    }

    public double getValorCobrado() {
        return valorCobrado;
    }

    public boolean isEncerrado() {
        return encerrado;
    }

    public String getEntradaFormatada() {
        return dataHoraEntrada.format(FORMATTER);
    }

    public String getSaidaFormatada() {
        return (dataHoraSaida != null) ? dataHoraSaida.format(FORMATTER) : "Em aberto";
    }

    public String getTempoFormatado(LocalDateTime momentoReferencia) {
        long totalMinutos = calcularMinutosPermanencia(momentoReferencia);
        long horas = totalMinutos / 60;
        long minutos = totalMinutos % 60;
        return String.format("%dh %02dmin (%d minutos)", horas, minutos, totalMinutos);
    }

    public String gerarComprovante() {
        StringBuilder sb = new StringBuilder();
        sb.append("=========================================\n");
        sb.append("         COMPROVANTE DE ESTACIONAMENTO   \n");
        sb.append("=========================================\n");
        sb.append(String.format(" Ticket ID:        %s\n", id));
        sb.append(String.format(" Veículo:          %s - %s\n", veiculo.getPlaca(), veiculo.getModelo()));
        sb.append(String.format(" Categoria:        %s\n", veiculo.getTipo().getDescricao()));
        sb.append(String.format(" Vaga Utilizada:   #%02d\n", vaga.getNumero()));
        sb.append(String.format(" Entrada:          %s\n", getEntradaFormatada()));
        sb.append(String.format(" Saída:            %s\n", getSaidaFormatada()));
        if (encerrado) {
            sb.append(String.format(" Tempo Total:      %s\n", getTempoFormatado(dataHoraSaida)));
            sb.append(String.format(" Valor Total:      R$ %.2f\n", valorCobrado));
            sb.append(" Status:           PAGO / ENCERRADO\n");
        } else {
            sb.append(" Status:           EM ABERTO\n");
        }
        sb.append("=========================================");
        return sb.toString();
    }

    @Override
    public String toString() {
        return String.format("Ticket[%s] Placa: %s | Vaga: #%02d | Entrada: %s | Status: %s",
                id, veiculo.getPlaca(), vaga.getNumero(), getEntradaFormatada(),
                encerrado ? String.format("Pago (R$ %.2f)", valorCobrado) : "Ativo");
    }
}
