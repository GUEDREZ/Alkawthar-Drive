import 'dotenv/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';
const IS_ALGERIA = process.env.APP_VARIANT === 'algeria';

const getAppName = () => {
    if (IS_DEV) return 'EasyGo (Dev)';
    if (IS_PREVIEW) return 'EasyGo (Preview)';
    if (IS_ALGERIA) return 'Alkawthar Drive';
    return 'EasyGo'; // France (Default)
};

const getPackageName = () => {
    if (IS_DEV) return 'com.easygo.client.dev';
    if (IS_PREVIEW) return 'com.easygo.client.preview';
    if (IS_ALGERIA) return 'com.alkawthardrive.client';
    return 'com.easygo.vtc.france'; // France (Default)
};

const getIcon = () => {
    if (IS_ALGERIA) return "./assets/images/icon.png";
    return "./assets/images/logo.fr.jpg"; // Logo EasyGo
};

export default {
    expo: {
        name: getAppName(),
        slug: "alkawthardrive",
        version: "1.0.0",
        orientation: "portrait",
        icon: getIcon(),
        scheme: "alkawthardrive",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        primaryColor: "#1E40AF",
        privacy: "public",
        description: "Réservez un chauffeur VTC en Île-de-France rapidement et facilement avec Alkawthar Drive.",
        ios: {
            supportsTablet: true,
            bundleIdentifier: getPackageName(),
            buildNumber: "1",
            requireFullScreen: false,
            infoPlist: {
                NSLocationWhenInUseUsageDescription: "Alkawthar Drive a besoin d'accéder à votre position pour vous connecter avec les chauffeurs à proximité et suivre votre course en temps réel.",
                NSLocationAlwaysAndWhenInUseUsageDescription: "Alkawthar Drive a besoin d'accéder à votre position en arrière-plan pour suivre votre course et estimer les temps d'arrivée.",
                NSLocationAlwaysUsageDescription: "Alkawthar Drive a besoin d'accéder à votre position même en arrière-plan pour suivre votre course.",
                UIBackgroundModes: [
                    "location"
                ]
            },
            config: {
                googleMapsApiKey: "AIzaSyDfj3_iPzNPJyAcR68y9EDvu6pG5YomJE4"
            }
        },
        android: {
            package: getPackageName(),
            adaptiveIcon: {
                backgroundColor: "#ffffff",
                foregroundImage: "./assets/images/logo.fr.jpg",
                // backgroundImage: "./assets/images/android-icon-background.png", // Disabled to use solid color
                // monochromeImage: "./assets/images/android-icon-monochrome.png"
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            permissions: [
                "ACCESS_FINE_LOCATION",
                "ACCESS_COARSE_LOCATION",
                "ACCESS_BACKGROUND_LOCATION",
                "INTERNET"
            ],
            config: {
                googleMaps: {
                    apiKey: "AIzaSyDfj3_iPzNPJyAcR68y9EDvu6pG5YomJE4"
                }
            }
        },
        web: {
            output: "static",
            favicon: "./assets/images/favicon.png"
        },
        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/splash-icon.png",
                    imageWidth: 200,
                    resizeMode: "contain",
                    backgroundColor: "#ffffff",
                    dark: {
                        backgroundColor: "#000000"
                    }
                }
            ],
            [
                "expo-build-properties",
                {
                    android: {
                        enableProguardInReleaseBuilds: true,
                        enableMinifyInReleaseBuilds: true
                    }
                }
            ]
        ],
        experiments: {
            typedRoutes: true,
            reactCompiler: true
        },
        extra: {
            variant: process.env.APP_VARIANT || 'france',
            router: {},
            eas: {
                projectId: "ef344681-52aa-4dfe-a1a5-006034b08091"
            }
        }
    }
};
