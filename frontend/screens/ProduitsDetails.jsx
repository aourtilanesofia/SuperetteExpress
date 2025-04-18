import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from '@expo/vector-icons';


const backendUrl = "http://192.168.228.149:8080";

LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);

const ProduitsDetails = () => {
  const [produit, setProduit] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProduit = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/produits/${id}`);
        const data = await response.json();
        setProduit(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du produit :", error);
      }
    };

    if (id) {
      fetchProduit();
    }
  }, [id]);

  const augmenterQuantite = () => setQuantite(quantite + 1);
  const diminuerQuantite = () => quantite > 1 && setQuantite(quantite - 1);

  const ajouterAuPanier = async () => {
    if (produit.stock === 0) {
      Alert.alert(t("stock.rupture"), t("stock.indisponible"));
      return;
    }

    try {
      const panierExistantRaw = await AsyncStorage.getItem("cart");
      const panierExistant = JSON.parse(panierExistantRaw) || [];
      const indexProduit = panierExistant.findIndex((item) => item._id === produit._id);

      if (indexProduit !== -1) {
        panierExistant[indexProduit].qty += quantite;
      } else {
        panierExistant.push({ ...produit, qty: quantite });
      }

      await AsyncStorage.setItem("cart", JSON.stringify(panierExistant));
      Alert.alert("✅", t("panier.ajout_succes"));
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier :", error);
      Alert.alert("❌", t("panier.erreur_ajout"));
    }
  };

  if (!produit) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const imageUri = produit.image && typeof produit.image === "string"
    ? produit.image.startsWith("http") || produit.image.startsWith("file://")
      ? produit.image
      : `${backendUrl}${produit.image}`
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header avec bouton retour */}
      
      {/* Image du produit */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
          onError={() => console.error("Erreur de chargement de l'image")}
        />
        {produit.stock === 0 && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>{t("Rupture de stock")}</Text>
          </View>
        )}
      </View>

      {/* Informations principales */}
      <View style={styles.content}>
        <Text style={styles.title}>{produit.nom}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{produit.prix} DA</Text>
        </View>

        {/* Sélecteur de quantité */}
        <View style={styles.quantitySelector}>
          <Text style={styles.quantityLabel}>{t("Quantite")}:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={[styles.quantityButton, quantite === 1 && styles.disabledButton]}
              onPress={diminuerQuantite}
              disabled={quantite === 1}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.quantityValue}>{quantite}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={augmenterQuantite}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("description")}</Text>
          <Text style={styles.description}>{produit.description || t("description.absente")}</Text>
        </View>

        {/* Bouton d'action */}
        <TouchableOpacity
          style={[styles.addButton, produit.stock === 0 && styles.disabledButton]}
          onPress={ajouterAuPanier}
          disabled={produit.stock === 0}
        >
          <Text style={styles.addButtonText}>
            {produit.stock === 0 ? t("rupture_stock") : `${t("ajouter_panier")} (${produit.prix * quantite} DA)`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 15,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#2E7D32',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    position: 'relative',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  stockBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  stockBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  stock: {
    fontSize: 14,
    color: '#666666',
  },
  quantitySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  quantityLabel: {
    fontSize: 16,
    color: '#666666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    minWidth: 30,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
  },
  addButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20, 
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProduitsDetails;