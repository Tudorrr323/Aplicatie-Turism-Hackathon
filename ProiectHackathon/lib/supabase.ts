import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chtdjkzxhamedzwricnu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodGRqa3p4aGFtZWR6d3JpY251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDYyMDUsImV4cCI6MjA3OTU4MjIwNX0.NLPZ6aWiFaGPwePyldNcqW4oXunxwxFiq5-gXyyFX00';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});