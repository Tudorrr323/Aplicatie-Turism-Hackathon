import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import LocationCard from './LocationCard';

interface Coordinates { lat: number; long: number; }
interface LocationItem {
    id: number;
    name: string;
    address: string;
    coordinates: Coordinates;
    image_url: string;
    short_description: string;
    rating: number;
}
interface ListProps {
    locations: LocationItem[];
}

const LocationList: React.FC<ListProps> = ({ locations }) => {
    return (
        <View style={styles.container}>
            <FlatList
                data={locations}
                // Folosim indexul ca ID, conform modificării din explore.tsx
                keyExtractor={(item) => String(item.id)} 
                renderItem={({ item }) => (
                    <LocationCard location={item} />
                )}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingTop: 10,
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
});

export default LocationList;