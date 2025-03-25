import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React, {useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const backendUrl = "http://192.168.43.107:8080"; // Remplace par ton URL de backend

const ProductsCard = ({ p }) => {
  const [produit, setProduit] = useState([]);
  const navigation = useNavigation();

  // Détails d'un produit
  const handleMoreDetails = (id) => {
  navigation.navigate('ProduitsDetails', { id }); 
};
const [quantite, setQuantite] = useState(1);
  const augmenterQuantite = () => setQuantite(quantite + 1);
  const diminuerQuantite = () => {
    if (quantite > 1) setQuantite(quantite - 1);
  };

  // Ajouter au panier
  const ajouterAuPanier = async () => {
    try {
        const panierExistantRaw = await AsyncStorage.getItem('cart');
        const panierExistant = JSON.parse(panierExistantRaw) || [];

        // Vérifier si le produit est déjà dans le panier
        const indexProduit = panierExistant.findIndex(item => item._id === p._id);
        if (indexProduit !== -1) {
            panierExistant[indexProduit].qty += quantite;
        } else {
            panierExistant.push({ ...p, qty: quantite });
        }

        await AsyncStorage.setItem('cart', JSON.stringify(panierExistant));
        alert('Produit ajouté au panier !');
    } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
    }
};
 

  return (
    <View style={styles.card}>
      {/* Image du produit */}
      <Image source={{ uri: `${backendUrl}${p?.image}` }} style={styles.image} />

      {/* Détails du produit */}
      <Text style={styles.title}>{p?.nom || "Produit inconnu"}</Text>
      <Text style={styles.price}>{p?.prix ? `${p.prix} DA` : "Prix non disponible"}</Text>

      {/* Boutons */}
      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.btnDetails} onPress={() => handleMoreDetails(p._id)}>
          <Text style={styles.btnText}>Détails</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnAdd} onPress={ajouterAuPanier}>
          <Text style={styles.btnText}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductsCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15, 
    padding: 15,
    width: '46%',
    margin: 5,
    alignItems: 'center',
    borderWidth: 0.7, 
    borderColor: '#329171',
    shadowColor: "#329171", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8, 
  }, 

  image: {
    width: 100, 
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10, 
    backgroundColor: '#f8f8f8', 
    marginBottom: 10,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3.84, 
    elevation: 8, 
  },
  
  title: {
    fontSize: 14, 
    color: 'bold',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 6,
    color: '#333',
    textTransform: 'capitalize', 
  },
  
  price: {
    fontSize: 14, 
    color: 'bold',
    //fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',

  },
  btnDetails: {
  backgroundColor: '#329171',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 5,
  flex: 1,
  marginRight: 5,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 }, 
  shadowOpacity: 0.15, 
  shadowRadius: 3, 
  elevation: 6, 
  },
  
btnAdd: {
  backgroundColor: '#329171',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 5,
  flex: 1,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 }, 
  shadowOpacity: 0.15, 
  shadowRadius: 3, 
  elevation: 6,
},

  btnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});


