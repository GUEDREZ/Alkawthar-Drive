import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { io } from "socket.io-client";

const SOCKET_URL = "https://vtcidf-backend-1.onrender.com";

export default function Confirmation() {
  const mapRef = useRef(null);

  // PARAMETRES VENANT DE reservation.tsx
  const params = useLocalSearchParams();
  const chauffeur = JSON.parse(params.chauffeur);
  const clientLat = Number(params.clientLat);
  const clientLon = Number(params.clientLon);

  const [chauffeurPos, setChauffeurPos] = useState(null);
  const [etatCourse, setEtatCourse] = useState("en_route");
  const [loaded, setLoaded] = useState(false);

  // WebSocket
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    socket.on("chauffeur_position", (pos) => {
      if (pos.id === chauffeur.id) {
        setChauffeurPos({
          latitude: pos.lat,
          longitude: pos.lon,
        });
      }
    });

    socket.on("etat_course", (etat) => {
      setEtatCourse(etat);
    });

    setLoaded(true);

    return () => socket.disconnect();
  }, []);

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4a8cff" />
        <Text style={{ marginTop: 12, color: "#555" }}>
          Chargement en cours…
        </Text>
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
        initialRegion={{
          latitude: clientLat,
          longitude: clientLon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Position du client */}
        <Marker coordinate={{ latitude: clientLat, longitude: clientLon }}>
          <View style={styles.clientDot} />
        </Marker>

        {/* Position chauffeur */}
        {chauffeurPos && (
          <Marker coordinate={chauffeurPos} anchor={{ x: 0.5, y: 0.5 }}>
            <Image
              source={require("../assets/cars/premium_car.png")}
              style={{ width: 45, height: 45 }}
            />
          </Marker>
        )}
      </MapView>

      {/* PANEL */}
      <View style={styles.panel}>
        <View style={styles.row}>
          <Image
            source={{ uri: chauffeur.photo }}
            style={styles.chauffeurPhoto}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.nom}>{chauffeur.nom}</Text>
            <Text style={styles.note}>★★★★★ 4.9</Text>

            <Text style={styles.status}>
              {etatCourse === "en_route" && "Votre chauffeur est en route 🚗"}
              {etatCourse === "proche" && "Votre chauffeur est proche ⏳"}
              {etatCourse === "arrivé" && "Votre chauffeur est arrivé ✔️"}
            </Text>
          </View>
        </View>

        {/* VEHICULE */}
        <View style={styles.vehicleCard}>
          <Image
            source={{
              uri:
                chauffeur.vehicule_photo ||
                "https://raw.githubusercontent.com/ChatGPTAssets/default_white_car/main/car.png",
            }}
            style={styles.carPhoto}
          />

          <View>
            <Text style={styles.carModel}>
              {chauffeur.vehicule_modele} — {chauffeur.vehicule_couleur}
            </Text>
            <Text style={styles.carPlate}>Plaque : {chauffeur.plaque}</Text>
          </View>
        </View>

        {/* Boutons */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openURL(`tel:${chauffeur.telephone}`)}
          >
            <Text style={styles.buttonText}>📞 Appeler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              Linking.openURL(
                `https://wa.me/${chauffeur.telephone.replace(/\D/g, "")}`
              )
            }
          >
            <Text style={styles.buttonText}>💬 WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonCancel}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  clientDot: {
    width: 14,
    height: 14,
    backgroundColor: "green",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "white",
  },
  panel: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  chauffeurPhoto: {
    width: 80,
    height: 80,
    borderRadius: 50,
    marginRight: 20,
  },
  nom: {
    fontSize: 20,
    fontWeight: "bold",
  },
  note: { color: "#ffcc00", marginTop: 5 },
  status: { marginTop: 8, fontWeight: "600", color: "#444" },
  vehicleCard: {
    marginTop: 20,
    flexDirection: "row",
    backgroundColor: "#eef5ff",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  carPhoto: {
    width: 90,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  carModel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  carPlate: {
    marginTop: 4,
    fontSize: 15,
    color: "#333",
  },
  buttonsRow: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#4a8cff",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonCancel: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  cancelText: {
    color: "white",
    fontWeight: "bold",
  },
});
