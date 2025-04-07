import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal } from 'react-native';
import { useTranslation } from "react-i18next";

const backendUrl = "http://192.168.1.47:8080"; // Remplace par ton URL de backend
//const backendUrl = "http://192.168.43.107:8080";
const ProductsCard = ({ p }) => {
  //console.log('ProductsCard rendu');
  //console.log('Produit reçu :', p);

  const [totalPanier, setTotalPanier] = useState(0);
  const navigation = useNavigation();
  const [quantite, setQuantite] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();

  let localAsset = null;

  const imageUri =
  p.image && typeof p.image === "string"
    ? p.image.startsWith("http") || p.image.startsWith("file://")
      ? p.image
      : `${backendUrl}${p.image}`
    : null;
  //console.log('Image URI:', imageUri);


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

  const ajouterAuPanier = async () => {
    if (p.stock === 0) {
      Alert.alert(" ", "Le produit est en rupture de stock !");
      return;
    }

    /*try {
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
        
        setModalVisible(true); // Affiche le modal
    } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
    }*/
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

      setModalVisible(false); // Fermer le modal après l'ajout
      Alert.alert(" ", "Produit ajouté au panier !");
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier :", error);
    }
  };



  useEffect(() => {
    mettreAJourPanier();
  }, []);
  //console.log(p);



  return (
    <>
      {/* Ajoute le modal ici */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.totale}>
              <Text style={styles.modalTitle}>{t("prix_totale")} : </Text>
              <Text style={styles.modalPrice}>{p.prix * quantite} DA</Text>
            </View>

            <View style={styles.modalProduct}>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                onError={() => console.error("Erreur de chargement de l'image :", imageUri)}
              />
              <View>
                <Text style={styles.modalText}>{p.nom}</Text>
                <Text style={styles.modalText}>{t("prix")}: {p.prix} DA</Text>
              </View>
              <View style={styles.counter}>
                <TouchableOpacity style={styles.smallButton} onPress={diminuerQuantite}>
                  <Text style={styles.buttonText}> -</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantite}</Text>
                <TouchableOpacity style={styles.smallButton} onPress={augmenterQuantite}>
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnAdd} onPress={confirmerAjoutAuPanier}>
                <Text style={styles.txt}>{t("Ajoutez_à_la_liste")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.txt}>{t("annuler")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Contenu de la carte produit */}
      <View style={styles.card}>

        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          onError={(e) => console.error("Erreur de chargement de l'image :", e.nativeEvent.error)}
        />
        <Text style={styles.title}>{p?.nom || "Produit inconnu"}</Text>
        <Text style={styles.price}>{t("prix")} : {p?.prix ? `${p.prix} DA` : "Prix non disponible"}</Text>
        <View style={styles.btnContainer}>
          <TouchableOpacity style={styles.btnDetails} onPress={() => navigation.navigate('ProduitsDetails', { id: p._id })}>
            <Text style={styles.btnText}>{t("Détails")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnAddd}
            onPress={async () => {
              if (p.stock === 0) {
                Alert.alert(" ", "Le produit est en rupture de stock !");
                return;
              }
              await ajouterAuPanier();
              setModalVisible(true);
            }}
          >
            <Text style={styles.btnText}>{t("ajouter")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
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
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center', 
    marginBottom: 6,
    color: '#333',
    textTransform: 'capitalize',
  },
  price: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
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
    elevation: 6,
  },
  btnAddd: {
    backgroundColor: '#329171',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    elevation: 6,
  },
  btnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '93%',
    height: '50%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    //marginLeft:50,
  },
  modalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  modalProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
  },
  modalImage: {
    width: 70,
    height: 70,
    marginRight: 10,
    //marginLeft: 20,
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: 150,
    //justifyContent:'space-between',
    padding: 5,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,

  },
  btnAdd: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    color: '#fff',
  },
  btnCancel: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    color: '#fff',
  },
  smallButton: {
    backgroundColor: '#BEBEBE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },

  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  txt: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  totale: {
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  }
});
