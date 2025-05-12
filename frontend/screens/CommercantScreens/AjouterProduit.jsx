import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from "react-native";
import LayoutCommercant from "../../components/LayoutCommercant/LayoutCommercant";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";


const backendUrl = "http://192.168.38.149:8080";


const AjouterProduit = ({ navigation }) => {
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [categorie, setCategorie] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [codeBarre, setCodeBarre] = useState(""); // Ajout de l'état pour le code barre
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const { t } = useTranslation();

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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "Nous avons besoin de la permission pour accéder à votre galerie d'images.");
      return;
    }

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
    if (!nom || !prix || !categorie || !stock || !description || !image || !codeBarre) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }

    if (isNaN(prix) || isNaN(stock)) {
      Alert.alert("Erreur", "Le prix et le stock doivent être des chiffres uniquement !");
      return;
    }

    

    // Créer un FormData pour envoyer l'image et les autres données
    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("prix", prix);
    formData.append("categorie", categorie);
    formData.append("stock", stock);
    formData.append("description", description);
    formData.append("codeBarre", codeBarre); // Ajouter le code barre au FormData

    // Ajouter l'image au FormData
    const localUri = image; // URI locale de l'image sélectionnée
    const filename = localUri.split("/").pop(); // Obtenir le nom du fichier
    const type = `image/${filename.split('.').pop()}`; // Détecter automatiquement le type de l'image

    formData.append("image", {
      uri: localUri,
      name: filename,
      type: type,
    });

    try {
      const response = await fetch(`${backendUrl}/api/produits/add`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert(" ", "Produit ajouté avec succès !");
        navigation.navigate("GestiondesProduits", { newProduct: data });
      } else {
        Alert.alert("Erreur", "Impossible d'ajouter le produit.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue !");
    }
  };

  return (
    <LayoutCommercant>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("ajouterproduit")}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>{t("nom")} :</Text>
          <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Nom du produit" />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t("prix")} :</Text>
          <TextInput style={styles.input} value={prix} onChangeText={setPrix} keyboardType="numeric" placeholder="Prix en DA" />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t("cat")} :</Text>
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
          <Text style={styles.label}>{t("Stock")} :</Text>
          <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="Quantité en stock" />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t("codebarre")} :</Text>
          <TextInput 
            style={styles.input} 
            value={codeBarre} 
            onChangeText={setCodeBarre} 
            keyboardType="default"
            placeholder="Code Barre"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t("image")} :</Text>
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <Text style={styles.imagePlaceholder}>Choisir une image</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t("description")} :</Text>
          <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} multiline placeholder="Description du produit" />
        </View>

        <TouchableOpacity style={styles.btnAjouter} onPress={handleAjouter}>
          <Text style={styles.btnText}>{t("ajouter")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </LayoutCommercant>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 29, textAlign: "center", color: "#000" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  label: { fontSize: 15, fontWeight: "bold", width: 100 },
  input: { flex: 1, borderWidth: 0.9, borderColor: "#9E9E9E", padding: 13, borderRadius: 10 },
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
  btnAjouter: { backgroundColor: "#2E7D32", padding: 12, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#9E9E9E",
    borderRadius: 10, 
    backgroundColor: "#fff",
    height: 48,
    justifyContent: "center",
  },

  picker: {
    width: "100%",
    height: 50,
    color: "#000",
  },
});

export default AjouterProduit;
