import { StyleSheet, Text, View, FlatList, ActivityIndicator, Button, Alert } from "react-native";
import React, { useEffect, useState } from "react";

const ListeDesLivreurs = () => {
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLivreurs();
  }, []);

  const fetchLivreurs = async () => {
    try {
      const response = await fetch("http://192.168.43.107:8080/api/v1/livreur/tousLivreurs");
      const data = await response.json();
      
      console.log("Données reçues :", data); // Debugging
      
      if (!Array.isArray(data)) {
        throw new Error("Format des données invalide");
      }
      
      setLivreurs(data);
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLivreur = async (id) => {
    Alert.alert("Confirmation", "Voulez-vous supprimer cet utilisateur ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        onPress: async () => {
          try {
            console.log("Suppression ID :", id);
            await fetch(`http://192.168.43.107:8080/api/v1/livreur/refuser/${id}`, { method: "DELETE" });
            setLivreurs(livreurs.filter((livreur) => livreur._id !== id ));
          } catch (error) {
            console.error("Erreur suppression :", error);
          }
        },
      },
    ]);
  };

  const validerLivreur = async (id) => {
    console.log("Validation ID :", id);

    if (!id) {
      console.error("Erreur : ID du livreur est undefined !");
      return;
    }

    try {
      const response = await fetch(`http://192.168.43.107:8080/api/v1/livreur/valider/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      console.log("Réponse API validation :", result);

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la validation du livreur");
      }

      setLivreurs(
        livreurs.map((livreur) => (livreur._id === id ? result.livreur : livreur))
      );
    } catch (error) {
      console.error("Erreur validation :", error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des Livreurs</Text>
      <FlatList
        data={livreurs}
        keyExtractor={(item) => item._id} // Sécurisation de la clé
        renderItem={({ item }) => (
          <View style={styles.livreurItem}>
            <Text style={styles.livreurName}>{item.nom}</Text>
            <Text style={styles.livreurEmail}>{item.email}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Valider" color="green" onPress={() => validerLivreur(item._id)} />
              <Button title="Supprimer" color="red" onPress={() => deleteLivreur(item._id)} />
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default ListeDesLivreurs;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  livreurItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  livreurName: { fontSize: 18, fontWeight: "bold" },
  livreurEmail: { fontSize: 14, color: "gray", marginBottom: 15 },
  buttonContainer: { gap: 7 },
});
