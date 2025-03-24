import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";


const backendUrl = "http://192.168.224.149:8080"; 

const ModifierProduit = ({ route, navigation }) => {
  const { produit } = route.params;
  
  const [nom, setNom] = useState(produit.nom);
  const [prix, setPrix] = useState(produit.prix.toString());
  const [categorie, setCategorie] = useState(produit.categorie);
  const [stock, setStock] = useState(produit.stock.toString());
  const [description, setDescription] = useState(produit.description);
  const [image, setImage] = useState(`${backendUrl}${produit.image}`);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/categories`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Erreur lors du chargement des catégories :", error);
      }
    };
    fetchCategories();
  }, []);

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

  const handleModifier = async () => {
    if (!nom && !prix && !categorie && !stock && !description && !image) {
        Alert.alert("Erreur", "Aucune modification détectée !");
        return;
    }

    if (prix && isNaN(prix) || stock && isNaN(stock)) {
        Alert.alert("Erreur", "Le prix et le stock doivent être des chiffres !");
        return;
    }

    let modifications = {};
    if (nom !== produit.nom) modifications.nom = nom;
    if (prix !== produit.prix.toString()) modifications.prix = parseFloat(prix);
    if (categorie !== produit.categorie) modifications.categorie = categorie;
    if (stock !== produit.stock.toString()) modifications.stock = parseInt(stock);
    if (description !== produit.description) modifications.description = description;
    if (image !== `${backendUrl}${produit.image}`) modifications.image = image;

    if (Object.keys(modifications).length === 0) {
        Alert.alert("Info", "Aucune modification apportée.");
        return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/produits/update/${produit._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(modifications),
        });

        const data = await response.json();

        if (data.message === "Produit modifié avec succès") {
            Alert.alert("Succès", "Produit modifié avec succès !", [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
        } else {
            Alert.alert("Erreur", "La modification a échoué");
        }
    } catch (error) {
        console.error("Erreur lors de la modification du produit:", error);
        Alert.alert("Erreur", "Une erreur s'est produite lors de la modification");
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier un Produit</Text>

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

      <TouchableOpacity style={styles.btnModifier} onPress={handleModifier}>
        <Text style={styles.btnText}>Valider</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50, backgroundColor: "#f8f8f8" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#329171" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  label: { fontSize: 16, fontWeight: "bold", width: 100 },
  input: { flex: 1, borderWidth: 1, borderColor: "#329171", padding: 10, borderRadius: 10 },
  textarea: { height: 120, textAlignVertical: "top" },
  picker: { flex: 1, height: 50, borderWidth: 1, borderColor: "#329171", borderRadius: 10 },
  imageContainer: { width: 150, height: 150, borderRadius: 10, backgroundColor: "#ddd", justifyContent: "center", alignItems: "center", overflow: "hidden", flex: 1 },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePlaceholder: { color: "#329171", fontWeight: "bold", textAlign: "center" },
  btnModifier: { backgroundColor: "#329171", padding: 15, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#329171",
    borderRadius: 10,
    backgroundColor: "#fff",
    height: 42,
    justifyContent: "center",
  },

  picker: {
    width: "100%",
    height: 50, 
    color: "#000", 
  },




});

export default ModifierProduit;
