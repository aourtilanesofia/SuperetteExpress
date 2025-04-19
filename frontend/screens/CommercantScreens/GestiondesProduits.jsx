import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";


const backendUrl = "http://192.168.1.42:8080";


const GestiondesProduits = () => {
  const navigation = useNavigation();
  const [produits, setProduits] = useState([]);
  const [categoriesOuvertes, setCategoriesOuvertes] = useState({});
  const { t } = useTranslation();

  // Fonction pour récupérer les produits
  const fetchProduits = () => {
    fetch(`${backendUrl}/api/produits`)
      .then((response) => response.json())
      .then((data) => setProduits(data))
      .catch((error) => console.error("Erreur lors de la récupération des produits :", error));
  };

  useEffect(fetchProduits, []);

  useFocusEffect(useCallback(fetchProduits, []));

  // Fonction pour supprimer un produit
  const confirmDelete = (id) => {
    Alert.alert("Confirmation", "Voulez-vous vraiment supprimer ce produit ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", onPress: () => handleDelete(id), style: "destructive" },
    ]);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${backendUrl}/api/produits/delete/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.message === "Produit supprimé avec succès") {
        fetchProduits();
      } else {
        Alert.alert("Erreur", "La suppression a échoué");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur s'est produite lors de la suppression");
    }
  };

  // Organiser les produits par catégorie
  const produitsParCategorie = produits.reduce((acc, produit) => {
    if (!acc[produit.categorie]) acc[produit.categorie] = [];
    acc[produit.categorie].push(produit);
    return acc;
  }, {});

  // Basculer l'affichage d'une catégorie
  const toggleCategorie = (categorie) => {
    setCategoriesOuvertes((prev) => ({
      ...prev,
      [categorie]: !prev[categorie],
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("listeproduits")}</Text>
      <ScrollView>
        {Object.entries(produitsParCategorie).map(([categorie, produits]) => (
          <View key={categorie} style={styles.categorieContainer}>
            {/* En-tête de la catégorie */}
            <TouchableOpacity style={styles.categorieHeader} onPress={() => toggleCategorie(categorie)}>
              <Text style={styles.categorieTitle}>{categorie}</Text>
              <Icon name={categoriesOuvertes[categorie] ? "chevron-up" : "chevron-down"} size={17} color="white" />
            </TouchableOpacity>

            {/* Liste des produits (affichée uniquement si la catégorie est ouverte) */}
            {categoriesOuvertes[categorie] && (
              <FlatList
                data={produits}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => { 
                  // Vérifier si l'image commence par "http", sinon ajouter `backendUrl`
                  const imageUri =
                    item.image && typeof item.image === "string"
                      ? item.image.startsWith("http") || item.image.startsWith("file://")
                        ? item.image
                        : `${backendUrl}${item.image}`
                      : null; 

 
                  return (
                    <View style={styles.produitContainer}>
                      <View style={styles.produit}>
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.image}
                          onError={() => console.error("Erreur de chargement de l'image :", imageUri)}
                        />
                        <View>
                          <Text style={styles.nomProduit}>{item.nom}</Text>
                          <Text>{item.prix} DA - {item.stock} {["Fruits", "Légumes"].includes(item.categorie) ? "Kg" : ""}</Text>
                        </View>
                      </View>
                      <View style={styles.btnContainer}>
                        <TouchableOpacity
                          style={styles.btnModifier}
                          onPress={() => navigation.navigate("ModifierProduit", { produit: item })}
                        >
                          <Text style={styles.btnText}>{t("modifier")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnSupprimer} onPress={() => confirmDelete(item._id)}>
                          <Text style={styles.btnText}>{t("supprimer")}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.btnAjouter} onPress={() => navigation.navigate("AjouterProduit")}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20, color: "black" },

  // Style pour les catégories
  categorieContainer: { marginBottom: 15, backgroundColor: "#fff", borderRadius: 10, elevation: 5 },
  categorieHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#2E7D32", padding: 16, borderRadius: 10 },
  categorieTitle: { fontSize: 17, fontWeight: '600', color: "white" },

  produitContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  produit: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  image: { width: 50, height: 50, borderRadius: 10, marginRight: 10 },
  nomProduit: { fontSize: 15, fontWeight: "bold", maxWidth: 270 },

  // Style des boutons
  btnContainer: { flexDirection: "row", justifyContent: "space-between" },
  btnModifier: { backgroundColor: "#4CAF50", padding: 8, borderRadius: 8, flex: 1, alignItems: "center", marginRight: 7 },
  btnSupprimer: { backgroundColor: "red", padding: 8, borderRadius: 8, flex: 1, alignItems: "center", marginLeft: 7 },
  btnAjouter: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007BFF',
    width: 60, 
    height: 60,
    borderRadius: 30, 
    elevation: 5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center', 
  },
});

export default GestiondesProduits;
