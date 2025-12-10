import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Premium VTC Client 🚘</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/reservation")}
      >
        <Text style={styles.buttonText}>Réserver maintenant</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#d4af37",
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 30,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
});
