import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import LayoutAdmin from './../../components/LayoutAdmin/LayoutAdmin';

const ListeDesLivreurs = () => {
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  useEffect(() => {
    fetchLivreurs();
  }, []);

  const fetchLivreurs = async () => {
    try {
      const response = await fetch("http://192.168.1.33:8080/api/v1/livreur/tousLivreurs");
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Format des données invalide");
      }

      setLivreurs(data);
    } catch (error) {
      console.error("Erreur :", error);
      Alert.alert("Erreur", "Impossible de charger les livreurs");
    } finally {
      setLoading(false);
    }
  };

  const deleteLivreur = async (id) => {
    Alert.alert(
      t('confirmation'),
      t('Voulez vous supprimer ce livreur ?'),
      [
        { text: t('Annuler'), style: "cancel" },
        {
          text: t('Supprimer'),
          onPress: async () => {
            try {
              await fetch(`http://192.168.1.33:8080/api/v1/livreur/refuser/${id}`, {
                method: "DELETE"
              });
              setLivreurs(livreurs.filter((livreur) => livreur._id !== id));
            } catch (error) {
              console.error("Erreur suppression :", error);
              Alert.alert("Erreur", t('Erreur de suppression'));
            }
          },
        },
      ]
    );
  };

  const toggleStatus = async (id) => {
    try {
      const livreur = livreurs.find(l => l._id === id);
      const endpoint = livreur.isValidated
        ? `http://192.168.1.33:8080/api/v1/livreur/invalider/${id}`
        : `http://192.168.1.33:8080/api/v1/livreur/valider/${id}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const updatedLivreur = await response.json();

      setLivreurs(livreurs.map(l =>
        l._id === id ? { ...l, isValidated: !l.isValidated } : l
      ));

      Alert.alert(
        "Succès",
        livreur.isValidated
          ? t('Livreur Désactive')
          : t('Livreur Active')
      );
    } catch (error) {
      console.error("Erreur changement statut :", error);
      Alert.alert("Erreur", t('Erreur lors le changement du statut'));
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
        <Text style={styles.title}>{t('Liste_des_livreurs')}</Text>

        <FlatList
          data={livreurs}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[styles.livreurItem, styles.cardShadow]}>
              <View style={styles.livreurInfo}>
                <Text style={styles.livreurName}>{item.nom}</Text>
                <Text style={styles.livreurDetail}>{item.numTel}</Text>
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteLivreur(item._id)}
                >
                  <Ionicons name="trash-outline" size={18} color="white" />
                  <Text style={styles.buttonText}>{t('supprimer')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    item.isValidated ? styles.deactivateButton : styles.activateButton
                  ]}
                  onPress={() => toggleStatus(item._id)}
                >
                  <Ionicons
                    name={item.isActive ? "close-circle-outline" : "checkmark-circle-outline"}
                    size={18}
                    color="white"
                  />
                  <Text style={styles.buttonText}>
                    {item.isValidated ? t('dasact') : t('act')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={50} color="#CBD5E0" />
              <Text style={styles.emptyText}>{t('aucun_livreur')}</Text>
            </View>
          }
        />
      </View>
    </LayoutAdmin>
  );
};

export default ListeDesLivreurs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: "#F5F7FB",
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
    paddingBottom: 40, // Augmenté pour laisser de l'espace en bas
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
  livreurDetail: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 4
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8
  },
  validatedBadge: {
    backgroundColor: '#10B981',
  },
  notValidatedBadge: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
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
    marginLeft: 6,
    fontSize: 14
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    color: "#CBD5E0",
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center'
  }
});