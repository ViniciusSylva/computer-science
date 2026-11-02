"""
Gera os gráficos (boxplot e barras) e a planilha Excel a partir dos CSV
gravados pelo quicksort.exe.

Uso:  python gerar_graficos_e_planilha.py <pasta_csv> <pasta_graficos> <arquivo_xlsx>
Requer: matplotlib, openpyxl
"""
import csv
import math
import statistics
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side

pasta_csv, pasta_graf, arquivo_xlsx = (Path(a) for a in sys.argv[1:4])
pasta_graf.mkdir(parents=True, exist_ok=True)

plt.rcParams.update({"font.family": "Times New Roman", "font.size": 11, "axes.spines.top": False,
                     "axes.spines.right": False})
COR = "#2F5D8A"
COR2 = "#C8553D"
COR3 = "#8C8C8C"
VIRGULA = matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:g}".replace(".", ","))


def num(t):
    return float(t.replace(",", "."))


def rotulo(n):
    return f"{n:,}".replace(",", ".")


# ------------------------------------------------------------------ leitura
tempos = {}
with open(pasta_csv / "tempos_brutos.csv", encoding="utf-8") as f:
    for linha in csv.DictReader(f, delimiter=";"):
        tempos.setdefault(int(linha["Tamanho"]), []).append(num(linha["Tempo_ms"]))
tamanhos = sorted(tempos)

estat_cpp = {}
with open(pasta_csv / "estatisticas.csv", encoding="utf-8") as f:
    for linha in csv.DictReader(f, delimiter=";"):
        estat_cpp[int(linha["Tamanho"])] = {k: num(v) for k, v in linha.items() if k != "Tamanho"}

# ------------------------------------------- conferência independente (Python)
print("Conferência C++ x Python (média e desvio):")
for n in tamanhos:
    m, d = statistics.mean(tempos[n]), statistics.stdev(tempos[n])
    ok = abs(m - estat_cpp[n]["Media_ms"]) < 1e-5 and abs(d - estat_cpp[n]["DesvioPadrao_ms"]) < 1e-5
    print(f"  n={n:>7}: média {m:.6f}  desvio {d:.6f}  -> {'IGUAL' if ok else 'DIFERENTE'}")

# ------------------------------------------------------- Figura 1: boxplots
fig, eixos = plt.subplots(2, 3, figsize=(10, 7))
eixos[1][2].axis("off")
for i, (ax, n) in enumerate(zip(eixos.flat, tamanhos)):
    ax.boxplot(tempos[n], widths=0.5, patch_artist=True,
               boxprops=dict(facecolor="#D6E2EE", edgecolor=COR),
               medianprops=dict(color=COR2, linewidth=2),
               whiskerprops=dict(color=COR), capprops=dict(color=COR),
               flierprops=dict(marker="o", markerfacecolor=COR2, markeredgecolor=COR2, markersize=5))
    ax.scatter([1 + (k % 5 - 2) * 0.04 for k in range(len(tempos[n]))], tempos[n], s=8, color=COR3,
               alpha=0.6, zorder=3)
    ax.set_xticks([])
    ax.set_title(f"({'abcde'[i]}) n = {rotulo(n)}", fontsize=11)
    if i % 3 == 0:
        ax.set_ylabel("Tempo (ms)")
    ax.yaxis.set_major_formatter(VIRGULA)
fig.tight_layout()
fig.savefig(pasta_graf / "figura1_boxplot.png", dpi=200)
plt.close(fig)

# ------------------------------------------- Figura 2: barras do tempo médio
medias = [estat_cpp[n]["Media_ms"] for n in tamanhos]
desvios = [estat_cpp[n]["DesvioPadrao_ms"] for n in tamanhos]
fig, ax = plt.subplots(figsize=(8, 4.5))
x = range(len(tamanhos))
ax.bar(x, medias, color=COR, yerr=desvios, capsize=4, ecolor="black", width=0.6)
ax.set_yscale("log")
ax.set_xticks(list(x), [rotulo(n) for n in tamanhos])
ax.set_xlabel("Quantidade de números ordenados (n)")
ax.set_ylabel("Tempo médio (ms) - escala logarítmica")
for xi, m in zip(x, medias):
    ax.text(xi, m * 1.35, f"{m:.4f}".replace(".", ","), ha="center", fontsize=10)
ax.set_ylim(top=max(medias) * 4)
ax.yaxis.set_major_formatter(VIRGULA)
fig.tight_layout()
fig.savefig(pasta_graf / "figura2_barras_tempo_medio.png", dpi=200)
plt.close(fig)

# -------------------------- Figura 3: crescimento observado x teórico (barras)
transicoes, observado, nlogn, quad = [], [], [], []
for a, b in zip(tamanhos, tamanhos[1:]):
    transicoes.append(f"{rotulo(a)} → {rotulo(b)}")
    observado.append(estat_cpp[b]["Media_ms"] / estat_cpp[a]["Media_ms"])
    nlogn.append((b * math.log2(b)) / (a * math.log2(a)))
    quad.append((b / a) ** 2)
