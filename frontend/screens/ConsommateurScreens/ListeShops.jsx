import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

const ListeShops = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setLoading(true);
    setError('');
    
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission de localisation refusée');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setLocation(location.coords);
      fetchShops(location.coords.latitude, location.coords.longitude); 
    } catch (err) {
      console.error(err);
      setError('Impossible de récupérer votre position');
      setLoading(false);
    }
  };

  const fetchShops = async (lat, lng) => {
    try {
      const response = await fetch(`http://192.168.1.33:8080/api/superettes/nearby?lat=${lat}&lng=${lng}&radius=10000`);

      const data = await response.json();
  
      if (data.success) {
        setShops(data.data.length > 0 ? data.data : [{
          _id: "test123",
          name: "SUPERETTE TEST",
          address: "Adresse test",
          distance: 250,
        }]);
      } else {
        setError(data.message || 'Aucune superette trouvée');
      }
    } catch (err) {
      setError('Erreur réseau - Vérifiez la connexion');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (location) {
      fetchShops(location.latitude, location.longitude);
    } else {
      getLocation();
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.shopCard}
      onPress={() => navigation.navigate('WelcomePage')}
      activeOpacity={0.7}
    >
      <View style={styles.shopIcon}>
        <MaterialIcons name="store" size={28} color="#2E7D32" />
      </View>
      <View style={styles.shopInfo}>
        <Text style={styles.shopName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.shopLocation}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.shopAddress} numberOfLines={1}>{item.address}</Text>
        </View>
        <View style={styles.shopDistanceContainer}>
          <MaterialIcons name="directions-walk" size={16} color="#4285f4" />
          <Text style={styles.shopDistance}>
            {typeof item.distance === 'number' ? 
              `${Math.round(item.distance)} m` : 
              'Distance inconnue'}
          </Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {!location ? (
        <View style={styles.locationPrompt}>
          <View style={styles.locationIconContainer}>
            <MaterialIcons name="location-searching" size={80} color="#2E7D32" />
          </View>
          
          <Text style={styles.promptTitle}>Découvrez les superettes près de vous</Text>
          <Text style={styles.promptText}>
            Nous avons besoin de votre position pour vous montrer les superettes les plus proches
          </Text>
          
          <TouchableOpacity 
            style={[styles.locationButton, loading && styles.disabledButton]} 
            onPress={getLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="my-location" size={20} color="#fff" />
                <Text style={styles.buttonText}>Autoriser la localisation</Text>
              </>
            )}
          </TouchableOpacity>
          
          {error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={20} color="#d32f2f" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Superettes à proximité</Text>
              <Text style={styles.subtitle}>Triées par distance</Text>
            </View>
            <TouchableOpacity 
              onPress={handleRefresh} 
              style={styles.refreshButton}
              disabled={refreshing}
            >
              <MaterialIcons 
                name="refresh" 
                size={24} 
                color={refreshing ? '#2E7D32' : '#666'} 
              />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={shops}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="storefront" size={50} color="#e0e0e0" />
                <Text style={styles.noResults}>Aucune superette trouvée</Text>
                <Text style={styles.noResultsSub}>Essayez d'élargir votre zone de recherche</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={handleRefresh}
                >
                  <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            }
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListHeaderComponent={
              shops.length > 0 && (
                <Text style={styles.resultsCount}>
                  {shops.length} {shops.length > 1 ? 'résultats' : 'résultat'}
                </Text>
              )
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  locationPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  locationIconContainer: {
    backgroundColor: '#e8f5e9',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  promptTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2E7D32',
    textAlign: 'center',
  },
  promptText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
    color: '#616161',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  locationButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 250,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  errorText: {
    color: '#d32f2f',
    marginLeft: 8,
    fontSize: 14,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
    marginLeft: 10,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
  resultsCount: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 15,
    marginLeft: 5,
  },
  shopCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#e8f5e9',
  },
  shopIcon: {
    backgroundColor: '#e8f5e9',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 6,
  },
  shopLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  shopAddress: {
    fontSize: 13,
    color: '#616161',
    marginLeft: 5,
    flexShrink: 1,
  },
  shopDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  shopDistance: {
    fontSize: 13,
    color: '#4285f4',
    fontWeight: '500',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResults: {
    fontSize: 17,
    color: '#424242',
    marginTop: 15,
    fontWeight: '500',
  },
  noResultsSub: {
    fontSize: 14,
    color: '#9e9e9e',
    marginTop: 5,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
});

export default ListeShops;