import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import locations from '../../data/locations.json'; 
import MapViewComponent from '../../components/MapViewComponent'; 
import LocationList from '../../components/LocationList'; 
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// --- INTERFEȚE ---
interface Coordinates {
    lat: number;
    long: number;
}
// 💡 NOTĂ: Am eliminat "id: number" din interfața de bază pentru că nu e în JSON
interface JsonLocationItem {
    name: string;
    address: string;
    coordinates: Coordinates;
    image_url: string;
    short_description: string;
    rating: number;
}
// 💡 NOU: Definirea structurii complete, inclusiv ID-ul adăugat
interface LocationItem extends JsonLocationItem {
    id: number; 
}

// 💡 CORECTARE: Adaugă ID-ul (indexul) la fiecare obiect după import
const locationData: LocationItem[] = (locations as JsonLocationItem[]).map((loc, index) => ({
    ...loc,
    id: index, // Adaugă ID-ul bazat pe index
}));

const ExplorePage = () => {
  const [isMapView, setIsMapView] = useState(true); 
  const [searchTerm, setSearchTerm] = useState(''); 
  
  // 💡 CORECȚIE FINALĂ: MUTĂ CALCULUL filteredLocations AICI, DUPĂ useState
  const filteredLocations = locationData.filter(location => 
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // showSuggestions folosește filteredLocations, care e definit acum
  const showSuggestions = searchTerm.length > 0 && filteredLocations.length > 0;
  
  const navigation = useNavigation();
  const router = useRouter(); // 💡 Adaugă useRouter

  const toggleView = () => {
    setIsMapView(prev => !prev);
  };

  useEffect(() => {
      navigation.setOptions({
          headerShown: true, 
          headerTitle: isMapView ? 'Explorează pe Hartă' : 'Feed Locații',
          headerRight: () => (
              <Button 
                  title={isMapView ? "Listă" : "Hartă"}
                  onPress={toggleView}
                  color="#007AFF"
              />
          ),
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontWeight: 'bold' }
      });
  }, [navigation, isMapView]);
  
  const renderSuggestionItem = ({ item }: { item: LocationItem }) => (
    <TouchableOpacity 
      style={styles.suggestionItem} 
      onPress={() => {
        setSearchTerm(item.name); 
        router.push(`/locations/${item.id}`); 
      }}
    >
        {/* 💡 SOLUȚIA FINALĂ: Unificăm totul într-un singur bloc <Text> */}
        <Text style={styles.suggestionTextWrapper}>
            {/* Ionicons cu spațiu pe dreapta (marginRight) */}
            <Ionicons name="location-outline" size={16} color="#444" style={{ marginRight: 10 }} />
            
            {/* Textul alăturat direct, fără spații în JSX */}
            {item.name} 
        </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* 1. BARA DE CĂUTARE (FIXATĂ SUS) */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Caută după nume sau adresă..."
            placeholderTextColor="#888"
            value={searchTerm}
            onChangeText={setSearchTerm}
            clearButtonMode="while-editing" 
          />
          <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.searchIcon}>
            <Ionicons name="search" size={24} color="#888" /> 
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 2. SUGGESTIONS DROPDOWN (Randat în afara containerului principal) */}
      {showSuggestions && (
          <FlatList
            style={styles.suggestionsDropdown}
            data={filteredLocations}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderSuggestionItem}
            keyboardShouldPersistTaps="always"
          />
      )}
      
      {/* 3. CONTAINERUL PRINCIPAL (Contine Harta/Lista) */}
      <View style={styles.container}>
        
        {/* HARTA/LISTA (O SINGURĂ DATĂ) */}
        {isMapView ? (
          <MapViewComponent locations={filteredLocations} />
        ) : (
          <LocationList locations={filteredLocations} />
        )}
        
        {/* Mesaj dacă nu există rezultate */}
        {!showSuggestions && filteredLocations.length === 0 && searchTerm.length > 0 && (
            <View style={styles.noResults}>
                <Text style={styles.noResultsText}>Nu s-au găsit locații pentru "{searchTerm}".</Text>
            </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { 
      flex: 1,
      // 💡 ADAUGĂ MARGIN TOP pentru a evita ca harta să fie sub searchbar
      marginTop: 80, // Ajustează valoarea în funcție de înălțimea searchbar-ului
  },
  
  // 💡 STILURI NOI PENTRU SEARCHBAR FIXAT SUS
  searchContainer: {
    position: 'absolute', // Poziționare absolută
    top: 0, // Lipit de sus
    left: 0, 
    right: 0,
    zIndex: 10, // Asigură că bara este deasupra hărții
    padding: 10, // Padding intern
    paddingTop: 40, // 💡 Ajustat pentru a trece peste status bar-ul telefonului
    backgroundColor: '#fff', 
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 3, // Umbră subtilă pentru Android
    shadowColor: '#000', // Umbră subtilă pentru iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInputWrapper: {
    flexDirection: 'row', // Aliniază input-ul și iconița pe aceeași linie
    alignItems: 'center', // Centrează vertical
    backgroundColor: '#f5f5f5',
    borderRadius: 25, // Rază mai mare pentru un aspect modern
    paddingHorizontal: 15,
    height: 50, // Înălțime fixă pentru wrapper
  },
  searchInput: {
    flex: 1, // Permite input-ului să ocupe tot spațiul disponibil
    fontSize: 16,
    color: '#333',
    paddingVertical: 0, // Elimină padding-ul vertical implicit
  },
  searchIcon: {
    marginLeft: 10, // Spațiu între input și iconiță
    padding: 5, // Zona de tap pentru iconiță
  },
  noResults: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 10,
  },
  noResultsText: {
      fontSize: 18,
      color: '#888',
  },
  suggestionsDropdown: {
    position: 'absolute',
    // 💡 CORECȚIE: Setează TOP-ul la înălțimea barei de căutare. 
    // Valoarea de 100-110px este sigură.
    top: 110, // Aici se va începe să randeze
    left: 10, // Aliniează-l cu padding-ul de 10 din searchContainer
    right: 10,
    zIndex: 11, // 💡 NOU: Trebuie să fie deasupra tuturor (inclusiv searchContainer)
    maxHeight: 300, 
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowOpacity: 0.2,
    elevation: 5,
},
suggestionItem: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    backgroundColor: '#fff',
},
suggestionTextWrapper: {
    fontSize: 16,
    color: '#333',
},
});

export default ExplorePage;