fig, ax = plt.subplots(figsize=(9, 4.5))
lx = range(len(transicoes))
w = 0.27
b1 = ax.bar([i - w for i in lx], observado, w, color=COR, label="Observado (Quicksort)")
b2 = ax.bar(list(lx), nlogn, w, color=COR3, label="Teórico n·log n")
b3 = ax.bar([i + w for i in lx], quad, w, color=COR2, label="Teórico n² (pior caso)")
for barras in (b1, b2, b3):
    for r in barras:
        ax.text(r.get_x() + r.get_width() / 2, r.get_height() + 1.5, f"{r.get_height():.1f}".replace(".", ","),
                ha="center", fontsize=9)
ax.set_xticks(list(lx), transicoes)
ax.set_xlabel("Aumento do conjunto de dados (10 vezes maior)")
ax.set_ylabel("Quantas vezes o tempo aumentou")
ax.legend(frameon=False, ncol=3, loc="upper center", bbox_to_anchor=(0.5, 1.12))
fig.tight_layout()
fig.savefig(pasta_graf / "figura3_crescimento_observado_x_teorico.png", dpi=200)
plt.close(fig)

# ---------------------------------------------------------- Planilha Excel
wb = Workbook()
fina = Side(style="thin", color="999999")
borda = Border(top=fina, bottom=fina, left=fina, right=fina)
cab = PatternFill("solid", fgColor="D6E2EE")
negrito = Font(bold=True, name="Times New Roman")
normal = Font(name="Times New Roman")

ws = wb.active
ws.title = "Dados brutos"
ws["A1"] = "Tempos do Quicksort por rodada (ms) - 20 amostras por tamanho"
ws["A1"].font = Font(bold=True, name="Times New Roman", size=12)
ws.cell(row=3, column=1, value="Rodada")
for c, n in enumerate(tamanhos, start=2):
    ws.cell(row=3, column=c, value=f"n = {rotulo(n)}")
for r in range(20):
    ws.cell(row=4 + r, column=1, value=r + 1)
    for c, n in enumerate(tamanhos, start=2):
        ws.cell(row=4 + r, column=c, value=tempos[n][r]).number_format = "0.0000"

# Estatística com FÓRMULAS do Excel (o Excel recalcula sozinho)
linha0 = 26
formulas = [("Média (ms)", "AVERAGE"), ("Mediana (ms)", "MEDIAN"), ("Desvio padrão (ms)", "STDEV"),
            ("Variância (ms²)", "VAR"), ("Coef. de variação (%)", None), ("Máximo (ms)", "MAX"),
            ("Mínimo (ms)", "MIN")]
ws.cell(row=linha0 - 1, column=1, value="Estatística descritiva (fórmulas do Excel)").font = negrito
for i, (nome, func) in enumerate(formulas):
    ws.cell(row=linha0 + i, column=1, value=nome).font = negrito
    for c in range(2, 2 + len(tamanhos)):
        col = ws.cell(row=3, column=c).column_letter
        faixa = f"{col}4:{col}23"
        if func:
            f = f"={func}({faixa})"
        else:
            f = f"=STDEV({faixa})/AVERAGE({faixa})*100"
        cel = ws.cell(row=linha0 + i, column=c, value=f)
        cel.number_format = "0.00" if func is None else ("0.00000000" if func == "VAR" else "0.0000")
for linha in ws.iter_rows(min_row=3, max_row=linha0 + len(formulas) - 1, max_col=1 + len(tamanhos)):
    for cel in linha:
        if cel.row == 24 or cel.row == 25:
            continue
        cel.border = borda
        cel.alignment = Alignment(horizontal="center")
        if cel.font != negrito:
            cel.font = normal
for c in range(1, 2 + len(tamanhos)):
    ws.cell(row=3, column=c).fill = cab
    ws.cell(row=3, column=c).font = negrito
ws.column_dimensions["A"].width = 24
for c in "BCDEF":
    ws.column_dimensions[c].width = 16

ws2 = wb.create_sheet("Estatística (C++)")
ws2["A1"] = "Estatística calculada pelo programa em C++ (para conferir com a aba anterior)"
ws2["A1"].font = Font(bold=True, name="Times New Roman", size=12)
cabec = ["Dados", "Média (ms)", "Mediana (ms)", "Desvio padrão (ms)", "Variância (ms²)", "CV (%)",
         "Máximo (ms)", "Mínimo (ms)"]
chaves = ["Media_ms", "Mediana_ms", "DesvioPadrao_ms", "Variancia_ms2", "CV_pct", "Maximo_ms", "Minimo_ms"]
for c, t in enumerate(cabec, start=1):
    cel = ws2.cell(row=3, column=c, value=t)
    cel.font, cel.fill, cel.border = negrito, cab, borda
for r, n in enumerate(tamanhos, start=4):
    ws2.cell(row=r, column=1, value=rotulo(n)).border = borda
    for c, k in enumerate(chaves, start=2):
        cel = ws2.cell(row=r, column=c, value=estat_cpp[n][k])
        cel.number_format = "0.00000000" if k == "Variancia_ms2" else "0.0000"
        cel.border = borda
for c in "ABCDEFGH":
    ws2.column_dimensions[c].width = 18
wb.save(arquivo_xlsx)
print("Gráficos e planilha gerados.")
