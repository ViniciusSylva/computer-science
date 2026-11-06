package br.com.estacionamento.model;

/**
 * Representa uma vaga física no estacionamento.
 * Controla seu estado de ocupação e o veículo atualmente estacionado.
 */
public class Vaga {
    private final int numero;
    private final TipoVeiculo tipoPermitido;
    private boolean ocupada;
    private Veiculo veiculoEstacionado;

    public Vaga(int numero, TipoVeiculo tipoPermitido) {
        if (numero <= 0) {
            throw new IllegalArgumentException("O número da vaga deve ser positivo.");
        }
        if (tipoPermitido == null) {
            throw new IllegalArgumentException("O tipo permitido para a vaga deve ser especificado.");
        }
        this.numero = numero;
        this.tipoPermitido = tipoPermitido;
        this.ocupada = false;
        this.veiculoEstacionado = null;
    }

    public boolean isDisponivel() {
        return !ocupada && veiculoEstacionado == null;
    }

    public boolean isCompativel(TipoVeiculo tipo) {
        return this.tipoPermitido == tipo;
    }

    public void ocupar(Veiculo veiculo) {
        if (veiculo == null) {
            throw new IllegalArgumentException("Não é possível ocupar a vaga com um veículo nulo.");
        }
        if (!isDisponivel()) {
            throw new IllegalStateException("Vaga " + numero + " já está ocupada.");
        }
        if (!isCompativel(veiculo.getTipo())) {
            throw new IllegalArgumentException(String.format(
                "Incompatibilidade: Vaga %d é exclusiva para %s, mas o veículo informado é %s.",
                numero, tipoPermitido.getDescricao(), veiculo.getTipo().getDescricao()
            ));
        }
        this.veiculoEstacionado = veiculo;
        this.ocupada = true;
    }

    public Veiculo desocupar() {
        if (!ocupada || veiculoEstacionado == null) {
            throw new IllegalStateException("Vaga " + numero + " já se encontra desocupada.");
        }
        Veiculo saindo = this.veiculoEstacionado;
        this.veiculoEstacionado = null;
        this.ocupada = false;
        return saindo;
    }

    public int getNumero() {
        return numero;
    }

    public TipoVeiculo getTipoPermitido() {
        return tipoPermitido;
    }

    public boolean isOcupada() {
        return ocupada;
    }

    public Veiculo getVeiculoEstacionado() {
        return veiculoEstacionado;
    }

    @Override
    public String toString() {
        String status = ocupada ? "OCUPADA por " + veiculoEstacionado : "LIVRE";
        return String.format("Vaga #%02d [%s] - %s", numero, tipoPermitido.getDescricao(), status);
    }
}
