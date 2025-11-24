import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Linking, ScrollView, Animated, Dimensions, useColorScheme, StatusBar } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import { generateVibeDescription, translateText } from '../../api/gemini'; 
import locations from '../../data/locations.json'; 
import { Colors } from '../../constants/Colors';

const IMG_HEIGHT = 300;
interface Coordinates { lat: number; long: number; }
interface JsonLocationItem { name: string; address: string; coordinates: Coordinates; image_url: string; short_description: string; rating: number; }
interface LocationItem extends JsonLocationItem { id: number; }
const locationData: LocationItem[] = (locations as JsonLocationItem[]).map((loc, index) => ({ ...loc, id: index }));

const DetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = Colors[colorScheme ?? 'light'];

    const [isVibeLoading, setIsVibeLoading] = useState(false);
    const [vibeDescription, setVibeDescription] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [showTranslatedOriginal, setShowTranslatedOriginal] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current; 
    const slideAnim = useRef(new Animated.Value(50)).current; 

    useEffect(() => { Animated.parallel([Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }), Animated.spring(slideAnim, { toValue: 0, friction: 6, useNativeDriver: true })]).start(); }, []);

    let locationIndex = typeof id === 'string' ? parseInt(id) : (Array.isArray(id) ? parseInt(id[0]) : null);
    const location = (locationIndex !== null && locationData[locationIndex]) ? locationData[locationIndex] : null;

    if (!location) return <View style={[styles.center, {backgroundColor: theme.background}]}><Text style={{color: theme.text}}>Locație invalidă</Text></View>;

    const handleGenerateVibe = async () => {
        setIsVibeLoading(true);
        try { const newDescription = await generateVibeDescription(location.name, location.short_description); setVibeDescription(newDescription); } catch (error) { setVibeDescription("Eroare AI."); } finally { setIsVibeLoading(false); }
    };

    const handleTranslateOriginal = async () => {
        if (showTranslatedOriginal) { setShowTranslatedOriginal(false); return; }
        if (!translatedText) {
            setIsTranslating(true);
            try { const text = await translateText(location.short_description); setTranslatedText(text); setShowTranslatedOriginal(true); } catch (err) { alert("Eroare traducere"); } finally { setIsTranslating(false); }
        } else { setShowTranslatedOriginal(true); }
    };

    const handleWhatsAppReserve = () => { Linking.openURL(`whatsapp://send?text=Rezervare la ${location.name}`); };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <Stack.Screen options={{ headerShown: false }} />
            <Image source={{ uri: location.image_url }} style={styles.headerImage} />
            <TouchableOpacity style={[styles.backButton, isDark && styles.darkBlurBtn]} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={isDark ? "#FFF" : "#000"} />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.placeholderbox} /> 
                <Animated.View style={[styles.contentCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }], backgroundColor: theme.card, shadowColor: theme.shadow }]}>
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}><Text style={[styles.title, { color: theme.text }]}>{location.name}</Text><Text style={[styles.address, { color: theme.textSecondary }]}>{location.address}</Text></View>
                        <View style={styles.ratingBadge}><Ionicons name="star" size={16} color="#FFF" /><Text style={styles.ratingText}>{location.rating}</Text></View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <View style={styles.sectionHeaderRow}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Despre Locație</Text>
                        <TouchableOpacity style={[styles.translateSmallBtn, { backgroundColor: isDark ? '#3A3A3C' : '#EBF5FF' }]} onPress={handleTranslateOriginal} disabled={isTranslating}>
                            {isTranslating ? <ActivityIndicator size="small" color="#007AFF" /> : <><Ionicons name="language" size={16} color="#007AFF" /><Text style={styles.translateBtnText}>{showTranslatedOriginal ? "Vezi Original (EN)" : "Traduce (RO)"}</Text></>}
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.description, { color: theme.text }]}>{showTranslatedOriginal && translatedText ? translatedText : location.short_description}</Text>
                    <View style={styles.vibeContainer}>
                        {vibeDescription && <View style={[styles.aiBlock, isDark && { backgroundColor: '#2C1E31' }]}><Text style={styles.descLabel}>✨ Vibe Check (AI):</Text><Text style={[styles.aiDescription, isDark && { color: '#D8B4E2' }]}>{vibeDescription}</Text></View>}
                        <TouchableOpacity style={[styles.aiButton, isVibeLoading && styles.disabledBtn]} onPress={handleGenerateVibe} disabled={isVibeLoading}>
                            {isVibeLoading ? <ActivityIndicator color="#FFF" /> : <Ionicons name="sparkles" size={20} color="#FFF" />}
                            <Text style={styles.aiButtonText}>{isVibeLoading ? "Generare Vibe..." : "Generează Vibe Creativ"}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.whatsAppButton} onPress={handleWhatsAppReserve}>
                        <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
                        <Text style={styles.aiButtonText}>Rezervă pe WhatsApp</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerImage: { width: '100%', height: IMG_HEIGHT, position: 'absolute', top: 0, left: 0, resizeMode: 'cover' },
    backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
    darkBlurBtn: { backgroundColor: 'rgba(0,0,0,0.6)' },
    placeholderbox: { height: IMG_HEIGHT - 40 }, scrollContent: { paddingBottom: 40 },
    contentCard: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, minHeight: 600, shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    title: { fontSize: 26, fontWeight: '800', marginBottom: 5 },
    address: { fontSize: 14 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF9500', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    ratingText: { color: '#fff', fontWeight: 'bold', marginLeft: 4 },
    divider: { height: 1, marginVertical: 20 },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '600' },
    translateSmallBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    translateBtnText: { fontSize: 12, color: '#007AFF', fontWeight: '600', marginLeft: 6 },
    description: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
    vibeContainer: { marginBottom: 20 },
    aiBlock: { backgroundColor: '#F4ECF7', padding: 15, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#8E44AD', marginBottom: 15 },
    descLabel: { fontSize: 12, fontWeight: '700', color: '#8E44AD', marginBottom: 4, textTransform: 'uppercase' },
    aiDescription: { fontSize: 16, lineHeight: 24, color: '#4A235A', fontStyle: 'italic' },
    aiButton: { backgroundColor: '#8E44AD', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 16, gap: 10, shadowColor: '#8E44AD', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    whatsAppButton: { marginTop: 15, backgroundColor: '#25D366', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 16, gap: 10, shadowColor: '#25D366', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    disabledBtn: { opacity: 0.7 },
    aiButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default DetailsScreen;