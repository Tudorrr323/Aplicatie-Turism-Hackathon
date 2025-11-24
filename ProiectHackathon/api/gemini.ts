// api/gemini.ts - Implementare MOCK AVANSATĂ

const VIBE_TEMPLATES = [
    // Template 1: Accent pe Vibe și Design
    (name: string, type: string) => `Un colț de rai urban, unde designul minimalist întâlnește ${type}-ul sofisticat. Vibe-ul este perfect pentru a te deconecta.`,
    
    // Template 2: Accent pe Mâncare/Băutură
    (name: string, type: string) => `Savurează experiența ${type} autentică! Locația emană un vibe cald și primitor, perfect pentru o seară cu prietenii.`,

    // Template 3: Accent pe Context (Locație/Studii)
    (name: string, type: string) => `Aproape de campus, acest ${type} este epicentrul social al studenților. Vibe-ul e mereu energic și plin de viață.`,
    
    // Template 4: Accent pe Senzație
    (name: string, type: string) => `Un refugiu boem unde timpul stă în loc. O cafenea care te îmbie la lectură, cu un vibe liniștit și aroma persistentă a cafelei.`,
];

function determineLocationType(name: string, shortDescription: string): string {
    const lowerName = name.toLowerCase();
    const lowerDesc = shortDescription.toLowerCase();
    
    if (lowerName.includes('coffee') || lowerName.includes('café') || lowerDesc.includes('espresso')) {
        return "cafeaua de specialitate";
    }
    if (lowerName.includes('pizza') || lowerName.includes('trattoria') || lowerDesc.includes('italian')) {
        return "gustul Italiei";
    }
    if (lowerName.includes('burger') || lowerName.includes('fast-food') || lowerDesc.includes('kebab')) {
        return "mâncarea rapidă artizanală";
    }
    if (lowerDesc.includes('fish') || lowerDesc.includes('seafood') || lowerName.includes('pescaresc')) {
        return "deliciile marine";
    }
    return "vibrațiile locului";
}


/**
 * Simulează un apel AI asincron, generând text dinamic bazat pe tipul locației.
 */
export async function generateVibeDescription(locationName: string, shortDescription: string): Promise<string> {
    
    // 1. Simulează o întârziere de 1.5 secunde
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    // 2. Determină tipul locației (pentru personalizare)
    const type = determineLocationType(locationName, shortDescription);
    
    // 3. Alege un template aleatoriu și îl personalizează
    const randomIndex = Math.floor(Math.random() * VIBE_TEMPLATES.length);
    const selectedTemplate = VIBE_TEMPLATES[randomIndex];

    return selectedTemplate(locationName, type);
}