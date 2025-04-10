import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import LayoutAdmin from "../../components/LayoutAdmin/LayoutAdmin";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const CommandeDetailsAdmin = ({ route }) => {
    const navigation = useNavigation(); 
    const { commande } = route.params;
    const [statut, setStatut] = useState(commande.statut);
    const { t } = useTranslation();

    const updateStatutCommande = async (nouveauStatut) => {
        if (statut === "Confirmée" || statut === "Annulée") {
            Alert.alert("Action non autorisée", "Le statut ne peut plus être modifié.");
            return;
        }

        try {
            const response = await fetch(`http://192.168.1.47:8080/api/commandes/${commande._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ statut: nouveauStatut }),
            });

            if (response.ok) {
                setStatut(nouveauStatut);
                Alert.alert(" ", `Commande ${nouveauStatut} !`);
                navigation.goBack();
            } else {
                Alert.alert("Erreur", "Échec de la mise à jour du statut");
            }
        } catch (error) {
            console.error("Erreur de connexion :", error);
            Alert.alert("Erreur", "Impossible de se connecter au serveur");
        }
    };

    return (
        <LayoutAdmin>
            <View style={styles.container}>
                <Text style={styles.title}>{t("commande")}: {commande.numeroCommande}</Text>
                <Text style={styles.client}>{t("client")} : {commande.userId ? commande.userId.nom : "Inconnu"}</Text>
                <Text style={styles.sectionTitle}>{t("listeproduits")} :</Text>
            </View>

            <FlatList
                data={commande.produits}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.productCard}>
                        <Text style={styles.productName}>{item.nom}</Text>
                        <View style={styles.detailsContainer}>
                            <Text style={styles.quantity}>{t("qte")}: {item.quantite}</Text>
                            <Text style={styles.price}>{item.prix} DA</Text>
                        </View>
                    </View>
                )}
            />

            <View style={styles.footer}>
                <View style={styles.grandTotal}>
                    <Text style={styles.totalLabel}>{t("total")} :</Text>
                    <Text style={styles.totalValue}>{commande.total} DA</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.confirmButton, (statut !== "En attente") && styles.disabledButton]} 
                        onPress={() => updateStatutCommande("Confirmée")}
                        disabled={statut !== "En attente"}
                    >
                        <Text style={styles.buttonText}>{t("confirmer")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.cancelButton, (statut !== "En attente") && styles.disabledButton]} 
                        onPress={() => updateStatutCommande("Annulée")}
                        disabled={statut !== "En attente"}
                    >
                        <Text style={styles.buttonText}>{t("annuler")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LayoutAdmin>
    );
};

export default CommandeDetailsAdmin;

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    client: {
        fontSize: 16,
        marginBottom: 5,
        textAlign: "center",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'left',
        marginLeft: 17,
        marginBottom: 15,
        marginTop: 15,
    },
    productCard: {
        padding: 8,
        borderRadius: 8,
        marginBottom: 3,
        margin: 16,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    productName: {
        fontSize: 15,
        fontWeight: "bold",
    },
    detailsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 5,
        margin: 10,
    },
    quantity: {
        fontSize: 14,
    },
    price: {
        fontSize: 14,
        fontWeight: "bold",
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "bold",
    },
    totalValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    grandTotal: {
        borderWidth: 1,
        borderColor: "lightgray",
        backgroundColor: "#ffffff",
        padding: 6,
        margin: 5,
        marginHorizontal: 20,
        borderRadius: 5,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 90,
    },
    confirmButton: {
        backgroundColor: "#2E7D32",
        padding: 10,
        borderRadius: 10,
        width: "40%",
        alignItems: "center",
        bottom: 70,
    },
    cancelButton: {
        backgroundColor: "red",
        padding: 10,
        borderRadius: 10,
        width: "40%",
        alignItems: "center",
        bottom: 70,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    disabledButton: {
        backgroundColor: "#ccc",
    },
});
