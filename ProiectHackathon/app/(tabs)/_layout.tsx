import React from 'react';
import { Tabs } from 'expo-router';
// Importează iconițe de la Expo (pentru UI/UX polish)
import { FontAwesome } from '@expo/vector-icons'; 

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF', // Blue activ
        headerShown: false, // Nu vrem titluri mari pe tab-uri
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorează',
          tabBarIcon: ({ color }) => <FontAwesome name="map-o" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <FontAwesome name="user-circle-o" color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}