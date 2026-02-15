@echo off
echo Starting BELL24h Backend Server...
echo.
cd /d %~dp0
py -m uvicorn dev_server:app --reload --port=8000 --host 127.0.0.1
pause

