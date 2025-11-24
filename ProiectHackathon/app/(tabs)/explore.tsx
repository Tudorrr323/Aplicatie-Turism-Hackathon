import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, FlatList, Text, useColorScheme, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import locations from '../../data/locations.json'; 
import MapViewComponent from '../../components/MapViewComponent'; 
import LocationList from '../../components/LocationList'; 
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface Coordinates { lat: number; long: number; }
interface JsonLocationItem { name: string; address: string; coordinates: Coordinates; image_url: string; short_description: string; rating: number; }
interface LocationItem extends JsonLocationItem { id: number; }
const locationData: LocationItem[] = (locations as JsonLocationItem[]).map((loc, index) => ({ ...loc, id: index }));

const ExplorePage = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light']; 
  const [isMapView, setIsMapView] = useState(true); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [focusedLocationId, setFocusedLocationId] = useState<number | null>(null);

  const filteredLocations = locationData.filter(location => location.name.toLowerCase().includes(searchTerm.toLowerCase()) || location.address.toLowerCase().includes(searchTerm.toLowerCase()));
  const showSuggestions = searchTerm.length > 0 && filteredLocations.length > 0;
  const navigation = useNavigation();
  const router = useRouter(); 
  const toggleView = () => { setIsMapView(prev => !prev); };

  useEffect(() => { navigation.setOptions({ headerShown: false }); }, [navigation]);
  
  const renderSuggestionItem = ({ item }: { item: LocationItem }) => (
    <TouchableOpacity style={[styles.suggestionItem, { borderBottomColor: theme.border, backgroundColor: theme.card }]} onPress={() => { setSearchTerm(item.name); if (isMapView) { setFocusedLocationId(item.id); } else { router.push(`/locations/${item.id}`); } }}>
        <View style={styles.suggestionContentWrapper}> 
            <Ionicons name="location" size={18} color={theme.tint} style={{ marginRight: 10 }} />
            <Text style={[styles.suggestionText, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
        </View>
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1, backgroundColor: theme.background, position: 'relative'}}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      {isMapView ? (
        <MapViewComponent locations={locationData} focusedLocationId={focusedLocationId} />
      ) : (
        <LocationList locations={filteredLocations} />
      )}
      <SafeAreaView edges={['top']} style={{position: 'absolute', top: 0, left: 0, right: 0}} />
      <View style={styles.floatingHeader}>
        <View style={styles.searchBarRow}>
            <View style={[styles.searchInputWrapper, { backgroundColor: theme.searchBar }]}>
                <Ionicons name="search" size={20} color={theme.searchIcon} style={{ marginLeft: 10 }} />
                <TextInput style={[styles.searchInput, { color: theme.text }]} placeholder="Caută locații..." placeholderTextColor={theme.textSecondary} value={searchTerm} onChangeText={(text) => { setSearchTerm(text); setFocusedLocationId(null); }} clearButtonMode="while-editing" />
                {searchTerm.length > 0 && (<TouchableOpacity onPress={() => setSearchTerm('')} style={{padding: 5}}><Ionicons name="close-circle" size={18} color={theme.searchIcon} /></TouchableOpacity>)}
            </View>
            <TouchableOpacity onPress={toggleView} style={[styles.toggleButton, { backgroundColor: theme.tint }]}>
                <Ionicons name={isMapView ? "list" : "map"} size={22} color="#fff" />
            </TouchableOpacity>
        </View>
        {showSuggestions && focusedLocationId === null && (
            <View style={[styles.suggestionsWrapper, { backgroundColor: theme.card }]}>
                <FlatList data={filteredLocations} keyExtractor={(item) => String(item.id)} renderItem={renderSuggestionItem} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} />
            </View>
        )}
      </View>
      {!isMapView && !showSuggestions && filteredLocations.length === 0 && searchTerm.length > 0 && (
          <View style={styles.noResults}><Ionicons name="search-outline" size={50} color={theme.textSecondary} /><Text style={[styles.noResultsText, { color: theme.textSecondary }]}>Nu am găsit locații.</Text></View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  floatingHeader: { position: 'absolute', top: 60, left: 20, right: 20, zIndex: 100, backgroundColor: 'transparent' },
  searchBarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 25, height: 50, marginRight: 10, paddingHorizontal: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 8 },
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
      marginTop: 0 
  },
});

export default ExplorePage;