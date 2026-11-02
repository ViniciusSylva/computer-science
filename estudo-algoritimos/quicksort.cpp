// =====================================================================
//  TRABALHO FINAL - ESTRUTURA DE DADOS (UNIFACVEST)
//  Análise de desempenho do algoritmo de ordenação QUICKSORT
//
//  O programa:
//    1) gera vetores de números inteiros aleatórios com 30, 300, 3.000,
//       30.000 e 300.000 elementos;
//    2) ordena cada tamanho com o Quicksort 20 vezes (20 amostras);
//    3) mede o tempo de cada execução em milissegundos (ms);
//    4) mostra cada tempo na tela, AO VIVO;
//    5) calcula a estatística descritiva: média, mediana, desvio padrão,
//       variância, coeficiente de variação, máximo e mínimo;
//    6) grava tudo em arquivos .csv (abrem direto no Excel).
//  Extra para a apresentação: demonstra o PIOR CASO (vetor já ordenado).
//
//  Compilar:  g++ -O2 -std=c++17 -static -Wl,--stack,268435456 -o quicksort.exe quicksort.cpp
//             (--stack aumenta a pilha para 256 MB: no pior caso a
//              recursão fica com n níveis e estouraria a pilha padrão)
//  Executar:  quicksort.exe              (abre o menu)
//             quicksort.exe --completo   (experimento completo direto)
// =====================================================================

#include <algorithm>
#include <chrono>
#include <cmath>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <random>
#include <sstream>
#include <string>
#include <vector>

#ifdef _WIN32
#include <windows.h>
#endif

using namespace std;

// ---------------------------------------------------------------------
//  1. QUICKSORT CLÁSSICO
//  Estratégia "dividir para conquistar":
//    1) escolhe um PIVÔ (aqui: o ÚLTIMO elemento, versão clássica);
//    2) PARTICIONA: menores ou iguais ao pivô vão para a esquerda,
//       maiores ficam à direita; o pivô para na sua posição FINAL;
//    3) repete o processo (recursão) no lado esquerdo e no direito.
//  Complexidade: O(n log n) no caso médio e melhor caso; O(n²) no pior
//  caso (vetor já ordenado ou com todos os valores iguais).
//
//  O vetor é recebido por REFERÊNCIA (vector<int>&): o algoritmo ordena
//  o próprio vetor, sem cópia. Copiar 300.000 números a cada chamada
//  recursiva gastaria tempo e memória e atrapalharia a medição.
// ---------------------------------------------------------------------

// Particionamento de Lomuto. Devolve a posição final do pivô.
int particionar(vector<int>& v, int inicio, int fim) {
    int pivo = v[fim];       // pivô = último elemento do trecho
    int i = inicio - 1;      // fim da região "menores ou iguais ao pivô"
    for (int j = inicio; j < fim; ++j) {
        if (v[j] <= pivo) {
            ++i;
            swap(v[i], v[j]);  // traz o elemento pequeno para a esquerda
        }
    }
    swap(v[i + 1], v[fim]);  // coloca o pivô entre as duas regiões
    return i + 1;
}

void quickSortRecursivo(vector<int>& v, int inicio, int fim) {
    if (inicio < fim) {                      // trecho com 0 ou 1 elemento já está ordenado
        int p = particionar(v, inicio, fim);
        quickSortRecursivo(v, inicio, p - 1);  // ordena o lado esquerdo
        quickSortRecursivo(v, p + 1, fim);     // ordena o lado direito
    }
}

void quickSort(vector<int>& v) {
    if (!v.empty()) quickSortRecursivo(v, 0, static_cast<int>(v.size()) - 1);
}

// ---------------------------------------------------------------------
//  2. ESTATÍSTICA DESCRITIVA
// ---------------------------------------------------------------------
struct Estatistica {
    double media, mediana, desvio, variancia, cv, minimo, maximo;
};

Estatistica calcular(vector<double> t) {  // recebe cópia de propósito: vamos ordená-la
    Estatistica e{};
    size_t n = t.size();
    sort(t.begin(), t.end());  // ordenar facilita mediana, mínimo e máximo
    double soma = 0;
    for (double x : t) soma += x;
    e.media = soma / n;
    e.mediana = (n % 2 == 0) ? (t[n / 2 - 1] + t[n / 2]) / 2.0 : t[n / 2];
    double sq = 0;
    for (double x : t) sq += (x - e.media) * (x - e.media);
    e.variancia = (n > 1) ? sq / (n - 1) : 0.0;  // variância AMOSTRAL (divide por n-1)
    e.desvio = sqrt(e.variancia);
    e.cv = (e.media > 0) ? e.desvio / e.media * 100.0 : 0.0;
    e.minimo = t.front();
    e.maximo = t.back();
    return e;
}

