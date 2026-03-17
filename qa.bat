@echo off

powershell -ExecutionPolicy Bypass -File "%~dp0.qa\run-all.ps1" %*

pause

exit /b %errorlevel%
