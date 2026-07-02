import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { CreateRecipeScreen } from '../screens/CreateRecipeScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { MainTabParamList } from './types';
import { useDispatch } from 'react-redux';
import { auth } from '../services/firebase';
import { getFavoritesAPI, getAllRecipesAPI, getUserLikesAPI } from '../services/recipeService';
import { addFavoriteRecipes, setRecipes } from '../store/slices/recipesSlice';
import { setFavorites } from '../store/slices/favoritesSlice';
import { fetchUserLikes } from '../store/slices/likesSlice';
import { Recipe } from '../constants/mockData';

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
  const layout = useResponsiveLayout();
  const bottomOffset = Math.max(insets.bottom, 12);

  return (
    <View
      className="absolute bg-gray-900 shadow-lg flex-row items-center justify-around px-4 border border-gray-800"
      style={{
        left: layout.tabBar.horizontalInset,
        right: layout.tabBar.horizontalInset,
        bottom: bottomOffset,
        height: layout.tabBar.height,
        borderRadius: layout.tabBar.radius,
      }}
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
              color={isFocused ? Colors.primary[500] : Colors.gray[400]}
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
  const dispatch = useDispatch();

  useEffect(() => {
    const initAppData = async () => {
      try {
        const user = auth().currentUser;
        if (!user) return;

        console.log('🔄 Fetching all recipes from database...');
        const recipesResponse = await getAllRecipesAPI(1, 5);
        if (recipesResponse && recipesResponse.success && recipesResponse.data) {
          const mappedRecipes = recipesResponse.data.recipes.map((r: any): Recipe => ({
            id: r.id.toString(),
            title: r.title,
            description: r.description,
            image: r.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
            duration: r.duration,
            difficulty: r.difficulty,
            calories: r.calories,
            rating: 5.0,
            reviewsCount: 1,
            chefName: r.chef_name,
            chefAvatar: r.chef_avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c',
            category: r.category,
            ingredients: r.ingredients || [],
            instructions: r.instructions || [],
            images: r.images || [],
            userId: r.user_id || undefined,
            videoUrl: r.video_url || undefined,
            likesCount: r.likesCount || 0,
          }));
          dispatch(setRecipes(mappedRecipes));
        }

        console.log('🔄 Fetching user favorites from database...');
        const favResponse = await getFavoritesAPI();
        if (favResponse && favResponse.success && favResponse.data) {
          const { favoriteIds, favoriteRecipes } = favResponse.data;
          if (Array.isArray(favoriteIds)) {
            console.log(`✅ Loaded ${favoriteIds.length} favorites from DB.`);
            dispatch(setFavorites(favoriteIds));
          }
          if (Array.isArray(favoriteRecipes)) {
            const mappedFavRecipes = favoriteRecipes.map((r: any): Recipe => ({
              id: r.id.toString(),
              title: r.title,
              description: r.description,
              image: r.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
              duration: r.duration,
              difficulty: r.difficulty,
              calories: r.calories,
              rating: 5.0,
              reviewsCount: 1,
              chefName: r.chef_name,
              chefAvatar: r.chef_avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c',
              category: r.category,
              ingredients: r.ingredients || [],
              instructions: r.instructions || [],
              images: r.images || [],
              userId: r.user_id || undefined,
              videoUrl: r.video_url || undefined,
              likesCount: r.likesCount || 0,
            }));
            dispatch(addFavoriteRecipes(mappedFavRecipes));
          }
        }
        console.log('🔄 Fetching user likes from database...');
        dispatch(fetchUserLikes());
      } catch (error) {
        console.error('❌ Error initializing app data on MainTabs mount:', error);
      }
    };

    initAppData();
  }, [dispatch]);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CookNookTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.white },
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
