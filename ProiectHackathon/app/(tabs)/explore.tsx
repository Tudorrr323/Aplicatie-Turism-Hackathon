import React, { useState, useEffect } from 'react';
// ... (Importuri) ...
import { View, StyleSheet, TextInput, TouchableOpacity, FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import locations from '../../data/locations.json'; 
import MapViewComponent from '../../components/MapViewComponent'; 
import LocationList from '../../components/LocationList'; 
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ... (Interfețe și locationData la fel) ...
interface Coordinates { lat: number; long: number; }
interface JsonLocationItem { name: string; address: string; coordinates: Coordinates; image_url: string; short_description: string; rating: number; }
interface LocationItem extends JsonLocationItem { id: number; }
const locationData: LocationItem[] = (locations as JsonLocationItem[]).map((loc, index) => ({ ...loc, id: index }));

const ExplorePage = () => {
  const [isMapView, setIsMapView] = useState(true); 
  const [searchTerm, setSearchTerm] = useState(''); 
  
  // 💡 NOU: State pentru focus
  const [focusedLocationId, setFocusedLocationId] = useState<number | null>(null);

  const filteredLocations = locationData.filter(location => 
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const showSuggestions = searchTerm.length > 0 && filteredLocations.length > 0;
  const navigation = useNavigation();
  const router = useRouter(); 

  const toggleView = () => { setIsMapView(prev => !prev); };

  useEffect(() => { navigation.setOptions({ headerShown: false }); }, [navigation]);
  
  const renderSuggestionItem = ({ item }: { item: LocationItem }) => (
    <TouchableOpacity 
      style={styles.suggestionItem} 
      onPress={() => {
        // 💡 LOGICA NOUĂ: 
        // 1. Setează textul
        setSearchTerm(item.name); 
        // 2. Dacă suntem pe hartă, ne focusăm pe pin
        if (isMapView) {
            setFocusedLocationId(item.id);
            // Golim search-ul vizual din listă ca să vedem harta, dar păstrăm pin-ul focusat
            // setSearchTerm(''); // Opțional, dacă vrei să dispară dropdown-ul imediat
        } else {
            // Dacă suntem pe listă, mergem la detalii direct
            router.push(`/locations/${item.id}`);
        }
      }}
    >
        <View style={styles.suggestionContentWrapper}> 
            <Ionicons name="location" size={18} color="#007AFF" style={{ marginRight: 10 }} />
            <Text style={styles.suggestionText} numberOfLines={1}>{item.name}</Text>
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1, backgroundColor: '#F5F7FA'}}>
      <SafeAreaView edges={['top']} style={{backgroundColor: 'transparent'}} />

      {/* 1. HEADER PLUTITOR */}
      <View style={styles.floatingHeader}>
        <View style={styles.searchBarRow}>
            <View style={styles.searchInputWrapper}>
                <Ionicons name="search" size={20} color="#8E8E93" style={{ marginLeft: 10 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Caută locații..."
                    placeholderTextColor="#8E8E93"
                    value={searchTerm}
                    onChangeText={(text) => {
                        setSearchTerm(text);
                        setFocusedLocationId(null); // Resetăm focusul când scriem
                    }}
                    clearButtonMode="while-editing" 
                />
                {searchTerm.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchTerm('')} style={{padding: 5}}>
                        <Ionicons name="close-circle" size={18} color="#8E8E93" />
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity onPress={toggleView} style={styles.toggleButton}>
                <Ionicons name={isMapView ? "list" : "map"} size={22} color="#fff" />
            </TouchableOpacity>
        </View>

        {/* 2. SUGGESTIONS (Doar dacă nu avem deja un focus activ pe hartă) */}
        {showSuggestions && focusedLocationId === null && (
            <View style={styles.suggestionsWrapper}>
                <FlatList
                    data={filteredLocations}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderSuggestionItem}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                />
            </View>
        )}
      </View>

      {/* 3. CONTENT */}
      <View style={styles.contentContainer}>
        {isMapView ? (
          <MapViewComponent 
            locations={locationData} // Trimitem TOATE locațiile (să rămână pinii)
            focusedLocationId={focusedLocationId} // Trimitem ID-ul pentru focus/zoom
          />
        ) : (
          <LocationList locations={filteredLocations} />
        )}
      </View>

    </View>
  );
};

// ... (Stilurile rămân la fel ca în versiunea anterioară funcțională) ...
const styles = StyleSheet.create({
  floatingHeader: { position: 'absolute', top: 50, left: 20, right: 20, zIndex: 100 },
  searchBarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  searchInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 25, height: 50, marginRight: 10, paddingHorizontal: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#1C1C1E', paddingHorizontal: 10, height: '100%' },
  toggleButton: {
      width: 50, height: 50, borderRadius: 25, backgroundColor: '#007AFF',
      justifyContent: 'center', alignItems: 'center',
      shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  suggestionsWrapper: {
    marginTop: 10, backgroundColor: '#fff', borderRadius: 16, maxHeight: 220,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
    overflow: 'hidden'
  },
  suggestionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  suggestionContentWrapper: { flexDirection: 'row', alignItems: 'center' },
  suggestionText: { fontSize: 15, color: '#1C1C1E', marginLeft: 10, fontWeight: '500', flex: 1 },
  contentContainer: { flex: 1 }, 
  noResults: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 0 },
  noResultsText: { marginTop: 10, color: '#8E8E93', fontSize: 16 },
});

export default ExplorePage;