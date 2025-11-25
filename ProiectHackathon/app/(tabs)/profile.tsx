import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, Image, Platform } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthProvider';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface AvatarProps {
  url: string | null | undefined;
  size?: number;
  onUpload: (uri: string) => void;
}

const Avatar = ({ url, size = 150, onUpload }: AvatarProps) => {
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    setUploading(true);
    await onUpload(result.assets[0].uri);
    setUploading(false);
  };

  return (
    <TouchableOpacity onPress={uploadAvatar} style={styles.avatarContainer}>
      {url ? <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: size / 2 }} /> : <Ionicons name="person-circle-outline" size={size} color="#333" />}
      {uploading && <View style={styles.uploadingOverlay}><ActivityIndicator color="#fff" /></View>}
    </TouchableOpacity>
  );
};

const ProfilePage = () => {
  const { session, user, loading, signOut, refreshSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState(''); // ex: 'YYYY-MM-DD'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginView, setIsLoginView] = useState(false); // Afișează implicit formularul de creare cont
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const router = useRouter();

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Te rog completează email-ul și parola.');
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert('Eroare la autentificare', error.message);
    } else {
      refreshSession(); // Forțăm reîmprospătarea sesiunii după login
    }
    setIsSubmitting(false);
  }

  async function signUpWithEmail() {
    if (!email || !password || !firstName || !lastName || !birthDate) {
      Alert.alert('Te rog completează toate câmpurile.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Parolele nu corespund', 'Te rog asigură-te că parolele introduse sunt identice.');
      return;
    }
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    if (age < 14) {
        Alert.alert('Vârstă invalidă', 'Trebuie să ai cel puțin 14 ani pentru a crea un cont.');
        return;
    }
    setIsSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          birth_date: birthDate,
        },
      },
    });
    if (error) {
      Alert.alert('Eroare la înregistrare', error.message);
    } else if (!data.session) {
      Alert.alert('Verificare necesară', 'Te rog verifică-ți email-ul pentru a finaliza înregistrarea.');
    }
    setIsSubmitting(false);
  }

  async function uploadAvatar(uri: string) {
    if (!session || !user) return;

    const fileExt = uri.split('.').pop();
    const fileName = `${session.user.id}.${fileExt}`;
    const filePath = `${fileName}`;

    // Construim corect FormData pentru React Native
    const formData = new FormData(); 
    formData.append('file', { 
      uri,
      name: fileName,
      type: `image/${fileExt}`,
    } as any);

    // Încărcăm fișierul folosind fetch pentru a putea seta header-ul corect
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, formData, {
        upsert: true, // Suprascrie fișierul dacă există deja
      });

    if (uploadError) {
      Alert.alert('Eroare la încărcare', uploadError.message);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = `${data.publicUrl}?t=${new Date().getTime()}`;

    // Actualizăm metadatele utilizatorului cu noua adresă URL a avatarului
    // Forțăm reîmprospătarea sesiunii pentru a ne asigura că token-ul este valid
    await supabase.auth.refreshSession();

    const { error: updateError } = await supabase.auth.updateUser({
      data: { ...user.user_metadata, avatar_url: publicUrl }
    });

    if (updateError) Alert.alert('Eroare la actualizare', updateError.message);
    else {
      // Reîmprospătăm sesiunea pentru a prelua datele actualizate ale utilizatorului
      refreshSession();
    }
  }

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios'); // Pe iOS, picker-ul e un modal, pe Android nu
    setDate(currentDate);

    if (event.type === 'set') {
        // Formatăm data în YYYY-MM-DD pentru Supabase
        const formattedDate = currentDate.toISOString().split('T')[0];
        setBirthDate(formattedDate);
    }
  };

  // Afișează indicatorul de încărcare dacă datele se încarcă SAU dacă sesiunea există dar profilul nu a fost încă preluat.
  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color={Colors.light.tint} /></View>;
  }

  if (session && user) {
    return (
      <View style={styles.fullPageContainer}>
        <TouchableOpacity onPress={() => router.push('/explore')} style={styles.backButton}><Ionicons name="arrow-back" size={28} color={Colors.light.tint} /></TouchableOpacity>
        <Avatar url={user.user_metadata.avatar_url} size={120} onUpload={uploadAvatar} />
        <Text style={styles.title}>{user.user_metadata.first_name} {user.user_metadata.last_name}</Text>
        <Text style={styles.subtitle}>{user.email}</Text>
        {user.user_metadata.birth_date && <Text style={styles.text}>Data nașterii: {new Date(user.user_metadata.birth_date).toLocaleDateString('ro-RO')}</Text>}
        <Text style={styles.text}>Membru din: {new Date(user.created_at).toLocaleDateString('ro-RO')}</Text>
        <TouchableOpacity style={styles.button} onPress={async () => {
          await signOut();
          router.replace('/explore'); // Redirecționează la ecranul principal după deconectare
        }}>
          <Text style={styles.buttonText}>Deconectare</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.authContainer}>
      {/* Butonul de Back */}
      <TouchableOpacity onPress={() => router.push('/explore')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color={Colors.light.tint} />
      </TouchableOpacity>

      <Text style={styles.title}>{isLoginView ? 'Autentificare' : 'Creare Cont'}</Text>

      {!isLoginView && (
        <>
          <TextInput style={styles.input} placeholder="Prenume" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
          <TextInput style={styles.input} placeholder="Nume" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
        </>
      )}

      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Parolă" value={password} onChangeText={setPassword} secureTextEntry />
      {!isLoginView && <TextInput style={styles.input} placeholder="Parolă (confirmare)" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />}
      
      {!isLoginView && (
        <>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={{color: birthDate ? '#000' : '#aaa', fontSize: 16}}>{birthDate ? new Date(birthDate).toLocaleDateString('ro-RO') : 'Data nașterii'}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker testID="dateTimePicker" value={date} mode="date" display="spinner" onChange={onChangeDate} maximumDate={new Date()} />
            )}
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={isLoginView ? signInWithEmail : signUpWithEmail} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isLoginView ? 'Intră în cont' : 'Creează cont'}</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLoginView(!isLoginView)}>
        <Text style={styles.switchText}>
          {isLoginView ? 'Nu ai cont? Creează unul acum!' : 'Ai deja cont? Intră în cont!'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  fullPageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 150, // Match the avatar size
  },
  backButton: {
    position: 'absolute',
    top: 60, // Ajustat pentru a fi vizibil sub bara de status
    left: 25,
    zIndex: 1,
    padding: 5,
  },
  authContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  text: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center', // Adaugă această linie pentru a centra textul vertical
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchText: {
    marginTop: 20,
    color: Colors.light.tint,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ProfilePage;