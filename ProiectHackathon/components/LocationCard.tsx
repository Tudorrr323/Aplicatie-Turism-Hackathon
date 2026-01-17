import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router'; 
import { FontAwesome } from '@expo/vector-icons';

interface LocationItem {
    id: number;
    name: string;
    image_url: string;
    rating: number;
}
interface CardProps {
    location: LocationItem;
}

const LocationCard: React.FC<CardProps> = ({ location }) => {
    return (
        <Link href={`/locations/${location.id}`} asChild>
            <TouchableOpacity style={styles.card} activeOpacity={0.9}>
                <Image source={{ uri: location.image_url }} style={styles.image} />
                
                {/* Gradient overlay simulation via background opacity */}
                <View style={styles.infoOverlay}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title} numberOfLines={1}>{location.name}</Text>
                        <View style={styles.ratingContainer}>
                            <FontAwesome name="star" color="#FFD700" size={12} />
                            <Text style={styles.ratingText}>{location.rating}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 20, // Colțuri mai rotunjite
        marginBottom: 20,
        height: 220, // Card mai înalt
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6,
    },
    image: {
        width: '100%', height: '100%', borderRadius: 20,
    },
    // Textul apare peste imagine, jos, cu un fundal alb semi-transparent sau solid
    infoOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(255,255,255,0.95)', // Glass effect simplu
        padding: 15,
        borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
        borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)'
    },
    textContainer: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    title: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', flex: 1, marginRight: 10 },
    ratingContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E',
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8
    },
    ratingText: { color: '#fff', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
});

export default LocationCard;