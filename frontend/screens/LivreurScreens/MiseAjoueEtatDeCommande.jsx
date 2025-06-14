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
  const { 
  commandeInitiale, 
  nom, 
  numTel, 
  adresse, 
  infoSupplementaire, 
  total 
} = route.params || {};

  // Fonction pour récupérer la commande depuis l'API
  const fetchCommandeByNumero = async (numeroCommande) => {
    try {
      const response = await fetch(`http://192.168.43.145:8080/api/commandes/numero/${numeroCommande}`);
      if (!response.ok) throw new Error('Erreur de récupération');
      const data = await response.json();

      // Correction du nom de champ si nécessaire
      return {
        ...data,
        methodePaiement: data.methodeParlement || data.methodePaiement,
        nomClient: data.nomClient || data.userId?.nom,
        telephoneClient: data.telephoneClient || data.userId?.numTel
      };
    } catch (error) {
      console.error("Erreur fetchCommande:", error);
      throw error;
    }
  };

  // Fonction pour mettre à jour le statut
  const updateCommandeStatus = async (numeroCommande, newStatus) => {
    try {
      const response = await fetch(`http://192.168.43.145:8080/api/commandes/update-status/${numeroCommande}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          livraison: newStatus,
          livreurId
        })
      });
      return await response.json();
    } catch (error) {
      console.error("Erreur update:", error);
      throw error;
    }
  };

  // Charge les données
  const loadData = async () => {
    try {
      setLoading(true);
      const numeroCommande = route.params?.commandeInitiale?.numeroCommande;

      if (numeroCommande) {
        const commandeFromAPI = await fetchCommandeByNumero(numeroCommande);
        setCommande(commandeFromAPI);
      }
    } catch (error) {
      console.error("Erreur loadData:", error);
      Alert.alert("Erreur", "Impossible de charger les données de la commande");
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour du statut
    const updateCommande = async (newStatus) => {
    if (!commande || !livreurId) return;

    setDisabledButtons(true);
    try {
      const response = await fetch(
        `http://192.168.43.145:8080/api/commandes/ModifierStat/${commande._id}`,

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

  // Initialisation
  useEffect(() => {
    const initialize = async () => {
      try {
        const id = await AsyncStorage.getItem('livreurId');
        if (id) setLivreurId(id);
        await loadData();
      } catch (error) {
        console.error("Erreur d'initialisation:", error);
      }
    };

    initialize();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

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
        </View>
      </LayoutLivreur>
    );
  }

  const isDisabled = disabledButtons || ['Livré', 'Non Livré'].includes(commande.livraison);

  // Fonction pour afficher le type de paiement
  const getPaymentMethodDisplay = () => {
    if (commande.methodePaiement === 'CIB') return 'Carte CIB';
    if (commande.methodePaiement === 'DAHABIYA') return 'Carte Dahabiya';
    if (commande.methodePaiement === 'Espèce') return 'Espèces';
    if (commande.paiement === 'Payée') return 'Payée';
    if (commande.paiement === 'En attente de paiement') return 'En attente';
    return 'Non spécifié';
  };

  return (
    <LayoutLivreur>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>{t('Suivi_de_livraison')}</Text>
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
              <Text style={styles.sectionTitle}>{t('Informations_client')}</Text>
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <Icon name="person" size={20} color="#2E7D32" style={styles.icon} />
                  <Text style={styles.infoText}>
                    {nom}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="phone" size={20} color="#2E7D32" style={styles.icon} />
                  <Text style={styles.infoText}>
                    {numTel}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="location-on" size={20} color="#2E7D32" style={styles.icon} />
                  <Text style={styles.infoText}>
                    {commande.destination?.adresse || t('adresse_non_disponible')}
                  </Text>
                </View>

                {commande.infoSupplementaire && (
                  <View style={styles.infoRow}>
                    <Icon name="info" size={20} color="#4CAF50" style={styles.icon} />
                    <Text style={styles.infoText}>
                      {commande.infoSupplementaire}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('Détails_de_la_commande')}</Text>
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
                    commande.paiement === 'En attente de paiement' && styles.statusEnAttente,
                    ['CIB', 'DAHABIYA'].includes(commande.methodePaiement) && styles.statusCarte
                  ]}>
                    {getPaymentMethodDisplay()}
                  </Text>
                </View>

                <View style={[styles.detailRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>{t('total')}:</Text>
                  <Text style={styles.totalValue}>{commande.totalNet} DA</Text>
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
                <Icon name="check-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>{t('Livrée')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.nonLivreButton, isDisabled && styles.disabledButton]}
                onPress={() => updateCommande('Non Livré')}
                disabled={isDisabled}
              >
                <Icon name="cancel" size={20} color="#fff" />
                <Text style={styles.buttonText}>{t('NonL')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </LayoutLivreur>
  );
};

// ... (conservez vos styles existants)

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
    paddingHorizontal: 15,
  },
  container: {
    marginTop: 50,
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
  statusCarte: {
    color: '#1976D2',
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
    marginBottom: 70
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
  }
});

export default MiseAJoueEtatDeCommande;