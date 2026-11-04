@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist resultados\tempos_brutos.csv (echo Rode antes o run_quicksort.bat, opcao 1. & pause & exit /b)
python -m pip install --quiet matplotlib openpyxl
python generate_charts_and_sheets.py resultados graficos_novos graficos_novos\dados_quicksort.xlsx
echo Graficos e planilha gerados na pasta graficos_novos
pause
