import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import LayoutLivreur from "../../components/LayoutLivreur/LayoutLivreur";

const DetailsCommandeLivreur = ({ route, navigation }) => {
  const { commande,adresseLivraison, total } = route.params;

  const handleAccept = () => {
    Alert.alert("Succès", "Vous avez accepté la commande");
    navigation.goBack();
  };

  const handleReject = () => {
    Alert.alert("Info", "Vous avez refusé la commande");
    navigation.goBack();
  };

  return (
    <LayoutLivreur>
      <View style={styles.container}>
        <Text style={styles.title}>Commande #{commande.numeroCommande}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client:</Text>
          <Text>{commande.userId?.nom || "Inconnu"}</Text>
          <Text>{commande.userId?.numTel || "Non disponible"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresse:</Text>
          <Text>{adresseLivraison}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total:</Text>
          <Text>{commande.total} DA</Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.buttonText}>Accepter</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
            <Text style={styles.buttonText}>Refuser</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LayoutLivreur>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  acceptButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default DetailsCommandeLivreur;