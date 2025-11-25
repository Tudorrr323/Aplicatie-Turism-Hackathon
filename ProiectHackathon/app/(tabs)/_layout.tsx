import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { ViewModeProvider, useViewMode } from './ViewModeContext';
import { ChatbotProvider, useChatbot } from '../../components/ChatbotContext';
import { ChatbotActionProvider } from '../../components/ChatbotActionContext';
import ChatbotModal from '../../components/ChatbotModal';
import { AuthProvider } from '../../context/AuthProvider';

const CustomTabBarButton = () => {
  const { isMapView, toggleView } = useViewMode();
  return (
    <TouchableOpacity
      onPress={toggleView}
      style={{
        alignSelf: 'center', // Centrează butonul în spațiul său
        top: -25,
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#007AFF',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <Ionicons name={isMapView ? "list" : "map"} size={32} color="#fff" />
    </TouchableOpacity>
  );
};

export const ChatbotFab = () => {
  const { toggleChat } = useChatbot();
  return (
    <TouchableOpacity
      onPress={toggleChat}
      style={{
        position: 'absolute',
        bottom: 80,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.light.tint,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
      }}
    >
      <Ionicons name="chatbubbles-outline" size={30} color="#fff" />
    </TouchableOpacity>
  );
};

const TabLayoutContent = () => {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF', headerShown: false, tabBarStyle: { height: 60 } }}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ title: 'Explorează', tabBarIcon: ({ color }) => <FontAwesome name="map-o" color={color} size={24} /> }} />
      <Tabs.Screen
        name="toggle"
        options={{
          title: '',
          tabBarButton: () => <CustomTabBarButton />,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color }) => <FontAwesome name="user-circle-o" color={color} size={24} /> }} />
    </Tabs>
  );
};

export default function TabLayout() {
  return (
    <AuthProvider>
      <ChatbotActionProvider>
        <ChatbotProvider>
          <ViewModeProvider>
            <TabLayoutContent />
            <ChatbotModal />
            <ChatbotFab />
          </ViewModeProvider>
        </ChatbotProvider>
      </ChatbotActionProvider>
    </AuthProvider>
  );
}