@echo off
echo ========================================
echo   BUILD PREVIEW ANDROID
echo ========================================
echo.
echo Creation d'un build de preview pour test...
echo Duree estimee: 10-15 minutes
echo.
cd /d F:\DVTC_PROJECTS\vtcClient
eas build --platform android --profile preview
echo.
echo ========================================
echo Build termine!
echo Telechargez l'APK depuis le lien fourni
echo ========================================
pause
