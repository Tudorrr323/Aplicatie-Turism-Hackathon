import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfilePage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Baranga Tudor</Text>
      <Text style={styles.subtitle}>Developer Hackathon 2025</Text>
      <Text style={styles.text}>Acest ecran îndeplinește cerința de meniu de bază.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
  },
  text: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
  }
});

export default ProfilePage;