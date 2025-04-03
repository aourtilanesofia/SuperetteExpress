import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";


const backendUrl = "http://192.168.1.47:8080";
 
const ModifierProduit = ({ route, navigation }) => {
  const { produit } = route.params;

  const [nom, setNom] = useState(produit.nom);
  const [prix, setPrix] = useState(produit.prix.toString());
  const [categorie, setCategorie] = useState(produit.categorie);
  const [stock, setStock] = useState(produit.stock.toString());
  const [description, setDescription] = useState(produit.description);
  const [categories, setCategories] = useState([]);
  const { t } = useTranslation();
  

  const [image, setImage] = useState(() => {
    if (!produit.image) return null;
    
    // Si l'image est déjà une URL complète
    if (produit.image.startsWith('http')) {
      return produit.image;
    }
    
    // Si c'est un chemin relatif
    return `${backendUrl}${produit.image.startsWith('/') ? '' : '/'}${produit.image}`;
  });

  

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
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission requise", "Autorisez l'accès aux images pour continuer.");
      }
    })();
  }, []);



  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      // Envoyer l'image au serveur
      uploadImage(result.uri);
    }
  };
  
  // Fonction pour télécharger l'image
  const uploadImage = async (uri) => {
    const formData = new FormData();
    const localUri = uri;
    const filename = localUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image';
  
    formData.append('file', {
      uri: localUri,
      name: filename,
      type: type,
    });
  
    try {
      const response = await axios.post('http://192.168.1.47:8080/api/produits/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      //console.log('Image téléchargée avec succès:', response.data);
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
    }
  };
  
  


  const handleModifier = async () => {
    // Fonction pour normaliser l'URL de l'image
    const normalizeImageUrl = (img) => {
      if (!img) return null;
      if (img.startsWith('http') || img.startsWith('file://')) return img;
      return `${backendUrl}${img.startsWith('/') ? '' : '/'}${img}`;
    };
  
    // Vérification des modifications
    const currentImageUrl = normalizeImageUrl(image);
    const originalImageUrl = normalizeImageUrl(produit.image);
  
    if (nom === produit.nom &&
        prix === produit.prix.toString() &&
        categorie === produit.categorie &&
        stock === produit.stock.toString() &&
        description === produit.description &&
        currentImageUrl === originalImageUrl) {
      Alert.alert("Avertissement", "Aucune modification détectée !");
      return;
    }
  
    // Validation des champs numériques
    if ((prix && isNaN(parseFloat(prix))) || (stock && isNaN(parseInt(stock)))) {
      Alert.alert("Erreur", "Le prix et le stock doivent être des nombres valides !");
      return;
    }
  
    const modifications = new FormData();
  
    // Ajout des champs modifiés
    if (nom !== produit.nom) modifications.append("nom", nom);
    if (prix !== produit.prix.toString()) modifications.append("prix", parseFloat(prix));
    if (categorie !== produit.categorie) modifications.append("categorie", categorie);
    if (stock !== produit.stock.toString()) modifications.append("stock", parseInt(stock));
    if (description !== produit.description) modifications.append("description", description);
  
    // Gestion de l'image
    if (currentImageUrl !== originalImageUrl) {
      if (image && image.startsWith('file://')) {
        // Nouvelle image locale à uploader
        try {
          const response = await fetch(image);
          const blob = await response.blob();
          modifications.append("image", blob, `product_${Date.now()}.${image.split('.').pop()}`);
        } catch (error) {
          console.error("Erreur de traitement de l'image:", error);
          Alert.alert("Erreur", "Impossible de traiter l'image sélectionnée");
          return;
        }
      } else if (image) {
        // Image déjà sur le serveur (chemin relatif ou URL complète)
        const imagePath = image.startsWith(backendUrl) 
          ? image.replace(backendUrl, '') 
          : image;
        modifications.append("imagePath", imagePath);
      } else {
        // Image supprimée
        modifications.append("removeImage", "true");
      }
    }
  
    try {
      const response = await fetch(`${backendUrl}/api/produits/update/${produit._id}`, {
        method: "PUT",
        body: modifications,
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || `Erreur ${response.status}: ${response.statusText}`);
      }
  
      Alert.alert(" ", data.message || "Mise à jour effectuée avec succès !", [
        { 
          text: "OK", 
          onPress: () => navigation.navigate('DetailsProduit', { 
            produit: data.produit || data.updatedProduct 
          }) 
        }
      ]);
    } catch (error) {
      console.error("Erreur API:", error);
      Alert.alert(
        "Erreur", 
        error.message || "Une erreur s'est produite lors de la modification",
        [{ text: "OK", onPress: () => {} }]
      );
    }
  };
  
  
  const imageUri = image 
  ? image.startsWith('http') || image.startsWith('file://') 
    ? image 
    : `${backendUrl}${image.startsWith('/') ? image : '/' + image}`
  : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("modifierproduit")}</Text>

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
        <Text style={styles.label}>{t("image")} :</Text>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
  {image ? (
    <Image
    source={{
      uri: image && (image.startsWith('http') || image.startsWith('file://') || image.startsWith(backendUrl)) 
        ? image
        : `${backendUrl}${image.startsWith('/') ? '' : '/'}${image}`
    }}
    style={styles.image}
    onError={(e) => {
      console.log("Erreur de chargement d'image:", e.nativeEvent.error);
    }}
  />
  ) : (
    <Text style={styles.imagePlaceholder}>+ Ajouter une image</Text>
  )}
</TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t("description")} :</Text>
        <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} multiline placeholder="Description du produit" />
      </View>

      <TouchableOpacity style={styles.btnModifier} onPress={handleModifier}>
        <Text style={styles.btnText}>{t("Mettre_à_jour")}</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 30, textAlign: "center", color: "#000" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  label: { fontSize: 15, fontWeight: "bold", width: 100 },
  input: { flex: 1, borderWidth: 1, borderColor: "#9E9E9E", padding: 13, borderRadius: 10 },
  textarea: { height: 120, textAlignVertical: "top" },
  picker: { flex: 1, height: 50, borderWidth: 1, borderColor: "#329171", borderRadius: 10 },
  imageContainer: { width: 150, height: 150, borderRadius: 10, backgroundColor: "#ddd", justifyContent: "center", alignItems: "center", overflow: "hidden", flex: 1 },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePlaceholder: { color: "#329171", fontWeight: "bold", textAlign: "center" },
  btnModifier: { backgroundColor: "#4CAF50", padding: 12, borderRadius: 10, alignItems: "center", marginTop: 45, },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

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

export default ModifierProduit;
