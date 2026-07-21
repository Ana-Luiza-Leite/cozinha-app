abrir.bat
 @echo off
 echo.
 echo  ==========================================
 echo   Cozinha Inteligente - Iniciando...
 echo  ==========================================
 echo.
 
 echo Abrindo o navegador...
 start "" "%~dp0abrir.html"
 
 echo Iniciando o servidor...
 cd /d "%~dp0"
 node server.js
 
 pause