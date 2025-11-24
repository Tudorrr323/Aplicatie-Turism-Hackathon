import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { useRouter } from 'expo-router';

// INTERFEȚE (Asigură-te că sunt identice în toate fișierele)
interface Coordinates { lat: number; long: number; }
interface LocationItem {
    id: number; // Indexul array-ului
    name: string;
    coordinates: Coordinates;
    short_description: string;
    rating: number;
}
interface MapProps { locations: LocationItem[]; }

// URL Wikimedia (remediu pentru blocajul OSM)
const WIKIMEDIA_TILE_URL = "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png";

const MapViewComponent: React.FC<MapProps> = ({ locations }) => {
    const router = useRouter(); 
    
    // Extrage coordonatele primei locații pentru a centra harta
    const firstLocation = locations.length > 0 ? locations[0].coordinates : null;

    const initialRegion = {
        latitude: firstLocation ? firstLocation.lat : 44.4268, // Default Bucuresti
        longitude: firstLocation ? firstLocation.long : 26.1025,
        latitudeDelta: 0.05, 
        longitudeDelta: 0.05,
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={undefined} // Folosim null/undefined pentru a evita Google Maps
                initialRegion={initialRegion}
            >
                {/* 1. Incarcă Tile-urile Wikimedia */}
                <UrlTile
                    urlTemplate={WIKIMEDIA_TILE_URL}
                    maximumZ={19} 
                />

                {/* 2. Randează Pin-urile (Marker-ele) */}
                {locations.map((location) => (
                    <Marker
                        // Folosim Indexul ca ID
                        key={String(location.id)} 
                        coordinate={{ 
                            latitude: location.coordinates.lat, 
                            longitude: location.coordinates.long 
                        }}
                        title={location.name}
                        description={`${location.short_description} (${location.rating}⭐)`}
                        
                        // LOGICA DE NAVIGARE către /locations/[id].tsx
                        onPress={() => {
                            router.push(`/locations/${location.id}`);
                        }}
                    />
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});

export default MapViewComponent;