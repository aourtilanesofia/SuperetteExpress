import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import LayoutAdmin from "../../components/LayoutAdmin/LayoutAdmin";
import { useTranslation } from "react-i18next";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { io } from "socket.io-client";

const socket = io("http://192.168.1.9:8080");

const GestionDesCommandes = () => {
    const { t } = useTranslation();
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [newCommandes, setNewCommandes] = useState([]); 
    const navigation = useNavigation();

    const fetchCommandes = async () => {
        try {
            const response = await fetch("http://192.168.1.9:8080/api/commandes/");
            const data = await response.json();
            if (response.ok) {
                setCommandes(data.reverse());
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

    // Écoute les nouvelles commandes via WebSocket
    useEffect(() => {
        socket.on("nouvelleCommande", (nouvelleCommande) => {
            //console.log("Nouvelle commande reçue via WebSocket:", nouvelleCommande); 
            setCommandes((prev) => [nouvelleCommande, ...prev]);
    
            setNewCommandes((prev) => {
                //console.log("Nouvelles commandes avant ajout:", prev);
                if (!prev.includes(nouvelleCommande._id)) {
                    const updatedNewCommandes = [...prev, nouvelleCommande._id];
                    //console.log("Nouvelles commandes après ajout:", updatedNewCommandes);
                    return updatedNewCommandes;
                }
                return prev;
            });
        });
     
        return () => socket.off("nouvelleCommande");
    }, []);

    // Marquer une commande comme vue lorsqu'on clique dessus
    const handlePressCommande = (commande) => {
        // Marquer comme vue en supprimant l'ID de la commande des nouvelles commandes
        setNewCommandes((prev) => prev.filter((id) => id !== commande._id));
        navigation.navigate("CommandeDetailsAdmin", { commande });
    };

    return (
        <LayoutAdmin>
            <Text style={styles.txtdash}>{t("listedescommandes")}</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#329171" />
            ) : commandes.length === 0 ? (
                <Text style={styles.noCommandes}>{t("Aucune commande")}</Text> 
            ) : (
                <FlatList
                    style={styles.container}
                    contentContainerStyle={{ paddingBottom: 55 }}
                    data={commandes}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.card, newCommandes.includes(item._id) && styles.newCommande]}
                            onPress={() => handlePressCommande(item)}
                        >
                            {newCommandes.includes(item._id) && <Text style={styles.badge}>Nouveau</Text>}  
                            <Text style={styles.commandeId}>{t("commande")} {item.numeroCommande}</Text>
                            <Text>{t("client")} : {item.userId ? item.userId.nom : "Inconnu"}</Text>
                            <Text style={styles.total}>{t("total")} : {item.total} DA</Text>
                            <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
                            <Text
                                style={[
                                    styles.statut,
                                    { color: item.statut === "Confirmée" ? "green" : item.statut === "Annulée" ? "red" : "orange" },
                                ]}
                            >
                                {item.statut}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </LayoutAdmin>
    );
};

export default GestionDesCommandes;

const styles = StyleSheet.create({
    txtdash: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "left",
        marginLeft: 17,
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
