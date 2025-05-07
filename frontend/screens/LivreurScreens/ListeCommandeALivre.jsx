import React, { useState, useEffect } from "react";
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
import LayoutLivreur from '../../components/LayoutLivreur/LayoutLivreur';
import { io } from "socket.io-client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const socket = io("http://192.168.1.9:8080");


const ListeCommandeALivre = () => {
  const [commandesAssignees, setCommandesAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [livreurId, setLivreurId] = useState(null);
  const navigation = useNavigation();
  const [refusedCommande, setRefusedCommande] = useState(null);
  const [acceptedCommands, setAcceptedCommands] = useState([]);
  const [orderDetails, setOrderDetails] = useState({}); // Stocke à la fois paymentMethod et total

  // Charger les détails des commandes depuis AsyncStorage
  const loadOrderDetails = async (commandes) => {
    const details = {};
    try {
      for (const commande of commandes) {
        const orderKey = `commande_${commande.numeroCommande}`;
        const savedOrder = await AsyncStorage.getItem(orderKey);
        if (savedOrder) {
          const orderData = JSON.parse(savedOrder);
          console.log("Contenu récupéré de AsyncStorage:", orderData);
          details[commande.numeroCommande] = {
            paymentMethod: orderData.paymentMethod || 'Non spécifiée',
            total: (commande.total || 0) + 130
          };
        } else {
          details[commande.numeroCommande] = {
            paymentMethod: commande.methodePaiement || 'Non spécifiée',
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
      socket.off(`commande-assignee-${livreurId}`);
    };
  }, []);

  const fetchCommandes = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://192.168.1.9:8080/api/v1/livreur/${id}/commandes-assignees`
      );
      const data = await response.json();
      setCommandesAssignees(data || []);
      await loadOrderDetails(data || []);
    } catch (error) {
      console.error('Erreur fetchCommandes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!livreurId) return;

    socket.on(`commande-assignee-${livreurId}`, (newCommande) => {
      setCommandesAssignees(prev => [newCommande, ...prev]);
      loadOrderDetails([newCommande]);
      Alert.alert("Nouvelle commande!", `Commande #${newCommande.numeroCommande}`);
    });

    return () => {
      socket.off(`commande-assignee-${livreurId}`);
    };
  }, [livreurId]);

  const accepterCommande = async (numeroCommande, numTel, nom) => {
    try {
      const API_URL = `http://192.168.1.9:8080/api/v1/livreur/${numeroCommande}/accept`;
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
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      setAcceptedCommands(prev => [...prev, numeroCommande]);
      
      navigation.navigate('DetailsCommandeALivre', { 
        numeroCommande: numeroCommande,
        numTel,
        nom,
        commande: data.commande
      });
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', error.message);
    }
  };

  const refuserCommande = async (numeroCommande) => {
    try {
      const response = await fetch(
        `http://192.168.1.9:8080/api/v1/livreur/${numeroCommande}/refuser`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            livreurId,
            raison: "Livreur non disponible",
            livraison: "Refusée"
          })
        }
      );

      if (!response.ok) throw new Error("Échec du refus");

      setCommandesAssignees(prev => 
        prev.filter(c => c.numeroCommande !== numeroCommande)
      );
    } catch (error) {
      Alert.alert("Erreur", error.message);
    }
  };

  const removeCommandeFromList = (numeroCommande) => {
    setCommandesAssignees(prev => 
      prev.filter(c => c.numeroCommande !== numeroCommande)
    );
    setAcceptedCommands(prev => 
      prev.filter(num => num !== numeroCommande)
    );
  };

  const renderItem = ({ item }) => {
    const isAccepted = acceptedCommands.includes(item.numeroCommande);
    const isDelivered = item.livraison === "Livré";
    const showButtons = !isAccepted && !isDelivered;
    const details = orderDetails[item.numeroCommande] || {};
    
    return (
      <View style={styles.card}>
        {(isAccepted || isDelivered) && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => removeCommandeFromList(item.numeroCommande)}
          >
            <Icon name="close" size={24} color="#e74c3c" />
          </TouchableOpacity>
        )}
        
        <Text style={styles.commandeNumero}>Commande #{item.numeroCommande}</Text>
        <Text style={styles.client}>Client: {item.userId?.nom || "Inconnu"}</Text>
        <Text style={styles.telephone}>Tél: {item.userId?.numTel || "Non disponible"}</Text>
        <Text style={styles.adresse}>Adresse: {item.destination?.adresse || "Non spécifiée"}</Text>
  

        <View style={styles.statusContainer}>
          <Text style={[
            styles.statusText,
            item.livraison === 'Livré' && styles.statusLivree,
            item.livraison === 'Refusée' && styles.statusRefusee,
            item.livraison === 'Acceptée' && styles.statusAcceptee
          ]}>
            Statut: {item.livraison || 'En attente'} 
          </Text>
        </View>
        
        <Text style={styles.total}>Total: {(details.total)+130 || 0} DA</Text>

        {showButtons && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => accepterCommande(item.numeroCommande, item.userId?.numTel, item.userId?.nom)}
            >
              <Text style={styles.buttonText}>Accepter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => refuserCommande(item.numeroCommande)}
            >
              <Text style={styles.buttonText}>Refuser</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <LayoutLivreur>
      <Text style={styles.title}>Commandes Assignées</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" />
      ) : commandesAssignees.length === 0 ? (
        <Text style={styles.emptyText}>Aucune commande assignée</Text>
      ) : (
        <FlatList
          data={commandesAssignees}
          renderItem={renderItem}
          keyExtractor={item => item.numeroCommande.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await fetchCommandes(livreurId);
                setRefreshing(false);
              }}
              colors={["#2E7D32"]}
            />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </LayoutLivreur>
  );
};

// Les styles restent identiques à votre code original
const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginVertical: 15,
  },
  listContainer: {
    paddingBottom: 70,
  },
  card: { 
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  commandeNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  client: {
    fontSize: 16,
    color: '#555',
    marginBottom: 3,
  },
  telephone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  adresse: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
    fontStyle: 'italic',
  },
  paymentMethodContainer: {
    marginVertical: 5,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  paymentMethod: {
    fontSize: 14,
    color: '#555',
    fontWeight: 'bold',
  },
  statusContainer: {
    marginVertical: 5,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusLivree: {
    color: '#27ae60',
  },
  statusRefusee: {
    color: '#e74c3c',
  },
  statusAcceptee: {
    color: '#f39c12',
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#2E7D32',
    marginRight: 5,
  },
  rejectButton: {
    backgroundColor: '#D32F2F',
    marginLeft: 5,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
  deleteButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ListeCommandeALivre;