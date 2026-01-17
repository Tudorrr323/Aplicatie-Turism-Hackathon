import { Redirect } from 'expo-router';
import React from 'react';

// Redirecționează de la ruta rădăcină către ecranul principal al aplicației (explore)
export default function Index() { return <Redirect href="/explore" />; }