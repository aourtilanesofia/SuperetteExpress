import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native"
import LayoutLivreur from '../../components/LayoutLivreur/LayoutLivreur';
import { useTranslation } from "react-i18next";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { io } from "socket.io-client";
import AsyncStorage from '@react-native-async-storage/async-storage';


const socket = io("http://192.168.1.9:8080");

const ListeCommandeALivre = () => {
    const { t } = useTranslation();
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCommandes, setNewCommandes] = useState([]);
    const navigation = useNavigation();

    const [total, setTotal] = useState('0');

    useEffect(() => {
        const getTotal = async () => {
            const savedTotal = await AsyncStorage.getItem('total');
            if (savedTotal) setTotal(savedTotal);
        };

        getTotal();
    }, []);

    const fetchCommandes = async () => {
        try {
            const response = await fetch("http://192.168.1.9:8080/api/commandes/");
            const data = await response.json();
            //console.log(data);
            if (response.ok) {
                const commandesFiltrees = data
                    .filter(c => c.paiement === "Payée" || c.paiement === "En attente de paiement")
                    .reverse();
                setCommandes(commandesFiltrees);
            } else {
                console.error("Erreur lors de la récupération des commandes :", data.message);
            }
        } catch (error) {
            console.error("Erreur de connexion au serveur :", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommandes();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchCommandes();
        }, [])
    );

    useEffect(() => {
        socket.on("nouvelleCommande", (nouvelleCommande) => {
            if (nouvelleCommande.paiement === "Payée" || nouvelleCommande.paiement === "En attente de paiement") {
                setCommandes((prev) => [nouvelleCommande, ...prev]);
                setNewCommandes((prev) => {
                    if (!prev.includes(nouvelleCommande._id)) {
                        return [...prev, nouvelleCommande._id];
                    }
                    return prev;
                });
            }
        });

        return () => socket.off("nouvelleCommande");
    }, []);

    const handlePressCommande = (commande) => {
        setNewCommandes((prev) => prev.filter((id) => id !== commande._id));
        navigation.navigate("DetailsCommandeALivre", { commande });
    };

    return (
        <LayoutLivreur>
            <Text style={styles.txtdash}>Liste des commandes a livrer</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#329171" />
            ) : commandes.length === 0 ? (
                <Text style={styles.noCommandes}>{t("Aucune commande")}</Text>
            ) : (
                <FlatList
                    style={styles.container}
                    contentContainerStyle={{ paddingBottom: 56 }}
                    data={commandes}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        console.log(item.userId),
                        <TouchableOpacity
                            style={[styles.card, newCommandes.includes(item._id) && styles.newCommande]}
                            onPress={() => handlePressCommande(item)}
                        >
                            {newCommandes.includes(item._id) && <Text style={styles.badge}>Nouveau</Text>}
                            <Text style={styles.commandeId}>{t("commande")} {item.numeroCommande}</Text>
                            <Text>{t("client")} : {item.userId ? item.userId.nom : "Inconnu"}</Text>
                            <Text style={styles.total}>
                                Num téléphone : {item.userId && item.userId.numTel ? item.userId.numTel : "Non disponible"}
                            </Text>
                            <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
                            <Text
                                style={[
                                    styles.statut,
                                    {
                                        color:
                                            item.paiement === "Payée" || item.paiement === "En attente de paiement"
                                                ? "#2E7D32"
                                                : item.statut === "Confirmée"
                                                    ? "green"
                                                    : item.statut === "Annulée"
                                                        ? "red"
                                                        : "#ff9800",
                                    },
                                ]}
                            >
                                {item.paiement}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </LayoutLivreur>
    );
};

export default ListeCommandeALivre;

const styles = StyleSheet.create({
    txtdash: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        //textAlign: "left",
        marginLeft: 17,
        marginTop: 25,
        textAlign: 'center',
    },
    card: {
        backgroundColor: "#fff",
        padding: 14,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 6,
        margin: 15,
        position: "relative",
    },
    newCommande: {
        borderColor: "green",
        borderWidth: 2,
    },
    badge: {
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: "red",
        color: "white",
        paddingVertical: 3,
        paddingHorizontal: 7,
        borderRadius: 10,
        fontSize: 12,
        fontWeight: "bold",
        zIndex: 1,
    },
    commandeId: {
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: 5,
    },
    statut: {
        fontSize: 14,
        fontWeight: "bold",
        color: "orange",
        alignSelf: "flex-end",
        marginTop: -20,
    },
    date: {
        alignSelf: "flex-end",
        color: "#666",
        bottom: 79,
    },
    total: {
        marginTop: 10,
    },
    noCommandes: {
        textAlign: "center",
        fontSize: 16,
        color: "#666",
        marginTop: 200,
    },
});
