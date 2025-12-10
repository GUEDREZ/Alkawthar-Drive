import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  ScrollView,
  Image
} from "react-native";

import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Polyline,
} from "react-native-maps";

import PolylineDecoder from "@mapbox/polyline";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { io } from "socket.io-client";

const GOOGLE_API_KEY = "AIzaSyDfj3_iPzNPJyAcR68y9EDvu6pG5YomJE4";
const SOCKET_URL = "https://vtcidf-backend-1.onrender.com";

export default function Reservation() {
  const mapRef = useRef(null);
  const router = useRouter();

  const [clientPos, setClientPos] = useState(null);
  const [destinationPos, setDestinationPos] = useState(null);

  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [price, setPrice] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  const [step, setStep] = useState("home");

  const socket = useRef(null);

  // Get current location
  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission localisation refusée");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setClientPos({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  // Calculate Google Directions route
  const getRoute = async () => {
    if (!clientPos || !destinationPos) return;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${clientPos.latitude},${clientPos.longitude}&destination=${destinationPos.latitude},${destinationPos.longitude}&key=${GOOGLE_API_KEY}`;

    const res = await fetch(url);
    const json = await res.json();

    if (!json.routes || json.routes.length === 0) {
      alert("Trajet introuvable.");
      return;
    }

    const points =
      json.routes[0].overview_polyline.points;

    const decoded = PolylineDecoder.decode(points);

    const coords = decoded.map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng,
    }));

    setRouteCoords(coords);

    const leg = json.routes[0].legs[0];

    const km = leg.distance.value / 1000;
    const min = leg.duration.value / 60;

    setDistance(km);
    setDuration(min);
    setPrice((km * 2.2).toFixed(2));

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 70, left: 70, bottom: 70, right: 70 },
      animated: true,
    });

    setStep("summary");
  };

  // Send reservation to backend
  const sendReservation = () => {
    socket.current = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.current.emit("course_request", {
      client: clientPos,
      destination: destinationPos,
      distance,
      duration,
      price,
    });

    socket.current.on("chauffeur_assigned", (data) => {
      router.push({
        pathname: "/confirmation",
        params: {
          chauffeur: JSON.stringify(data.chauffeur),
          clientLat: clientPos.latitude,
          clientLon: clientPos.longitude,
        },
      });
    });

    setStep("waiting");
  };

  if (!clientPos) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#d4af37" />
        <Text style={{ color: "white", marginTop: 10 }}>
          Localisation en cours…
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <StatusBar barStyle="light-content" />

      {/* HEADER PREMIUM */}
      <View style={styles.topHeader}>
        <Image
          source={require("../assets/images/logo.fr.jpg")}
          style={styles.logoHeader}
          resizeMode="contain"
        />
        {/* <Text style={styles.premiumTitle}>PREMIUM VTC</Text> */}
      </View>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: clientPos.latitude,
          longitude: clientPos.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {clientPos && (
          <Marker coordinate={clientPos}>
            <View style={styles.clientDot} />
          </Marker>
        )}

        {destinationPos && (
          <Marker
            coordinate={destinationPos}
            pinColor="gold"
          />
        )}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={5}
            strokeColor="#d4af37"
          />
        )}
      </MapView>

      {/* ÉCRAN ACCUEIL */}
      {step === "home" && (
        <View style={styles.homeLayer}>
          <TouchableOpacity
            style={styles.goButton}
            onPress={() => setStep("form")}
          >
            <Text style={styles.goButtonText}>COMMANDER</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FORMULAIRE */}
      {step === "form" && (
        <View style={styles.panel}>
          <TouchableOpacity onPress={() => setStep("home")} style={styles.closeBtn}>
            <Text style={{ color: '#666' }}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Votre Trajet</Text>

          <Text style={styles.label}>Départ</Text>

          <GooglePlacesAutocomplete
            placeholder="Votre position"
            fetchDetails={true}
            query={{
              key: GOOGLE_API_KEY,
              language: "fr",
            }}
            onPress={(data, details) => {
              setClientPos({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              });
            }}
            styles={{ ...autoStyles, container: { flex: 0, zIndex: 10 } }}
          />

          <Text style={styles.label}>Destination</Text>

          <GooglePlacesAutocomplete
            placeholder="Adresse d'arrivée"
            fetchDetails={true}
            query={{
              key: GOOGLE_API_KEY,
              language: "fr",
            }}
            onPress={(data, details) => {
              setDestinationPos({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              });
            }}
            styles={{ ...autoStyles, container: { flex: 0, zIndex: 5 } }}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={getRoute}
          >
            <Text style={styles.buttonText}>Continuer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* RÉSUMÉ */}
      {step === "summary" && (
        <View style={styles.panel}>
          <Text style={styles.title}>Résumé du trajet</Text>

          <Text style={styles.summary}>
            Distance : {distance.toFixed(1)} km
          </Text>
          <Text style={styles.summary}>
            Durée : {duration.toFixed(0)} min
          </Text>
          <Text style={styles.price}>
            Prix : {price} €
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={sendReservation}
          >
            <Text style={styles.buttonText}>
              Commander
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ATTENTE CHAUFFEUR */}
      {step === "waiting" && (
        <View style={styles.waitPanel}>
          <ActivityIndicator
            size="large"
            color="#d4af37"
          />
          <Text style={styles.waitText}>
            Recherche d’un chauffeur…
          </Text>
        </View>
      )}

      {/* BARRE DU BAS (FOOTER) - Visible sauf si clavier ouvert (géré par le layout) ou si navigation active */}
      {step === "home" && (
        <View style={styles.bottomFooter}>
          <TouchableOpacity style={styles.footerItem}>
            <Text style={styles.footerIcon}>⚙️</Text>
            <Text style={styles.footerText}>Paramètres</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerItem}>
            <Text style={styles.footerIcon}>📞</Text>
            <Text style={styles.footerText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerItem}>
            <Text style={styles.footerIcon}>🆘</Text>
            <Text style={styles.footerText}>Urgence</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  map: { flex: 1 },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },

  clientDot: {
    width: 12,
    height: 12,
    backgroundColor: "green",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
  },

  panel: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#111",
    padding: 20,
    paddingBottom: 50, // Espace pour la barre de navigation Android
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },

  topHeader: {
    position: "absolute",
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    width: "100%",
    alignItems: "center",
    zIndex: 200, // Au-dessus de tout
  },
  premiumTitle: {
    color: "#d4af37", // OR
    fontSize: 28,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    // textShadowRadius: 10,
    // fontStyle: 'italic',
    // letterSpacing: 2,
  },

  logoHeader: {
    width: 200,
    height: 50,
    marginTop: 0,
  },

  homeLayer: {
    position: 'absolute',
    bottom: 120, // Au-dessus du footer
    width: '100%',
    alignItems: 'center',
    zIndex: 50,
  },

  goButton: {
    backgroundColor: "#d4af37",
    width: 200,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  goButtonText: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  bottomFooter: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 90,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20, // Pour les écrans sans bouton home
    borderTopWidth: 1,
    borderTopColor: '#222'
  },
  footerItem: {
    alignItems: 'center',
  },
  footerIcon: {
    fontSize: 22,
    marginBottom: 4,
    color: '#fff'
  },
  footerText: {
    color: '#fff',
    fontSize: 10,
    textTransform: 'uppercase'
  },

  closeBtn: {
    alignSelf: 'flex-end',
    marginBottom: 5,
    padding: 5,
  },

  title: {
    color: "#d4af37",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  label: {
    color: "#fff",
    marginVertical: 8,
  },

  button: {
    backgroundColor: "#d4af37",
    padding: 14,
    borderRadius: 25,
    marginTop: 20,
  },

  buttonText: {
    color: "#000",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },

  summary: {
    color: "white",
    fontSize: 17,
    marginTop: 10,
  },

  price: {
    color: "#d4af37",
    fontSize: 22,
    marginTop: 15,
    fontWeight: "bold",
  },

  waitPanel: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 180,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  waitText: {
    marginTop: 15,
    color: "#fff",
    fontSize: 18,
  },
});

const autoStyles = {
  textInput: {
    backgroundColor: "#fff",
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  listView: {
    backgroundColor: "#222",
  },
  description: {
    color: "#fff",
  },
};
