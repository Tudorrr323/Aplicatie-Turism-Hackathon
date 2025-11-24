import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Animated, Linking, Platform } from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';

interface Coordinates { lat: number; long: number; }
interface LocationItem {
    id: number;
    name: string;
    address: string;
    coordinates: Coordinates;
    short_description: string;
    rating: number;
    image_url: string;
}
interface MapProps { 
    locations: LocationItem[]; 
    focusedLocationId?: number | null;
}

// URL Harta Clasică (Standard OSM)
const TILE_URL = "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";

const MapViewComponent: React.FC<MapProps> = ({ locations, focusedLocationId }) => {
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    
    const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const slideAnim = useRef(new Animated.Value(300)).current; 

    // Focus Logic
    useEffect(() => {
        if (focusedLocationId !== undefined && focusedLocationId !== null) {
            const targetLoc = locations.find(l => l.id === focusedLocationId);
            if (targetLoc) {
                setSelectedLocation(targetLoc);
                mapRef.current?.animateCamera({
                    center: {
                        latitude: targetLoc.coordinates.lat,
                        longitude: targetLoc.coordinates.long,
                    },
                    zoom: 17, 
                    pitch: 0,
                    heading: 0
                }, { duration: 1000 });
            }
        }
    }, [focusedLocationId]);

    // GPS Logic
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setUserLocation(location);
            }
        })();
    }, []);

    // Animatie Card
    useEffect(() => {
        if (selectedLocation) {
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
        } else {
            Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }).start();
        }
    }, [selectedLocation]);

    const centerOnUser = async () => {
        if (userLocation) {
            mapRef.current?.animateToRegion({
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            }, 1000);
        }
    };

    const handleMapPress = () => {
        if (selectedLocation) setSelectedLocation(null);
    };

    // 💡 NOU: Funcție pentru Google Maps Directions
    const handleGetDirections = () => {
        if (!selectedLocation) return;
        const lat = selectedLocation.coordinates.lat;
        const long = selectedLocation.coordinates.long;
        const label = encodeURIComponent(selectedLocation.name);
        
        // Schema URL care deschide Google Maps cu destinația setată
        const url = Platform.select({
            ios: `maps:0,0?q=${label}@${lat},${long}`,
            android: `geo:0,0?q=${lat},${long}(${label})`
        });

        // Fallback la URL web dacă schema nu merge
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}`;

        Linking.canOpenURL(url!).then(supported => {
            if (supported) {
                Linking.openURL(url!);
            } else {
                Linking.openURL(webUrl);
            }
        });
    };

    const firstLocation = locations.length > 0 ? locations[0].coordinates : null;
    const initialRegion = {
        latitude: firstLocation ? firstLocation.lat : 44.4268,
        longitude: firstLocation ? firstLocation.long : 26.1025,
        latitudeDelta: 0.09,
        longitudeDelta: 0.09,
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
                onPress={handleMapPress}
                toolbarEnabled={false}
                loadingEnabled={true}
                // 💡 FIX FUNDAL: Setăm culoarea exactă a fundalului OSM
                loadingBackgroundColor="#F2EFE9" 
                // 💡 FIX TEXTURA: Ascundem textura default Google
                mapType={Platform.OS === 'android' ? "none" : "standard"} 
                minZoomLevel={4}
                maxZoomLevel={19}
            >
                {/* Tile Layer Standard */}
                <UrlTile 
                    urlTemplate={TILE_URL} 
                    maximumZ={19} 
                    zIndex={-1} 
                />

                {locations.map((location) => {
                    const isSelected = selectedLocation?.id === location.id;
                    return (
                        <Marker
                            key={String(location.id)}
                            coordinate={{ 
                                latitude: location.coordinates.lat, 
                                longitude: location.coordinates.long 
                            }}
                            onPress={() => setSelectedLocation(location)}
                            stopPropagation={true}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={[styles.tinyPin, isSelected && styles.selectedTinyPin]}>
                                {isSelected ? (
                                    <Ionicons name="restaurant" size={14} color="#fff" />
                                ) : (
                                    <Text style={styles.tinyPinText}>{location.rating.toFixed(1)}</Text>
                                )}
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            {/* Buton GPS */}
            <TouchableOpacity style={[styles.gpsButton, selectedLocation ? { bottom: 200 } : { bottom: 30 }]} onPress={centerOnUser}>
                <Ionicons name="locate" size={22} color="#007AFF" />
            </TouchableOpacity>

            {/* MINI CARD CU BUTON DIRECTII */}
            <Animated.View style={[styles.miniCardContainer, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.miniCardWrapper}>
                    
                    {/* Zonă Clickabilă pentru Detalii */}
                    <TouchableOpacity 
                        activeOpacity={0.9} 
                        style={styles.miniCardContent}
                        onPress={() => router.push(`/locations/${selectedLocation?.id}`)}
                    >
                        <Image source={{ uri: selectedLocation?.image_url }} style={styles.cardImage} />
                        <View style={styles.cardTextContent}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{selectedLocation?.name}</Text>
                            <Text style={styles.cardAddress} numberOfLines={1}>{selectedLocation?.address}</Text>
                            <View style={styles.cardRatingRow}>
                                <FontAwesome name="star" size={12} color="#FF9800" />
                                <Text style={styles.ratingText}> {selectedLocation?.rating}</Text>
                                <Text style={styles.moreInfoText}> • Apasă pentru detalii</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* 💡 BUTON DIRECTII (GOOGLE MAPS) */}
                    <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
                        <View style={styles.directionsIconBg}>
                            <MaterialIcons name="directions" size={24} color="#fff" />
                        </View>
                        <Text style={styles.directionsText}>Go</Text>
                    </TouchableOpacity>

                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2EFE9' }, // Culoare OSM
    map: { flex: 1 },
    
    tinyPin: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FF9800',
        elevation: 4, 
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2,
    },
    selectedTinyPin: {
        backgroundColor: '#007AFF',
        borderColor: '#fff',
        width: 38,
        height: 38,
        borderRadius: 19,
        zIndex: 10, 
    },
    tinyPinText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#333',
    },

    gpsButton: {
        position: 'absolute', right: 20, width: 45, height: 45,
        backgroundColor: '#fff', borderRadius: 25,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5,
    },
    
    miniCardContainer: { position: 'absolute', bottom: 30, left: 20, right: 20, zIndex: 100 },
    
    miniCardWrapper: {
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 10,
        shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10, alignItems: 'center',
    },
    miniCardContent: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
    },
    cardImage: { width: 55, height: 55, borderRadius: 10, backgroundColor: '#eee' },
    cardTextContent: { flex: 1, marginLeft: 10, justifyContent: 'center' },
    cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 2 },
    cardAddress: { fontSize: 12, color: '#8E8E93', marginBottom: 2 },
    cardRatingRow: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { fontSize: 12, color: '#1C1C1E', fontWeight: '600' },
    moreInfoText: { fontSize: 11, color: '#007AFF' },

    // Stiluri Buton Direcții
    directionsButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        paddingLeft: 10,
        borderLeftWidth: 1,
        borderLeftColor: '#f0f0f0',
    },
    directionsIconBg: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#4285F4', // Albastru Google Maps
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 2,
    },
    directionsText: {
        fontSize: 10,
        color: '#4285F4',
        fontWeight: '700',
    }
});

export default MapViewComponent;