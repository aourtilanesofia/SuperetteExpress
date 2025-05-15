import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import LayoutAdmin from './../../components/LayoutAdmin/LayoutAdmin';

const ListeDesClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation(); 

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("http://192.168.1.33:8080/api/v1/consommateur/tousConsommateur");

      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
    Alert.alert("Confirmation", "Voulez-vous vraiment supprimer cet utilisateur ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        onPress: async () => {
          try {
            await fetch(`http://192.168.1.33:8080/api/v1/consommateur/supConsommateur/${id}`, { method: "DELETE" });

            setClients(clients.filter((client) => client._id !== id));
          } catch (error) {
            console.error("Erreur suppression :", error);
          }
        },
      },
    ]);
  };

  const toggleStatus = async (id) => {
    try {
      const response = await fetch(`http://192.168.1.33:8080/api/v1/consommateur/status/${id}`, {

        method: "PUT",
        headers: { "Content-Type": "application/json" }, 
      });
   
      const text = await response.text();
      const updatedUser = JSON.parse(text); 
      setClients(clients.map((client) => (client._id === id ? updatedUser : client)));
    } catch (error) {
      console.error("Erreur activation :", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <LayoutAdmin>
    <View style={styles.container}>
      <Text style={styles.title}>{t('Liste_des_clients')}</Text>
      
      <FlatList
        data={clients}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[styles.clientItem, styles.cardShadow]}>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{item.nom}</Text>
              <Text style={styles.clientEmail}>{item.numTel}</Text>
            </View>
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteClient(item._id)}
              >
                <Ionicons name="trash-outline" size={18} color="white" />
                <Text style={styles.buttonText}>{t('supprimer')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  item.isActive ? styles.deactivateButton : styles.activateButton
                ]}
                onPress={() => toggleStatus(item._id)}
              >
                <Ionicons 
                  name={item.isActive ? "close-circle-outline" : "checkmark-circle-outline"} 
                  size={18} 
                  color="white" 
                />
                <Text style={styles.buttonText}>
                  {item.isActive ? t('dasact') : t('act')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
    </LayoutAdmin>
  );
};

export default ListeDesClients;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#F5F7FB" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F5F7FB'
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20,
    color: "#2D3748",
    textAlign: 'center'
  },
  listContent: {
    paddingBottom: 20
  },
  clientItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardShadow: {
    shadowColor: "#6C63FF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clientInfo: {
    marginBottom: 12
  },
  clientName: { 
    fontSize: 18, 
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4
  },
  clientEmail: { 
    fontSize: 14, 
    color: "#718096",
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    marginHorizontal: 4
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  activateButton: {
    backgroundColor: "#10B981",
  },
  deactivateButton: {
    backgroundColor: "#F59E0B",
  },
  buttonText: {
    color: "white",
    fontWeight: '500',
    marginLeft: 6
  }
});