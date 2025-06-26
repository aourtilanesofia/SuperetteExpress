import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from "react-native";
import React, { useState, useEffect } from "react";
import LayoutLivreur from '../../components/LayoutLivreur/LayoutLivreur';
import { io } from "socket.io-client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

const socket = io("http://192.168.43.145:8080");



const ListeCommandeALivre = () => {
  const [commandesAssignees, setCommandesAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [livreurId, setLivreurId] = useState(null);
  const navigation = useNavigation();
  const [refusedCommande, setRefusedCommande] = useState(null);
  const [acceptedCommands, setAcceptedCommands] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [orderData, setOrderData] = useState(null);
  const { t } = useTranslation();


  const loadOrderDetails = async (commandes) => {
    const details = {};
    try {
      for (const commande of commandes) {
        const orderKey = `commande_${commande.numeroCommande}`;
        const savedOrder = await AsyncStorage.getItem(orderKey);
        if (savedOrder) {
          const orderData = JSON.parse(savedOrder);
          details[commande.numeroCommande] = {
            paymentMethod: orderData.paymentMethod || 'Non spécifiée',
            // totalNet: orderData.totalNet
            //total: (commande.total || 0) + 130 
          };
        } else {
          details[commande.numeroCommande] = {
            paymentMethod: commande.methodePaiement || 'Non spécifiée',
            //totalNet: orderData.totalNet,
            total: commande.total || 0
          };
        }
      }
      setOrderDetails(details);
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
    }
  };

  useEffect(() => {
    const fetchLivreurId = async () => {
      try {
        let id = await AsyncStorage.getItem('livreurId');
        if (!id) {
          const userData = await AsyncStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            id = user._id;
            await AsyncStorage.setItem('livreurId', id);
          }
        }

        if (id) {
          setLivreurId(id);
          const savedCommandes = await AsyncStorage.getItem('commandesAssignees');
          if (savedCommandes) {
            const parsedCommandes = JSON.parse(savedCommandes);
            setCommandesAssignees(parsedCommandes);
            await loadOrderDetails(parsedCommandes);
          }
          fetchCommandes(id);
        } else {
          navigation.navigate('LoginLivreur');
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchLivreurId();

    return () => {
      if (livreurId) socket.off(`commande-assignee-${livreurId}`);
    };
  }, []);

  const fetchCommandes = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://192.168.43.145:8080/api/v1/livreur/${id}/commandes-assignees`
      );
      const data = await response.json();

      const savedCommandes = await AsyncStorage.getItem('commandesAssignees');
      const savedCommandesMap = savedCommandes
        ? JSON.parse(savedCommandes).reduce((acc, cmd) => {
          acc[cmd.numeroCommande] = cmd;
          return acc;
        }, {})
        : {};

      const commandesAvecBadge = data.map(c => ({
        ...c,
        isNew: !savedCommandesMap[c.numeroCommande] || savedCommandesMap[c.numeroCommande].isNew
      }));

      const sortedCommands = commandesAvecBadge.sort((a, b) => new Date(b.date) - new Date(a.date));

      setCommandesAssignees(sortedCommands);
      await AsyncStorage.setItem('commandesAssignees', JSON.stringify(sortedCommands));
      await loadOrderDetails(data);
    } catch (error) {
      console.error('Erreur fetchCommandes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!livreurId) return;

    socket.on(`commande-assignee-${livreurId}`, (newCommande) => {
      const commandeAvecBadge = { ...newCommande, isNew: true };
      setCommandesAssignees(prev => {
        const newCommandes = [commandeAvecBadge, ...prev];
        AsyncStorage.setItem('commandesAssignees', JSON.stringify(newCommandes));
        return newCommandes;
      });
      loadOrderDetails([newCommande]);
      Alert.alert("Nouvelle commande!", `Commande #${newCommande.numeroCommande}`);
    });

    return () => {
      socket.off(`commande-assignee-${livreurId}`);
    };
  }, [livreurId]);

  const accepterCommande = async (numeroCommande, numTel, nom) => {
    try {
      const API_URL = `http://192.168.43.145:8080/api/v1/livreur/${numeroCommande}/accept`;

      const token = await AsyncStorage.getItem('token');

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          livreurId,
          livraison: "Acceptée"
        })
      });

      const responseText = await response.text();
      if (!response.ok) throw new Error(`Erreur ${response.status}: ${responseText}`);

      const data = JSON.parse(responseText);
      setAcceptedCommands(prev => [...prev, numeroCommande]);

      navigation.navigate('DetailsCommandeALivre', {
        numeroCommande,
        numTel,
        nom,
        commande: data.commande
      });
    } catch (error) {
      console.error('Erreur:', error);
      const revertedCommandes = commandesAssignees.map(commande =>
        commande.numeroCommande === numeroCommande
          ? { ...commande, isNew: true }
          : commande
      );
      setCommandesAssignees(revertedCommandes);
      await AsyncStorage.setItem('commandesAssignees', JSON.stringify(revertedCommandes));
      Alert.alert('Erreur', error.message);
    }
  };

  const refuserCommande = async (numeroCommande) => {
    try {
      const updatedCommandes = commandesAssignees.filter(c => c.numeroCommande !== numeroCommande);
      setCommandesAssignees(updatedCommandes);
      await AsyncStorage.setItem('commandesAssignees', JSON.stringify(updatedCommandes));

      const response = await fetch(
        `http://192.168.43.145:8080/api/v1/livreur/${numeroCommande}/refuser`,

        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            livreurId,
            raison: "Livreur non disponible",
            livraison: "Refusée"
          })
        }
      );

      if (!response.ok) throw new Error("Échec du refus");
    } catch (error) {
      if (livreurId) fetchCommandes(livreurId);
      Alert.alert("Erreur", error.message);
    }
  };

  const supprimerCommandeListe = (numeroCommande) => {
    const updatedCommandes = commandesAssignees.filter(c => c.numeroCommande !== numeroCommande);
    setCommandesAssignees(updatedCommandes);
    AsyncStorage.setItem('commandesAssignees', JSON.stringify(updatedCommandes));
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (livreurId) fetchCommandes(livreurId).then(() => setRefreshing(false));
  };

  const renderItem = ({ item }) => {
    const isLivree = item.livraison === "Livré";
    const showButtons = item.livraison === "Assignée" || item.livraison === "En attente";
    const details = orderDetails[item.numeroCommande] || {};

    return (
      <View style={styles.card}>
        {/* Badge Nouveau */}
        {!isLivree && item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NOUVEAU</Text>
          </View>
        )}

        {/* Bouton de suppression */}
        {isLivree && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => supprimerCommandeListe(item.numeroCommande)}
          >
            <Icon name="close" size={20} color="#D62828" />
          </TouchableOpacity>
        )}

        {/* En-tête de la carte */}
        <View style={styles.cardHeader}>
          <View style={styles.commandeInfo}>
            <Text style={styles.commandeNumero}>{t('commande')} #{item.numeroCommande}</Text>
            <View style={styles.infoRow}>
              <Icon name="access-time" size={16} color="#555" />
              <Text style={styles.dateText}>
                {new Date(item.date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
            {/* Ajoutez cette partie pour afficher le nom de la supérette */}
            <View style={styles.infoRow}>
              <Icon name="store" size={16} color="#555" />
              <Text style={styles.superetteText}>
                {item.superetteId?.name || "Supérette non spécifiée"}
              </Text>
            </View>
          </View>
        </View>

        {/* Détails client */}
        <View style={styles.clientInfo}>
          <View style={styles.infoRow}>
            <Icon name="person" size={16} color="#555" />
            <Text style={styles.client}> {item.userId?.nom || "Inconnu"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="phone" size={16} color="#555" />
            <Text style={styles.telephone}> {item.userId?.numTel || "Non disponible"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="place" size={16} color="#555" />
            <Text style={styles.adresse}> {item.destination?.adresse || "Non spécifiée"}</Text>
          </View>
        </View>

        {/* Statut et Total */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            isLivree ? styles.statusLivree :
              item.livraison === "Refusée" ? styles.statusRefusee :
                item.livraison === "Acceptée" ? styles.statusAcceptee :
                  styles.statusAssignee
          ]}>
            <Text style={styles.statusText}>
              {item.livraison || 'En attente'}
            </Text>
          </View>
          <Text style={styles.total}>{t('total')}: {item.totalNet || 0} DA</Text>
        </View>

        {/* Boutons d'action */}
        {showButtons && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => accepterCommande(item.numeroCommande, item.userId?.numTel, item.userId?.nom, item.superetteId?.name)}
            >
              <Text style={styles.buttonText}>{t('accepter')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => refuserCommande(item.numeroCommande)}
            >
              <Text style={styles.buttonText}>{t('refuser')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <LayoutLivreur loading={loading}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('commAs')}</Text>
        <TouchableOpacity onPress={() => onRefresh()} style={styles.refreshButton}>
          <Icon name="refresh" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <FlatList
          data={commandesAssignees}
          contentContainerStyle={styles.listContainer}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2E7D32']}
              tintColor="#2E7D32"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="assignment" size={50} color="#cccccc" />
              <Text style={styles.emptyText}>{t('NcommAs')}</Text>
            </View>
          }
        />
      )}
    </LayoutLivreur>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  superetteText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
    fontStyle: 'italic'
  },
  refreshButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
    paddingBottom: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  cardHeader: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commandeInfo: {
    marginBottom: 8,
  },
  commandeNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  clientInfo: {
    marginVertical: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  client: {
    fontSize: 15,
    color: '#555',
  },
  telephone: {
    fontSize: 14,
    color: '#666',
  },
  adresse: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusLivree: {
    backgroundColor: '#e8f5e9',
  },
  statusTextLivree: {
    color: '#27ae60',
  },
  statusRefusee: {
    backgroundColor: '#ffebee',
  },
  statusTextRefusee: {
    color: '#e74c3c',
  },
  statusAcceptee: {
    backgroundColor: '#fff3e0',
  },
  statusTextAcceptee: {
    color: '#f39c12',
  },
  statusAssignee: {
    backgroundColor: '#e3f2fd',
  },
  statusTextAssignee: {
    color: '#3498db',
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#F44336',
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  newBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E63946',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    backgroundColor: 'rgb(244, 171, 178)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default ListeCommandeALivre;