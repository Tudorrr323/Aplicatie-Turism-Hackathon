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
        <Link 
            href={`/locations/${location.id}`} 
            asChild 
        >
            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
                <Image 
                    source={{ uri: location.image_url }} 
                    style={styles.image} 
                    // Am șters defaultSource pentru a evita eroarea de import
                />
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>{location.name}</Text>
                    <View style={styles.ratingContainer}>
                        <FontAwesome name="star" color="#FFD700" size={12} style={{ marginRight: 4 }}/>
                        <Text style={styles.ratingText}>{location.rating.toFixed(1)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        marginVertical: 8,
        elevation: 5, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    image: {
        width: '100%',
        height: 140,
        backgroundColor: '#eee',
    },
    info: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        flexShrink: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ratingText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 12,
    },
});

export default LocationCard;