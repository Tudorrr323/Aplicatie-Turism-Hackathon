import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, useColorScheme, SafeAreaView, ScrollView, TextInput } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { Colors } from '../constants/Colors';

// Definirea tipurilor pentru filtre
export interface Filters {
    city: string;
    minRating: number;
    sortBy: 'default' | 'rating_asc' | 'rating_desc' | 'name_asc';
}

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: Filters) => void;
    currentFilters: Filters;
    cities: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply, currentFilters, cities }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [localFilters, setLocalFilters] = useState<Filters>(currentFilters);
    const [citySearch, setCitySearch] = useState('');
    const [showAllCities, setShowAllCities] = useState(false);

    // Resetare stare la deschiderea modalului
    useEffect(() => {
        if (visible) {
            setLocalFilters(currentFilters);
            setCitySearch('');
            setShowAllCities(false);
        }
    }, [visible, currentFilters]);

    // Filtrează orașele pe baza căutării
    const filteredCities = cities.filter(city => city.toLowerCase().includes(citySearch.toLowerCase()));

    // Afișează primele 5 orașe sau toate, în funcție de starea `showAllCities`
    const citiesToShow = showAllCities ? filteredCities : filteredCities.slice(0, 5);

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleReset = () => {
        const defaultFilters: Filters = { city: 'all', minRating: 0, sortBy: 'default' };
        setLocalFilters(defaultFilters);
        onApply(defaultFilters);
        onClose();
    };

    const renderOption = (title: string, value: string, filterKey: keyof Filters, isSelected: boolean) => (
        <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: isSelected ? theme.tint : theme.background }, isSelected && styles.selectedOption]}
            onPress={() => setLocalFilters(prev => ({ ...prev, [filterKey]: value }))}
        >
            <Text style={[styles.optionText, { color: isSelected ? '#fff' : theme.text }]}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.card }]}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Filtrează & Sortează</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color={theme.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.filterSection}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>CAUTĂ ORAȘ</Text>
                        <View style={[styles.citySearchWrapper, { backgroundColor: theme.background }]}>
                            <Ionicons name="search" size={20} color={theme.textSecondary} />
                            <TextInput style={[styles.citySearchInput, { color: theme.text }]} placeholder="Ex: București, Iași..." placeholderTextColor={theme.textSecondary} value={citySearch} onChangeText={setCitySearch} />
                        </View>
                        <View style={styles.optionsRow}>
                            {renderOption('Toate', 'all', 'city', localFilters.city === 'all')}
                            {citiesToShow.map(city => <TouchableOpacity key={city} style={[styles.optionButton, { backgroundColor: localFilters.city === city ? theme.tint : theme.background }, localFilters.city === city && styles.selectedOption]} onPress={() => setLocalFilters(prev => ({ ...prev, city }))}><Text style={[styles.optionText, { color: localFilters.city === city ? '#fff' : theme.text }]}>{city}</Text></TouchableOpacity>)}
                            {!showAllCities && filteredCities.length > 5 && (
                                <TouchableOpacity style={[styles.optionButton, { backgroundColor: theme.background }]} onPress={() => setShowAllCities(true)}>
                                    <Text style={[styles.optionText, { color: theme.tint }]}>Vezi mai mult...</Text>
                                </TouchableOpacity>
                            )}
                            {showAllCities && filteredCities.length > 5 && (
                                <TouchableOpacity style={[styles.optionButton, { backgroundColor: theme.background }]} onPress={() => setShowAllCities(false)}>
                                    <Text style={[styles.optionText, { color: theme.tint }]}>Afișează mai puțin</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>RATING MINIM</Text>
                        <View style={styles.optionsRow}>
                            {[1, 2, 3, 4, 5].map(rating => (
                                <TouchableOpacity key={rating} style={styles.starButton} onPress={() => setLocalFilters(prev => ({ ...prev, minRating: rating }))}>
                                    <Text style={{ fontSize: 16, color: localFilters.minRating >= rating ? '#FFC700' : theme.textSecondary }}>★</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity onPress={() => setLocalFilters(prev => ({ ...prev, minRating: 0 }))} style={{ marginLeft: 10 }}>
                                <Text style={{ color: theme.tint }}>Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.filterSection}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>SORTEAZĂ DUPĂ</Text>
                        <View style={styles.optionsRow}>
                            {renderOption('Recomandat', 'default', 'sortBy', localFilters.sortBy === 'default')}
                            {renderOption('Rating ↑', 'rating_asc', 'sortBy', localFilters.sortBy === 'rating_asc')}
                            {renderOption('Rating ↓', 'rating_desc', 'sortBy', localFilters.sortBy === 'rating_desc')}
                            {renderOption('Nume (A-Z)', 'name_asc', 'sortBy', localFilters.sortBy === 'name_asc')}
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={[styles.footerButton, { backgroundColor: theme.background }]} onPress={handleReset}>
                        <Text style={[styles.footerButtonText, { color: theme.text }]}>Resetează</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.footerButton, { backgroundColor: theme.tint }]} onPress={handleApply}>
                        <Text style={[styles.footerButtonText, { color: '#fff' }]}>Aplică Filtre</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: { flex: 1, marginTop: '20%', borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    closeButton: { padding: 5 },
    scrollContent: { paddingBottom: 100 }, // Spațiu pentru a nu se suprapune cu butoanele de jos
    filterSection: { padding: 20 },
    citySearchWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 15, height: 44, marginBottom: 15 },
    citySearchInput: { flex: 1, fontSize: 16, marginLeft: 10 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15 },
    optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    optionButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
    selectedOption: { borderColor: 'transparent' },
    optionText: { fontWeight: '600' },
    starButton: { padding: 5 },
    footer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', position: 'absolute', bottom: 0, left: 0, right: 0 },
    footerButton: { flex: 1, padding: 15, borderRadius: 15, alignItems: 'center', marginHorizontal: 10 },
    footerButtonText: { fontSize: 16, fontWeight: 'bold' },
});

export default FilterModal;