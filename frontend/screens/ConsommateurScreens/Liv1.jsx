import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ProgressBarAndroid,
  Platform,
  Linking,
  RefreshControl,
  ScrollView
} from 'react-native';
import Layout from '../../components/Layout/Layout';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const Liv1 = ({ route }) => {
  const { commande, adresseLivraison, infoSupplementaire, numeroCommande } = route.params;
  const [livreur, setLivreur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [commandeAcceptee, setCommandeAcceptee] = useState(false);

  const navigation = useNavigation();

  const notifyLivreur = async (livreurId) => {
    try {
      const response = await fetch(`http://192.168.1.36:8080/api/v1/livreur/assigner`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          livreurId,
          numeroCommande: commande.numeroCommande,
          client: commande.userId?.nom || "Inconnu",
          adresse: adresseLivraison,
          total: commande.total,
          infoSupplementaire
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de l'assignation");
      }
    } catch (error) {
      Alert.alert("Erreur", error.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLivreur();
    setRefreshing(false);
  };

  useEffect(() => {
    const checkCommandeLivraison = async () => {
      try {
        const response = await fetch(`http://192.168.1.36:8080/api/commandes/${numeroCommande}/livraison`);

        const data = await response.json();

        if (data.livraison === 'Acceptée') {
          setCommandeAcceptee(true);
        } else if (data.livraison === 'Refusée') {
          navigation.navigate('CommandeRefusee', {
            numeroCommande,
            livreur,
            commande 
          });
        }
      } catch (error) {
        console.error("Erreur vérification statut livraison:", error);
      }
    };

    const interval = setInterval(checkCommandeLivraison, 10000);
    return () => clearInterval(interval);
  }, [numeroCommande]);

  const assignerCommandeAuLivreur = async (numeroCommande, livreurId) => {
    try {
      const response = await fetch(`http://192.168.1.36:8080/api/commandes/assigner`, {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numeroCommande,
          livreurId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de l\'assignation');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur assignation', error);
      throw error;
    }
  };

  const fetchLivreur = async () => {
    try {
      setLoading(true);
      setError(null);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission de localisation refusée');
        setLoading(false);
        return;
      }

      let destinationLocation = await Location.getCurrentPositionAsync({});
      const destination = {
        latitude: destinationLocation.coords.latitude,
        longitude: destinationLocation.coords.longitude
      };

      const livreurResponse = await fetch(
        `http://192.168.1.36:8080/api/v1/livreur/nearby?longitude=${destination.longitude}&latitude=${destination.latitude}&maxDistance=10000`

      );

      if (!livreurResponse.ok) {
        const errorData = await livreurResponse.json();
        throw new Error(errorData.message || 'Erreur lors de la recherche des livreurs');
      }

      const livreurData = await livreurResponse.json();

      if (!livreurData.data || livreurData.data.length === 0) {
        setError('Aucun livreur disponible dans votre zone');
        setLoading(false);
        return; 
      }

      const nearestLivreur = livreurData.data[0];
      setLivreur(nearestLivreur);
      notifyLivreur(nearestLivreur._id);
      await assignerCommandeAuLivreur(numeroCommande, nearestLivreur._id);

    } catch (error) {
      console.error("Erreur:", error);
      setError(error.message || 'Erreur lors de la recherche du livreur');
    } finally {
      setLoading(false);
    }
  };

  const callLivreur = () => {
    if (livreur?.numTel) {
      Linking.openURL(`tel:${livreur.numTel}`);
    }
  };

  useEffect(() => {
    fetchLivreur();
  }, []);

  const annulerCommande = async () => {
    try {
      const response = await fetch(
        `http://192.168.1.36:8080/api/commandes/cancel/${commande.numeroCommande}`,

        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur serveur");
      }

      alert("Commande annulée avec succès!");
      navigation.navigate('AcceuilConsommateur');
    } catch (error) {
      console.error("Erreur complète:", error);
      alert(`Échec: ${error.message}`);
    }
  };

  const handlePaiement = async () => {
    try {
      const response = await fetch(`http://192.168.1.36:8080/api/commandes/${numeroCommande}/livraison`);

      const data = await response.json();

      if (data.livraison === 'Acceptée') {
        navigation.navigate('ModePaiement', {
          commande,
          livreur,
          adresse: adresseLivraison,
          infoSupplementaire,
          numeroCommande,
          total: commande.total,
        });
      } else if (data.livraison === 'Refusée') {
        navigation.navigate('CommandeRefusee', {
          numeroCommande,
          livreur,
          commande
        });
      } else {
        alert("La commande n'a pas encore été acceptée");
      }
    } catch (error) {
      console.error("Erreur vérification statut livraison:", error);
      alert("Erreur réseau");
    }
  };

  


  return (
    <Layout>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {/* Section de recherche en haut */}
        <View style={styles.searchContainer}>
          {loading ? (
            <View style={styles.searchContent}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Recherche du livreur le plus proche...</Text>
              {Platform.OS === 'android' ? (
                <ProgressBarAndroid
                  styleAttr="Horizontal"
                  indeterminate={false}
                  progress={progress}
                  color="#4CAF50"
                  style={styles.progressBar}
                />
              ) : (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                </View>
              )}
            </View>
          ) : error ? (
            <View style={styles.searchContent}>
              <Ionicons name="warning" size={40} color="#FF5252" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setLoading(true);
                  setError(null);
                  setProgress(0);
                  fetchLivreur();
                }}
              >
                <Text style={styles.retryButtonText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          ) : livreur ? (
            <View style={styles.livreurContainer}>
              <View style={styles.livreurHeader}>
                <View style={styles.userIcon}>
                  <Ionicons name="person" size={24} color="white" />
                </View>
                <Text style={styles.livreurName}>{livreur.nom}</Text>
                <TouchableOpacity style={styles.callButton} onPress={callLivreur}>
                  <Ionicons name="call" size={20} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.livreurDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="car" size={16} color="#4CAF50" />
                  <Text style={styles.detailText}>{livreur.categorie} - {livreur.marque} - {livreur.matricule}</Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        {/* Section des informations fixes en bas */}
        <View style={styles.bottomSection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Résumé de la commande</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Net</Text>
              <Text style={styles.summaryValue}>{commande?.total ?? '6800'} DA</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mode de livraison</Text>
              <Text style={styles.summaryValue}>À domicile</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.paymentButton}
            onPress={handlePaiement}
          >
            <Text style={styles.paymentButtonText}>Procéder au paiement</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>


          <TouchableOpacity style={styles.cancelButton} onPress={annulerCommande}>
            <Text style={styles.cancelButtonText}>Annuler la commande</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 40,
  },
  searchContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#616161',
    marginVertical: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 8,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#FF5252',
    marginVertical: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  livreurContainer: {
    width: '100%',
  },
  livreurHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  livreurName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  livreurDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    bottom: 250,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  paymentButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    bottom: 200,
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FF5252',
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    bottom: 200,
  },
  cancelButtonText: {
    color: '#FF5252',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Liv1;