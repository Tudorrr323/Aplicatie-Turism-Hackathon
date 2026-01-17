import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Animated, Linking, Platform, useColorScheme } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface Coordinates { lat: number; long: number; }
interface LocationItem { id: number; name: string; address: string; coordinates: Coordinates; short_description: string; rating: number; image_url: string; }
interface CityItem { name: string; coordinates: Coordinates; }
interface MapProps { locations: LocationItem[]; focusedLocationId?: number | null; focusedCity?: CityItem | null; }

// URL-uri pentru tile-urile hărții
const GOOGLE_MAPS_URL = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

const MapViewComponent: React.FC<MapProps> = ({ locations, focusedLocationId, focusedCity }) => {
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const slideAnim = useRef(new Animated.Value(300)).current; 

    useEffect(() => {
        if (focusedLocationId !== undefined && focusedLocationId !== null) {
            const targetLoc = locations.find(l => l.id === focusedLocationId);
            if (targetLoc) {
                setSelectedLocation(targetLoc);
                mapRef.current?.animateCamera({ center: { latitude: targetLoc.coordinates.lat, longitude: targetLoc.coordinates.long }, zoom: 16, pitch: 0, heading: 0 }, { duration: 1000 });
            }
        }
    }, [focusedLocationId]);

    useEffect(() => {
        if (focusedCity) {
            setSelectedLocation(null); // Ascunde cardul de locație dacă un oraș este selectat
            mapRef.current?.animateCamera({ center: { latitude: focusedCity.coordinates.lat, longitude: focusedCity.coordinates.long }, zoom: 12, pitch: 0, heading: 0 }, { duration: 1500 });
        }
    }, [focusedCity]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setUserLocation(location);
                // Centrează harta pe locația utilizatorului la prima încărcare
                if (mapRef.current) {
                    mapRef.current.animateToRegion({ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.09, longitudeDelta: 0.04 });
                }
            }
        })();
    }, []);

    useEffect(() => {
        if (selectedLocation) {
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
        } else {
            Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }).start();
        }
    }, [selectedLocation]);

    const centerOnUser = async () => {
        if (userLocation) {
            mapRef.current?.animateToRegion({ latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 1000);
        } else {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setUserLocation(location);
                mapRef.current?.animateToRegion({ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 1000);
            }
        }
    };

    const handleGetDirections = () => {
        if (!selectedLocation) return;
        const label = encodeURIComponent(selectedLocation.name);
        const url = Platform.select({ ios: `maps:0,0?q=${label}@${selectedLocation.coordinates.lat},${selectedLocation.coordinates.long}`, android: `geo:0,0?q=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.long}(${label})` });
        Linking.openURL(url!);
    };

    const initialRegion = { latitude: 44.4268, longitude: 26.1025, latitudeDelta: 0.09, longitudeDelta: 0.09 };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={undefined}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
                onPress={() => setSelectedLocation(null)}
                toolbarEnabled={false}
                loadingEnabled={true}
                loadingBackgroundColor={theme.background}
                minZoomLevel={4}
                maxZoomLevel={19}
                rotateEnabled={false}
                mapType="none"
            >
                <UrlTile urlTemplate={GOOGLE_MAPS_URL} maximumZ={19} zIndex={1} />
                {locations.map((location) => {
                    const isSelected = selectedLocation?.id === location.id;
                    return (
                        <Marker
                            key={String(location.id)}
                            coordinate={{ latitude: location.coordinates.lat, longitude: location.coordinates.long }}
                            onPress={() => setSelectedLocation(location)}
                            stopPropagation={true}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={[styles.pinContainer, isSelected && styles.selectedPinContainer]}>
                                {isSelected ? <Ionicons name="restaurant" size={16} color="#fff" /> : <Text style={styles.pinText}>{location.rating.toFixed(1)}</Text>}
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            <TouchableOpacity style={[styles.gpsButton, { backgroundColor: theme.card }, selectedLocation ? { bottom: 200 } : { bottom: 30 }]} onPress={centerOnUser}>
                <Ionicons name="locate" size={22} color={theme.tint} />
            </TouchableOpacity>

            <Animated.View style={[styles.miniCardContainer, { transform: [{ translateY: slideAnim }] }]}>
                <View style={[styles.miniCardWrapper, { backgroundColor: theme.card }]}>
                    <TouchableOpacity activeOpacity={0.9} style={styles.miniCardContent} onPress={() => router.push(`/locations/${selectedLocation?.id}`)}>
                        <Image source={{ uri: selectedLocation?.image_url }} style={styles.cardImage} />
                        <View style={styles.cardTextContent}>
                            <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{selectedLocation?.name}</Text>
                            <Text style={[styles.cardAddress, { color: theme.textSecondary }]} numberOfLines={1}>{selectedLocation?.address}</Text>
                            <View style={styles.cardRatingRow}>
                                <FontAwesome name="star" size={12} color="#FF9800" />
                                <Text style={[styles.ratingText, { color: theme.text }]}> {selectedLocation?.rating}</Text>
                                <Text style={[styles.moreInfoText, { color: theme.tint }]}> • Apasă pentru detalii</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.directionsButton, { borderLeftColor: theme.border }]} onPress={handleGetDirections}>
                        <View style={styles.directionsIconBg}><MaterialIcons name="directions" size={24} color="#fff" /></View>
                        <Text style={styles.directionsText}>Go</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 }, map: { flex: 1 },
    pinContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#EA4335', elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1 },
    selectedPinContainer: { backgroundColor: '#EA4335', borderColor: '#fff', transform: [{ scale: 1.1 }], zIndex: 10 },
    pinText: { fontSize: 10, fontWeight: 'bold', color: '#333' },
    gpsButton: { position: 'absolute', left: 20, width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5 },
    miniCardContainer: { position: 'absolute', bottom: 30, left: 20, right: 20, zIndex: 100 },
    miniCardWrapper: { flexDirection: 'row', borderRadius: 16, padding: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10, alignItems: 'center' },
    miniCardContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    cardImage: { width: 55, height: 55, borderRadius: 10, backgroundColor: '#333' },
    cardTextContent: { flex: 1, marginLeft: 10, justifyContent: 'center' },
    cardTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
    cardAddress: { fontSize: 12, marginBottom: 2 },
    cardRatingRow: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { fontSize: 12, fontWeight: '600' },
    moreInfoText: { fontSize: 11 },
    directionsButton: { alignItems: 'center', justifyContent: 'center', marginLeft: 10, paddingLeft: 10, borderLeftWidth: 1 },
    directionsIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4285F4', justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
    directionsText: { fontSize: 10, color: '#4285F4', fontWeight: '700' }
});

export default MapViewComponent;