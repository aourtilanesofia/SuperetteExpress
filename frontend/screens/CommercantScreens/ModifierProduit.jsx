import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert,  ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";



const backendUrl = "http://192.168.1.42:8080";


const ModifierProduit = ({ route, navigation }) => {
  const { produit } = route.params;

  const [nom, setNom] = useState(produit.nom);
  const [prix, setPrix] = useState(produit.prix.toString());
  const [categorie, setCategorie] = useState(produit.categorie);
  const [stock, setStock] = useState(produit.stock.toString());
  const [description, setDescription] = useState(produit.description);
  const [codeBarre, setCodeBarre] = useState(produit.codeBarre || '');
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
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
  
      console.log("Résultat de la sélection d'image:", result);
  
      // Vérifiez si l'image a été sélectionnée
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri; // L'URI est dans le premier objet du tableau `assets`
        console.log("Image sélectionnée:", imageUri);
        setImage(imageUri); // Mettez à jour l'état avec l'URI de l'image
        uploadImage(imageUri); // Si vous avez une fonction pour uploader l'image
      } else {
        console.log("Aucune image sélectionnée ou échec de la récupération de l'URI");
      }
    } catch (error) {
      console.error("Erreur lors de la sélection d'image:", error);
    }
  };
  
  
  


  // Fonction pour télécharger l'image
  const uploadImage = async (uri) => {
    const formData = new FormData();
    const localUri = uri;
    const filename = localUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image';
  
    formData.append('image', {
      uri: localUri,
      name: filename,
      type: type,
    });
  
    try {
      const response = await fetch(`${backendUrl}/api/produits/update/${produit._id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text(); // Récupérer la réponse sous forme de texte brut
        console.error("Erreur de serveur:", errorText);
        Alert.alert("Erreur de serveur", errorText); // Affiche l'erreur serveur dans une alerte
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
  
      const data = await response.json(); // Tenter de parser la réponse en JSON
      console.log('Image téléchargée avec succès:', data);
  
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      Alert.alert('Erreur', "Impossible de télécharger l'image");
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
      codeBarre === produit.codeBarre &&
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
    if (codeBarre !== produit.codeBarre) modifications.append("codeBarre", codeBarre);

  
    // Gestion de l'image
    if (currentImageUrl !== originalImageUrl) {
      if (image && image.startsWith('file://')) {
        const localUri = image;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
  
        modifications.append('image', {
          uri: localUri,
          name: filename,
          type: type,
        });
      } else if (image) {
        const imagePath = image.startsWith(backendUrl) ? image.replace(backendUrl, '') : image;
        modifications.append("imagePath", imagePath); // Pas besoin d'upload si l'image existe déjà sur le serveur
      } else {
        modifications.append("removeImage", "true"); // Si aucune image n'est fournie, supprimer l'ancienne image
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
  
      // Afficher un message de succès
      Alert.alert(" ", data.message || "Mise à jour effectuée avec succès !", [
        {
          text: "OK",
          onPress: () => navigation.navigate('GestiondesProduits', {
            produit: data.produit || data.updatedProduct
          })
        }
      ]);
    } catch (error) {
      console.error("Erreur API:", error);
      Alert.alert(
        "Erreur",
        error.message || "Une erreur s'est produite lors de la modification",
        [{ text: "OK", onPress: () => { } }]
      );
    }
  };
  


  const imageUri = image
    ? image.startsWith('http') || image.startsWith('file://')
      ? image
      : `${backendUrl}${image.startsWith('/') ? image : '/' + image}`
    : null;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.label}>{t("codeBarre")} :</Text>
          <TextInput
            style={styles.input}
            value={codeBarre}
            onChangeText={setCodeBarre}
            keyboardType="default"
            placeholder="Code barre du produit"
          />
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
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 30, textAlign: "center", color: "#000" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  label: { fontSize: 15, fontWeight: "bold", width: 100 },
  input: { flex: 1, borderWidth: 1, borderColor: "#9E9E9E", padding: 13, borderRadius: 10 },
  textarea: { height: 120, textAlignVertical: "top" },
  picker: { flex: 1, height: 50, borderWidth: 1, borderColor: "#329171", borderRadius: 10 },
  imageContainer: { width: 150, height: 150, borderRadius: 10, backgroundColor: "#ddd", justifyContent: "center", alignItems: "center", overflow: "hidden", flex: 1 },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePlaceholder: { color: "#329171", fontWeight: "bold", textAlign: "center" },
  btnModifier: { backgroundColor: "#2E7D32", padding: 12, borderRadius: 10, alignItems: "center", marginTop: 30, },
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

export default ModifierProduit;
