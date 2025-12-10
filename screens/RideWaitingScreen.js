import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

export default function RideWaitingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#d4af37" />
      <Text style={styles.text}>Recherche d’un chauffeur...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  text: { color: "#d4af37", marginTop: 20, fontSize: 18 },
});
