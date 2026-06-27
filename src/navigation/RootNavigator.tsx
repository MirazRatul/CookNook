import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SplashScreenView } from "../screens/SplashScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { SignInScreen } from "../screens/auth/SignInScreen";
import { SignUpScreen } from "../screens/auth/SignUpScreen";
import { RecipeDetailsScreen } from "../screens/RecipeDetailsScreen";
import { ProfileScreen } from "../screens/user/ProfileScreen";
import { UserRecipeScreen } from "../screens/user/UserRecipe";
import { MainTabs } from "./MainTabs";
import { RootStackParamList } from "./types";
import { Colors } from "../constants/Colors";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: Colors.white },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreenView} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="UserRecipe" component={UserRecipeScreen} />
      <Stack.Screen
        name="RecipeDetails"
        component={RecipeDetailsScreen}
        options={{ animation: "fade" }}
      />
    </Stack.Navigator>
  );
}
