@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Compilando quicksort.cpp ...
g++ -O2 -std=c++17 -static -Wl,--stack,268435456 -o quicksort.exe quicksort.cpp
if errorlevel 1 (echo ERRO na compilacao. Veja se o g++ esta instalado.) else (echo OK: quicksort.exe gerado.)
pause
