import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, Platform, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChatbot } from './ChatbotContext';
import { useChatbotAction } from './ChatbotActionContext';
import { Colors } from '../constants/Colors';
import locations from '../data/locations.json';
import allCities from '../data/romanian_cities.json';

interface JsonLocationItem { name: string; address: string; coordinates: { lat: number; long: number; }; image_url: string; short_description: string; rating: number; }
interface LocationItem extends JsonLocationItem { id: number; }
const locationData: LocationItem[] = (locations as JsonLocationItem[]).map((loc, index) => ({ ...loc, id: index }));

type MessageAction = { type: 'navigate'; locationId: number; } | { type: 'apply_city_filter'; city: string; };
interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    action?: MessageAction;
}

const getBotResponse = (message: string): { text: string; action?: Message['action'] } => {
    const lowerCaseMessage = message.toLowerCase();

    // --- NOU: Funcție de normalizare pentru orașe ---
    const normalizeCityForSearch = (city: string): string => {
        if (city.toLowerCase() === 'bucurești') return 'bucharest';
        return city;
    };

    // --- Îmbunătățire: Definirea entităților și a cuvintelor cheie ---
    const superlatives = {
        desc: ['cel mai bun', 'cel mai mare', 'cea mai bună', 'cea mai mare'],
        asc: ['cel mai slab', 'cel mai prost', 'cel mai mic']
    };

    // --- NOU: Logic pentru a clasifica locațiile ---
    const drinkKeywords = ['cafea', 'espresso', 'ceai', 'bere', 'vin', 'băuturi', 'cocktail', 'smoothie', 'sucuri'];
    const foodKeywords = ['mâncare', 'restaurant', 'pizza', 'burger', 'paste', 'sushi', 'grill', 'meniu'];

    const getLocationType = (location: LocationItem): 'drink' | 'food' | 'unknown' => {
        const description = `${location.name.toLowerCase()} ${location.short_description.toLowerCase()}`;
        if (drinkKeywords.some(kw => description.includes(kw))) {
            return 'drink';
        }
        if (foodKeywords.some(kw => description.includes(kw))) {
            return 'food';
        }
        return 'unknown';
    };

    // Extrage intenția și entitățile (subiect, oraș)
    const extractEntity = (keywords: string[]): string | null => {
        for (const keyword of keywords) {
            // Folosim o expresie regulată pentru a potrivi cuvântul întreg și a evita potriviri parțiale (ex: "brașov" în "îmbrăcat")
            const regex = new RegExp(`\\b${keyword.replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't')}\\b`, 'i');
            if (regex.test(lowerCaseMessage.replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't'))) {
                return keyword;
            }
        }
        return null;
    };

    // --- NOU: Gruparea cuvintelor cheie pe concepte/sinonime ---
    const itemConcepts = {
        cafea: ['cafea', 'espresso', 'cappuccino', 'latte', 'coffee'],
        matcha: ['matcha'],
        pizza: ['pizza', 'pizzerie'],
        burger: ['burger', 'burgers'],
        bere: ['bere', 'beer', 'pub'],
        vegan: ['vegan', 'plant-based'],
        smoothie: ['smoothie', 'sucuri'],
        paste: ['paste', 'pasta'],
        sushi: ['sushi'],
        vin: ['vin', 'wine']
    };
    const allItemKeywords = Object.values(itemConcepts).flat();
    const cityKeywords = allCities.map(c => c.name.toLowerCase());
    const typeKeywords = {
        drink: ['bar', 'cafenea', 'ceainărie', 'pub'],
        food: ['restaurant', 'pizzerie', 'trattoria', 'bistro']
    };

    // --- Îmbunătățire: Extragerea tuturor entităților din mesaj ---
    const foundItemKeyword = extractEntity(allItemKeywords);
    const foundCity = extractEntity(cityKeywords);
    const foundSortOrder = superlatives.desc.some(s => lowerCaseMessage.includes(s)) ? 'desc' : (superlatives.asc.some(s => lowerCaseMessage.includes(s)) ? 'asc' : null);
    const foundType = extractEntity(typeKeywords.drink) ? 'drink' : (extractEntity(typeKeywords.food) ? 'food' : null);

    // --- Îmbunătățire: Procesare logică bazată pe entitățile găsite ---
    let results = [...locationData];
    let appliedCriteria = [];

    // 1. Filtrare după tip (bar/restaurant)
    if (foundType) {
        results = results.filter(loc => getLocationType(loc) === foundType);
        appliedCriteria.push(foundType === 'drink' ? 'baruri/cafenele' : 'restaurante');
    }

    // 2. Filtrare după oraș
    if (foundCity) {
        const searchCity = normalizeCityForSearch(foundCity);
        results = results.filter(loc => loc.address.toLowerCase().includes(searchCity));
        appliedCriteria.push(`din ${foundCity.charAt(0).toUpperCase() + foundCity.slice(1)}`);
    }

    // 3. Filtrare după produs specific
    if (foundItemKeyword) {
        // Găsește conceptul (ex: 'cafea') care conține cuvântul cheie găsit (ex: 'espresso')
        const conceptKey = Object.keys(itemConcepts).find(key => itemConcepts[key as keyof typeof itemConcepts].includes(foundItemKeyword)) || foundItemKeyword;
        const searchTerms = itemConcepts[conceptKey as keyof typeof itemConcepts] || [foundItemKeyword];

        results = results.filter(loc => {
            const description = `${loc.name.toLowerCase()} ${loc.short_description.toLowerCase()}`;
            return searchTerms.some(term => description.includes(term));
        });
        appliedCriteria.push(`care servește ${conceptKey}`);
    }

    // 4. Sortare dacă este cerută
    if (foundSortOrder) {
        results.sort((a, b) => foundSortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating);
        appliedCriteria.push(`cu ${foundSortOrder === 'desc' ? 'cel mai bun' : 'cel mai slab'} review`);
    }

    // --- NOU: Logic pentru intenții generale (a bea / a mânca) ---
    const wantsToDrink = lowerCaseMessage.includes('beau') || lowerCaseMessage.includes('bea');
    const wantsToEat = lowerCaseMessage.includes('mănânc') || lowerCaseMessage.includes('manca');

    if (wantsToDrink || wantsToEat) { 
        const cityForGeneral = extractEntity(cityKeywords);
        if (!cityForGeneral) {
            return { text: `Sigur! În ce oraș ai vrea să ${wantsToDrink ? 'bei ceva' : 'mănânci'}?` };
        }

        const targetType = wantsToDrink ? 'drink' : 'food';
        const foundCity = normalizeCityForSearch(cityForGeneral);
        const results = locationData.filter(loc => {
            const type = getLocationType(loc);
            const isInCity = loc.address.toLowerCase().includes(foundCity);
            return (type === targetType || type === 'unknown') && isInCity;
        });

        if (results.length > 0) {
            const typeText = wantsToDrink ? 'băuturi' : 'mâncare';
            return { text: `Perfect! Te duc acum la locațiile cu ${typeText} din ${cityForGeneral}.`, action: { type: 'apply_city_filter', city: cityForGeneral } };
        } else {
            const typeText = wantsToDrink ? 'baruri sau cafenele' : 'restaurante';
            return { text: `Din păcate, nu am găsit ${typeText} în ${cityForGeneral} în baza mea de date.` };
        }
    }

    // --- Răspuns Final bazat pe rezultatele filtrate și sortate ---
    if (appliedCriteria.length > 0) {
        if (results.length > 0) {
            const found = results[0];
            const responseText = `Am găsit: "${found.name}". Pare a fi ce căutai (${appliedCriteria.join(', ')}). Vrei să vezi detalii?`;
            return {
                text: responseText,
                action: { type: 'navigate', locationId: found.id }
            };
        } else {
            return { text: `Din păcate, nu am găsit nicio locație care să corespundă criteriilor tale: ${appliedCriteria.join(', ')}.` };
        }
    }

    // Logica veche pentru căutare directă de restaurant (îmbunătățită)
    const directSearchMatch = lowerCaseMessage.match(/(?:caută|găsește|vreau|arată-mi)\s(?:restaurantul\s)?(.+)/);
    if (directSearchMatch) {
        const query = directSearchMatch[1].trim();
        const cityMatch = query.match(/în\s(.+)/);
        const cityName = cityMatch ? cityMatch[1] : null;
        const restaurantName = cityName ? query.replace(/în\s.+/, '').trim() : query;

        const results = locationData.filter(loc => {
            const nameMatch = loc.name.toLowerCase().includes(restaurantName);
            const searchCity = cityName ? normalizeCityForSearch(cityName) : null;
            const cityMatch = searchCity ? loc.address.toLowerCase().includes(searchCity) : true;
            return nameMatch && cityMatch;
        });

        if (results.length > 0) {
            const found = results[0];
            return {
                text: `Am găsit "${found.name}". Vrei să vezi detalii?`,
                action: { type: 'navigate', locationId: found.id }
            };
        } else {
            return { text: `Nu am găsit niciun restaurant care să corespundă căutării "${restaurantName}" ${cityName ? `în ${cityName}`: ''}.` };
        }
    }

    if (lowerCaseMessage.includes('salut') || lowerCaseMessage.includes('bună')) {
        return { text: 'Salut! Cu ce te pot ajuta astăzi? Poți să mă întrebi despre restaurante sau cum funcționează aplicația.' };
    }
    if (lowerCaseMessage.includes('recomandă') || lowerCaseMessage.includes('restaurant')) {
        return { text: 'Pentru a găsi restaurante, folosește pagina "Explorează". Poți căuta după nume sau poți folosi filtrele avansate pentru a sorta după oraș și rating.' };
    }
    if (lowerCaseMessage.includes('rezervare') || lowerCaseMessage.includes('rezerv')) {
        return { text: 'Poți face o rezervare direct de pe pagina de detalii a unui restaurant, folosind butonul "Rezervă pe WhatsApp".' };
    }
    if (lowerCaseMessage.includes('hartă') || lowerCaseMessage.includes('listă')) {
        return { text: 'Poți comuta între vizualizarea hărții și cea a listei folosind butonul central din bara de navigare de jos.' };
    }
    return { text: "Nu am înțeles întrebarea. Poți reformula, te rog? Pot răspunde la întrebări despre restaurante, rezervări sau funcționalitățile aplicației." };
};

