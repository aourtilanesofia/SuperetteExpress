import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import Layout from "../../components/Layout/Layout";
import { useTranslation } from "react-i18next";

const CommandeDetails = ({ route, navigation }) => {
    const { commande } = route.params;
    const [statutCommande, setStatutCommande] = useState(commande.statut);
    const { t } = useTranslation();

    const annulerCommande = async () => {
        try {
            const response = await fetch(`http://192.168.1.36:8080/api/commandes/cancel/${commande.numeroCommande}`, {

                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
    
            if (response.ok) {
                alert("Votre commande a bien été annulée !");
    
                if (route.params?.onDelete) {
                    route.params.onDelete(commande.numeroCommande);
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

    const renderProduit = ({ item }) => (
        <View style={styles.produitCard}>
            <Text style={styles.nomProduit}>{item.nom}</Text>
            <View style={styles.detailsRow}>
                <Text style={styles.detailText}>{t("prix")}: <Text style={styles.detailValue}>{item.prix} DA</Text></Text>
                <Text style={styles.detailText}>{t("qte")}: <Text style={styles.detailValue}>{item.quantite}</Text></Text>
            </View>
        </View>
    );

    return (
        <Layout>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t("Commande")} #{commande.numeroCommande}</Text>
                    <Text style={styles.date}>{new Date(commande.date).toLocaleString()}</Text>
                </View>

                <Text style={styles.sectionTitle}>{t("Articles commandés")}</Text>
                <FlatList
                    data={commande.produits}
                    renderItem={renderProduit}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.listContainer}
                />

                <View style={styles.summaryContainer}>
                    <Text style={styles.total}>{t("Total")}: <Text style={styles.totalValue}>{commande.total} DA</Text></Text>
                    <View style={styles.statusContainer}>
                        <Text style={[
                            styles.status,
                            { 
                                backgroundColor: statutCommande === "Annulée" ? "#FFEBEE" :
                                              statutCommande === "Confirmée" ? "#E8F5E9" : "#FFF8E1",
                                color: statutCommande === "Annulée" ? "#D32F2F" :
                                       statutCommande === "Confirmée" ? "#2E7D32" : "#FF9800"
                            }
                        ]}>
                            {statutCommande}
                        </Text>
                    </View>
                </View>

               
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#F5F5F5",
    },
    header: {
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    date: {
        fontSize: 14,
        color: "#757575",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#424242",
        marginBottom: 10,
    },
    listContainer: {
        paddingBottom: 15,
    },
    produitCard: {
        backgroundColor: "#FFF",
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    nomProduit: {
        fontSize: 16,
        fontWeight: "600",
        color: "#212121",
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    detailText: {
        fontSize: 14,
        color: "#616161",
    },
    detailValue: {
        fontWeight: "500",
        color: "#212121",
    },
    summaryContainer: {
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
    },
    total: {
        fontSize: 17,
        color: "#424242",
        marginBottom: 15,
        textAlign: "right",
    },
    totalValue: {
        fontWeight: "bold",
        color: "#2E7D32",
    },
    statusContainer: {
        alignItems: "flex-end",
    },
    status: {
        fontSize: 14,
        fontWeight: "600",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    annulerButton: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#D32F2F",
        borderRadius: 8,
        padding: 15,
        marginTop: 25,
        alignItems: "center",
    },
    annulerText: {
        color: "#D32F2F",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default CommandeDetails;