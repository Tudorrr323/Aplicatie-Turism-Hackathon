# Aplicație Turism Hackathon (Top Places)

Aceasta este o aplicație mobilă de turism dezvoltată în cadrul unui Hackathon, menită să ajute utilizatorii (în special studenții și turiștii) să descopere locații interesante precum restaurante, cafenele și obiective turistice.

Aplicația oferă o experiență modernă, integrând hărți interactive, traduceri automate și descrieri generate de AI pentru a oferi un "vibe" al locului.

## 📱 Funcționalități Principale

*   **Explorare Locații**: Vizualizarea unei liste de locații recomandate, cu detalii esențiale.
*   **Hărți Interactive**: Integrare cu Google Maps pentru vizualizarea locațiilor pe hartă (`react-native-maps`).
*   **Moduri de Vizualizare**: Comutare rapidă între vizualizarea tip Listă și Hartă.
*   **Detalii Locație**: Pagini dedicate pentru fiecare locație, incluzând descrieri și informații specifice.
*   **Integrare AI (Gemini)**:
    *   **Traduceri**: Traducerea automată a descrierilor în limba română.
    *   **Vibe Generator**: Generarea unor descrieri creative ("vibe") pentru locații folosind Google Gemini AI.
*   **Chatbot**: Asistent virtual integrat pentru a răspunde la întrebări despre locații.
*   **Filtrare**: Posibilitatea de a filtra locațiile în funcție de preferințe.
*   **Profil Utilizator**: Secțiune pentru administrarea profilului (integrare posibilă cu Supabase).

## 📸 Galerie Foto

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="./Poze/Screenshot_20251127_113512_Top Places.jpg" alt="Screenshot 1" width="30%">
  <img src="./Poze/Screenshot_20251127_113517_Top Places.jpg" alt="Screenshot 2" width="30%">
  <img src="./Poze/Screenshot_20251127_113523_Top Places.jpg" alt="Screenshot 3" width="30%">
  <img src="./Poze/Screenshot_20251127_113530_Top Places.jpg" alt="Screenshot 4" width="30%">
  <img src="./Poze/Screenshot_20251127_113617_Top Places.jpg" alt="Screenshot 5" width="30%">
  <img src="./Poze/Screenshot_20251127_113627_Top Places.jpg" alt="Screenshot 6" width="30%">
  <img src="./Poze/Screenshot_20251127_113636_Top Places.jpg" alt="Screenshot 7" width="30%">
  <img src="./Poze/Screenshot_20251127_113641_Top Places.jpg" alt="Screenshot 8" width="30%">
  <img src="./Poze/Screenshot_20251127_113654_Top Places.jpg" alt="Screenshot 9" width="30%">
  <img src="./Poze/Screenshot_20251127_113657_Top Places.jpg" alt="Screenshot 10" width="30%">
  <img src="./Poze/Screenshot_20251127_113732_Top Places.jpg" alt="Screenshot 11" width="30%">
  <img src="./Poze/Screenshot_20251127_114134_Top Places.jpg" alt="Screenshot 12" width="30%">
</div>

## 🛠️ Tehnologii Utilizate

*   **Framework**: [React Native](https://reactnative.dev/) cu [Expo](https://expo.dev/) (SDK 54).
*   **Limbaj**: TypeScript.
*   **Navigație**: [Expo Router](https://docs.expo.dev/router/introduction/).
*   **Hărți**: `react-native-maps`.
*   **AI**: [Google Gemini API](https://ai.google.dev/) (`@google/generative-ai`).
*   **Backend / Bază de date**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`).
*   **UI/UX**: `expo-linear-gradient`, `@expo/vector-icons`.

## 📂 Structura Proiectului

```text
ProiectHackathon/
├── app/                 # Ecrane și rute (Expo Router)
│   ├── (tabs)/          # Ecranele principale (Explore, Profile, etc.)
│   ├── locations/       # Rute dinamice pentru detalii locații
│   └── ...
├── components/          # Componente reutilizabile (Carduri, Modale, Hărți)
├── api/                 # Integrări API (ex: gemini.ts)
├── data/                # Date statice (ex: locations.json)
├── lib/                 # Configurări biblioteci externe (ex: supabase.ts)
└── assets/              # Resurse statice (imagini, fonturi)
```

## 🚀 Instalare și Rulare

1.  **Clonează repository-ul** (dacă este cazul) și navighează în folderul proiectului:
    ```bash
    cd ProiectHackathon
    ```

2.  **Instalează dependențele**:
    ```bash
    npm install
    ```

3.  **Configurare Mediu**:
    *   Asigură-te că ai cheile API necesare (Google Maps, Gemini AI, Supabase).
    *   Verifică fișierele de configurare (ex: `app.json`, `api/gemini.ts`).
    *   *Notă: Nu uita să îți adaugi propriile chei API în locurile marcate sau în fișiere `.env` dacă este configurat.*

4.  **Pornește aplicația**:
    ```bash
    npx expo start
    ```
    *   Scanează codul QR cu aplicația **Expo Go** pe telefon (Android/iOS).
    *   Apasă `w` pentru a rula în browser (web).
    *   Apasă `a` pentru Android Emulator sau `i` pentru iOS Simulator.

## 📝 Note pentru Dezvoltatori

*   Fișierul `api/gemini.ts` conține logica de integrare cu AI-ul și un sistem de fallback pentru traduceri (`MOCK_TRANSLATIONS`) în cazul în care API-ul nu răspunde.
*   Navigația este gestionată prin sistemul de fișiere din folderul `app/`, specific Expo Router.
