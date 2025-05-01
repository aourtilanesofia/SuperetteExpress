import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Layout from '../../components/Layout/Layout';
import { useTranslation } from "react-i18next";

const TrackCommande = () => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const res = await fetch('http://192.168.1.42:8080/api/commandes/dernierelocalisation');
        const data = await res.json();

        if (data.success && data.data.lat && data.data.lng) {
          setPosition({
            latitude: data.data.lat,
            longitude: data.data.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } else {
          Alert.alert('Erreur', 'Position du livreur non disponible');
        }
      } catch (err) {
        console.error('Erreur récupération position:', err);
        Alert.alert('Erreur', 'Impossible de récupérer la position du livreur');
      } finally {
        setLoading(false);
      }
    };

    fetchPosition();
  }, []);

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>{t('suivremacommande')}</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : position ? (
          <MapView style={styles.map} region={position}>
            <Marker coordinate={position} title="Livreur" />
          </MapView>
        ) : (
          <Text>Position non disponible</Text>
        )}
      </View>
    </Layout>
  );
};

export default TrackCommande;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  map: {
    flex: 1,
    height: 400,
    width: '100%',
    borderRadius: 10,
  },
});
