import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import LayoutLivreur from '../../components/LayoutLivreur/LayoutLivreur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from "react-i18next";
import AsyncStorage from '@react-native-async-storage/async-storage';

const MiseAjoueEtatDeCommande = ({ route, navigation }) => {
  const { t } = useTranslation();
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disabledButtons, setDisabledButtons] = useState(false);
  const [livreurId, setLivreurId] = useState(null);
  const [clientInfo, setClientInfo] = useState({
    nom: '',
    numTel: '',
    adresse: '',
    infoSupplementaire: '',
    total: 0
  });

  const loadAllData = async () => {
    try {
      setLoading(true);

      if (route.params) {
        const {
          commandeInitiale,
          nom,
          numTel,
          adresse,
          infoSupplementaire,
          total
        } = route.params;

        setCommande(commandeInitiale);
        setClientInfo({
          nom: nom || '',
          numTel: numTel || '',
          adresse: adresse || '',
          infoSupplementaire: infoSupplementaire || '',
          total: total || 0
        });
        return;
      }

      const savedData = await AsyncStorage.getItem('commandeData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setCommande(parsedData.commande);
        setClientInfo(parsedData.clientInfo);
      }
    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAllData = async () => {
    try {
      const dataToSave = {
        commande,
        clientInfo,
        timestamp: new Date().getTime()
      };
      await AsyncStorage.setItem('commandeData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Erreur de sauvegarde:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        const id = await AsyncStorage.getItem('livreurId');
        if (id) {
          setLivreurId(id);
          await loadAllData();
        }
      } catch (error) {
        console.error("Erreur d'initialisation:", error);
      }
    };

    initializeData();

    const unsubscribe = navigation.addListener('focus', () => {
      loadAllData();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (commande && clientInfo.nom) {
      saveAllData();
    }
  }, [commande, clientInfo]);

  const updateCommande = async (newStatus) => {
    if (!commande || !livreurId) return;

    setDisabledButtons(true);
    try {
      const response = await fetch(
        `http://192.168.38.149:8080/api/commandes/ModifierStat/${commande._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            livraison: newStatus,
            livreurId
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Erreur HTTP: ${response.status}`);
      }

      const updatedCommande = { ...commande, livraison: newStatus };
      setCommande(updatedCommande);

      Alert.alert("Succès", `Commande marquée comme ${newStatus}`);

      if (newStatus === 'Livré' || newStatus === 'Non Livré') {
        setTimeout(() => {
          navigation.navigate('ListeCommandeALivre'); 
        }, 2000);
      }
    } catch (err) {
      Alert.alert("Erreur", err.message);
    } finally {
      setDisabledButtons(false);
    }
  };

  // Fonction pour déterminer l'affichage du paiement
  useEffect(() => {
    if (commande) {
      console.log("Commande complète:", JSON.stringify(commande, null, 2));
      console.log("Paiement:", commande.paiement);
    }
  }, [commande]);
  const getPaymentDisplay = () => {
    if (!commande) return 'Non spécifié';
    console.log("Données reçues de l'API:", JSON.stringify(commande, null, 2));
    
    const paiement = commande.paiement?.toLowerCase() || '';
    
    if (paiement.includes('Payée')) return 'Par carte';
    if (paiement.includes('En attente de paiement')) return 'En espèce';
    if (paiement.includes('Non')) return 'Non Payée';
    
    return 'Non spécifié';
  };

  if (loading) {
    return (
      <LayoutLivreur>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </LayoutLivreur>
    );
  }

  if (!commande) {
    return (
      <LayoutLivreur>
        <View style={styles.emptyContainer}>
          <Icon name="assignment" size={50} color="#95a5a6" />
          <Text style={styles.emptyText}>{t('Aucune livraison')}</Text>
        </View>
      </LayoutLivreur>
    );
  }

  const isDisabled = disabledButtons ||
    commande.livraison === "Livré" ||
    commande.livraison === "Non Livré";

  return (
    <LayoutLivreur>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.header}>{t('suiviliv')}</Text>

          <View style={styles.card}>
            <Text style={styles.commandeId}>
              {t('Commande')} #{commande.numeroCommande}
            </Text>

            <View style={styles.infoRow}>
              <Icon name="person" size={16} color="#555" />
              <Text> {clientInfo.nom || commande.userId?.nom || t('client_inconnu')}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="phone" size={16} color="#555" />
              <Text> {clientInfo.numTel || commande.userId?.numTel || t('non_disponible')}</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="location-on" size={16} color="#555" />
              <Text> {clientInfo.adresse || commande.destination?.adresse || t('adresse_non_disponible')}</Text>
            </View>

            {clientInfo.infoSupplementaire && (
              <View style={styles.infoRow}>
                <Icon name="info" size={16} color="#555" />
                <Text> {clientInfo.infoSupplementaire}</Text>
              </View>
            )}

            <View style={styles.statusContainer}>
              <Text style={[
                styles.statusText,
                commande.livraison === 'Livré' && styles.statusLivree,
                commande.livraison === 'Non Livré' && styles.statusNonLivree,
                commande.livraison === 'En cours' && styles.statusEnCours
              ]}>
                {t('livraison')}: {commande.livraison || t('en_attente')}
              </Text>

              <View style={styles.infoRow}>
                <Icon name="payment" size={16} color="#555" />
                <Text> Paiement : {getPaymentDisplay()}</Text>
              </View>
            </View>

            <Text style={styles.totalText}>
              {t('total')}: {(commande.total + 130)} DA
            </Text>
          </View>

          {commande.livraison === 'En cours' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.livreButton]}
                onPress={() => updateCommande('Livré')}
                disabled={isDisabled}
              >
                <Text style={styles.buttonText}>{t('livre')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.nonLivreButton]}
                onPress={() => updateCommande('Non Livré')}
                disabled={isDisabled}
              >
                <Text style={styles.buttonText}>{t('nonlivre')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </LayoutLivreur>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 20,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  commandeId: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 15,
    color: '#2c3e50'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    marginVertical: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  statusText: {
    fontSize: 16,
    marginVertical: 5,
  },
  statusLivree: {
    color: '#27ae60',
    fontWeight: 'bold'
  },
  statusNonLivree: {
    color: '#e74c3c',
    fontWeight: 'bold'
  },
  statusPayee: {
    color: '#2980b9',
    fontWeight: 'bold'
  },
  statusEnCours: {
    color: '#FFA500',
    fontWeight: 'bold'
  },
  totalText: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'right',
    color: '#2c3e50'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  livreButton: {
    backgroundColor: '#4CAF50',
  },
  nonLivreButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    color: '#95a5a6',
    fontSize: 18,
    marginVertical: 20,
    textAlign: 'center'
  },
  backButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    marginTop: 20
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default MiseAjoueEtatDeCommande;