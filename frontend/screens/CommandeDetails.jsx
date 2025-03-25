import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import Layout from "../components/Layout/Layout";

const CommandeDetails = ({ route, navigation }) => {
    const { commande } = route.params;
    const [statutCommande, setStatutCommande] = useState(commande.statut);;

    const annulerCommande = async () => {
        try {
            const response = await fetch(`http://192.168.43.107:8080/api/commandes/cancel/${commande._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();

            if (response.ok) {
                setStatutCommande("Annulée"); // Met à jour le statut localement
            } else {
                alert("Erreur lors de l'annulation : " + data.message);
            }
        } catch (error) {
            alert("Erreur de connexion au serveur");
        }
    };

    return (
        <Layout>
            <View style={styles.container}>
                <Text style={styles.title}>Commande {commande.numeroCommande}</Text>
                <Text style={styles.date}>{new Date(commande.date).toLocaleString()}</Text>

                <FlatList
                
                    data={commande.produits}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.produit}>
                            <Text style={styles.nomProduit}>{item.nom}</Text>
                            <Text style={styles.txt}>Prix: {item.prix} DA</Text>
                            <Text style={styles.txt}>Quantité: {item.quantite}</Text>
                        </View>
                    )}
                />

                <Text style={styles.total}>Total : {commande.total} DA</Text>
                <Text style={[styles.status, { color: statutCommande === "Annulée" ? "red" : "#ff9800" }]}>
                    {statutCommande}
                </Text>

                {commande.statut !== "Annulée" && (
                    <TouchableOpacity style={styles.annulerButton} onPress={annulerCommande}>
                        <Text style={styles.annulerText}>Annuler la commande</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Layout>
    );
};

export default CommandeDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#FFF",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    date: {
        fontSize: 14,
        marginBottom: 10,
        color: "gray",
    },
    produit: {
        //backgroundColor: "#fff",
        padding: 10,
        borderRadius: 5,
        marginBottom: 5,
        borderBottomWidth: 1,  // Ajoute un trait
        borderBottomColor: "#ccc", // Couleur du trait
    },
    nomProduit: {
        fontSize: 16,
        fontWeight: "bold",
    },
    total: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 10,
    },
    status: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
    },
    annulerButton: {
        backgroundColor: "red",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 40,
    },
    annulerText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    txt:{ 
        fontSize:15,
        marginTop:10,
    },
});
