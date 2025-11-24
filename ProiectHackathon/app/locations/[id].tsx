import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Button, ActivityIndicator, Linking, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router'; 
import { SafeAreaView } from 'react-native-safe-area-context'; 

import { generateVibeDescription } from '../../api/gemini'; // Logica AI (Mock)
import locations from '../../data/locations.json'; // Datele JSON

// --- INTERFEȚE UNIFICATE ---
interface Coordinates { lat: number; long: number; }
interface JsonLocationItem { 
    name: string; 
    address: string; 
    coordinates: Coordinates; 
    image_url: string; 
    short_description: string; 
    rating: number; 
}
interface LocationItem extends JsonLocationItem { id: number; }

// --- DATA PROCESSING ---
// Adaugă ID-ul (indexul) la fiecare obiect
const locationData: LocationItem[] = (locations as JsonLocationItem[]).map((loc, index) => ({ 
    ...loc, 
    id: index 
}));


const DetailsScreen = () => {
    // Extrage ID-ul din URL
    const params = useLocalSearchParams(); 
    const id = params.id;
    
    // Stări pentru AI Generative
    const [isLoading, setIsLoading] = useState(false);
    const [vibeDescription, setVibeDescription] = useState<string | null>(null);

    // 1. Logica de Conversie ID (index)
    let locationIndex: number | null = null;
    if (typeof id === 'string') {
        locationIndex = parseInt(id);
    } else if (Array.isArray(id) && id.length > 0) {
        locationIndex = parseInt(id[0]);
    }
    
    // 2. Găsirea Locației prin INDEX (Corecția de Tip)
    const isValidIndex = locationIndex !== null && locationIndex >= 0 && locationIndex < locationData.length;
    let location: LocationItem | null = null; 

    if (isValidIndex && locationIndex !== null) {
        // Corecția de tip: Folosește logica validată
        location = locationData[locationIndex]; 
    }

    if (!location) {
        return <View style={styles.errorContainer}><Text style={styles.errorText}>Locația nu a fost găsită.</Text></View>;
    }

    // 3. Logică AI Generative
    const handleGenerateVibe = async () => {
        setIsLoading(true); 
        try {
            const newDescription = await generateVibeDescription(location.name, location.short_description);
            setVibeDescription(newDescription); 
        } catch (error) {
            setVibeDescription("Eroare la generarea descrierii AI.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // 4. Logică Buton WhatsApp
    const handleWhatsAppReserve = () => {
        const phoneNumber = "0040712345678"; 
        const message = `Aș dori să fac o rezervare la ${location.name}.`;
        const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        
        Linking.openURL(url).catch(() => {
            alert('Vă rugăm instalați WhatsApp.');
        });
    };

    // Descrierea afișată (AI > JSON)
    const displayDescription = vibeDescription || location.short_description;

    return (
    <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <ScrollView contentContainerStyle={styles.scrollContent}> 
            
            {/* Imaginea locației */}
            <Image 
                source={{ uri: location.image_url }} 
                style={styles.image} 
            />

            <View style={styles.content}>
    
                {/* Titlu */}
                <Text style={styles.title}>{location.name}</Text>
                
                {/* Rating */}
                <Text style={styles.rating}>⭐ {location.rating.toFixed(1)} / 5</Text> 
                
                {/* Descriere */}
                <View style={styles.descriptionBox}>
                    <Text style={styles.description}>
                        {displayDescription}
                    </Text>
                </View>

                {/* Butoane - deși View-urile sunt sigure, le lipim și pe ele pentru siguranță */}
                <Button 
                    title={isLoading ? "Se generează Vibe..." : "✨ Generează Descriere Vibe"}
                    onPress={handleGenerateVibe}
                    disabled={isLoading}
                    color={isLoading ? "#A0A0A0" : "#9C27B0"} 
                />
                {isLoading && (
                    <ActivityIndicator size="small" color="#9C27B0" style={{ marginTop: 10 }} />
                )}
                <View style={{ marginTop: 15 }}>
                    <Button 
                        title="📞 Rezervă (Link WhatsApp)"
                        onPress={handleWhatsAppReserve}
                        color="#25D366" 
                    />
                </View>

            </View>
            
        </ScrollView>
    </SafeAreaView>
);
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    scrollContent: {
        backgroundColor: '#fff',
        paddingBottom: 40, 
    },
    container: { flex: 1, backgroundColor: '#fff' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 18, color: 'red' },
    image: { width: '100%', height: 250, backgroundColor: '#eee' },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    rating: { fontSize: 16, color: '#666', marginBottom: 15 },
    descriptionBox: { 
        paddingVertical: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee', 
        marginBottom: 20 
    },
    description: { fontSize: 16, 
        lineHeight: 24,
        textAlignVertical: 'top', // Specific pentru Android
        textAlign: 'left', // Setare generală
        color: '#333' },
});

export default DetailsScreen;