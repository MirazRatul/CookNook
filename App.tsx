import React, { useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store, RootState } from './src/store/store';
import { toggleFavorite, setSelectedRecipe } from './src/store/slices/recipesSlice';
import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { RecipeDetailsScreen } from './src/screens/RecipeDetailsScreen';
import { CreateRecipeScreen } from './src/screens/CreateRecipeScreen';
import { RecipeCard } from './src/components/RecipeCard';
import { Ionicons } from '@expo/vector-icons';
import './global.css';

// Root App Component
export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <AppContent />
      </SafeAreaView>
    </Provider>
  );
}

// Inner App Content with Store Access
function AppContent() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'Home' | 'Explore' | 'Favorites' | 'Create'>('Home');
  const [currentScreen, setCurrentScreen] = useState<'Tabs' | 'Details'>('Tabs');
  const [prevTab, setPrevTab] = useState<'Home' | 'Explore' | 'Favorites'>('Home');

  const { recipes, favorites } = useSelector((state: RootState) => state.recipes);

  const navigateTo = (screenName: string) => {
    if (screenName === 'Details') {
      // Remember where we came from so we go back to the correct tab
      if (activeTab !== 'Create') {
        setPrevTab(activeTab);
      }
      setCurrentScreen('Details');
    } else {
      setCurrentScreen('Tabs');
      setActiveTab(screenName as any);
    }
  };

  const handleBackFromDetails = () => {
    setCurrentScreen('Tabs');
    setActiveTab(prevTab);
  };

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen onNavigate={navigateTo} />;
      case 'Explore':
        return <ExploreScreen onNavigate={navigateTo} />;
      case 'Create':
        return <CreateRecipeScreen onNavigate={navigateTo} />;
      case 'Favorites':
        return <FavoritesTab onNavigate={navigateTo} />;
      default:
        return <HomeScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <View className="flex-1 relative bg-white">
      {currentScreen === 'Details' ? (
        <RecipeDetailsScreen onBack={handleBackFromDetails} />
      ) : (
        <View className="flex-1">
          {renderTabContent()}

          {/* Reusable Bottom Navigation Tab Bar */}
          <View className="absolute bottom-5 left-6 right-6 h-16 bg-gray-900 rounded-[28px] shadow-lg flex-row items-center justify-around px-4 border border-gray-800">
            {/* Tab: Home */}
            <TouchableOpacity
              onPress={() => setActiveTab('Home')}
              className="items-center justify-center p-2"
              activeOpacity={0.8}
            >
              <Ionicons
                name={activeTab === 'Home' ? 'home' : 'home-outline'}
                size={22}
                color={activeTab === 'Home' ? '#f59e0b' : '#9ca3af'}
              />
              <Text
                className={`text-[10px] mt-0.5 font-bold ${
                  activeTab === 'Home' ? 'text-primary-500' : 'text-gray-400'
                }`}
              >
                Home
              </Text>
            </TouchableOpacity>

            {/* Tab: Explore */}
            <TouchableOpacity
              onPress={() => setActiveTab('Explore')}
              className="items-center justify-center p-2"
              activeOpacity={0.8}
            >
              <Ionicons
                name={activeTab === 'Explore' ? 'search' : 'search-outline'}
                size={22}
                color={activeTab === 'Explore' ? '#f59e0b' : '#9ca3af'}
              />
              <Text
                className={`text-[10px] mt-0.5 font-bold ${
                  activeTab === 'Explore' ? 'text-primary-500' : 'text-gray-400'
                }`}
              >
                Explore
              </Text>
            </TouchableOpacity>

            {/* Tab: Create */}
            <TouchableOpacity
              onPress={() => setActiveTab('Create')}
              className="items-center justify-center p-2"
              activeOpacity={0.8}
            >
              <Ionicons
                name={activeTab === 'Create' ? 'add-circle' : 'add-circle-outline'}
                size={24}
                color={activeTab === 'Create' ? '#f59e0b' : '#9ca3af'}
              />
              <Text
                className={`text-[10px] mt-0.5 font-bold ${
                  activeTab === 'Create' ? 'text-primary-500' : 'text-gray-400'
                }`}
              >
                Create
              </Text>
            </TouchableOpacity>

            {/* Tab: Favorites */}
            <TouchableOpacity
              onPress={() => setActiveTab('Favorites')}
              className="items-center justify-center p-2"
              activeOpacity={0.8}
            >
              <Ionicons
                name={activeTab === 'Favorites' ? 'heart' : 'heart-outline'}
                size={22}
                color={activeTab === 'Favorites' ? '#f59e0b' : '#9ca3af'}
              />
              <Text
                className={`text-[10px] mt-0.5 font-bold ${
                  activeTab === 'Favorites' ? 'text-primary-500' : 'text-gray-400'
                }`}
              >
                Favorites
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// Favorites Tab Screen
interface FavoritesTabProps {
  onNavigate: (screen: string) => void;
}

function FavoritesTab({ onNavigate }: FavoritesTabProps) {
  const dispatch = useDispatch();
  const { recipes, favorites } = useSelector((state: RootState) => state.recipes);

  const favoriteRecipes = recipes.filter((recipe) => favorites.includes(recipe.id));

  const handleRecipePress = (recipe: any) => {
    dispatch(setSelectedRecipe(recipe));
    onNavigate('Details');
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-6 pb-2 border-b border-gray-100">
        <Text className="text-2xl font-black text-gray-900 mb-2">My Favorites</Text>
      </View>
      <View className="flex-1 bg-gray-50/50">
        {favoriteRecipes.length > 0 ? (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {favoriteRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={true}
                onPress={() => handleRecipePress(recipe)}
                onToggleFavorite={() => dispatch(toggleFavorite(recipe.id))}
                horizontal
              />
            ))}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center p-8">
            <Ionicons name="heart-outline" size={64} color="#9ca3af" className="opacity-40" />
            <Text className="text-gray-900 font-extrabold text-lg mt-4">No favorites yet</Text>
            <Text className="text-gray-400 text-sm mt-1 text-center max-w-[240px]">
              Tap the heart icon on any recipe to save it here for quick access later!
            </Text>
            <TouchableOpacity
              onPress={() => onNavigate('Explore')}
              className="mt-6 bg-primary-500 px-6 py-2.5 rounded-full"
            >
              <Text className="text-white font-bold text-sm">Find Recipes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
