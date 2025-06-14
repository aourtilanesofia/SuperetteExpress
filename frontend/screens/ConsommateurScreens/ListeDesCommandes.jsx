import React, { useState, useEffect, useCallback } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  RefreshControl
} from "react-native";
import Layout from "../../components/Layout/Layout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Icon from 'react-native-vector-icons/MaterialIcons';

const ListeDesCommandes = () => {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const { t } = useTranslation();

    const fetchOrders = useCallback(async () => {
        try {
            setRefreshing(true);
            const userId = await AsyncStorage.getItem("userId");
            if (!userId) {
                console.log("Aucun utilisateur connecté");
                setLoading(false);
                setRefreshing(false);
                return;
            }

            const response = await fetch(`http://192.168.43.145:8080/api/commandes/user/${userId}`);
            const data = await response.json();

            if (response.ok) {
                const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setCommandes(sortedData);
            } else {
                console.log("Erreur lors de la récupération des commandes :", data.message);
            }
        } catch (error) {
            console.log("Erreur de connexion au serveur :", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();  
    }, [fetchOrders]); 

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [fetchOrders])
    );

    const supprimerCommande = (idCommande) => {
        setCommandes((prevCommandes) => prevCommandes.filter((commande) => commande._id !== idCommande));
    };

    const onRefresh = () => {
        fetchOrders();
    };

    const handlePaiement = (statut, commande) => {
        if (statut !== "Confirmée") {
            Alert.alert("Paiement Impossible", "Votre commande n'est pas encore confirmée!");
        } else {
            navigation.navigate("Paiement", { commande });
        }
    };

    const renderCommandeItem = ({ item }) => {
        let statusColor = "#ff9800";
        let statusText = item.statut;

        if (item.paiement === "Payée" || item.paiement === "En attente de paiement") {
            statusText = item.paiement;
            statusColor = item.paiement === "Payée" ? "green" : "#ff9800";
        } else if (item.statut === "Confirmée") {
            statusColor = "green";
        } else if (item.statut === "Annulée") {
            statusColor = "red";
        }

        const isDisabled = item.statut === "Annulée";

        return (
            <View style={styles.card}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("CommandeDetails", {
                        commande: item,
                        onDelete: supprimerCommande
                    })}
                    style={styles.touchableArea}
                >
                    <View style={styles.cardHeader}>
                        <Text style={styles.commandeId}>{t("commande")} #{item.numeroCommande}</Text>
                        <View style={styles.infoRow}>
                            <Icon name="access-time" size={16} color="#2E7D32" />
                            <Text style={styles.dateText}>
                                {new Date(item.date).toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statusContainer}>
                        <Text style={styles.total}>{t("total")} : {item.total} DA</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <Layout>
            <View style={styles.header}>
                <Text style={styles.title}>{t("Mes_Commandes")}</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                    <Icon name="refresh" size={24} color="#329171" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#329171" />
                </View>
            ) : commandes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="assignment" size={50} color="#cccccc" />
                    <Text style={styles.emptyText}>{t("Aucune commande")}</Text>
                </View>
            ) : (
                <FlatList
                    data={commandes}
                    keyExtractor={(item) => item._id}
                    renderItem={renderCommandeItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={onRefresh} 
                            colors={['#329171']}
                            tintColor="#329171"
                        />
                    }
                />
            )}
        </Layout>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    refreshButton: {
        padding: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 10,
        paddingBottom: 70,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        bottom:80
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    touchableArea: {
        flex: 1,
    },
    cardHeader: {
        marginBottom: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    commandeId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        //borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    total: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginLeft:230,
    },
    paiementButton: {
        backgroundColor: '#2E7D32',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    paiementButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
});

export default ListeDesCommandes;