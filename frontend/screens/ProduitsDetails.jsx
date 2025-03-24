import React, {useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useRoute } from "@react-navigation/native";


const backendUrl = "http://192.168.224.149:8080"; 

const ProduitsDetails = () => {  
  const [produit, setProduit] = useState([]); 
  const navigation = useNavigation();
  const route = useRoute(); 
  const { id } = route.params; 

  useEffect(() => {
    const fetchProduit = async () => {
      try {
        console.log("Fetching product from:", `${backendUrl}/api/produits/${id}`);
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

  
  const [quantite, setQuantite] = useState(1);
  const augmenterQuantite = () => setQuantite(quantite + 1);
  const diminuerQuantite = () => {
    if (quantite > 1) setQuantite(quantite - 1);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        {produit.image ? (
          <Image source={{ uri: `${backendUrl}${produit.image}` }} style={styles.image} />
        ) : (
          <ActivityIndicator size="large" color="#329171" />
        )}
      </View>

      {/* Informations du produit */}
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Titre de produit :</Text>
        <Text style={styles.titre}>{produit.nom}</Text>

        <Text style={styles.label}>Prix :</Text>
        <Text style={styles.prix}>{produit.prix} DA</Text>
      </View>

      {/*la description ici */}
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Description :</Text>
        <Text style={styles.description}>{produit.description}</Text>
      </View>

      {/* Bouton Ajouter au panier + Sélecteur de quantité */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.btnPanier}>
          <Text style={styles.btnPanierText}>Ajouter au panier</Text>
        </TouchableOpacity>

        <View style={styles.quantiteContainer}>
          <TouchableOpacity style={styles.btnQuantite} onPress={diminuerQuantite}>
            <Text style={styles.btnText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantite}>{quantite}</Text>

          <TouchableOpacity style={styles.btnQuantite} onPress={augmenterQuantite}>
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  imageContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
},

  image: {
    width: 300,
    height: 200,
    borderRadius: 10,
  },
  detailsContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#329171",
    marginTop: 10,
  },
  titre: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  prix: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: "black",
    marginBottom: 20,
    fontWeight: "bold",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  btnPanier: {
    backgroundColor: "#329171",
    padding: 15,
    borderRadius: 10,
    width: "50%",
    alignItems: "center",
  },
  btnPanierText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantiteContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnQuantite: {
    backgroundColor: "#329171",
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 18,
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantite: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
});

export default ProduitsDetails;

