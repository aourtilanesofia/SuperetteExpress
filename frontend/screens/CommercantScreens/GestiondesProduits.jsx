import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import LayoutCommercant from "../../components/LayoutCommercant/LayoutCommercant";
import Icon from "react-native-vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";

const backendUrl = "http://192.168.43.145:8080";

const GestiondesProduits = ({route}) => {
  const { superetteId } = route.params || {};
  const navigation = useNavigation();
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesOuvertes, setCategoriesOuvertes] = useState({});
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Fonction pour récupérer les données
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Chargement des données pour superetteId:", superetteId);
      
      // 1. Charger les catégories de la supérette
      const catResponse = await fetch(`${backendUrl}/api/categories?superetteId=${superetteId}`);
      const catData = await catResponse.json();
      console.log("Catégories chargées:", catData);
      setCategories(catData);

      // 2. Charger tous les produits
      const prodResponse = await fetch(`${backendUrl}/api/produits`);
      const prodData = await prodResponse.json();
      console.log("Produits chargés:", prodData);
      setProduits(prodData);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      Alert.alert("Erreur", "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (superetteId) {
      fetchData();
    }
  }, [superetteId]);

  useFocusEffect(
    useCallback(() => {
      if (superetteId) {
        fetchData();
      }
    }, [superetteId])
  );

  // Organiser les produits par catégorie
  const produitsParCategorie = produits.reduce((acc, produit) => {
    const categorie = categories.find(cat => cat._id === produit.categorieId);
    
    if (categorie && categorie.superetteId === superetteId) {
      const nomCategorie = categorie.nom;
      if (!acc[nomCategorie]) {
        acc[nomCategorie] = [];
      }
      acc[nomCategorie].push({
        ...produit,
        categorieNom: nomCategorie
      });
    }
    
    return acc;
  }, {});

  console.log("Produits organisés par catégorie:", produitsParCategorie);

  // Fonction pour supprimer un produit
  const confirmDelete = (id) => {
    Alert.alert(
      t("confirmation"),
      t("voulez_vous_supprimer_produit"),
      [
        { text: t("annuler"), style: "cancel" },
        { 
          text: t("supprimer"), 
          onPress: () => handleDelete(id), 
          style: "destructive" 
        },
      ]
    );
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${backendUrl}/api/produits/delete/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.message === "Produit supprimé avec succès") {
        fetchData();
      } else {
        Alert.alert("Erreur", data.message || "La suppression a échoué");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur s'est produite lors de la suppression");
    }
  };

  // Basculer l'affichage d'une catégorie
  const toggleCategorie = (categorie) => {
    setCategoriesOuvertes((prev) => ({
      ...prev,
      [categorie]: !prev[categorie],
    }));
  };

  if (loading) {
    return (
      <LayoutCommercant>
        <View style={styles.container}>
          <Text>Chargement en cours...</Text>
        </View>
      </LayoutCommercant>
    );
  }

  if (Object.keys(produitsParCategorie).length === 0) {
    return (
      <LayoutCommercant>
        <View style={styles.container}>
          <Text style={styles.title}>{t("listeproduits")}</Text>
          <Text style={styles.emptySubtitle}>Aucun produit trouvé pour cette supérette</Text>
          <TouchableOpacity 
            style={styles.btnAjouter} 
            onPress={() => navigation.navigate("AjouterProduit", { superetteId })}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </LayoutCommercant>
    );
  }

  return (
    <LayoutCommercant>
      <View style={styles.container}>
        <Text style={styles.title}>{t("listeproduits")}</Text>
        <ScrollView>
          {Object.entries(produitsParCategorie).map(([nomCategorie, produits]) => (
            <View key={nomCategorie} style={styles.categorieContainer}>
              <TouchableOpacity 
                style={styles.categorieHeader} 
                onPress={() => toggleCategorie(nomCategorie)}
              >
                <Text style={styles.categorieTitle}>{nomCategorie}</Text>
                <Icon 
                  name={categoriesOuvertes[nomCategorie] ? "chevron-up" : "chevron-down"} 
                  size={17} 
                  color="white" 
                />
              </TouchableOpacity>

              {categoriesOuvertes[nomCategorie] && (
                <FlatList
                  data={produits}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => {
                    const imageUri = item.image?.startsWith("http") 
                      ? item.image 
                      : `${backendUrl}${item.image}`;
                    
                    return (
                      <View style={styles.produitContainer}>
                        <View style={styles.produit}>
                          <Image
                            source={{ uri: imageUri }}
                            style={styles.image}
                            onError={(e) => console.log("Erreur image:", e.nativeEvent.error)}
                          />
                          <View>
                            <Text style={styles.nomProduit}>{item.nom}</Text>
                            <Text>
                              {item.prix} DA - {item.stock} 
                              {["Fruits", "Légumes"].includes(item.categorieNom) ? "Kg" : ""}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.btnContainer}>
                          <TouchableOpacity
                            style={styles.btnModifier}
                            onPress={() => navigation.navigate("ModifierProduit", { 
                              produit: item,
                              superetteId 
                            })}
                          >
                            <Text style={styles.btnText}>{t("modifier")}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.btnSupprimer} 
                            onPress={() => confirmDelete(item._id)}
                          >
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

        <TouchableOpacity 
          style={styles.btnAjouter} 
          onPress={() => navigation.navigate("AjouterProduit", { superetteId })}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </LayoutCommercant>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#f8f8f8",
    bottom:45,
  },
  title: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginBottom: 20, 
    color: "black" 
  },
  categorieContainer: { 
    marginBottom: 15, 
    backgroundColor: "#fff", 
    borderRadius: 10, 
    elevation: 5 
  },
  categorieHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    backgroundColor: "#2E7D32", 
    padding: 16, 
    borderRadius: 10 
  },
  categorieTitle: { 
    fontSize: 17, 
    fontWeight: '600', 
    color: "white" 
  },
  produitContainer: { 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: "#ddd" 
  },
  produit: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 10 
  },
  image: { 
    width: 50, 
    height: 50, 
    borderRadius: 10, 
    marginRight: 10 
  },
  nomProduit: { 
    fontSize: 15, 
    fontWeight: "bold", 
    maxWidth: 270 
  },
  btnContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  btnModifier: { 
    backgroundColor: "#4CAF50", 
    padding: 8, 
    borderRadius: 8, 
    flex: 1, 
    alignItems: "center", 
    marginRight: 7 
  },
  btnSupprimer: { 
    backgroundColor: "red", 
    padding: 8, 
    borderRadius: 8, 
    flex: 1, 
    alignItems: "center", 
    marginLeft: 7 
  },
  btnAjouter: {
    position: 'absolute',
    bottom: 40,
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
  btnText: { 
    color: "#fff", 
    fontSize: 13, 
    fontWeight: "bold" 
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center', 
  },
  emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 80,
        paddingHorizontal: 30,
        marginTop:300,
    },
});

export default GestiondesProduits;