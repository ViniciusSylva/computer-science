package br.com.estacionamento.model;

import java.util.Objects;

/**
 * Representa um Veículo no sistema de estacionamento.
 * Abstração focada nos dados essenciais para identificação e tarifação,
 * com validação estrita de placa (Mercosul e tradicional) e modelo.
 */
public class Veiculo {
    /**
     * Padrão oficial de placas brasileiro:
     * - Mercosul: 3 letras, 1 número, 1 letra e 2 números (ex: ABC1D23)
     * - Tradicional: 3 letras e 4 números (ex: ABC1234)
     */
    public static final String REGEX_MERCOSUL = "^[A-Z]{3}[0-9][A-Z][0-9]{2}$";
    public static final String REGEX_TRADICIONAL = "^[A-Z]{3}[0-9]{4}$";
    public static final String REGEX_PLACA_BRASIL = "^[A-Z]{3}([0-9][A-Z][0-9]{2}|[0-9]{4})$";

    private String placa;
    private String modelo;
    private TipoVeiculo tipo;

    public Veiculo(String placa, String modelo, TipoVeiculo tipo) {
        if (tipo == null) {
            throw new IllegalArgumentException("O tipo de veículo deve ser informado.");
        }
        this.placa = validarESanitizarPlaca(placa);
        this.modelo = validarESanitizarModelo(modelo);
        this.tipo = tipo;
    }

    /**
     * Remove hífens, espaços e caracteres especiais, convertendo para letras maiúsculas.
     */
    public static String sanitizarPlaca(String placaRaw) {
        if (placaRaw == null) {
            return "";
        }
        return placaRaw.trim().replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
    }

    /**
     * Verifica se a string informada corresponde a uma placa brasileira válida (Mercosul ou tradicional).
     */
    public static boolean isPlacaValida(String placaRaw) {
        String limpa = sanitizarPlaca(placaRaw);
        return limpa.matches(REGEX_PLACA_BRASIL);
    }

    /**
     * Verifica se a string informada é um modelo válido:
     * - Não nulo e não vazio;
     * - Mínimo de 2 caracteres;
     * - Contém pelo menos uma letra (não pode ser composto exclusivamente por números).
     */
    public static boolean isModeloValido(String modeloRaw) {
        if (modeloRaw == null) {
            return false;
        }
        String m = modeloRaw.trim();
        return m.length() >= 2 && m.matches(".*[a-zA-Z\\p{L}].*");
    }

    private static String validarESanitizarPlaca(String placaRaw) {
        if (placaRaw == null || placaRaw.trim().isEmpty()) {
            throw new IllegalArgumentException("A placa do veículo não pode ser vazia.");
        }
        String limpa = sanitizarPlaca(placaRaw);
        if (!limpa.matches(REGEX_PLACA_BRASIL)) {
            throw new IllegalArgumentException(String.format(
                "Placa '%s' inválida! A placa deve seguir o padrão brasileiro Mercosul (ex: ABC1D23) ou tradicional (ex: ABC1234).",
                placaRaw.trim().toUpperCase()
            ));
        }
        return limpa;
    }

    private static String validarESanitizarModelo(String modeloRaw) {
        if (modeloRaw == null || modeloRaw.trim().isEmpty()) {
            throw new IllegalArgumentException("O modelo do veículo não pode ser vazio.");
        }
        String m = modeloRaw.trim();
        if (m.length() < 2) {
            throw new IllegalArgumentException("O modelo do veículo deve ter pelo menos 2 caracteres.");
        }
        if (!m.matches(".*[a-zA-Z\\p{L}].*")) {
            throw new IllegalArgumentException("O modelo do veículo não pode ser composto exclusivamente por números. Deve conter pelo menos uma letra (ex: Corolla, CG 160, Gol 1.0).");
        }
        return m;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = validarESanitizarPlaca(placa);
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = validarESanitizarModelo(modelo);
    }

    public TipoVeiculo getTipo() {
        return tipo;
    }

    public void setTipo(TipoVeiculo tipo) {
        if (tipo == null) {
            throw new IllegalArgumentException("O tipo de veículo deve ser informado.");
        }
        this.tipo = tipo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Veiculo veiculo = (Veiculo) o;
        return Objects.equals(placa, veiculo.placa);
    }

    @Override
    public int hashCode() {
        return Objects.hash(placa);
    }

    @Override
    public String toString() {
        return String.format("[%s] %s (%s)", placa, modelo, tipo.getDescricao());
    }
}
