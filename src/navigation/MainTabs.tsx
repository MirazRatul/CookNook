import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { CreateRecipeScreen } from '../screens/CreateRecipeScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { MainTabParamList } from './types';

type IconName = keyof typeof Ionicons.glyphMap;

type TabRoute = {
  name: keyof MainTabParamList;
  label: string;
  component: React.ComponentType<any>;
  icon: IconName;
  activeIcon: IconName;
};

const TAB_ROUTES: TabRoute[] = [
  {
    name: 'Home',
    label: 'Home',
    component: HomeScreen,
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    name: 'Explore',
    label: 'Explore',
    component: ExploreScreen,
    icon: 'search-outline',
    activeIcon: 'search',
  },
  {
    name: 'Create',
    label: 'Create',
    component: CreateRecipeScreen,
    icon: 'add-circle-outline',
    activeIcon: 'add-circle',
  },
  {
    name: 'Favorites',
    label: 'Favorites',
    component: FavoritesScreen,
    icon: 'heart-outline',
    activeIcon: 'heart',
  },
];

const Tab = createBottomTabNavigator<MainTabParamList>();

function CookNookTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12);

  return (
    <View
      className="absolute left-6 right-6 h-16 bg-gray-900 rounded-[28px] shadow-lg flex-row items-center justify-around px-4 border border-gray-800"
      style={{ bottom: bottomOffset }}
    >
      {state.routes.map((route, index) => {
        const options = descriptors[route.key].options;
        const isFocused = state.index === index;
        const config = TAB_ROUTES.find((item) => item.name === route.name);
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : options.title ?? config?.label ?? route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            className="items-center justify-center p-2"
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
          >
            <Ionicons
              name={isFocused ? config?.activeIcon ?? 'ellipse' : config?.icon ?? 'ellipse-outline'}
              size={route.name === 'Create' ? 24 : 22}
              color={isFocused ? '#f59e0b' : '#9ca3af'}
            />
            <Text
              className={`text-[10px] mt-0.5 font-bold ${
                isFocused ? 'text-primary-500' : 'text-gray-400'
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CookNookTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#ffffff' },
        tabBarHideOnKeyboard: true,
      }}
    >
      {TAB_ROUTES.map((route) => (
        <Tab.Screen
          key={route.name}
          name={route.name}
          component={route.component}
          options={{ title: route.label }}
        />
      ))}
    </Tab.Navigator>
  );
}
