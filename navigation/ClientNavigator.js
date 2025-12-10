import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import ClientReservationScreen from "../screens/ClientReservationScreen";
import RideWaitingScreen from "../screens/RideWaitingScreen";

const Stack = createNativeStackNavigator();

export default function ClientNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Reservation" component={ClientReservationScreen} />
      <Stack.Screen name="Waiting" component={RideWaitingScreen} />
    </Stack.Navigator>
  );
}
