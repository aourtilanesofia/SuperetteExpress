import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from "react-native";
import LayoutCommercant from "../../components/LayoutCommercant/LayoutCommercant";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";

const backendUrl = "http://192.168.43.145:8080"; 

const AjouterProduit = ({ navigation, route }) => {
  const { superetteId } = route.params || {};
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [selectedCategorie, setSelectedCategorie] = useState("");
  const [selectedCategorieId, setSelectedCategorieId] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [codeBarre, setCodeBarre] = useState("");
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/categories?superetteId=${superetteId}`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
      }
    };
    fetchCategories();
  }, [superetteId]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "Nous avons besoin de la permission pour accéder à votre galerie.");
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

  const handleAjouter = async () => {
    if (!nom || !prix || !selectedCategorieId || !stock || !description || !image) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires !");
      return;
    }

    if (isNaN(prix) || isNaN(stock)) {
      Alert.alert("Erreur", "Le prix et le stock doivent être des nombres valides");
      return;
    }

    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("prix", prix);
    formData.append("categorie", selectedCategorie);
    formData.append("categorieId", selectedCategorieId);
    formData.append("stock", stock);
    formData.append("description", description);
    formData.append("codeBarre", codeBarre);

    const localUri = image;
    const filename = localUri.split("/").pop();
    const type = `image/${filename.split('.').pop()}`;

    formData.append("image", {
      uri: localUri,
      name: filename,
      type: type,
    });

    try {
      const response = await fetch(`${backendUrl}/api/produits/add`, {
        method: "POST",
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert("Succès", "Produit ajouté avec succès !");
        navigation.navigate("GestiondesProduits", { superetteId });
      } else {
        Alert.alert("Erreur", data.message || "Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error("Erreur:", error);
      Alert.alert("Erreur", "Une erreur est survenue");
    }
  };

  return (
    <LayoutCommercant>
     <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("ajouterproduit")}</Text>

          {/* Champs du formulaire */}
          <View style={styles.row}>
            <Text style={styles.label}>{t("nom")}:</Text>
            <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Nom du produit"  />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t("prix")}:</Text>
            <TextInput style={styles.input} value={prix} onChangeText={setPrix} keyboardType="numeric" placeholder="Prix en DA"/>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t("cat")}:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCategorieId}
                onValueChange={(itemValue, itemIndex) => {
                  const selected = categories.find(cat => cat._id === itemValue);
                  setSelectedCategorieId(itemValue);
                  setSelectedCategorie(selected?.nom || "");
                }}
              >
                <Picker.Item label="Sélectionner une catégorie" value="" />
                {categories.map((cat) => (
                  <Picker.Item key={cat._id} label={cat.nom} value={cat._id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t("Stock")}:</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric"  placeholder="Quantité en stock" />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t("codebarre")}:</Text>
            <TextInput style={styles.input} value={codeBarre} onChangeText={setCodeBarre} placeholder="Code Barre" />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t("image")}:</Text>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <Text style={styles.imagePlaceholder}>Choisir une image</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t("description")}:</Text>
            <TextInput 
              style={[styles.input, styles.textarea]} 
              value={description} 
              onChangeText={setDescription} 
              multiline 
              placeholder="Description du produit"
            />
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 250,
  },
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
