import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SplashScreenView } from "../screens/SplashScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { RecipeDetailsScreen } from "../screens/RecipeDetailsScreen";
import { MainTabs } from "./MainTabs";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreenView} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="RecipeDetails"
        component={RecipeDetailsScreen}
        options={{ animation: "fade" }}
      />
    </Stack.Navigator>
  );
}
