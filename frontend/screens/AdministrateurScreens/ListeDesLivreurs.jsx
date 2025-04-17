import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

const ListeDesLivreurs = () => { 
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  useEffect(() => {
    fetchLivreurs();
  }, []);

  const fetchLivreurs = async () => {
    try {
      const response = await fetch("http://192.168.1.42:8080/api/v1/livreur/tousLivreurs");
      const data = await response.json();
      
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
      {text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        onPress: async () => {
          try {
            await fetch(`http://192.168.1.42:8080/api/v1/livreur/refuser/${id}`, { method: "DELETE" });
            setLivreurs(livreurs.filter((livreur) => livreur._id !== id ));
          } catch (error) {
            console.error("Erreur suppression :", error);
          }
        },
      },
    ]);
  };

  const validerLivreur = async (id) => {
    if (!id) {
      console.error("Erreur : ID du livreur est undefined !");
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.42:8080/api/v1/livreur/valider/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la validation du livreur");
      }

      setLivreurs(
        livreurs.map((livreur) => (livreur._id === id ? result.livreur : livreur))
      );

      Alert.alert("Succès", "Compte validé !");
    } catch (error) {
      console.error("Erreur validation :", error);
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
    <View style={styles.container}>
      <Text style={styles.title}>{t('Liste_des_livreurs')}</Text>
      
      <FlatList
        data={livreurs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[styles.livreurItem, styles.cardShadow]}>
            <View style={styles.livreurInfo}>
              <Text style={styles.livreurName}>{item.nom}</Text>
              <Text style={styles.livreurEmail}>{item.email}</Text>
              {item.isValidated && (
                <View style={styles.validationBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.validationText}>Validé</Text>
                </View>
              )}
            </View>
            
            <View style={styles.actionsContainer}>
              {!item.isValidated && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.validateButton]}
                  onPress={() => validerLivreur(item._id)}
                >
                  <Ionicons name="checkmark-outline" size={18} color="white" />
                  <Text style={styles.buttonText}>Valider</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteLivreur(item._id)}
              >
                <Ionicons name="trash-outline" size={18} color="white" />
                <Text style={styles.buttonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={50} color="#CBD5E0" />
            <Text style={styles.emptyText}>Aucun livreur disponible</Text>
          </View>
        }
      />
    </View>
  );
};

export default ListeDesLivreurs;

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
  livreurItem: {
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
  livreurInfo: {
    marginBottom: 12
  },
  livreurName: { 
    fontSize: 18, 
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4
  },
  livreurEmail: { 
    fontSize: 14, 
    color: "#718096",
    marginBottom: 8
  },
  validationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4
  },
  validationText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8
  },
  validateButton: {
    backgroundColor: "#10B981",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  buttonText: {
    color: "white",
    fontWeight: '500',
    marginLeft: 6,
    fontSize: 14
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    color: "#CBD5E0",
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center'
  }
});