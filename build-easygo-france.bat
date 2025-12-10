@echo off
echo ========================================
echo   BUILD EASYGO (FRANCE) - Sans Git
echo ========================================
echo.
echo Lancement du build sans Git...
echo Package: com.easygo.client
echo Duree estimee: 15-20 minutes
echo.
cd /d F:\DVTC_PROJECTS\vtcClient
set EAS_NO_VCS=1
eas build --platform android --profile production
echo.
echo ========================================
echo Build termine!
echo ========================================
pause
