@echo off
chcp 65001 >nul
echo ===================================================
echo   Installation de la Caisse StockFlow Pro
echo ===================================================
echo.
echo Ce script va creer un raccourci securise sur votre bureau.
echo En cliquant sur ce raccourci pour utiliser StockFlow, 
echo l'impression des tickets se fera silencieusement et 
echo directement sans demander de confirmation.
echo.

:: ---------------------------------------------------------
:: URL a configurer : Pensez a mettre la vraie URL de prod !
SET URL="http://localhost:3001/dashboard"
:: ---------------------------------------------------------

SET SHORTCUT_NAME="Caisse StockFlow.lnk"
SET SCRIPT="%TEMP%\CreateShortcut.vbs"

:: Generation du script VBS pour creer proprement le raccourci
echo Set oWS = WScript.CreateObject("WScript.Shell") > %SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\" ^& %SHORTCUT_NAME% >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%

:: Trouver Chrome via l'App Paths Windows
echo On Error Resume Next >> %SCRIPT%
echo chromePath = oWS.RegRead("HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe\") >> %SCRIPT%
echo If chromePath = "" Then chromePath = oWS.RegRead("HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe\") >> %SCRIPT%
echo On Error GoTo 0 >> %SCRIPT%

:: Fallback au cas ou le registre est bloque
echo If chromePath = "" Then chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe" >> %SCRIPT%

echo oLink.TargetPath = chromePath >> %SCRIPT%
echo userData = oWS.ExpandEnvironmentStrings("%%APPDATA%%") ^& "\StockFlowCaisse" >> %SCRIPT%
echo oLink.Arguments = "--kiosk-printing --user-data-dir=""" ^& userData ^& """ " ^& %URL% >> %SCRIPT%
:: Mode fenetre normal = 1, Maximise = 3
echo oLink.WindowStyle = 3 >> %SCRIPT% 
echo oLink.Description = "Lancer la Caisse Automatique StockFlow" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%

:: Execution du mini-script VBS
cscript /nologo %SCRIPT%
del %SCRIPT%

echo.
echo [SUCCES] Le raccourci "Caisse StockFlow" a ete ajoute a votre Bureau !
echo.
echo IMPORTANT : Assurez-vous que votre imprimante a ticket est 
echo definie comme L'IMPRIMANTE PAR DEFAUT dans les parametres Windows.
echo.
pause
