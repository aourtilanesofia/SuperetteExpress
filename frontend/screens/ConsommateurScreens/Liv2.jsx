import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { decode } from '@mapbox/polyline';

const Liv2 = ({ navigation, route }) => {
  // Extraction des paramètres
  const { commande, livreur, adresseLivraison, total,numeroCommande } = route.params;

  // États
  const [region, setRegion] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [driverPosition, setDriverPosition] = useState(null);
  const [duration, setDuration] = useState('--');
  const [distance, setDistance] = useState('--');

  // 1. Géocodage gratuit avec OpenStreetMap Nominatim
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        {
          headers: {
            'User-Agent': 'YourApp/1.0 (your@email.com)' // Nécessaire pour Nominatim
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error("Erreur de géocodage:", error);
      return null;
    }
  };

  // 2. Calcul d'itinéraire gratuit avec OSRM
  const calculateRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=polyline`
      );
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        
        // Utilisation correcte de decode
        const points = decode(route.geometry); // Décode la polyligne
        
        const coords = points.map(point => ({
          latitude: point[0],
          longitude: point[1]
        }));
        
        setCoordinates(coords);
        setDuration(Math.round(route.duration / 60));
        setDistance((route.distance / 1000).toFixed(1));
        
        setRegion({
          latitude: (start.latitude + end.latitude) / 2,
          longitude: (start.longitude + end.longitude) / 2,
          latitudeDelta: Math.abs(start.latitude - end.latitude) * 1.5,
          longitudeDelta: Math.abs(start.longitude - end.longitude) * 1.5,
        });
      }
    } catch (error) {
      console.error("Erreur de calcul d'itinéraire:", error);
      // Solution de repli : ligne droite entre les points
      setCoordinates([start, end]);
      setDuration(Math.round(
        Math.sqrt(
          Math.pow(start.latitude - end.latitude, 2) + 
          Math.pow(start.longitude - end.longitude, 2)
        ) * 10
      ));
      setDistance(
        Math.sqrt(
          Math.pow(start.latitude - end.latitude, 2) + 
          Math.pow(start.longitude - end.longitude, 2)
        ).toFixed(1)
      );
    }
  };

  // 3. Simulation de la position du livreur (à remplacer par du réel en production)
  const simulateDriverMovement = (start, end) => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < coordinates.length - 1) {
        setDriverPosition(coordinates[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 3000); // Mise à jour toutes les 3 secondes
    
    return () => clearInterval(interval);
  };

  // Initialisation
  useEffect(() => {
    const initTracking = async () => {
      try {
        // Géocodage de l'adresse de livraison
        const destination = await geocodeAddress(adresseLivraison);
        if (!destination) return;

        // Position de départ du livreur
        const start = {
          latitude: livreur.position.coordinates[1],
          longitude: livreur.position.coordinates[0]
        };

        // Calcul de l'itinéraire
        await calculateRoute(start, destination);

        // Simulation du déplacement
        simulateDriverMovement(start, destination);

      } catch (error) {
        console.error("Erreur initialisation:", error);
      }
    };

    initTracking();
  }, []);

  // Fonction pour appeler le livreur
  const callDriver = () => {
    Linking.openURL(`tel:${livreur.numTel}`);
  };

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Suivi de commande</Text>
      </View>

      {/* Carte */}
      {region && (
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation={false}
        >
          {/* Itinéraire */}
          <Polyline
            coordinates={coordinates}
            strokeWidth={4}
            strokeColor="#4CAF50"
          />
          
          {/* Position du livreur */}
          {driverPosition && (
            <Marker coordinate={driverPosition}>
              <View style={styles.driverMarker}>
                <Ionicons name="bicycle" size={24} color="white" />
              </View>
            </Marker>
          )}
          
          {/* Destination */}
          {coordinates.length > 0 && (
            <Marker coordinate={coordinates[coordinates.length - 1]}>
              <View style={styles.destinationMarker}>
                <Ionicons name="flag" size={20} color="white" />
              </View>
            </Marker>
          )}
        </MapView>
      )}

      {/* Infos livreur */}
      <View style={styles.driverInfo}>
        <Text style={styles.driverName}>{livreur.nom}</Text>
        <View style={styles.driverDetails}>
          <Text>{distance} km - {duration} min</Text>
          <TouchableOpacity onPress={callDriver}>
            <Ionicons name="call" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Détails commande */}
      <View style={styles.orderInfo}>
        <Text style={styles.orderText}>N° Commande: {numeroCommande}</Text>
        <Text style={styles.orderText}>Total: {total} DA</Text>
        <Text style={styles.orderText}>Adresse: {adresseLivraison}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    padding: 15,
    backgroundColor: '#4CAF50'
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  map: {
    width: '100%',
    height: 300
  },
  driverMarker: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white'
  },
  destinationMarker: {
    backgroundColor: '#FF5722',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white'
  },
  driverInfo: {
    padding: 15,
    backgroundColor: 'white'
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  driverDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  orderInfo: {
    padding: 15,
    backgroundColor: 'white',
    marginTop: 10
  },
  orderText: {
    marginBottom: 5
  }
});

export default Liv2;