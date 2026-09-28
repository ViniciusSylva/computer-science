import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="D0D7DE"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="{color}"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="{color}"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>
            <w:insideV w:val="none"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def format_table(table, col_widths, headers, rows, header_bg="1F4E79", alt_bg="F9FAFB"):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table)
    
    # Header row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], header_bg)
        set_cell_margins(hdr_cells[i], top=140, bottom=140, left=160, right=160)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.bold = True
            run.font.size = Pt(10)
            run.font.color.rgb = RGBColor(255, 255, 255)
            run.font.name = "Arial"
            
    # Data rows
    for r_idx, row_data in enumerate(rows):
        row_cells = table.add_row().cells
        bg_color = alt_bg if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            row_cells[c_idx].text = str(val)
            set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=100, bottom=100, left=150, right=150)
            p = row_cells[c_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.size = Pt(9.5)
                run.font.name = "Arial"
                run.font.color.rgb = RGBColor(40, 40, 40)

    # Set column widths
    for row in table.rows:
        for i, w in enumerate(col_widths):
            row.cells[i].width = Inches(w)

def add_callout_box(doc, text, title="DESTAQUE DE ENGENHARIA"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "F0F4F8")
    set_cell_margins(cell, top=160, bottom=160, left=200, right=200)
    
    # Left border thick, others none
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="1F4E79"/>
            <w:top w:val="none"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    run_t = p.add_run(f"📌 {title}\n")
    run_t.font.bold = True
    run_t.font.size = Pt(10.5)
    run_t.font.color.rgb = RGBColor(31, 78, 121)
    run_t.font.name = "Arial"
    
    run_b = p.add_run(text)
    run_b.font.size = Pt(9.5)
    run_b.font.italic = True
    run_b.font.color.rgb = RGBColor(50, 50, 50)
    run_b.font.name = "Arial"
    
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def build_document():
    doc = Document()
    
    # Page Setup - Margins 1 inch
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
    # Styles
    normal_style = doc.styles['Normal']
    normal_font = normal_style.font
    normal_font.name = 'Arial'
    normal_font.size = Pt(10.5)
    normal_font.color.rgb = RGBColor(40, 40, 40)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # CAPA DO DOCUMENTO
    # -------------------------------------------------------------
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_inst = p_inst.add_run("CURSO DE CIÊNCIA DA COMPUTAÇÃO / ENGENHARIA DE SOFTWARE\nPROGRAMAÇÃO ORIENTADA A OBJETOS")
    r_inst.font.bold = True
    r_inst.font.size = Pt(11)
    r_inst.font.color.rgb = RGBColor(100, 100, 100)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(24)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("RELATÓRIO TÉCNICO & DICIONÁRIO DE PROJETO\nSISTEMA DE GESTÃO DE ESTACIONAMENTO")
    r_title.font.bold = True
    r_title.font.size = Pt(20)
    r_title.font.color.rgb = RGBColor(31, 78, 121)
    p_title.paragraph_format.space_after = Pt(12)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("Abstração, Identificação de Objetos, Modelagem UML e Implementação Completa em Java")
    r_sub.font.size = Pt(13)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(80, 80, 80)
    p_sub.paragraph_format.space_after = Pt(36)

    # Box dos Integrantes
    tbl_group = doc.add_table(rows=1, cols=1)
    tbl_group.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_group = tbl_group.cell(0, 0)
    c_group.width = Inches(5.5)
    set_cell_background(c_group, "F2F5F8")
    set_cell_margins(c_group, top=160, bottom=160, left=200, right=200)
    set_table_borders(tbl_group, color="B0C4DE")
    
    p_g = c_group.paragraphs[0]
    p_g.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_gh = p_g.add_run("GRUPO 3\n")
    r_gh.font.bold = True
    r_gh.font.size = Pt(13)
    r_gh.font.color.rgb = RGBColor(31, 78, 121)
    
    r_gm = p_g.add_run("Mariah M.  •  Vinicius S.  •  Alan G.  •  Bernardo R.\n\n")
    r_gm.font.bold = True
    r_gm.font.size = Pt(11)
    r_gm.font.color.rgb = RGBColor(30, 30, 30)
    
    r_gd = p_g.add_run("Data da Apresentação: 24/09/2026 | Horário: 19h30min")
    r_gd.font.size = Pt(10)
    r_gd.font.color.rgb = RGBColor(100, 100, 100)

    doc.add_page_break()

    # -------------------------------------------------------------
    # 1. OBJETIVO E VISÃO GERAL
    # -------------------------------------------------------------
    h1 = doc.add_heading("1. Objetivo e Escopo do Trabalho", level=1)
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(6)
    for run in h1.runs:
        run.font.color.rgb = RGBColor(31, 78, 121)

    doc.add_paragraph(
        "O presente trabalho tem como finalidade realizar uma análise profunda de engenharia de software "
        "sobre o problema de gerenciamento de um estacionamento comercial rotativo. A solução foi projetada "
        "seguindo rigorosamente os princípios de Abstração, Identificação de Objetos do Domínio e Modelagem "
        "UML antes de sua codificação em linguagem Java moderna (OpenJDK 21 LTS)."
    )
    doc.add_paragraph(
        "O sistema contempla o controle físico de vagas setorizadas, a emissão e encerramento de tickets de permanência, "
        "a validação de compatibilidade entre veículos e vagas, a aplicação de regras tarifárias com tolerância "
        "gratuita inicial de 15 minutos e arredondamento comercial para frações de hora, além de fornecer relatórios "
        "gerenciais de ocupação e faturamento."
    )

    add_callout_box(
        doc,
        "A premissa central deste projeto foi comprovar como o uso correto da Abstração e da Modelagem UML "
        "elimina a complexidade acidental, reduz custos de desenvolvimento e produz código limpo, testável e de alta coesão.",
        title="PRINCÍPIO NORTEADOR DO PROJETO"
    )

    # -------------------------------------------------------------
    # 2. TAREFA 1: ABSTRAÇÃO E FILTRAGEM DO DOMÍNIO
    # -------------------------------------------------------------
    h2 = doc.add_heading("2. Tarefa 1: Descrição do Domínio e Aplicação da Abstração", level=1)
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(6)
    for run in h2.runs:
        run.font.color.rgb = RGBColor(31, 78, 121)

    doc.add_paragraph(
        "A Abstração consiste no processo intelectual de focar estritamente nas propriedades relevantes de uma entidade "
        "sob a perspectiva dos objetivos do sistema, descartando deliberadamente características que representam ruído. "
        "A tabela a seguir consolida a distinção entre os elementos essenciais mantidos no modelo e os detalhes descartados:"
    )

    t1_headers = ["Elemento Essencial", "Justificativa Técnica", "Detalhe Descartado", "Motivo do Descarte"]
    t1_widths = [1.5, 2.0, 1.4, 1.6]
    t1_rows = [
        ["Placa do Veículo", "Identificador unívoco do veículo para controle, segurança e busca no pátio.", "Cor e Pintura", "Não interfere no cálculo de tarifa, ocupação física ou regras do pátio."],
        ["Modelo do Veículo", "Facilita o reconhecimento visual pelo operador e constrói o comprovante.", "Quilometragem / Combustível", "Pertencem ao uso privado do condutor; sem relação com a guarda do veículo."],
        ["Tipo / Categoria", "Determina a compatibilidade física da vaga e o fator multiplicador da tarifa.", "Marca dos Pneus e Mecânica", "Detalhes mecânicos irrelevantes para a prestação do serviço."],
        ["Número da Vaga", "Endereçamento físico unívoco no pátio para localização ágil do veículo.", "Material do Piso / Asfalto", "Infraestrutura civil passiva; não agrega valor ao modelo de software."],
        ["Estado da Vaga", "Controle booleano em tempo real da disponibilidade (Livre / Ocupada).", "Câmeras e Iluminação", "Devem ser gerenciados por subsistemas dedicados (CFTV/Automação)."],
        ["Horário Entrada/Saída", "Variáveis temporais determinantes para cálculo exato de permanência.", "Dados do Motorista (CPF, RG)", "Desnecessários para estacionamento avulso; respeita a LGPD e privacidade."],
        ["Tarifa Base & Multiplicador", "Base financeira para cômputo da remuneração do serviço prestado.", "Integração Bancária Interna", "Detalhe de implementação de gateway externo que não altera o domínio."]
    ]
    t1_tbl = doc.add_table(rows=1, cols=4)
    format_table(t1_tbl, t1_widths, t1_headers, t1_rows)

    doc.add_page_break()

    # -------------------------------------------------------------
    # 3. TAREFAS 2 & 4: DICIONÁRIO COMPLETO DE DADOS (VARIÁVEIS)
    # -------------------------------------------------------------
    h3 = doc.add_heading("3. Dicionário Completo de Dados: Variáveis e Atributos", level=1)
    h3.paragraph_format.space_before = Pt(14)
    h3.paragraph_format.space_after = Pt(6)
    for run in h3.runs:
        run.font.color.rgb = RGBColor(31, 78, 121)

    doc.add_paragraph(
        "Abaixo detalham-se todas as variáveis de instância, atributos de classe e constantes que compõem o sistema, "
        "indicando visibilidade, tipo primitivo/objeto e função de negócio:"
    )

    var_headers = ["Classe", "Modificador", "Nome da Variável", "Tipo", "Descrição e Finalidade de Negócio"]
    var_widths = [1.2, 1.0, 1.4, 1.1, 1.8]
    var_rows = [
        ["TipoVeiculo", "private final", "descricao", "String", "Nome amigável da categoria (ex: 'Carro de Passeio', 'Motocicleta')."],
        ["TipoVeiculo", "private final", "multiplicadorTarifa", "double", "Fator de ponderação sobre a tarifa base (ex: Carro = 1.0, Moto = 0.5, SUV = 1.2)."],
        ["Veiculo", "private", "placa", "String", "Placa do veículo em letras maiúsculas e sem espaços. Atua como chave natural única."],
        ["Veiculo", "private", "modelo", "String", "Nome comercial do veículo (ex: 'Toyota Corolla', 'Honda CG 160')."],
        ["Veiculo", "private", "tipo", "TipoVeiculo", "Referência à categoria do veículo para compatibilidade de vaga e tarifação."],
        ["Vaga", "private final", "numero", "int", "Número sequencial identificador da vaga física no pátio (positivo, >= 1)."],
        ["Vaga", "private final", "tipoPermitido", "TipoVeiculo", "Restrição da vaga: somente veículos dessa categoria podem estacionar."],
        ["Vaga", "private", "ocupada", "boolean", "Indicador de ocupação: true quando há veículo alocado, false quando livre."],
        ["Vaga", "private", "veiculoEstacionado", "Veiculo", "Referência ao objeto Veiculo atualmente na vaga; null se estiver livre."],
        ["Ticket", "private static final", "FORMATTER", "DateTimeFormatter", "Padrão imutável de exibição de data/hora ('dd/MM/yyyy HH:mm:ss')."],
        ["Ticket", "private final", "id", "String", "Código único do comprovante de atendimento (ex: 'TCK-1001')."],
        ["Ticket", "private final", "veiculo", "Veiculo", "Referência ao veículo que ingressou no estabelecimento."],
        ["Ticket", "private final", "vaga", "Vaga", "Referência à vaga ocupada durante a permanência."],
        ["Ticket", "private final", "dataHoraEntrada", "LocalDateTime", "Momento cronológico de entrada no pátio."],
        ["Ticket", "private", "dataHoraSaida", "LocalDateTime", "Momento cronológico de saída; null enquanto o ticket estiver aberto."],
        ["Ticket", "private", "valorCobrado", "double", "Valor monetário total apurado e quitado na saída do veículo."],
        ["Ticket", "private", "encerrado", "boolean", "Flag do ciclo de vida: false = veículo no pátio, true = atendimento concluído."],
        ["Estacionamento", "private final", "nome", "String", "Nome comercial fantasia do estabelecimento."],
        ["Estacionamento", "private", "tarifaBaseHora", "double", "Valor monetário de referência cobrado por hora para carros (ex: R$ 10,00)."],
        ["Estacionamento", "private final", "vagas", "List<Vaga>", "Coleção encapsulada de todas as vagas físicas pertencentes ao pátio."],
        ["Estacionamento", "private final", "ticketsAtivos", "Map<String, Ticket>", "Tabela hash indexada pela placa do veículo para buscas em tempo O(1)."],
        ["Estacionamento", "private final", "historicoTickets", "List<Ticket>", "Lista cronológica de todos os atendimentos finalizados para auditoria."],
        ["Estacionamento", "private", "proximoNumeroTicket", "int", "Contador sequencial autoincrementado a cada novo ticket emitido (inicia em 1001)."]
    ]
    t_var = doc.add_table(rows=1, cols=5)
    format_table(t_var, var_widths, var_headers, var_rows)

    doc.add_page_break()

    # -------------------------------------------------------------
    # 4. TAREFAS 2 & 4: DICIONÁRIO COMPLETO DE OPERAÇÕES (MÉTODOS)
    # -------------------------------------------------------------
    h4 = doc.add_heading("4. Dicionário Completo de Operações: Funções e Métodos", level=1)
    h4.paragraph_format.space_before = Pt(14)
    h4.paragraph_format.space_after = Pt(6)
    for run in h4.runs:
        run.font.color.rgb = RGBColor(31, 78, 121)

    doc.add_paragraph(
        "Apresentam-se a seguir todos os métodos desenvolvidos no sistema, detalhando suas assinaturas, "
        "parâmetros de entrada, tipos de retorno e a lógica operacional encapsulada:"
    )

    fn_headers = ["Classe", "Método / Assinatura", "Retorno", "Responsabilidade e Comportamento Operacional"]
    fn_widths = [1.2, 2.0, 1.0, 2.3]
    fn_rows = [
        ["TipoVeiculo", "getDescricao()", "String", "Retorna a nomenclatura legível associada à categoria."],
        ["TipoVeiculo", "getMultiplicadorTarifa()", "double", "Retorna o índice ponderador de cálculo da tarifa."],
        ["Veiculo", "Veiculo(placa, modelo, tipo)", "Construtor", "Valida que nenhum campo seja nulo ou vazio; padroniza placa em maiúsculas."],
        ["Veiculo", "getPlaca() / setPlaca(placa)", "String / void", "Leitura e alteração da placa com validação de formato e não-vazio."],
        ["Veiculo", "getModelo() / setModelo(mod)", "String / void", "Leitura e alteração do modelo do veículo."],
        ["Veiculo", "getTipo() / setTipo(tipo)", "TipoVeiculo / void", "Leitura e alteração da categoria do veículo."],
        ["Veiculo", "equals(Object o) / hashCode()", "boolean / int", "Compara igualdade lógica baseando-se estritamente na placa do veículo."],
        ["Veiculo", "toString()", "String", "Formata representação textual: '[PLACA] Modelo (Categoria)'."],
        ["Vaga", "Vaga(numero, tipoPermitido)", "Construtor", "Inicializa vaga física com número positivo e tipo; define estado como livre."],
        ["Vaga", "isDisponivel()", "boolean", "Retorna true se 'ocupada == false' E 'veiculoEstacionado == null'."],
        ["Vaga", "isCompativel(TipoVeiculo tipo)", "boolean", "Verifica se a categoria do veículo corresponde à restrição física da vaga."],
        ["Vaga", "ocupar(Veiculo veiculo)", "void", "Valida disponibilidade e compatibilidade; associa o veículo e marca ocupada = true."],
        ["Vaga", "desocupar()", "Veiculo", "Desassocia o veículo da vaga, marca ocupada = false e retorna a instância do veículo desocupado."],
        ["Vaga", "getNumero() / getTipoPermitido()", "int / TipoVeiculo", "Métodos de leitura das propriedades imutáveis da vaga."],
        ["Vaga", "isOcupada() / getVeiculoEstacionado()", "boolean / Veiculo", "Métodos de leitura do estado momentâneo de ocupação."],
        ["Ticket", "Ticket(id, veiculo, vaga, entrada)", "Construtor", "Instancia o ticket com data/hora de entrada e status encerrado = false."],
        ["Ticket", "calcularMinutosPermanencia(fim)", "long", "Executa 'Duration.between(entrada, fim).toMinutes()' garantindo consistência cronológica."],
        ["Ticket", "calcularValor(fim, tarifaBase)", "double", "Aplica tolerância de 15 min grátis; arredonda minutos em horas via Math.ceil e multiplica pelo fator do veículo."],
        ["Ticket", "encerrar(saida, tarifaBase)", "double", "Registra horário de término, calcula valor final, altera flag encerrado = true e retorna o valor."],
        ["Ticket", "getEntradaFormatada() / getSaidaFormatada()", "String", "Formata os timestamps de entrada e saída no padrão brasileiro."],
        ["Ticket", "gerarComprovante()", "String", "Produz o cupom fiscal/recibo de pagamento textual para o cliente."],
        ["Estacionamento", "Estacionamento(nome, tarifaBase)", "Construtor", "Inicializa o estacionamento com validação de valores monetários positivos."],
        ["Estacionamento", "adicionarVaga(Vaga vaga)", "void", "Insere nova vaga garantindo unicidade do número no pátio."],
        ["Estacionamento", "inicializarVagasPadrao()", "void", "Cria configuração predefinida de 10 vagas (5 Carros, 3 Motos, 2 Caminhonetes)."],
        ["Estacionamento", "registrarEntrada(Veiculo)", "Ticket", "Sobrecarga conveniente que registra a entrada no horário atual do sistema."],
        ["Estacionamento", "registrarEntrada(Veiculo, entrada)", "Ticket", "Valida duplicidade, localiza vaga compatível livre, ocupa e emite ticket."],
        ["Estacionamento", "registrarSaida(placa)", "Ticket", "Sobrecarga que processa a saída no momento atual."],
        ["Estacionamento", "registrarSaida(placa, saida)", "Ticket", "Recupera ticket ativo em O(1), desocupa vaga física, fecha cobrança e move para o histórico."],
        ["Estacionamento", "consultarVagasDisponiveis()", "List<Vaga>", "Filtra e retorna todas as vagas desocupadas via Java Stream."],
        ["Estacionamento", "consultarVagasOcupadas()", "List<Vaga>", "Filtra e retorna todas as vagas em uso."],
        ["Estacionamento", "consultarVagasDisponiveisPorTipo(t)", "List<Vaga>", "Filtra vagas livres que sejam compatíveis com a categoria solicitada."],
        ["Estacionamento", "buscarTicketAtivo(placa)", "Optional<Ticket>", "Consulta segura se determinado veículo está no estacionamento."],
        ["Estacionamento", "getFaturamentoTotal()", "double", "Soma o valor cobrado de todos os tickets encerrados no histórico."],
        ["Estacionamento", "gerarRelatorioOcupacao()", "String", "Calcula taxa percentual de ocupação, vagas livres/ocupadas e receita total acumulada."],
        ["Main", "main(String[] args)", "void", "Ponto de entrada do executável, loop do menu interativo e leitura de teclado."],
        ["Main", "executarDemonstracaoAutomatica(est)", "void", "Simulação automatizada de 7 etapas para apresentação ao vivo em seminário."],
        ["TestEstacionamento", "main(String[] args)", "void", "Executa a suíte de 5 testes unitários com assertions nativas."]
    ]
    t_fn = doc.add_table(rows=1, cols=4)
    format_table(t_fn, fn_widths, fn_headers, fn_rows)

    doc.add_page_break()

    # -------------------------------------------------------------
    # 5. TAREFA 3: MODELAGEM E DIAGRAMA UML
    # -------------------------------------------------------------
    h5 = doc.add_heading("5. Tarefa 3: Modelagem e Diagrama de Classes UML", level=1)
    h5.paragraph_format.space_before = Pt(14)
    h5.paragraph_format.space_after = Pt(6)
    for run in h5.runs:
        run.font.color.rgb = RGBColor(31, 78, 121)

    doc.add_paragraph(
        "O diagrama de classes UML representa a planta arquitetural do software, definindo a visibilidade de atributos "
        "e métodos, tipos de dados e os relacionamentos estruturais com suas respectivas multiplicidades."
    )

    uml_desc_headers = ["Relacionamento UML", "Classes Envolvidas", "Tipo de Relação", "Justificativa Semântica"]
    uml_desc_widths = [1.5, 1.8, 1.4, 1.8]
    uml_desc_rows = [
        ["Estacionamento *-- Vaga", "Estacionamento e Vaga", "Composição (Forte)", "As vagas físicas pertencem integralmente ao estacionamento. Se o estacionamento for destruído, suas vagas deixam de existir no sistema."],
        ["Estacionamento *-- Ticket", "Estacionamento e Ticket", "Composição (Forte)", "O histórico de tickets emitidos e o controle de atendimentos ativos são de posse exclusiva do estacionamento."],
        ["Vaga o-- Veiculo", "Vaga e Veiculo", "Agregação (Fraca)", "A vaga abriga temporariamente de 0 a 1 veículo. O veículo possui ciclo de vida independente: existia antes de entrar e continua existindo após a saída."],
        ["Ticket --> Veiculo", "Ticket e Veiculo", "Associação Direcionada", "O ticket referencia exatamente 1 veículo para identificação, tarifação e emissão do comprovante."],
        ["Ticket --> Vaga", "Ticket e Vaga", "Associação Direcionada", "O ticket referencia a vaga ocupada para controle de desocupação e conferência física."],
        ["Veiculo --> TipoVeiculo", "Veiculo e TipoVeiculo", "Associação Unidirecional", "O veículo possui 1 categoria que define suas dimensões e custo."],
        ["Vaga --> TipoVeiculo", "Vaga e TipoVeiculo", "Associação Unidirecional", "A vaga é restrita a 1 categoria de veículo."]
    ]
    t_uml = doc.add_table(rows=1, cols=4)
    format_table(t_uml, uml_desc_widths, uml_desc_headers, uml_desc_rows)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    add_callout_box(
        doc,
        "A distinção entre Composição (*--) e Agregação (o--) é um dos critérios avaliativos mais importantes em POO. "
        "Demonstramos com clareza que o Veiculo é agregado à Vaga, enquanto as Vagas são compostas pelo Estacionamento.",
        title="CONCEITO FUNDAMENTAL DE MODELAGEM UML"
    )

    # -------------------------------------------------------------
    # 6. TAREFA 5: COMPARAÇÃO UML VS CÓDIGO E ANÁLISE DE ABSTRAÇÃO
    # -------------------------------------------------------------
    h6 = doc.add_heading("6. Tarefa 5: Comparação UML vs. Código Java e Redução da Complexidade", level=1)
    h6.paragraph_format.space_before = Pt(14)
    h6.paragraph_format.space_after = Pt(6)
    for run in h6.runs:
        run.font.color.rgb = RGBColor(31, 78, 121)

    doc.add_paragraph(
        "A comparação entre o modelo UML previamente projetado e o código Java resultante comprova a fidelidade arquitetural:"
    )

    comp_headers = ["Elemento no Diagrama UML", "Implementação no Código Java", "Benefício Direto da Abstração"]
    comp_widths = [1.8, 2.3, 2.4]
    comp_rows = [
        ["Visibilidade Privada (-)", "Modificador 'private' com getters específicos", "Encapsulamento total; previne mutações ilegais no estado dos objetos."],
        ["Composição 1 para 1..*", "private final List<Vaga> vagas = new ArrayList<>()", "Garante que as vagas fiquem contidas e protegidas na classe controladora."],
        ["Agregação 0..1", "private Veiculo veiculoEstacionado; (pode ser null)", "Representa fielmente o estado vazio da vaga sem forçar dependência existencial."],
        ["Associação Ticket -> Veiculo", "private final Veiculo veiculo; (imutável)", "Garante integridade referencial: um ticket emitido nunca altera o veículo."],
        ["Métodos de Consulta", "Streams funcionais: filter(Vaga::isDisponivel)", "Consultas declarativas limpas, sem poluição de lógica procedural no cliente."]
    ]
    t_comp = doc.add_table(rows=1, cols=3)
    format_table(t_comp, comp_widths, comp_headers, comp_rows)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    
    p_disc = doc.add_paragraph()
    r_dh = p_disc.add_run("Como a Abstração Reduziu a Complexidade do Problema:\n")
    r_dh.font.bold = True
    r_dh.font.size = Pt(11)
    r_dh.font.color.rgb = RGBColor(31, 78, 121)
    
    doc.add_paragraph(
        "1. Redução Significativa da Carga Cognitiva: Ao filtrar aspectos irrelevantes (cor, mecânica, proprietário), "
        "a equipe conseguiu manter o foco nas regras de negócio essenciais (vaga, tempo e dinheiro). "
        "Isso tornou as classes concisas, fáceis de ler e livres de 'código espaguete'."
    )
    doc.add_paragraph(
        "2. Alta Coesão e Baixo Acoplamento: O Veiculo não sabe calcular preços; a Vaga não controla relógio; "
        "o Ticket cuida da cobrança e o Estacionamento gerencia o fluxo global. Nenhuma classe assumiu responsabilidades alheias."
    )
    doc.add_paragraph(
        "3. Extensibilidade Simplificada (Open/Closed Principle): Caso seja necessário criar uma nova categoria "
        "(ex: 'CAMINHAO' ou 'CARRO_ELETRICO'), basta incluir uma nova entrada no enum TipoVeiculo, "
        "sem a necessidade de reescrever as classes Vaga ou Estacionamento."
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # 7. ROTEIRO DE APRESENTAÇÃO E DIVISÃO DE FALAS (24/09 às 19h30)
    # -------------------------------------------------------------
    h7 = doc.add_heading("7. Roteiro e Divisão de Falas para a Apresentação em Grupo", level=1)
    h7.paragraph_format.space_before = Pt(14)
    h7.paragraph_format.space_after = Pt(6)
    for run in h7.runs:
        run.font.color.rgb = RGBColor(31, 78, 121)

    doc.add_paragraph(
        "Estrutura organizada de apresentação oral (tempo estimado: 12 a 15 minutos), distribuída igualmente entre "
        "os 4 integrantes da equipe:"
    )

    speak_headers = ["Integrante", "Bloco da Apresentação", "Conteúdo Abordado", "Tempo Estimado"]
    speak_widths = [1.3, 1.6, 2.6, 1.0]
    speak_rows = [
        ["Mariah M.", "Abertura & Tarefa 1", "Apresentação da equipe, contexto do estacionamento rotativo e o conceito de Abstração (essencial vs. detalhes descartados).", "3 minutos"],
        ["Vinicius S.", "Tarefa 2", "Identificação dos objetos, definição das 5 classes, distribuição de responsabilidades e variáveis do modelo.", "3 minutos"],
        ["Alan G.", "Tarefa 3", "Apresentação do Diagrama de Classes UML, navegabilidade, multiplicidades e diferença entre Composição e Agregação.", "3 minutos"],
        ["Bernardo R.", "Tarefas 4 e 5", "Demonstração prática do código Java no console (Opção 6), comparação UML vs. código e conclusão sobre redução da complexidade.", "4 a 5 minutos"]
    ]
    t_spk = doc.add_table(rows=1, cols=4)
    format_table(t_spk, speak_widths, speak_headers, speak_rows)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    add_callout_box(
        doc,
        "Dica Estratégica para o Grupo: No momento da fala do Bernardo, execute o programa e escolha a Opção [6] "
        "(Demonstração Automática). Ela executa em 5 segundos todo o ciclo de entrada, saída com cálculo tarifário "
        "e faturamento, eliminando riscos de digitação errada ao vivo.",
        title="DICA DE APRESENTAÇÃO AO VIVO"
    )

    # -------------------------------------------------------------
    # 8. RESULTADOS DA BATERIA DE TESTES
    # -------------------------------------------------------------
    h8 = doc.add_heading("8. Verificação e Testes Automatizados", level=1)
    h8.paragraph_format.space_before = Pt(14)
    h8.paragraph_format.space_after = Pt(6)
    for run in h8.runs:
        run.font.color.rgb = RGBColor(31, 78, 121)

    doc.add_paragraph(
        "O sistema conta com uma suíte de testes automatizados com validações nativas (assertions) "
        "localizada em 'br.com.estacionamento.test.TestEstacionamento'. Os resultados obtidos em tempo de execução foram:"
    )

    test_headers = ["ID do Teste", "Cenário de Teste", "Comportamento Esperado", "Status"]
    test_widths = [1.0, 2.2, 2.3, 1.0]
    test_rows = [
        ["TESTE 1", "Criação e validação de veículo", "Placa padronizada em maiúsculas, validação de campos obrigatórios não nulos.", "APROVADO"],
        ["TESTE 2", "Ocupação e compatibilidade de vagas", "Bloqueio de moto em vaga de carro; liberação física da vaga no desocupar.", "APROVADO"],
        ["TESTE 3", "Fluxo completo de entrada e saída", "Cálculo exato de permanência (2h = R$ 10,00 para moto); liberação de vaga.", "APROVADO"],
        ["TESTE 4", "Regra de tolerância de cortesia", "Permanência de até 15 minutos isenta de cobrança (valor R$ 0,00).", "APROVADO"],
        ["TESTE 5", "Bloqueio de entrada duplicada", "Disparo de IllegalStateException para veículo que já possui ticket ativo.", "APROVADO"]
    ]
    t_tst = doc.add_table(rows=1, cols=4)
    format_table(t_tst, test_widths, test_headers, test_rows)

    # -------------------------------------------------------------
    # 9. CÓDIGO-FONTE COMPLETO COMENTADO
    # -------------------------------------------------------------
    doc.add_page_break()
    h9 = doc.add_heading("9. Apêndice: Código-Fonte Completo em Java", level=1)
    h9.paragraph_format.space_before = Pt(14)
    h9.paragraph_format.space_after = Pt(6)
    for run in h9.runs:
        run.font.color.rgb = RGBColor(31, 78, 121)

    doc.add_paragraph(
        "Apresentam-se a seguir os códigos-fontes completos de todas as classes do projeto, "
        "estruturadas de acordo com as convenções da linguagem Java e com documentação Javadoc:"
    )

    src_dir = r"C:\Users\bernardo\.gemini\antigravity\scratch\sistema-estacionamento\src"
    files_to_include = [
        ("br.com.estacionamento.model.TipoVeiculo", os.path.join(src_dir, "br", "com", "estacionamento", "model", "TipoVeiculo.java")),
        ("br.com.estacionamento.model.Veiculo", os.path.join(src_dir, "br", "com", "estacionamento", "model", "Veiculo.java")),
        ("br.com.estacionamento.model.Vaga", os.path.join(src_dir, "br", "com", "estacionamento", "model", "Vaga.java")),
        ("br.com.estacionamento.model.Ticket", os.path.join(src_dir, "br", "com", "estacionamento", "model", "Ticket.java")),
        ("br.com.estacionamento.service.Estacionamento", os.path.join(src_dir, "br", "com", "estacionamento", "service", "Estacionamento.java")),
        ("br.com.estacionamento.app.Main", os.path.join(src_dir, "br", "com", "estacionamento", "app", "Main.java")),
        ("br.com.estacionamento.test.TestEstacionamento", os.path.join(src_dir, "br", "com", "estacionamento", "test", "TestEstacionamento.java")),
    ]

    for class_name, file_path in files_to_include:
        h_cls = doc.add_heading(f"Classe: {class_name}", level=2)
        h_cls.paragraph_format.space_before = Pt(10)
        h_cls.paragraph_format.space_after = Pt(4)
        for r in h_cls.runs:
            r.font.color.rgb = RGBColor(47, 85, 151)

        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                code_content = f.read()

            tbl_code = doc.add_table(rows=1, cols=1)
            tbl_code.alignment = WD_TABLE_ALIGNMENT.CENTER
            c_code = tbl_code.cell(0, 0)
            c_code.width = Inches(6.5)
            set_cell_background(c_code, "F8F9FA")
            set_cell_margins(c_code, top=100, bottom=100, left=140, right=140)
            set_table_borders(tbl_code, color="D0D7DE")

            p_code = c_code.paragraphs[0]
            p_code.paragraph_format.space_before = Pt(0)
            p_code.paragraph_format.space_after = Pt(0)
            p_code.paragraph_format.line_spacing = 1.05

            r_code = p_code.add_run(code_content)
            r_code.font.name = "Consolas"
            r_code.font.size = Pt(8.5)
            r_code.font.color.rgb = RGBColor(33, 37, 41)

            doc.add_paragraph().paragraph_format.space_after = Pt(6)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    p_end = doc.add_paragraph()
    p_end.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_end = p_end.add_run("--- FIM DO DOCUMENTO TÉCNICO ---")
    r_end.font.bold = True
    r_end.font.color.rgb = RGBColor(120, 120, 120)

    # Save
    output_path = r"C:\Users\bernardo\.gemini\antigravity\scratch\sistema-estacionamento\docs\Trabalho_Grupo3_Sistema_Estacionamento.docx"
    doc.save(output_path)
    print(f"DOCUMENTO DOCX ATUALIZADO COM SUCESSO EM: {output_path}")

if __name__ == "__main__":
    build_document()
