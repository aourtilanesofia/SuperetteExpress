import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import LayoutLivreur from '../../components/LayoutLivreur/LayoutLivreur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from "react-i18next";
import AsyncStorage from '@react-native-async-storage/async-storage';

const MiseAJoueEtatDeCommande = ({ route, navigation }) => {
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
          total,
          paymentMethod
        } = route.params;

        const mergedCommande = {
          ...commandeInitiale,
          paymentMethod: paymentMethod || commandeInitiale.paymentMethod || 'Non spécifié',
          paiement: paymentMethod === 'Carte CIB' ? 'Payée' : 
                  (paymentMethod === 'Espèces' ? 'En attente de paiement' : 
                  commandeInitiale.paiement || 'Non spécifié')
        };

        setCommande(mergedCommande);
        
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
        const commandeData = parsedData.commande || parsedData.commandeInitiale;
        
        if (commandeData) {
          setCommande({
            ...commandeData,
            paymentMethod: commandeData.paymentMethod || 'Non spécifié',
            paiement: commandeData.paymentMethod === 'Carte CIB' ? 'Payée' : 
                    (commandeData.paymentMethod === 'Espèces' ? 'En attente de paiement' : 
                    commandeData.paiement || 'Non spécifié')
          });
        }
        
        setClientInfo(parsedData.clientInfo || {
          nom: '',
          numTel: '',
          adresse: '',
          infoSupplementaire: '',
          total: 0
        });
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
        commande: {
          ...commande,
          paymentMethod: commande.paymentMethod || 'Non spécifié'
        },
        clientInfo,
        timestamp: new Date().getTime()
      };
      await AsyncStorage.setItem('commandeData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Erreur de sauvegarde:", error);
    }
  };

  const getPaymentDisplay = () => {
    if (!commande) return 'Non spécifié';
  
    switch(commande.paiement) {
      case 'Payée':
        return 'Par carte';
      case 'En attente de paiement':
        return 'En espèce';
      case 'Non':
        return 'Non payée';
      default:
        return 'Non spécifié';
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

  if (loading) {
    return (
      <LayoutLivreur>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>{t('Chargement en cours...')}</Text>
        </View>
      </LayoutLivreur>
    );
  }

  if (!commande) {
    return (
      <LayoutLivreur>
        <View style={styles.emptyContainer}>
          <Image 
            source={require('../../assets/empty-box.png')} 
            style={styles.emptyImage}
          />
          <Text style={styles.emptyTitle}>{t('Aucune livraison en cours')}</Text>
          <Text style={styles.emptySubtitle}>{t('Aucune commande à afficher pour le moment')}</Text>
          
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadAllData}
          >
            <Text style={styles.retryButtonText}>{t('Réessayer')}</Text>
          </TouchableOpacity>
        </View>
      </LayoutLivreur>
    );
  }

  const isDisabled = disabledButtons ||
    commande.livraison === "Livré" ||
    commande.livraison === "Non Livré";

  return (
    <LayoutLivreur>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>{t('Suivi de livraison')}</Text>
            <View style={styles.headerLine} />
          </View>

          <View style={styles.card}>
            <View style={styles.commandeHeader}>
              <Text style={styles.commandeId}>
                {t('Commande')} #{commande.numeroCommande}
              </Text>
              <View style={[
                styles.statusBadge,
                commande.livraison === 'Livré' && styles.statusBadgeLivree,
                commande.livraison === 'Non Livré' && styles.statusBadgeNonLivree,
                commande.livraison === 'En cours' && styles.statusBadgeEnCours
              ]}>
                <Text style={styles.statusBadgeText}>
                  {commande.livraison || t('en_attente')}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('Informations client')}</Text>
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Icon name="person" size={20} color="#2E7D32" style={styles.icon} />
                  <Text style={styles.infoText}>
                    {clientInfo.nom || commande.userId?.nom || t('client_inconnu')}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="phone" size={20} color="#2E7D32" style={styles.icon} />
                  <Text style={styles.infoText}>
                    {clientInfo.numTel || commande.userId?.numTel || t('non_disponible')}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="location-on" size={20} color="#2E7D32" style={styles.icon} />
                  <Text style={styles.infoText}>
                    {clientInfo.adresse || commande.destination?.adresse || t('adresse_non_disponible')}
                  </Text>
                </View>

                {clientInfo.infoSupplementaire && (
                  <View style={styles.infoRow}>
                    <Icon name="info" size={20} color="#4CAF50" style={styles.icon} />
                    <Text style={styles.infoText}>
                      {clientInfo.infoSupplementaire}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('Détails de la commande')}</Text>
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('Statut')}:</Text>
                  <Text style={[
                    styles.detailValue,
                    commande.livraison === 'Livré' && styles.statusLivree,
                    commande.livraison === 'Non Livré' && styles.statusNonLivree,
                    commande.livraison === 'En cours' && styles.statusEnCours
                  ]}>
                    {commande.livraison || t('en_attente')}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('Paiement')}:</Text>
                  <Text style={[
                    styles.detailValue,
                    commande.paiement === 'Payée' && styles.statusPayee,
                    commande.paiement === 'En attente de paiement' && styles.statusEnAttente
                  ]}>
                    {getPaymentDisplay()}
                  </Text>
                </View>

                

                <View style={[styles.detailRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>{t('Total')}:</Text>
                  <Text style={styles.totalValue}>{(commande.total + 130)} DA</Text>
                </View>
              </View>
            </View>
          </View>

          {commande.livraison === 'En cours' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.livreButton, isDisabled && styles.disabledButton]}
                onPress={() => updateCommande('Livré')}
                disabled={isDisabled}
              >
                <Icon name="check-circle" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>{t('Livrée')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.nonLivreButton, isDisabled && styles.disabledButton]}
                onPress={() => updateCommande('Non Livré')}
                disabled={isDisabled}
              >
                <Icon name="cancel" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>{t('Non livrée')}</Text>
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
    paddingBottom: 30,
    paddingHorizontal: 15,
  },
  container: {
    marginTop:50,
    flex: 1,
  },
  headerContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  headerLine: {
    height: 3,
    width: 50,
    backgroundColor: '#2E7D32',
    borderRadius: 3,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  commandeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commandeId: {
    fontWeight: '600',
    fontSize: 18,
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusBadgeLivree: {
    backgroundColor: '#e8f5e9',
  },
  statusBadgeNonLivree: {
    backgroundColor: '#ffebee',
  },
  statusBadgeEnCours: {
    backgroundColor: '#fff8e1',
  },
  statusBadgeText: {
    fontWeight: '500',
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoContainer: {
    marginLeft: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
    width: 24,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#555',
    flex: 1,
  },
  detailsContainer: {
    marginLeft: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 15,
    color: '#777',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusLivree: {
    color: '#2E7D32',
  },
  statusNonLivree: {
    color: '#e74c3c',
  },
  statusPayee: {
    color: '#2980b9',
  },
  statusEnCours: {
    color: '#FFA500',
  },
  statusEnAttente: {
    color: '#f39c12',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  livreButton: {
    backgroundColor: '#4CAF50',
  },
  nonLivreButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 25,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default MiseAJoueEtatDeCommande;