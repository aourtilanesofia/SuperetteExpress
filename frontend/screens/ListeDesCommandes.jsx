import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import Layout from "../components/Layout/Layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const ListeDesCommandes = () => {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userId = await AsyncStorage.getItem("userId");
                if (!userId) {
                    console.log("Aucun utilisateur connecté");
                    setLoading(false);
                    return;
                }

                const response = await fetch(`http://192.168.43.107:8080/api/commandes/user/${userId}`);
                const data = await response.json();

                if (response.ok) {
                    setCommandes(data);
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

    return (
        <Layout>
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#ff9800" />
                ) : (
                    <>
                        <Text style={styles.subTitle}>Nombre de commandes : {commandes.length}</Text>
                        <FlatList
                            data={commandes}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.card}
                                    onPress={() => navigation.navigate("CommandeDetails", { commande: item })}
                                >
                                    <View style={styles.row}>
                                        <Text style={styles.commandeId}>Commande N° {item.numeroCommande}</Text>
                                        <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
                                    </View>
                                    <Text style={styles.total}>Total : {item.total} DA</Text>
                                    <Text style={[styles.status, { color: item.statut === "Annulée" ? "red" : "#ff9800" }]}>
                                        {item.statut}
                                    </Text>
                                </TouchableOpacity>
                            )}
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
        //fontWeight: "bold",
        marginTop: 8,
    },
    status: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 5,
        textAlign: "right",
    },
});
