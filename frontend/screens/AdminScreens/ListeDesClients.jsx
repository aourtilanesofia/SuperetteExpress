import { StyleSheet, Text, View, FlatList, ActivityIndicator, Button, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

const ListeDesClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("http://192.168.43.107:8080/api/v1/consommateur/tousConsommateur");
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
    Alert.alert("Confirmation", "Voulez-vous supprimer cet utilisateur ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        onPress: async () => {
          try {
            await fetch(`http://192.168.43.107:8080/api/v1/consommateur/supConsommateur/${id}`, { method: "DELETE" });
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
      const response = await fetch(`http://192.168.43.107:8080/api/v1/consommateur/status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }, // Ajout du header
      });
   
      const text = await response.text();
      console.log("Réponse brute :", text); // Debug pour voir la réponse
  
      const updatedUser = JSON.parse(text); // Convertir en JSON
      setClients(clients.map((client) => (client._id === id ? updatedUser : client)));
  
    } catch (error) {
      console.error("Erreur activation :", error);
    }
  };
  

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    
      <View style={styles.container}>
      <Text style={styles.title}>{t('Liste_des_clients')}</Text>
      <FlatList
        data={clients}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
            <View style={styles.clientItem}>
              <Text style={styles.clientName}>{item.nom}</Text>
              <Text style={styles.clientEmail}>{item.email}</Text>
              <View style={styles.buttonContainer}>
                <Button title="Supprimer" color="red" onPress={() => deleteClient(item._id)} style={styles.btnsup}/>
                <Button
                  title={item.isActive ? "Désactiver" : "Activer"}
                  color={item.isActive ? "orange" : "green"}
                  onPress={() => toggleStatus(item._id)}
                />
              </View>
            </View>
          )}
      />
    </View>
    
  );
};

export default ListeDesClients;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10,  },
  clientItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  clientName: { fontSize: 18, fontWeight: "bold" },
  clientEmail: { fontSize: 14, color: "gray", marginBottom:15 },
  btnsup:{
    
    borderRadius:15,

  },
  btnact:{},
  buttonContainer:{
    gap:7,
  }
});
