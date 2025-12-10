import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function Finish() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const distance = params.distance;
  const duration = params.duration;
  const price = params.price;
  const date = params.date;
  const pdfUrl = Array.isArray(params.pdf) ? params.pdf[0] : params.pdf;

  return (
    <View style={styles.container}>
      <Text style={styles.congrats}>🎉 Course Terminée</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Résumé de votre course</Text>

        <Text style={styles.item}>Distance : {distance} km</Text>
        <Text style={styles.item}>Durée : {duration} min</Text>
        <Text style={styles.item}>Date : {date}</Text>

        <Text style={styles.totalPrice}>{price} €</Text>
      </View>

      {/* Bouton PDF */}
      <TouchableOpacity
        style={styles.pdfBtn}
        onPress={() => Linking.openURL(pdfUrl)}
      >
        <Ionicons name="document-text-outline" size={28} color="white" style={{ marginRight: 10 }} />
        <Text style={styles.pdfText}>Télécharger le reçu PDF</Text>
      </TouchableOpacity>

      {/* Retour */}
      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => router.push("/")}
      >
        <Text style={styles.homeText}>Retour à l’accueil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: 60,
    alignItems: "center",
  },

  congrats: {
    color: "#d4af37",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    width: "90%",
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
  },

  title: {
    color: "#d4af37",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },

  item: {
    color: "white",
    fontSize: 17,
    marginTop: 5,
  },

  totalPrice: {
    color: "#d4af37",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 15,
  },

  pdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },

  pdfText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },

  homeBtn: {
    marginTop: 25,
    backgroundColor: "#d4af37",
    paddingVertical: 13,
    paddingHorizontal: 50,
    borderRadius: 30,
  },

  homeText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
});
