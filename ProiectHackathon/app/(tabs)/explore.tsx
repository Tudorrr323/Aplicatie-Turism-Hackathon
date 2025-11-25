import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, FlatList, Text, useColorScheme, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import allCities from '../../data/romanian_cities.json';
import locations from '../../data/locations.json'; 
import MapViewComponent from '../../components/MapViewComponent'; 
import LocationList from '../../components/LocationList'; 
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useViewMode } from './ViewModeContext';
import { useChatbotAction } from '../../components/ChatbotActionContext';
import FilterModal, { Filters } from '../../components/FilterModal';

interface Coordinates { lat: number; long: number; }
interface JsonLocationItem { name: string; address: string; coordinates: Coordinates; image_url: string; short_description: string; rating: number; }
interface LocationItem extends JsonLocationItem { id: number; }
interface CityItem { name: string; coordinates: Coordinates; }
interface RomanianCity { name: string; lat: number; lng: number; }

// Datele locațiilor și orașelor
const locationData: LocationItem[] = (locations as JsonLocationItem[]).map((loc, index) => ({ ...loc, id: index }));

// Folosim lista completă de orașe din România
const cities: CityItem[] = (allCities as RomanianCity[]).map(city => ({
    name: city.name,
    coordinates: { lat: city.lat, long: city.lng }
}));

// Funcție pentru a normaliza numele orașelor pentru comparații (ex: București -> Bucharest)
const normalizeCityName = (name: string) => {
    if (name === 'București') return 'Bucharest';
    return name;
};

