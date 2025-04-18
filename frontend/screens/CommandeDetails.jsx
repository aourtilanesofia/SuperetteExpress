import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import Layout from "../components/Layout/Layout";
import { useTranslation } from "react-i18next"; 

const CommandeDetails = ({ route, navigation }) => {
    const { commande } = route.params;
    const [statutCommande, setStatutCommande] = useState(commande.statut);
    const { t } = useTranslation();

    const annulerCommande = async () => {
        try {
            const response = await fetch(`http://192.168.228.149:8080/api/commandes/cancel/${commande._id}`, {

                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
    
            if (response.ok) {
                alert("Votre commande a bien été annulée !");
    
                if (route.params?.onDelete) {
                    route.params.onDelete(commande._id);
                }
    
                navigation.goBack();
            } else {
                const data = await response.json();
                alert("Erreur lors de l'annulation : " + data.message);
            }
        } catch (error) {
            alert("Erreur de connexion au serveur");
        }
    };

    return (
        <Layout> 
            <View style={styles.container}>
                <Text style={styles.title}>{t("Commande")} {commande.numeroCommande}</Text>
                <Text style={styles.date}>{new Date(commande.date).toLocaleString()}</Text>

                <FlatList
                    data={commande.produits}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.produit}>
                            <Text style={styles.nomProduit}>{item.nom}</Text>
                            <Text style={styles.txt}>{t("prix")}: {item.prix} DA</Text>
                            <Text style={styles.txt}>{t("qte")}: {item.quantite}</Text>
                        </View>
                    )}
                />

                <Text style={styles.total}>{t("total")} : {commande.total} DA</Text>
                <Text style={[styles.status, { color: statutCommande === "Annulée" ? "red" : statutCommande === "Confirmée" ? "green" : "#ff9800" }]}> 
                    {statutCommande}
                </Text>
                {commande.statut !== "Annulée" && (
                    <TouchableOpacity 
                        style={[styles.annulerButton, commande.statut === "Confirmée" && { backgroundColor: "#ccc" }]} 
                        onPress={commande.statut === "Confirmée" ? null : annulerCommande} 
                        disabled={commande.statut === "Confirmée"}
                    >
                        <Text style={styles.annulerText}>{t("annulerlacommande")}</Text>
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
        padding: 10,
        borderRadius: 5,
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
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
    txt: { 
        fontSize: 15,
        marginTop: 10,
    },
});
