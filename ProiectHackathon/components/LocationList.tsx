import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import LocationCard from './LocationCard';

// ... (Interfețele rămân la fel) ...
interface Coordinates { lat: number; long: number; }
interface LocationItem { id: number; name: string; address: string; coordinates: Coordinates; image_url: string; short_description: string; rating: number; }
interface ListProps { locations: LocationItem[]; }

const LocationList: React.FC<ListProps> = ({ locations }) => {
    return (
        <View style={styles.container}>
            <FlatList
                data={locations}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <LocationCard location={item} />
                )}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                // Header integrat în listă pentru a scrola împreună
                ListHeaderComponent={
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerTitle}>Locații apropiate</Text>
                        <Text style={styles.headerSubtitle}>{locations.length} rezultate</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    content: {
        // 💡 FIX PADDING: 100px este înălțimea aprox a searchbar-ului (50 + top 50)
        paddingTop: 110, 
        paddingHorizontal: 20, 
        paddingBottom: 100, 
    },
    headerContainer: { marginBottom: 15 }, // Mutat padding-ul în contentContainerStyle
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E' },
    headerSubtitle: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
});

export default LocationList;