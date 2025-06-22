/*import React, { useEffect, useState, useRef } from 'react';
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
        
        const response = await fetch(`http://192.168.43.145:8080/api/commandes/active/${userId}`, {

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
      const response = await fetch(`http://192.168.43.145:8080/api/v1/livreur/position/${livreurId}`, {

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

export default TrackCommande;*/

/*import React, { useEffect, useState, useRef } from 'react';
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

  const getRouteCoordinates = async (start, end) => {
  const origin = `${start.latitude},${start.longitude}`;
  const destination = `${end.latitude},${end.longitude}`;
  const apiKey = 'AlzaSy5hfGD-tSolKrWuPU6AWpwLIJZaubUheeI';

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}&mode=driving`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes.length) {
      const points = decodePolyline(data.routes[0].overview_polyline.points);
      setRouteCoordinates(points);
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  } catch (err) {
    console.error("Erreur récupération itinéraire:", err);
  }
};

function decodePolyline(encoded) {
  let points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}



  // Fonctions de persistance
  const storeActiveDelivery = async (deliveryData) => {
    await AsyncStorage.setItem('activeDelivery', JSON.stringify(deliveryData));
  };

  const loadActiveDelivery = async () => {
    const stored = await AsyncStorage.getItem('activeDelivery');
    return stored ? JSON.parse(stored) : null;
  };

  const clearActiveDelivery = async () => {
    await AsyncStorage.removeItem('activeDelivery');
    setHasActiveDelivery(false);
  };

  // Vérifie si une position est valide
  const isValidPosition = (pos) => {
    return pos && typeof pos.latitude === 'number' && typeof pos.longitude === 'number';
  };

  // Vérifier s'il y a une commande active
  useEffect(() => {
    const checkActiveDelivery = async () => {
      try {
        // 1. Vérifier le stockage local d'abord
        const storedDelivery = await loadActiveDelivery();
        if (storedDelivery) {
          setHasActiveDelivery(true);
          navigation.setParams(storedDelivery);
          if (storedDelivery.commande?.livraison !== "Livré") {
            setHasActiveDelivery(true);
            navigation.setParams(storedDelivery);
          }
          return;
        }

        // 2. Si pas dans le stockage mais params valides
        if (commandeId && livreurId) {
          setHasActiveDelivery(true);
          await storeActiveDelivery({
            commandeId,
            livreurId,
            livreur,
            adresseLivraison,
            clientInfo,
            positionClient,
            infoSupplementaire,
            commande
          });
          return;
        }

        // 3. Sinon, vérifier via l'API
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');

        const response = await fetch(`http://192.168.43.145:8080/api/commandes/active/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const activeCommande = await response.json();
          if (activeCommande) {
            const deliveryData = {
              commandeId: activeCommande._id,
              livreurId: activeCommande.livreurId?._id,
              livreur: activeCommande.livreurId,
              commande: activeCommande
            };
            navigation.setParams(deliveryData);
            await storeActiveDelivery(deliveryData);
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

    return () => {
      clearInterval(watchId.current);
      if (clientWatchId.current?.remove) clientWatchId.current.remove();
    };
  }, []);

  // Récupérer la position du livreur depuis l'API
  const fetchLivreurPosition = async () => {
    try {
      if (!livreurId) throw new Error(t('aucun_livreur'));

      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.43.145:8080/api/v1/livreur/position/${livreurId}`, {
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
              updateRoute(newPos, clientPosition);
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

  // Fonction pour marquer la livraison comme terminée
  const handleDeliveryComplete = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.43.145:8080/api/commandes/${commandeId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await clearActiveDelivery();
        Alert.alert(t('succes'), t('livraison_marquee_terminee'));
        navigation.goBack();
      } else {
        throw new Error(t('erreur_marquer_terminee'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert(t('erreur'), error.message);
    }
  };

  // Affichage si aucune commande en cours
  // Affichage si aucune commande en cours ou si commande livrée
  if ((!hasActiveDelivery || (commande?.livraison === "Livré")) && !loading) {
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
                  <Text>Livreur</Text>
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
    marginBottom: 16,
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
  },
  secondaryButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TrackCommande;*/

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

  // VOTRE CLÉ API GOOGLE MAPS - REMPLACEZ PAR VOTRE CLÉ
  const GOOGLE_MAPS_API_KEY = 'AIzaSyD7Iee-i7N-4NjTowXg8V6CdaCM084ohj8';

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

  // Fonction pour obtenir l'itinéraire depuis l'API Google Maps Directions
const getRouteCoordinates = async (start, end) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
    
    console.log("URL OSRM:", url); // Debug

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const textResponse = await response.text(); // D'abord lire le texte brut
    console.log("Réponse brute:", textResponse); // Debug

    const data = JSON.parse(textResponse);
    console.log("Données parsées:", data); // Debug

    if (data.routes && data.routes.length > 0) {
      const points = data.routes[0].geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));
      
      console.log("Points de l'itinéraire:", points); // Debug
      setRouteCoordinates(points);
    } else {
      console.warn("Aucun itinéraire trouvé, ligne droite utilisée");
      setRouteCoordinates([start, end]);
    }
  } catch (err) {
    console.error("Erreur OSRM:", err);
    setRouteCoordinates([start, end]); // Fallback sûr
  }
};

  // Fonction pour décoder la polyligne Google Maps
  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return points;
  };

  // Vérifie si une position est valide
  const isValidPosition = (pos) => {
    return pos && typeof pos.latitude === 'number' && typeof pos.longitude === 'number';
  };

  // Vérifier s'il y a une commande active
  useEffect(() => {
    const checkActiveDelivery = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        
        // Si des paramètres valides sont passés
        if (commandeId && livreurId) {
          setHasActiveDelivery(true);
          return;
        }

        // Sinon, vérifier via l'API
        const response = await fetch(`http://192.168.43.145:8080/api/commandes/active/${userId}`, {
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
      const response = await fetch(`http://192.168.43.145:8080/api/v1/livreur/position/${livreurId}`, {
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
    getRouteCoordinates(start, end); // Utilise l'API Google Maps
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

          // Mise à jour périodique de la position du livreur
          watchId.current = setInterval(async () => {
            try {
              const newPos = await fetchLivreurPosition();
              if (isActive) {
                setLivreurPosition(newPos);
                updateRoute(newPos, clientPosition);
              }
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

              {routeCoordinates.length > 0 && (
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
                  <Text>{t('livreur')}</Text>
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
});

export default TrackCommande;


