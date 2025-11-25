import React from 'react';
import { FlatList, StyleSheet, View, Text, useColorScheme } from 'react-native';
import LocationCard from './LocationCard';
import { Colors } from '../constants/Colors';

// Definirea structurii datelor pentru o locație, pentru claritate
interface Coordinates { lat: number; long: number; }
interface LocationItem { id: number; name: string; address: string; coordinates: Coordinates; image_url: string; short_description: string; rating: number; }

// Definirea proprietăților pe care le primește componenta
interface ListProps {
    locations: LocationItem[];
    showSuggestions?: boolean; // Proprietate opțională pentru a controla afișarea sugestiilor
}

// Valoarea implicită pentru showSuggestions este true
const LocationList: React.FC<ListProps> = ({ locations, showSuggestions = true }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // FlatList este componenta optimă pentru a afișa liste lungi de date.
    // Va randa doar elementele vizibile pe ecran, asigurând performanță.
    return (
        <FlatList
            style={{ flex: 1 }}
            data={locations} // Sursa de date pentru listă (toate restaurantele filtrate)
            renderItem={({ item }) => <LocationCard location={item} />} // Componenta care afișează fiecare restaurant
            keyExtractor={(item) => String(item.id)} // Un identificator unic pentru fiecare element
            showsVerticalScrollIndicator={false} // Ascunde bara de derulare
            contentContainerStyle={styles.contentContainer} // Stilul pentru containerul interior al listei
            // ListHeaderComponent adaugă un titlu deasupra listei, doar dacă showSuggestions este true
            ListHeaderComponent={() => {
                if (!showSuggestions) return null; // Nu randa nimic dacă showSuggestions este false
                return (
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Locații apropiate</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                            {locations.length} rezultate
                        </Text>
                    </View>
                );
            }}
        />
    );
};

const styles = StyleSheet.create({
    // Stilul pentru containerul interior al listei
    contentContainer: {
        paddingTop: 140, // Spațiu de sus pentru a nu se suprapune cu bara de căutare
        paddingHorizontal: 20, // Spațiu pe laterale
        paddingBottom: 40, // Spațiu la finalul listei
    },
    header: { marginBottom: 20 },
    headerTitle: { fontSize: 22, fontWeight: '800' },
    headerSubtitle: { fontSize: 14, marginTop: 2 },
});

export default LocationList;