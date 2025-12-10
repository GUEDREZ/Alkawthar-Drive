import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import api from "../services/api";

export default function ClientReservationScreen({ route, navigation }) {
  const { phone } = route.params;

  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [notes, setNotes] = useState("");

  const handleReservation = async () => {
    if (!departure || !arrival) return alert("Remplissez départ et arrivée");

    const res = await api.post("/reservation", {
      phone,
      departure,
      arrival,
      date,
      time,
      passengers,
      notes,
      gender: "Client",
    });

    if (res.data.success) {
      navigation.navigate("Waiting", { rideId: res.data.rideId });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Réservation</Text>

      <TextInput style={styles.input} placeholder="Départ" onChangeText={setDeparture} value={departure}/>
      <TextInput style={styles.input} placeholder="Arrivée" onChangeText={setArrival} value={arrival}/>
      <TextInput style={styles.input} placeholder="Date (2025-11-23)" onChangeText={setDate} value={date}/>
      <TextInput style={styles.input} placeholder="Heure (14:00)" onChangeText={setTime} value={time}/>
      <TextInput style={styles.input} placeholder="Passagers" onChangeText={setPassengers} value={passengers} keyboardType="numeric"/>
      <TextInput style={[styles.input, { height: 80 }]} placeholder="Notes" onChangeText={setNotes} value={notes} multiline/>

      <TouchableOpacity style={styles.button} onPress={handleReservation}>
        <Text style={styles.buttonText}>Envoyer la réservation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 20 },
  title: { color: "#d4af37", fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#d4af37",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginBottom: 15,
  },
  button: { backgroundColor: "#d4af37", padding: 15, borderRadius: 10 },
  buttonText: { color: "#000", textAlign: "center", fontWeight: "bold" },
});