const ChatbotModal: React.FC = () => {
    const { isChatOpen, toggleChat } = useChatbot();
    const { dispatchAction } = useChatbotAction();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Salut! Sunt asistentul tău virtual. Cum te pot ajuta?', sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (input.trim() === '') return;

        const userMessage: Message = { id: String(Date.now()), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);

        const botResponse = getBotResponse(input);
        const botMessage: Message = { id: String(Date.now() + 1), text: botResponse.text, sender: 'bot', action: botResponse.action };

        setTimeout(() => {
            setMessages(prev => [...prev, botMessage]);
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 500);

        setInput('');
    };

    const handleActionPress = (action: Message['action']) => {
        if (action?.type === 'navigate') {
            dispatchAction({ type: 'navigate_to_location', payload: { id: action.locationId } });
            toggleChat(); // Închide chat-ul după ce acțiunea a fost trimisă
        } else if (action?.type === 'apply_city_filter') {
            // Capitalizează numele orașului pentru afișare corectă în filtru
            const properCityName = action.city.charAt(0).toUpperCase() + action.city.slice(1);
            dispatchAction({ type: 'apply_city_filter', payload: { city: properCityName } });
            toggleChat();
        }
    };

    return (
        <Modal visible={isChatOpen} animationType="slide" transparent={false} onRequestClose={toggleChat}>
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Asistent Virtual</Text>
                    <TouchableOpacity onPress={toggleChat}><Ionicons name="close" size={28} color={theme.text} /></TouchableOpacity>
                </View>
                <View style={styles.flexOne}>
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(item) => item.id}
                            style={styles.chatContainer}
                            contentContainerStyle={styles.chatContent}
                            renderItem={({ item }) => (
                                <View style={[styles.messageRow, item.sender === 'user' ? styles.userRow : styles.botRow]}>
                                    {item.sender === 'bot' && (
                                        <View style={[styles.avatar, { backgroundColor: theme.card }]}>
                                            <Ionicons name="hardware-chip-outline" size={20} color={theme.tint} />
                                        </View>
                                    )}
                                    <View style={[styles.messageBubble, item.sender === 'user' ? [styles.userBubble, { backgroundColor: theme.tint }] : [styles.botBubble, { backgroundColor: theme.card }]]}>
                                        <Text style={item.sender === 'user' ? styles.userText : [styles.botText, { color: theme.text }]}>{item.text}</Text>
                                        {item.action && (
                                            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.tint }]} onPress={() => handleActionPress(item.action)}>
                                                <Text style={styles.actionButtonText}>Arată pe Hartă</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            )}
                        />

                        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: Platform.OS === 'ios' ? 20 : 15 }]}>
                            <TextInput
                                style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                                value={input}
                                onChangeText={setInput}
                                placeholder="Scrie un mesaj..."
                                placeholderTextColor={theme.textSecondary}
                            />
                            <TouchableOpacity style={[styles.sendButton, { backgroundColor: theme.tint }]} onPress={handleSend}>
                                <Ionicons name="send" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    flexOne: { flex: 1 },
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    chatContainer: { flex: 1, padding: 10 },
    chatContent: { paddingBottom: 10 },
    messageRow: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end' },
    userRow: { justifyContent: 'flex-end' },
    botRow: { justifyContent: 'flex-start' },
    avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 18 },
    userBubble: { backgroundColor: '#007AFF' },
    botBubble: {},
    userText: { color: '#fff', fontSize: 16 },
    botText: { fontSize: 16 },
    actionButton: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 15, alignSelf: 'flex-start' },
    actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    inputContainer: { flexDirection: 'row', padding: 15, borderTopWidth: 1, alignItems: 'center' },
    input: { flex: 1, height: 44, borderRadius: 22, paddingHorizontal: 15, fontSize: 16, marginRight: 10 },
    sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});

export default ChatbotModal;