@echo off
cd /d "%~dp0"
echo Starting local server...
echo Open this URL in your browser: http://localhost:8000/
echo Press Ctrl+C to stop the server.
echo.
node server.js
pause
