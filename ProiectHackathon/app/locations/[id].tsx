import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Linking, ScrollView, Animated, Dimensions } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'; 
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Ionicons } from '@expo/vector-icons';
import { generateVibeDescription } from '../../api/gemini'; 
import locations from '../../data/locations.json'; 

// --- CONFIG ---
const { width } = Dimensions.get('window');
const IMG_HEIGHT = 300;

// --- DATA PREP ---
interface Coordinates { lat: number; long: number; }
interface JsonLocationItem { name: string; address: string; coordinates: Coordinates; image_url: string; short_description: string; rating: number; }
interface LocationItem extends JsonLocationItem { id: number; }
const locationData: LocationItem[] = (locations as JsonLocationItem[]).map((loc, index) => ({ ...loc, id: index }));

const DetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    
    const [isLoading, setIsLoading] = useState(false);
    const [vibeDescription, setVibeDescription] = useState<string | null>(null);

    // --- ANIMATII ---
    const fadeAnim = useRef(new Animated.Value(0)).current; // Opacitate
    const slideAnim = useRef(new Animated.Value(50)).current; // Pozitie Y

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 6, useNativeDriver: true })
        ]).start();
    }, []);

    // --- LOGICA LOCATIE ---
    let locationIndex = typeof id === 'string' ? parseInt(id) : (Array.isArray(id) ? parseInt(id[0]) : null);
    const location = (locationIndex !== null && locationData[locationIndex]) ? locationData[locationIndex] : null;

    if (!location) return <View style={styles.center}><Text>Locație invalidă</Text></View>;

    const handleGenerateVibe = async () => {
        setIsLoading(true);
        try {
            const newDescription = await generateVibeDescription(location.name, location.short_description);
            setVibeDescription(newDescription);
        } catch (error) { setVibeDescription("Eroare AI."); } finally { setIsLoading(false); }
    };

    const handleWhatsAppReserve = () => {
        Linking.openURL(`whatsapp://send?text=Rezervare la ${location.name}`);
    };

    const displayDescription = vibeDescription || location.short_description;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* 1. IMAGINEA DE FUNDAL (HEADER) */}
            <Image source={{ uri: location.image_url }} style={styles.headerImage} />
            
            {/* 2. BUTON BACK PLUTITOR */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>

            {/* 3. CONȚINUT SCROLLABIL CU ANIMATIE */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.placeholderbox} /> 
                
                <Animated.View style={[styles.contentCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    
                    {/* HEADER LOCATIE */}
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{location.name}</Text>
                            <Text style={styles.address}>{location.address}</Text>
                        </View>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={16} color="#FFF" />
                            <Text style={styles.ratingText}>{location.rating}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* DESCRIERE */}
                    <Text style={styles.sectionTitle}>Despre Locație</Text>
                    <Text style={styles.description}>{displayDescription}</Text>

                    {/* ACTIUNI */}
                    <View style={styles.actionContainer}>
                        {/* Buton AI */}
                        <TouchableOpacity 
                            style={[styles.aiButton, isLoading && styles.disabledBtn]} 
                            onPress={handleGenerateVibe}
                            disabled={isLoading}
                        >
                            {isLoading ? <ActivityIndicator color="#FFF" /> : <Ionicons name="sparkles" size={20} color="#FFF" />}
                            <Text style={styles.aiButtonText}>{isLoading ? "Generare..." : "Vibe Check AI"}</Text>
                        </TouchableOpacity>

                        {/* Buton WhatsApp */}
                        <TouchableOpacity style={styles.whatsAppButton} onPress={handleWhatsAppReserve}>
                            <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
                            <Text style={styles.aiButtonText}>Rezervă</Text>
                        </TouchableOpacity>
                    </View>

                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    headerImage: {
        width: '100%', height: IMG_HEIGHT, position: 'absolute', top: 0, left: 0, resizeMode: 'cover',
    },
    backButton: {
        position: 'absolute', top: 50, left: 20, zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 20,
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 5
    },
    placeholderbox: { height: IMG_HEIGHT - 40 }, // Spatiu transparent pentru a vedea poza
    scrollContent: { paddingBottom: 40 },
    
    contentCard: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        padding: 25, minHeight: 600,
        shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    title: { fontSize: 26, fontWeight: '800', color: '#1C1C1E', marginBottom: 5 },
    address: { fontSize: 14, color: '#8E8E93' },
    ratingBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF9500', 
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12
    },
    ratingText: { color: '#fff', fontWeight: 'bold', marginLeft: 4 },
    divider: { height: 1, backgroundColor: '#E5E5EA', marginVertical: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1C1C1E', marginBottom: 10 },
    description: { fontSize: 16, lineHeight: 24, color: '#3A3A3C', marginBottom: 30 },
    
    actionContainer: { gap: 15 },
    aiButton: {
        backgroundColor: '#8E44AD', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        padding: 16, borderRadius: 16, gap: 10,
        shadowColor: '#8E44AD', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
    },
    whatsAppButton: {
        backgroundColor: '#25D366', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        padding: 16, borderRadius: 16, gap: 10,
        shadowColor: '#25D366', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4
    },
    disabledBtn: { opacity: 0.7 },
    aiButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default DetailsScreen;