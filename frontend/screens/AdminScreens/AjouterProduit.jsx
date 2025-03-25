import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";

const backendUrl = "http://192.168.43.107:8080"; 

const AjouterProduit = ({ navigation }) => {
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [categorie, setCategorie] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/categories`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
      }
    };
    fetchCategories();
  }, []);

  // Sélectionner une image depuis la galerie
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // Ajouter un produit dans la base de données
  const handleAjouter = async () => {
    if (!nom || !prix || !categorie || !stock || !description || !image) {
      Alert.alert("Erreur", "Tous les champs doivent être remplis !");
      return;
    }

    if (isNaN(prix) || isNaN(stock)) {
      Alert.alert("Erreur", "Le prix et le stock doivent être des chiffres uniquement !");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/produits/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom,
          prix,
          categorie,
          stock,
          description,
          image,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Succès", "Produit ajouté avec succès !");
        navigation.navigate("GestiondesProduits", { newProduct: data });
      } else {
        Alert.alert("Erreur", "Impossible d'ajouter le produit.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue !");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un Produit</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Nom :</Text>
        <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Nom du produit" />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Prix :</Text>
        <TextInput style={styles.input} value={prix} onChangeText={setPrix} keyboardType="numeric" placeholder="Prix en DA" />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Catégorie :</Text>
        <View style={styles.pickerContainer}>
        <Picker
          selectedValue={categorie}
          style={styles.picker}
          onValueChange={(itemValue) => setCategorie(itemValue)}
          >
          <Picker.Item label="Sélectionner une catégorie" value="" />
            {categories.map((cat) => (
          <Picker.Item key={cat._id} label={cat.nom} value={cat.nom} />
                      ))}
        </Picker>
      </View>


    </View>
      <View style={styles.row}>
        <Text style={styles.label}>Stock :</Text>
        <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="Quantité en stock" />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Image :</Text>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>Choisir une image</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Description :</Text>
        <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} multiline placeholder="Description du produit" />
      </View>

      <TouchableOpacity style={styles.btnAjouter} onPress={handleAjouter}>
        <Text style={styles.btnText}>Ajouter le produit</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 10,},
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 27, textAlign: "center", color: "#000" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  label: { fontSize: 15, fontWeight: "bold", width: 100 },
  input: { flex: 1, borderWidth: 0.9, borderColor: "#000", padding: 13, borderRadius: 10 },
  textarea: { height: 120, textAlignVertical: "top" },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    color: "gray",
    fontWeight: "bold",
    textAlign: "center",
  },
  btnAjouter: { backgroundColor: "#4CAF50", padding: 12, borderRadius: 10, alignItems: "center", marginTop:45, },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "bold" },

    pickerContainer: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#000",
      borderRadius: 10,
      backgroundColor: "#fff",
      height: 48, 
      justifyContent: "center",
    },
  
    picker: {
      width: "100%",
      height: 50, 
      color: "gray", 
    },
  });
export default AjouterProduit;