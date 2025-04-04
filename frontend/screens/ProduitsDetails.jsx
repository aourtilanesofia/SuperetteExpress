import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator,Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox } from "react-native";
import { useTranslation } from "react-i18next";

const backendUrl = "http://192.168.1.47:8080";
LogBox.ignoreLogs([
  "VirtualizedLists should never be nested",
]);
 
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
  const diminuerQuantite = () => {
    if (quantite > 1) setQuantite(quantite - 1);
  };

  const ajouterAuPanier = async () => {
    if (produit.stock === 0) {
      alert("Produit en rupture de stock !");
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
      Alert.alert(" ","Produit ajouté au panier !");
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier :", error);
    }
  };

  if (!produit) {
    return <ActivityIndicator size="large" color="#329171" style={styles.loading} />;
  }


  return (
    <FlatList
      data={[produit]}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: `${backendUrl}${item.image}` }} style={styles.image} />
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.titre}>{item.nom}</Text>
            <View style={styles.v1}>
              <Text style={styles.labe}>{t("prix")} :</Text>
              <Text style={styles.prix}>{item.prix} DA</Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.label}>{t("description")} :</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.btnPanier,
                item.stock === 0 && styles.btnRupture, 
              ]}
              onPress={ajouterAuPanier}
              disabled={item.stock === 0} 
            >
              <Text style={styles.btnPanierText}>
              {item.stock === 0 ? t("rupture_stock") : t("ajouter_panier")}
              </Text>
            </TouchableOpacity>

            <View style={styles.quantiteContainer}>
              <TouchableOpacity style={styles.btnQuantite} onPress={() => setQuantite(Math.max(1, quantite - 1))}>
                <Text style={styles.btnText}> - </Text>
              </TouchableOpacity>

              <Text style={styles.quantite}>{quantite}</Text>

              <TouchableOpacity style={styles.btnQuantite} onPress={() => setQuantite(quantite + 1)}>
                <Text style={styles.btnText}> + </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      contentContainerStyle={{ flexGrow: 1 }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    //backgroundColor: "#f8f8f8",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  image: {
    width: 370,
    height: 360,
    borderRadius: 10,
  },
  detailsContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#329171",
    marginTop: 20,
  },
  labe: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#329171",
  },
  titre: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  prix: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
    marginLeft: 15,
  },
  description: {
    fontSize: 16,
    color: "black",
    marginTop: 10,
    marginBottom: 20,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  btnPanier: {
    backgroundColor: "#329171",
    padding: 12,
    borderRadius: 5,
    width: "43%",
    alignItems: "center",
    marginLeft: 10,
  },
  btnPanierText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  quantiteContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnQuantite: {
    backgroundColor: "#329171",
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 18,
  },
  btnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  quantite: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  v1: {
    flexDirection: "row",
    marginTop: 15,
  },
  btnRupture: {
    backgroundColor: "red",
  },
});

export default ProduitsDetails;
