@echo off
echo ========================================
echo   BUILD PRODUCTION ANDROID (PLAY STORE)
echo ========================================
echo.
echo Creation du build de production (.aab)...
echo Duree estimee: 10-15 minutes
echo.
cd /d F:\DVTC_PROJECTS\vtcClient
eas build --platform android --profile production
echo.
echo ========================================
echo Build termine!
echo Fichier .aab pret pour le Play Store
echo ========================================
pause
