import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");

  const handleLogin = () => {
    if (!phone) return alert("Entrez votre numéro WhatsApp");
    navigation.navigate("Reservation", { phone });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion WhatsApp</Text>

      <Text style={styles.label}>Numéro WhatsApp</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex : +213..."
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Continuer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#000" },
  title: { color: "#d4af37", fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 30 },
  label: { color: "#fff", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#d4af37",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#d4af37",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: { color: "#000", textAlign: "center", fontWeight: "bold", fontSize: 16 },
});
