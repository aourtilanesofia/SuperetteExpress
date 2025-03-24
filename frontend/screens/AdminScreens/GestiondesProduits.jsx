import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";


const backendUrl = "http://192.168.224.149:8080"; 

const GestiondesProduits = () => {
  const navigation = useNavigation();
  const [produits, setProduits] = useState([]);
  const [categoriesOuvertes, setCategoriesOuvertes] = useState({}); // Gère l'état ouvert/fermé des catégories

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
      <Text style={styles.title}>Liste des Produits</Text>
      <ScrollView>
        {Object.entries(produitsParCategorie).map(([categorie, produits]) => (
          <View key={categorie} style={styles.categorieContainer}>
            {/*En-tête de la catégorie */}
            <TouchableOpacity style={styles.categorieHeader} onPress={() => toggleCategorie(categorie)}>
              <Text style={styles.categorieTitle}>{categorie}</Text>
              <Icon name={categoriesOuvertes[categorie] ? "chevron-up" : "chevron-down"} size={20} color="white" />
            </TouchableOpacity>

            {/*iste des produits (affichée uniquement si la catégorie est ouverte) */}
            {categoriesOuvertes[categorie] && (
              <FlatList
                data={produits}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <View style={styles.produitContainer}>
                    <View style={styles.produit}>
                      <Image source={{ uri: `${backendUrl}${item.image}` }} style={styles.image} />
                      <View>
                        <Text style={styles.nomProduit}>{item.nom}</Text>
                        <Text>
                          <Text style={{ fontWeight: "bold" }}>{item.prix} DA</Text> -  
                          <Text style={{ fontWeight: "bold" }}> {item.stock} Kg</Text>
                        </Text>
                      </View>
                    </View>
                    <View style={styles.btnContainer}>
                      <TouchableOpacity
                        style={styles.btnModifier}
                        onPress={() => navigation.navigate("ModifierProduit", { produit: item })}
                      >
                        <Text style={styles.btnText}>Modifier</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.btnSupprimer} onPress={() => confirmDelete(item._id)}>
                        <Text style={styles.btnText}>Supprimer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.btnAjouter} onPress={() => navigation.navigate("AjouterProduit")}>
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "black" },

  // Style pour les catégories
  categorieContainer: { marginBottom: 15, backgroundColor: "#fff", borderRadius: 10, elevation: 5 },
  categorieHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#329171", padding: 15, borderRadius: 10 },
  categorieTitle: { fontSize: 18, fontWeight: "bold", color: "white" },

  produitContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  produit: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  image: { width: 50, height: 50, borderRadius: 10, marginRight: 10 },
  nomProduit: { fontSize: 18, fontWeight: "bold" },

  // Style des boutons
  btnContainer: { flexDirection: "row", justifyContent: "space-between" },
  btnModifier: { backgroundColor: "#329171", padding: 10, borderRadius: 10, flex: 1, alignItems: "center", marginRight: 5 },
  btnSupprimer: { backgroundColor: "red", padding: 10, borderRadius: 10, flex: 1, alignItems: "center", marginLeft: 5 },
  btnAjouter: { position: "absolute", bottom: 27, right: 21, backgroundColor: "#329171", width: 52, height: 52, borderRadius: 10, alignItems: "center", justifyContent: "center", elevation: 5 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default GestiondesProduits;
