// components/AdresseSection.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

const AdresseSection = () => {
  const [adresse, setAdresse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAdresse('Permission refusée');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync(location.coords);

      if (geocode.length > 0) {
        const { name, street, city, region, country } = geocode[0];
        const fullAddress = `${name} ${street}, ${city}, ${region}, ${country}`;
        setAdresse(fullAddress);
      } else {
        setAdresse('Adresse non trouvée');
      }

      setLoading(false);
    })();
  }, []);

  const handlePressAdresse = () => {
    // ici tu affiches un modal avec les options : "choisir sur carte", "saisir manuellement"
    alert('Affichage modal avec carte et saisie manuelle ici');
  };

  return (
    <TouchableOpacity onPress={handlePressAdresse}>
      <View style={styles.container}>
        <Text style={styles.label}>Adresse</Text>
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={styles.adresseText}>{adresse}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default AdresseSection;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  adresseText: {
    fontSize: 14,
  },
});
