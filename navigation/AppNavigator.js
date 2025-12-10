import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ClientNavigator from "./ClientNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientNavigator" component={ClientNavigator} />
    </Stack.Navigator>
  );
}