// ---------------------------------------------------------------------
//  3. FORMATAÇÃO
// ---------------------------------------------------------------------

// Número com vírgula decimal (padrão brasileiro / Excel em português).
string br(double x, int casas) {
    ostringstream s;
    s << fixed << setprecision(casas) << x;
    string r = s.str();
    replace(r.begin(), r.end(), '.', ',');
    return r;
}

// 300000 -> "300.000"
string milhar(long long n) {
    string s = to_string(n), r;
    int c = 0;
    for (int i = static_cast<int>(s.size()) - 1; i >= 0; --i) {
        r.insert(r.begin(), s[i]);
        if (++c % 3 == 0 && i > 0) r.insert(r.begin(), '.');
    }
    return r;
}

// ---------------------------------------------------------------------
//  4. O EXPERIMENTO
// ---------------------------------------------------------------------

// Gera n inteiros aleatórios entre 0 e 1.000.000.
// A SEMENTE é fixa (depende de n e da rodada): rodar de novo gera
// exatamente os mesmos números -> experimento REPRODUTÍVEL.
vector<int> gerarVetor(int n, int rodada) {
    mt19937 gerador(static_cast<unsigned>(n) * 1000u + static_cast<unsigned>(rodada));
    uniform_int_distribution<int> dist(0, 1000000);
    vector<int> v(n);
    for (int& x : v) x = dist(gerador);
    return v;
}

void imprimirTabela(const vector<int>& tamanhos, const vector<Estatistica>& est) {
    cout << "\n  Estatística descritiva do Quicksort (tempos em ms)\n";
    cout << "  " << string(112, '-') << "\n";
    cout << "  " << left << setw(10) << "Dados" << right << setw(13) << "Média"
         << setw(13) << "Mediana" << setw(14) << "Desvio P." << setw(18) << "Variância(ms²)"
         << setw(10) << "CV(%)" << setw(32) << "Máximo / Mínimo" << "\n";
    cout << "  " << string(112, '-') << "\n";
    for (size_t k = 0; k < est.size(); ++k) {
        const Estatistica& e = est[k];
        cout << "  " << left << setw(10) << milhar(tamanhos[k]) << right
             << setw(13) << br(e.media, 4) << setw(13) << br(e.mediana, 4)
             << setw(13) << br(e.desvio, 4) << setw(17) << br(e.variancia, 8)
             << setw(10) << br(e.cv, 2)
             << setw(32) << (br(e.maximo, 4) + " / " + br(e.minimo, 4)) << "\n";
    }
    cout << "  " << string(112, '-') << "\n";
}

void executar(const vector<int>& tamanhos, int rodadas, bool salvar) {
    using relogio = chrono::steady_clock;  // relógio monotônico: próprio para medir intervalos

    ofstream brutos, estat;
    if (salvar) {
#ifdef _WIN32
        CreateDirectoryA("resultados", nullptr);
#endif
        brutos.open("resultados/tempos_brutos.csv");
        estat.open("resultados/estatisticas.csv");
        brutos << "Tamanho;Rodada;Tempo_ms\n";
        estat << "Tamanho;Media_ms;Mediana_ms;DesvioPadrao_ms;Variancia_ms2;CV_pct;Maximo_ms;Minimo_ms\n";
    }

    vector<Estatistica> est;
    for (int n : tamanhos) {
        cout << "\n=================================================================\n";
        cout << "  QUICKSORT - CONJUNTO DE " << milhar(n) << " NÚMEROS - " << rodadas << " rodadas\n";
        cout << "=================================================================\n";

        vector<double> tempos;
        for (int r = 1; r <= rodadas; ++r) {
            vector<int> v = gerarVetor(n, r);  // gerar os números NÃO entra na medição

            auto t0 = relogio::now();
            quickSort(v);                      // <- só isto é cronometrado
            auto t1 = relogio::now();

            double ms = chrono::duration<double, milli>(t1 - t0).count();
            bool ok = is_sorted(v.begin(), v.end());  // confere se ordenou mesmo
            tempos.push_back(ms);

            cout << "  Rodada " << setw(2) << setfill('0') << r << setfill(' ') << "/" << rodadas
                 << " | n = " << setw(7) << milhar(n) << " | tempo: " << setw(12) << br(ms, 4)
                 << " ms  (" << br(ms / 1000.0, 4) << " s)"
                 << (ok ? "  [ordenado OK]" : "  [ERRO: NAO ORDENOU]") << "\n";

            if (salvar) brutos << n << ";" << r << ";" << br(ms, 6) << "\n";
        }

        est.push_back(calcular(tempos));
        const Estatistica& e = est.back();
        cout << "  >> Média: " << br(e.media, 4) << " ms | Mediana: " << br(e.mediana, 4)
             << " ms | Desvio: " << br(e.desvio, 4) << " ms | CV: " << br(e.cv, 2) << " %\n";
        if (salvar)
            estat << n << ";" << br(e.media, 6) << ";" << br(e.mediana, 6) << ";"
                  << br(e.desvio, 6) << ";" << br(e.variancia, 8) << ";" << br(e.cv, 4) << ";"
                  << br(e.maximo, 6) << ";" << br(e.minimo, 6) << "\n";
    }

    imprimirTabela(tamanhos, est);
    if (salvar)
        cout << "  Arquivos gravados em: resultados\\tempos_brutos.csv e resultados\\estatisticas.csv\n";
}

// Ordena o MESMO conjunto duas vezes: embaralhado (caso médio) e já
// ordenado (pior caso: o pivô = último = sempre o MAIOR elemento, então
// cada partição separa só 1 elemento e o custo vira O(n²)).
void demonstrarPiorCaso(int n) {
    using relogio = chrono::steady_clock;
    vector<int> aleatorio = gerarVetor(n, 1);
    vector<int> ordenado = aleatorio;
    sort(ordenado.begin(), ordenado.end());  // prepara a entrada, fora da medição

    auto t0 = relogio::now();
    quickSort(aleatorio);
    auto t1 = relogio::now();
    quickSort(ordenado);
    auto t2 = relogio::now();

    double msAleatorio = chrono::duration<double, milli>(t1 - t0).count();
    double msOrdenado = chrono::duration<double, milli>(t2 - t1).count();
    cout << "\n  n = " << milhar(n) << "\n"
         << "  Vetor ALEATÓRIO (caso médio, O(n log n)): " << setw(14) << br(msAleatorio, 4) << " ms\n"
         << "  Vetor JÁ ORDENADO (pior caso, O(n²))    : " << setw(14) << br(msOrdenado, 4) << " ms\n"
         << "  -> o pior caso foi " << br(msOrdenado / msAleatorio, 0) << " vezes mais lento\n";
}

// ---------------------------------------------------------------------
//  5. MENU
// ---------------------------------------------------------------------
int main(int argc, char* argv[]) {
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);  // acentos aparecem certos no terminal do Windows
#endif
    const vector<int> TAMANHOS = {30, 300, 3000, 30000, 300000};

    if (argc > 1 && string(argv[1]) == "--completo") {
        executar(TAMANHOS, 20, true);
        return 0;
    }

    while (true) {
        cout << "\n================== QUICKSORT ==================\n"
             << "  1 - Experimento COMPLETO (30 a 300.000 | 20 rodadas | grava CSV)\n"
             << "  2 - Escolher UM tamanho e o número de rodadas\n"
             << "  3 - Demonstrar o PIOR CASO (vetor já ordenado)\n"
             << "  0 - Sair\n"
             << "  Opção: ";
        int op;
        if (!(cin >> op) || op == 0) break;
        if (op == 1) {
            executar(TAMANHOS, 20, true);
        } else if (op == 2) {
            int n, r;
            cout << "  Quantidade de números (ex.: 3000): ";
            cin >> n;
            cout << "  Quantas rodadas (ex.: 20): ";
            cin >> r;
            if (n > 0 && r > 0) executar({n}, r, false);
        } else if (op == 3) {
            int n;
            cout << "  Quantidade de números (sugestão: 30000; acima de 100000 demora): ";
            cin >> n;
            if (n > 0) demonstrarPiorCaso(n);
        }
    }
    return 0;
}
