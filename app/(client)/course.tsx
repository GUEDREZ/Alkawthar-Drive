import { Ionicons } from "@expo/vector-icons";
import PolylineDecoder from "@mapbox/polyline";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { io } from "socket.io-client";

const GOOGLE_API_KEY = "AIzaSyAmZidnFyW3OQ6_WvVJUluXODV-pxnPdfg";
const SOCKET_URL = "https://vtcidf-backend-1.onrender.com";

export default function Course() {
  const mapRef = useRef(null);
  const params = useLocalSearchParams();

  const chauffeur = JSON.parse(params.chauffeur);
  const destination = JSON.parse(params.destination);

  const [chauffeurPos, setChauffeurPos] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [eta, setEta] = useState(null); // Temps restant
  const [distanceLeft, setDistanceLeft] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Obtenir itinéraire chauffeur → destination
  const fetchRoute = async (lat, lon) => {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${lat},${lon}&destination=${destination.lat},${destination.lon}&key=${GOOGLE_API_KEY}`;

    const res = await fetch(url);
    const json = await res.json();

    if (!json.routes || json.routes.length === 0) return;

    // Décodage polyline
    const points = json.routes[0].overview_polyline.points;
    const decoded = PolylineDecoder.decode(points);

    const coords = decoded.map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng,
    }));

    setRouteCoords(coords);

    // Distance et durée restantes
    const leg = json.routes[0].legs[0];
    setDistanceLeft((leg.distance.value / 1000).toFixed(1));
    setEta(Math.round(leg.duration.value / 60));

    // Ajustement carte
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 80, bottom: 80, left: 80, right: 80 },
      animated: true,
    });
  };

  // SOCKETS Chauffeur → Destination
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    socket.on("chauffeur_position", (pos) => {
      if (pos.id !== chauffeur.id) return;

      const newPos = {
        latitude: pos.lat,
        longitude: pos.lon,
      };

      setChauffeurPos(newPos);

      // recalcul itinéraire
      fetchRoute(newPos.latitude, newPos.longitude);
    });

    setLoaded(true);

    return () => socket.disconnect();
  }, []);

  if (!loaded || !chauffeurPos) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#d4af37" />
        <Text style={styles.loadingText}>Course en cours…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* MAP */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={false}
        initialRegion={{
          latitude: chauffeurPos.latitude,
          longitude: chauffeurPos.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
      >
        {/* Chauffeur */}
        <Marker coordinate={chauffeurPos} anchor={{ x: 0.5, y: 0.5 }}>
          <Image
            source={require("../../assets/cars/premium_car.png")}
            style={{ width: 50, height: 50 }}
          />
        </Marker>

        {/* Destination */}
        <Marker
          coordinate={{
            latitude: destination.lat,
            longitude: destination.lon,
          }}
        >
          <Ionicons name="flag" size={40} color="black" />
        </Marker>

        {/* Trajet */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={6}
            strokeColor="#4a8cff"
          />
        )}
      </MapView>

      {/* PANEL INFOS */}
      <View style={styles.infoPanel}>
        <Text style={styles.title}>En course 🚗</Text>

        <Text style={styles.infoText}>
          Temps restant : <Text style={styles.bold}>{eta} min</Text>
        </Text>
        <Text style={styles.infoText}>
          Distance restante :{" "}
          <Text style={styles.bold}>{distanceLeft} km</Text>
        </Text>

        <Text style={styles.small}>
          Destination : {destination.address}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  map: { flex: 1 },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 18,
  },

  infoPanel: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#111",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  title: {
    color: "#d4af37",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  infoText: {
    color: "white",
    fontSize: 18,
    marginVertical: 3,
  },
  bold: {
    color: "#d4af37",
    fontWeight: "bold",
  },
  small: {
    color: "#aaa",
    marginTop: 10,
    fontSize: 14,
  },
});
