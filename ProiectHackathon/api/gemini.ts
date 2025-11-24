import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ PUNE CHEIA TA AICI (Dacă o ai)
const API_KEY = "AIzaSyCvbb6bmRYtfZ5CtP9H3YtobeA1-xqXtYI"; 

const genAI = new GoogleGenerativeAI(API_KEY);

// ==========================================
// 📚 1. DICȚIONAR DE TRADUCERI (FALLBACK SIGUR)
// ==========================================
// Acestea sunt traducerile exacte pentru locațiile din JSON-ul tău.
// Se folosesc dacă API-ul dă eroare.

const MOCK_TRANSLATIONS: { [key: string]: string } = {
    "A quiet place, ideal for reading and study sessions. Excellent espresso.": 
        "Un loc liniștit, ideal pentru citit și studiu. Espresso excelent.",
    
    "Traditional Romanian dishes, generous servings, and live folk music.": 
        "Mâncăruri tradiționale românești, porții generoase și muzică populară live.",
    
    "Fast and tasty Asian food, a favorite among Polytechnic students.": 
        "Mâncare asiatică rapidă și gustoasă, preferată de studenții de la Politehnică.",
    
    "Modern design, perfect for a relaxed brunch. They have the best cakes.": 
        "Design modern, perfect pentru un brunch relaxat. Au cele mai bune prăjituri.",
    
    "Wood-fired oven pizza, authentic Italian ingredients. Excellent for groups.": 
        "Pizza la cuptor cu lemne, ingrediente italiene autentice. Excelent pentru grupuri.",
    
    "Healthy, plant-based options. Fresh smoothies and delicious cream soups.": 
        "Opțiuni sănătoase, pe bază de plante. Smoothie-uri proaspete și supe cremă delicioase.",
    
    "Strategic location near the campus. Quick and affordable student lunch menu.": 
        "Locație strategică lângă campus. Meniu de prânz rapid și accesibil pentru studenți.",
    
    "The best artisanal burgers in town, featuring Black Angus beef.": 
        "Cei mai buni burgeri artizanali din oraș, cu carne Black Angus.",
    
    "An oasis of calm with over 50 types of tea and ambient music.": 
        "O oază de liniște cu peste 50 de tipuri de ceai și muzică ambientală.",
    
    "Fresh fish and seafood specialties, with a view of the sea.": 
        "Specialități din pește proaspăt și fructe de mare, cu vedere la mare.",
    
    "International menu, green terrace. Ideal for a romantic dinner.": 
        "Meniu internațional, terasă verde. Ideal pentru o cină romantică.",
    
    "Board games, consoles, and coffee. An excellent place for socializing.": 
        "Jocuri de societate, console și cafea. Un loc excelent pentru socializare.",
    
    "Homemade pasta and Italian wines. Mediterranean atmosphere.": 
        "Paste de casă și vinuri italienești. Atmosferă mediteraneană.",
    
    "Artisanal bakery with specialty coffees. Ideal for breakfast.": 
        "Brutărie artizanală cu cafea de specialitate. Ideal pentru micul dejun.",
    
    "Döner Kebab and Shawarma. Quick and filling option after classes.": 
        "Döner Kebab și Shaorma. Opțiune rapidă și sățioasă după cursuri.",
    
    "Traditional Transylvanian food, next to the Medieval Citadel.": 
        "Mâncare tradițională ardelenească, lângă Cetatea Medievală.",
    
    "Smoothies, natural juices, and acai bowls for an energy boost.": 
        "Smoothie-uri, sucuri naturale și boluri acai pentru un boost de energie.",
    
    "Fixed (lunch) menu, cheap and tasty, just like home.": 
        "Meniu fix (de prânz), ieftin și gustos, ca acasă.",
    
    "Craft beer, quiz nights, and live sports. Popular student spot.": 
        "Bere artizanală, seri de quiz și sport live. Loc popular printre studenți.",
    
    "Minimalist design, specialty coffee, and relaxing background music.": 
        "Design minimalist, cafea de specialitate și muzică de fundal relaxantă."
};

// Helper pentru generarea procedurală a Vibe-ului (păstrat din pasul anterior)
// ... (Poți lăsa logica FALLBACK_DATA / getGrammaticallyCorrectFallback aici dacă o mai ai, sau o ștergi)
// Pentru simplitate, voi include un fallback simplu pentru vibe aici:

const VIBE_FALLBACKS = [
    "Atmosfera este electrică și primitoare, perfectă pentru o ieșire memorabilă.",
    "Un loc cu un vibe relaxat, unde te poți deconecta complet de agitația orașului.",
    "Energia locului te cucerește imediat, iar detaliile de design fac diferența."
];

// ==========================================
// 🤖 2. FUNCȚII API + FALLBACK
// ==========================================

// A. TRADUCERE (Textul Original)
export async function translateText(textToTranslate: string): Promise<string> {
    // 1. Verificăm întâi dicționarul local (INSTANT și SIGUR)
    if (MOCK_TRANSLATIONS[textToTranslate]) {
        // Simulăm un mic delay ca să pară că "gândește" (UX)
        await new Promise(resolve => setTimeout(resolve, 600));
        return MOCK_TRANSLATIONS[textToTranslate];
    }

    // 2. Dacă nu e în dicționar, încercăm API-ul
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Translate to Romanian: "${textToTranslate}"`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.log("Translation Error:", error);
        return "Traducere indisponibilă (Verifică conexiunea).";
    }
}

// B. VIBE GENERATOR (Textul Creativ)
export async function generateVibeDescription(locationName: string, shortDescription: string): Promise<string> {
    try {
        // Încercăm API-ul cu setări creative
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", // Sau gemini-pro
            generationConfig: { temperature: 1.2 } 
        });

        const prompt = `
            Scrie o descriere scurtă și creativă (Vibe) în română pentru "${locationName}".
            Context: ${shortDescription}.
            Folosește un ton modern și emoji-uri.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();

    } catch (error) {
        console.log("Vibe API Error:", error);
        // Fallback Random
        await new Promise(resolve => setTimeout(resolve, 1000));
        return VIBE_FALLBACKS[Math.floor(Math.random() * VIBE_FALLBACKS.length)];
    }
}