const ExplorePage = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light']; 
  const { isMapView, toggleView } = useViewMode();
  const [searchTerm, setSearchTerm] = useState(''); 
  const [focusedLocationId, setFocusedLocationId] = useState<number | null>(null);
  const [focusedCity, setFocusedCity] = useState<CityItem | null>(null);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const { action, clearAction } = useChatbotAction();
  const [activeFilters, setActiveFilters] = useState<Filters>({ city: 'all', minRating: 0, sortBy: 'default' });

  // Aplică filtrele și căutarea
  const getFilteredAndSortedLocations = () => {
    let result = locationData
      // Filtrare după căutare
      .filter(location => location.name.toLowerCase().includes(searchTerm.toLowerCase()) || location.address.toLowerCase().includes(searchTerm.toLowerCase()))
      // Filtrare după oraș
      .filter(location => {
          if (activeFilters.city === 'all') return true;
          return location.address.includes(normalizeCityName(activeFilters.city));
      })
      // Filtrare după rating
      .filter(location => location.rating >= activeFilters.minRating);

    // Sortare
    switch (activeFilters.sortBy) {
      case 'rating_asc': result.sort((a, b) => a.rating - b.rating); break;
      case 'rating_desc': result.sort((a, b) => b.rating - a.rating); break;
      case 'name_asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return result;
  };

  const displayedLocations = getFilteredAndSortedLocations();
  const isFilterActive = activeFilters.city !== 'all' || activeFilters.minRating > 0 || activeFilters.sortBy !== 'default';

  // Filtrare orașe pentru sugestii de căutare
  const searchFilteredCities = cities.filter(city => city.name.toLowerCase().includes(searchTerm.toLowerCase()));
  // Filtrare locații doar pentru sugestii de căutare (fără filtrele avansate)
  const searchFilteredLocations = locationData.filter(location => location.name.toLowerCase().includes(searchTerm.toLowerCase()) || location.address.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Combină rezultatele pentru a le afișa în lista de sugestii
  const suggestions = [
    // Afișăm orașele primele în sugestii
    ...searchFilteredCities.map(city => ({ ...city, type: 'city' })),
    ...searchFilteredLocations.map(location => ({ ...location, type: 'location' }))
  ];
  const showSuggestions = searchTerm.length > 0 && suggestions.length > 0;

  const navigation = useNavigation();
  const router = useRouter(); 

  useEffect(() => { navigation.setOptions({ headerShown: false }); }, [navigation]);
  
  // Execută acțiunile primite de la chatbot
  useEffect(() => {
    if (action?.type === 'navigate_to_location' && 'id' in action.payload) {
      const { id } = action.payload;
      // Comută pe hartă dacă nu suntem deja acolo
      if (!isMapView) {
        toggleView();
      }
      setFocusedLocationId(id); // Setează locația pentru a fi focusată pe hartă
      clearAction();
    } else if (action?.type === 'apply_city_filter' && 'city' in action.payload) {
      const { city } = action.payload;
      handleApplyFilters({ ...activeFilters, city });
      if (!isMapView) toggleView(); // Comută pe hartă dacă nu suntem deja acolo
      clearAction();
    }
  }, [action]);

  const handleApplyFilters = (newFilters: Filters) => {
    setActiveFilters(newFilters);

    if (newFilters.city !== 'all') {
        const cityObject = cities.find(c => c.name === newFilters.city);
        if (cityObject) {
            setFocusedCity(cityObject);
            setFocusedLocationId(null); // Resetează locația focusată
        }
    } else {
        setFocusedCity(null); // Resetează focusul pe oraș dacă se alege "Toate"
    }
  };
  const handleSuggestionPress = (item: any) => {
    setSearchTerm(item.name);
    if (item.type === 'city') {
      setFocusedCity(item);
      setFocusedLocationId(null); // Resetează locația focusată
    } else { // type === 'location'
      setFocusedCity(null); // Resetează orașul focusat
      if (isMapView) { setFocusedLocationId(item.id); } else { router.push(`/locations/${item.id}`); }
    }
  };

  const renderSuggestionItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.suggestionItem, { borderBottomColor: theme.border, backgroundColor: theme.card }]} onPress={() => handleSuggestionPress(item)}>
        <View style={styles.suggestionContentWrapper}> 
            <Ionicons name={item.type === 'city' ? "business" : "location"} size={18} color={theme.tint} style={{ marginRight: 10 }} />
            <Text style={[styles.suggestionText, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1, backgroundColor: theme.background, position: 'relative'}}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      {isMapView ? (
        <MapViewComponent locations={displayedLocations} focusedLocationId={focusedLocationId} focusedCity={focusedCity} />
      ) : (
        <LocationList locations={displayedLocations} />
      )}
      <SafeAreaView edges={['top']} style={{position: 'absolute', top: 0, left: 0, right: 0}} />
      <View style={styles.floatingHeader}>
        <View style={styles.searchBarRow}>
            <View style={[styles.searchInputWrapper, { backgroundColor: theme.searchBar }]}>
                <Ionicons name="search" size={20} color={theme.searchIcon} style={{ marginLeft: 10 }} />
                <TextInput style={[styles.searchInput, { color: theme.text }]} placeholder="Caută locații sau orașe..." placeholderTextColor={theme.textSecondary} value={searchTerm} onChangeText={(text) => { setSearchTerm(text); setFocusedLocationId(null); setFocusedCity(null); }} clearButtonMode="while-editing" />
                {searchTerm.length > 0 && (<TouchableOpacity onPress={() => setSearchTerm('')} style={{padding: 5}}><Ionicons name="close-circle" size={18} color={theme.searchIcon} /></TouchableOpacity>)}
            </View>
            <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={[styles.toggleButton, { backgroundColor: theme.searchBar, marginRight: 10 }]}>
                <Ionicons name="options-outline" size={22} color={theme.tint} />
                {isFilterActive && <View style={styles.filterDot} />}
            </TouchableOpacity>
        </View>
        {isMapView && showSuggestions && focusedLocationId === null && (
            <View style={[styles.suggestionsWrapper, { backgroundColor: theme.card }]}>
                <FlatList 
                    data={suggestions} 
                    keyExtractor={(item, index) => {
                        const keyId = 'id' in item ? item.id : item.name;
                        return `${item.type}-${keyId}-${index}`;
                    }} 
                    renderItem={renderSuggestionItem} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} />
            </View>
        )}
      </View>
      <FilterModal 
        visible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={activeFilters}
        cities={cities.map(c => c.name)}
      />
      {!isMapView && !showSuggestions && displayedLocations.length === 0 && (searchTerm.length > 0 || isFilterActive) && (
          <View style={styles.noResults}><Ionicons name="search-outline" size={50} color={theme.textSecondary} /><Text style={[styles.noResultsText, { color: theme.textSecondary }]}>Nu am găsit locații.</Text></View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  floatingHeader: { position: 'absolute', top: 60, left: 20, right: 20, zIndex: 100, backgroundColor: 'transparent' },
  searchBarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 25, height: 50, paddingHorizontal: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 8, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, paddingHorizontal: 10, height: '100%' },
  toggleButton: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  suggestionsWrapper: { marginTop: 10, borderRadius: 16, maxHeight: 220, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, overflow: 'hidden' },
  suggestionItem: { padding: 15, borderBottomWidth: 1 },
  suggestionContentWrapper: { flexDirection: 'row', alignItems: 'center' },
  suggestionText: { fontSize: 15, marginLeft: 10, fontWeight: '500', flex: 1 },
  noResults: { position: 'absolute', top: 120, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 0 },
  noResultsText: { marginTop: 10, fontSize: 16 },
  contentContainer: { 
      flex: 1, // <--- TREBUIE SĂ FIE PREZENT!
      marginTop: 0,
  },
  filterDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#007AFF', borderWidth: 1, borderColor: '#fff' },
});

export default ExplorePage;