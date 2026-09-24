package br.com.estacionamento.model;

/**
 * Representa os tipos de veículos suportados pelo estacionamento.
 * Cada tipo possui uma descrição e um fator multiplicador para o cálculo da tarifa.
 */
public enum TipoVeiculo {
    CARRO("Carro de Passeio", 1.0),
    MOTO("Motocicleta", 0.5),
    CAMINHONETE("Caminhonete / SUV", 1.2);

    private final String descricao;
    private final double multiplicadorTarifa;

    TipoVeiculo(String descricao, double multiplicadorTarifa) {
        this.descricao = descricao;
        this.multiplicadorTarifa = multiplicadorTarifa;
    }

    public String getDescricao() {
        return descricao;
    }

    public double getMultiplicadorTarifa() {
        return multiplicadorTarifa;
    }

    @Override
    public String toString() {
        return descricao;
    }
}
