import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import Layout from "../components/Layout/Layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const ListeDesCommandes = () => {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const { t } = useTranslation(); 

    const supprimerCommande = (idCommande) => {
        setCommandes((prevCommandes) => prevCommandes.filter((commande) => commande._id !== idCommande));
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userId = await AsyncStorage.getItem("userId");
                if (!userId) {
                    console.log("Aucun utilisateur connecté");
                    setLoading(false);
                    return;
                } 

                const response = await fetch(`http://192.168.1.42:8080/api/commandes/user/${userId}`);

                const data = await response.json();

                if (response.ok) {
                    // Trier par date décroissante (les plus récentes en haut)
                    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setCommandes(sortedData);
                } else {
                    console.log("Erreur lors de la récupération des commandes :", data.message);
                }
            } catch (error) {
                console.log("Erreur de connexion au serveur :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handlePaiement = (statut, commande) => {
        if (statut !== "Confirmée") {
            Alert.alert("Paiement Impossible", "Votre commande n'est pas encore confirmée!");
        } else {
            navigation.navigate("Paiement", { commande });
        }
    };

    return (
        <Layout> 
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#ff9800" />
                ) : commandes.length === 0 ? (
                    <Text style={styles.emptyMessage}>{t("Aucune commande")}</Text>
                ) : (
                    <>
                        <Text style={styles.subTitle}>{t("nbrcommande")} : {commandes.length}</Text>
                        <FlatList
                            data={commandes}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={{ paddingBottom: 50 }}
                            renderItem={({ item }) => {
                                const statusColor = item.statut === "Confirmée" ? "green"
                                    : item.statut === "Annulée" ? "red"
                                        : "#ff9800"; // En attente
                                const isDisabled = item.statut === "Annulée";
                                return (
                                    <TouchableOpacity
                                        style={styles.card}
                                        onPress={() => navigation.navigate("CommandeDetails", {
                                            commande: item,
                                            onDelete: supprimerCommande
                                        })}
                                    >
                                        <View style={styles.row}>
                                            <Text style={styles.commandeId}>{t("commande")} {item.numeroCommande}</Text>
                                            <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
                                        </View>
                                        <Text style={styles.total}>{t("total")} : {item.total} DA</Text>
                                        <View style={styles.v1}>
                                            <Text style={[styles.status, { color: statusColor }]}>
                                                {item.statut}
                                            </Text>
                                            <TouchableOpacity
                                                style={[styles.paiementButton, isDisabled && styles.disabledButton]}
                                                onPress={() => handlePaiement(item.statut, item)}
                                                disabled={isDisabled}
                                            >
                                                <Text style={styles.paiementButtonText}>{t("Paiement")}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </>
                )}
            </View>
        </Layout>
    );
};

export default ListeDesCommandes;

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    subTitle: {
        fontSize: 15,
        marginBottom: 15,
        fontWeight: "bold",
    },
    emptyMessage: {
        textAlign: "center",
        fontSize: 17,
        color: "#666",
        marginTop: 290,
    },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 6,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    commandeId: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#333",
    },
    date: {
        fontSize: 14,
        color: "#666",
    },
    total: {
        fontSize: 14,
        marginTop: 8,
    },
    status: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 5,
        textAlign: "right",
    },
    paiementButton: {
        backgroundColor: "#2E7D32",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        width: '32%',
        bottom: 10,
    },
    paiementButtonText: {
        color: "#fff",
        fontSize: 14,
        //fontWeight: "bold",
        textAlign: 'center',
    },
    disabledButton: {
        backgroundColor: "#ccc",
    },
    v1: { 
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
    },
});
