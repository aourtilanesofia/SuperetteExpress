import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import Layout from '../../components/Layout/Layout';
import { useTranslation } from "react-i18next";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TrackCommande = ({ route, navigation }) => {
  const { t } = useTranslation();
  const [livreurPosition, setLivreurPosition] = useState(null);
  const [clientPosition, setClientPosition] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasActiveDelivery, setHasActiveDelivery] = useState(false);
  const mapRef = useRef(null);
  const watchId = useRef(null);
  const clientWatchId = useRef(null);

  // Extraire les paramètres avec des valeurs par défaut
  const {
    commandeId = null,
    livreur = null,
    livreurId = null,
    adresseLivraison = null,
    clientInfo = null,
    positionClient = null,
    infoSupplementaire = null,
    commande = null
  } = route.params || {};

  // Vérifie si une position est valide
  const isValidPosition = (pos) => {
    return pos && typeof pos.latitude === 'number' && typeof pos.longitude === 'number';
  };

  // Vérifier s'il y a une commande active
  useEffect(() => {
    const checkActiveDelivery = async () => {
      try {
        // Si des paramètres valides sont passés
        if (commandeId && livreurId) {
          setHasActiveDelivery(true);
          return;
        }

        // Sinon, vérifier via l'API
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        
        const response = await fetch(`http://192.168.1.36:8080/api/commandes/active/${userId}`, {

          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const activeCommande = await response.json();
          if (activeCommande) {
            navigation.setParams({
              commandeId: activeCommande._id,
              livreurId: activeCommande.livreurId?._id,
              livreur: activeCommande.livreurId,
              commande: activeCommande
            });
            setHasActiveDelivery(true);
          }
        }
      } catch (error) {
        console.error("Erreur vérification commande:", error);
        setError(t('erreur_chargement'));
      } finally {
        setLoading(false);
      }
    };

    checkActiveDelivery();
  }, []);

  // Récupérer la position du livreur depuis l'API
  const fetchLivreurPosition = async () => {
    try {
      if (!livreurId) throw new Error(t('aucun_livreur'));

      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.1.36:8080/api/v1/livreur/position/${livreurId}`, {

        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || t('erreur_recuperation_position'));

      if (data?.position?.coordinates) {
        const [longitude, latitude] = data.position.coordinates;
        return { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
      }
      throw new Error(t('position_indisponible'));
    } catch (err) {
      console.error('Erreur récupération position:', err);
      if (livreurPosition) return livreurPosition;
      throw err;
    }
  };

  // Démarrer le suivi de la position client
  const startClientTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permission_requise'), t('activez_localisation'));
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    } catch (err) {
      console.error('Erreur suivi client:', err);
      throw err;
    }
  };

  // Mettre à jour l'itinéraire
  const updateRoute = (start, end) => {
    if (!isValidPosition(start) || !isValidPosition(end)) return;

    setRouteCoordinates([start, end]);
    mapRef.current?.fitToCoordinates([start, end], {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
  };

  // Initialisation du suivi
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const initTracking = async () => {
        if (!hasActiveDelivery) return;

        try {
          setLoading(true);
          setError(null);
          
          const [livreurPos, clientPos] = await Promise.all([
            fetchLivreurPosition(),
            positionClient ? Promise.resolve({
              latitude: positionClient.latitude,
              longitude: positionClient.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }) : startClientTracking()
          ]);

          if (isActive) {
            setLivreurPosition(livreurPos);
            setClientPosition(clientPos);
            updateRoute(livreurPos, clientPos);
          }

          // Mise à jour périodique
          watchId.current = setInterval(async () => {
            try {
              const newPos = await fetchLivreurPosition();
              if (isActive) setLivreurPosition(newPos);
            } catch (err) {
              console.error('Erreur mise à jour position:', err);
            }
          }, 10000);

        } catch (err) {
          if (isActive) {
            setError(err.message || t('erreur_suivi'));
            console.error('Erreur initTracking:', err);
          }
        } finally {
          if (isActive) setLoading(false);
        }
      };

      initTracking();

      return () => {
        isActive = false;
        clearInterval(watchId.current);
        if (clientWatchId.current?.remove) clientWatchId.current.remove();
      };
    }, [hasActiveDelivery, livreurId, positionClient])
  );

  // Calcul de distance (formule haversine en mètres)
  const calculateDistance = (pos1, pos2) => {
    if (!isValidPosition(pos1) || !isValidPosition(pos2)) return 0;
    
    const R = 6371;
    const dLat = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    const dLon = (pos2.longitude - pos1.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pos1.latitude * Math.PI / 180) *
      Math.cos(pos2.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c) * 1000;
  };

  // Affichage si aucune commande en cours
  if (!hasActiveDelivery && !loading) {
    return (
      <Layout>
        <View style={styles.noDeliveryContainer}>
          <Text style={styles.noDeliveryText}>{t('Aucune commande en cours')}</Text>
        </View>
      </Layout>
    );
  }

  // Affichage normal
  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>{t('suivremacommande')}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={livreurPosition || clientPosition}
              showsUserLocation={false}
            >
              {isValidPosition(livreurPosition) && (
                <Marker
                  coordinate={livreurPosition}
                  title={livreur?.nom || t('livreur')}
                  description={livreur?.numTel || ''}
                  pinColor="#2E7D32"
                />
              )}

              {isValidPosition(clientPosition) && (
                <Marker
                  coordinate={clientPosition}
                  title={t('votre_position')}
                  pinColor="#FF5722"
                />
              )}

              {routeCoordinates.length === 2 && (
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="#4285F4"
                  strokeWidth={4}
                />
              )}
            </MapView>

            <View style={styles.infoBox}>
              {isValidPosition(livreurPosition) && isValidPosition(clientPosition) && (
                <Text style={styles.distanceText}>
                  {t('Distance')}: {calculateDistance(livreurPosition, clientPosition).toFixed(1)} mètres
                </Text>
              )}
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: '#2E7D32' }]} />
                  <Text>{livreur?.nom || t('livreur')}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: '#FF5722' }]} />
                  <Text>{t('vous')}</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2E7D32',
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  distanceText: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 20,
  },
  noDeliveryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDeliveryText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    minWidth: 200,
  },
  secondaryButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TrackCommande;