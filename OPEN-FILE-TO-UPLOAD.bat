@echo off
echo ========================================
echo   VISVERGUNNING.HTML - UPLOAD HELPER
echo ========================================
echo.
echo Deze file opent de NIEUWE visvergunning.html
echo zodat je hem kunt uploaden naar Cloud86
echo.
echo Locatie:
echo %~dp0visvergunning.html
echo.
echo ========================================
echo.
pause

REM Open File Explorer met het bestand geselecteerd
explorer /select,"%~dp0visvergunning.html"

echo.
echo File Explorer geopend met visvergunning.html geselecteerd!
echo.
echo VOLGENDE STAPPEN:
echo 1. Log in op Cloud86 Plesk
echo 2. Ga naar File Manager ^> public_html
echo 3. Upload dit bestand (visvergunning.html)
echo 4. Klik op "Overwrite" als gevraagd
echo 5. Clear browser cache (Ctrl + Shift + R)
echo 6. Test op https://www.visclubsim.be/visvergunning.html
echo.
pause
