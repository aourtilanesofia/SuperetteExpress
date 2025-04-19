import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal } from 'react-native';
import { useTranslation } from "react-i18next";


const backendUrl = "http://192.168.1.42:8080";


const ProductsCard = ({ p }) => {
  const [totalPanier, setTotalPanier] = useState(0);
  const navigation = useNavigation();
  const [quantite, setQuantite] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();

  const imageUri =
    p.image && typeof p.image === "string"
      ? p.image.startsWith("http") || p.image.startsWith("file://")
        ? p.image
        : `${backendUrl}${p.image}`
      : null;

  const augmenterQuantite = () => setQuantite(quantite + 1);
  const diminuerQuantite = () => {
    if (quantite > 1) setQuantite(quantite - 1);
  };

  const mettreAJourPanier = async () => {
    try {
      const panierExistantRaw = await AsyncStorage.getItem('cart');
      const panierExistant = JSON.parse(panierExistantRaw) || [];
      const total = panierExistant.reduce((acc, item) => acc + item.qty, 0);
      setTotalPanier(total);
      await AsyncStorage.setItem('cartTotal', JSON.stringify(total));
    } catch (error) {
      console.error("Erreur lors de la mise à jour du panier :", error);
    }
  };

  const confirmerAjoutAuPanier = async () => {
    try {
      const panierExistantRaw = await AsyncStorage.getItem('cart');
      const panierExistant = JSON.parse(panierExistantRaw) || [];
      const indexProduit = panierExistant.findIndex(item => item._id === p._id);

      if (indexProduit !== -1) {
        panierExistant[indexProduit].qty += quantite;
      } else {
        panierExistant.push({ ...p, qty: quantite });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(panierExistant));
      await mettreAJourPanier();

      const ingredients = await getIngredientsFromCart();

if (ingredients.length > 0) {
  try {

    const response = await fetch(`http://192.168.1.42:8080/api/recettes/recherche`, {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients }),
    });

    const data = await response.json();

    if (data && data.length > 0) {
      const recette = data[0]; // prend la première recette correspondante
      navigation.navigate('VideoRecette', { url: recette.video }); // tu dois créer cet écran
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la recette :", error);
  }
}


      setModalVisible(false);
      Alert.alert(" ", "Produit ajouté au panier !");
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier :", error);
    }
  };

  useEffect(() => {
    mettreAJourPanier();
  }, []);

  const getIngredientsFromCart = async () => {
    try {
      const panierRaw = await AsyncStorage.getItem('cart');
      const panier = JSON.parse(panierRaw) || [];
      const ingredients = panier.map(item => item.nom); // suppose que chaque produit a un champ nom
      return ingredients;
    } catch (error) {
      console.error("Erreur lors de la récupération des ingrédients :", error);
      return [];
    }
  };
  

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>{t("Votre sélection")}</Text>
            
            <View style={styles.modalProductContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.modalImage}
                onError={() => console.error("Erreur de chargement de l'image")}
              />
              
              <View style={styles.modalProductInfo}>
                <Text style={styles.modalProductName}>{p.nom}</Text>
                <Text style={styles.modalProductPrice}>{p.prix} DA</Text>
              </View>
            </View>

            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>{t("Quantité")}:</Text>
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

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>{t("Total")}:</Text>
              <Text style={styles.totalPrice}>{p.prix * quantite} DA</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>{t("annuler")}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={confirmerAjoutAuPanier}
              >
                <Text style={styles.modalButtonText}>{t("Confirmer")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.productImage}
            onError={(e) => console.error("Erreur de chargement de l'image")}
          />
          {p.stock === 0 && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>{t("Rupture")}</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{p?.nom || "Produit inconnu"}</Text>
          <Text style={styles.productPrice}>{t("prix")} :{p?.prix ? `${p.prix} DA` : "Prix non disponible"}</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => navigation.navigate('ProduitsDetails', { id: p._id })}
          >
            <Text style={styles.buttonText}>{t("Détails")}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
  style={[styles.btnAddd, p.stock === 0 && styles.outOfStockButton]}
  onPress={() => {
    if (p.stock === 0) {
      Alert.alert(" ", "Le produit est en rupture de stock !");
      return;
    }
    setModalVisible(true);
  }}
>
  <Text style={styles.buttonText}>{t("ajouter")}</Text>
</TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default ProductsCard;

const styles = StyleSheet.create({
  // Carte produit
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    width: '46%',
    margin: '2%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    borderColor: '#2E7D32',
    shadowColor: "#2E7D32",
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0.7,
    borderColor: '#2E7D32',
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    resizeMode: 'contain',
    //backgroundColor: '#F8F8F8',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  outOfStockText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    marginBottom: 12,
    minHeight: 60,
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 13,
    //fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalProductContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  modalProductInfo: {
    flex: 1,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  modalProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#2E7D32',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold', 
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#2E7D32',
    marginLeft: 10,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  btnAddd: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    elevation: 6,
  },
  outOfStockButton: {
    backgroundColor: '#2E7D32', // Gris pour indiquer rupture
    // Vous pouvez aussi ajouter d'autres styles si besoin
    // borderWidth: 1,
    // borderColor: '#FF0000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});