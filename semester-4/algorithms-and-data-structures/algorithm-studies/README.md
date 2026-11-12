# Algorithm Studies: Quicksort Empirical Performance Analysis

This module contains an empirical study and performance benchmarking suite for the **Quicksort** algorithm, evaluating its execution time across various input sizes and verifying theoretical time complexity vs. observed real-world behavior.

## 📂 Directory Structure

| File | Type | Description |
|---|---|---|
| [`quicksort.cpp`](file:///algorithm-studies/quicksort.cpp) | C++ Source | Implementation of classic Quicksort (Lomuto partition scheme) and benchmarking harness that generates vectors of sizes 30, 300, 3,000, 30,000, and 300,000 integers with 20 sample runs each. Computes descriptive statistics (mean, median, standard deviation, variance, CV, min, max) and exports raw CSV data. |
| [`generate_charts_and_sheets.py`](file:///algorithm-studies/generate_charts_and_sheets.py) | Python Script | Data processing and visualization script using Matplotlib and OpenPyXL. Generates boxplots, bar charts in logarithmic scale, theoretical vs. observed growth curves, and a formatted Excel spreadsheet (`.xlsx`). |
| [`compile.bat`](file:///algorithm-studies/compile.bat) | Batch Script | Compiles `quicksort.cpp` using `g++` (`-O2`, `-std=c++17`, static linking, 256MB stack allocation to prevent recursion overflow in worst-case scenarios). |
| [`run_quicksort.bat`](file:///algorithm-studies/run_quicksort.bat) | Batch Script | Launches the compiled `quicksort.exe` interactive benchmark suite. |
| [`generate_charts.bat`](file:///algorithm-studies/generate_charts.bat) | Batch Script | Automatically installs dependencies (`matplotlib`, `openpyxl`) and triggers the Python charting script on benchmark results. |

---

## ⚙️ Compilation & Execution

### 1. Compilation
Ensure `g++` (MinGW / GCC) is installed and available in your `PATH`:
```cmd
compile.bat
```
Alternatively, compile manually via terminal:
```bash
g++ -O2 -std=c++17 -static -Wl,--stack,268435456 -o quicksort.exe quicksort.cpp
```

### 2. Running Benchmarks
Run the executable interactively or via batch script:
```cmd
run_quicksort.bat
```
* Generates sample arrays and benchmark metrics saved under `resultados/tempos_brutos.csv` and `resultados/estatisticas.csv`.

### 3. Generating Visualizations & Reports
```cmd
generate_charts.bat
```
* Generates distribution boxplots, mean execution bar plots, and `dados_quicksort.xlsx`.

