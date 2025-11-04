@echo off
cls
echo.
echo ========================================
echo FloodAI - Starting Backend
echo ========================================
echo.

cd /d "%~dp0"
python-3.13.9-embed-amd64\python.exe main.py

pause
