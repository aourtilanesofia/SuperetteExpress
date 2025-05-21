import React, { useState, useEffect, useCallback } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Alert,
  RefreshControl
} from "react-native";
import LayoutCommercant from "../../components/LayoutCommercant/LayoutCommercant";
import { useTranslation } from "react-i18next";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { io } from "socket.io-client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';


const socket = io("http://192.168.43.145:8080");



const GestionDesCommandes = () => {
    const { t } = useTranslation();
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [newCommandes, setNewCommandes] = useState([]);
    const navigation = useNavigation();

    // Charger les commandes déjà vues depuis AsyncStorage
    const loadSeenCommands = async () => {
        try {
            const seen = await AsyncStorage.getItem('seenCommands');
            return seen ? JSON.parse(seen) : [];
        } catch (error) {
            console.error("Erreur de chargement:", error);
            return [];
        }
    };

    // Sauvegarder les commandes vues
    const saveSeenCommands = async (commands) => {
        try {
            await AsyncStorage.setItem('seenCommands', JSON.stringify(commands));
        } catch (error) {
            console.error("Erreur de sauvegarde:", error);
        }
    };

    const fetchLivreurInfo = async (livreurId) => {
        try {
            const response = await fetch(`http://192.168.43.145:8080/api/v1/livreur/${livreurId}`);
            return await response.json();
        } catch (error) {
            console.error("Erreur récupération livreur", error);
            return null;
        }
    };

    const fetchCommandes = async () => {
        try {

            const response = await fetch("http://192.168.43.145:8080/api/commandes/");

            const data = await response.json();
            
            if (response.ok) {
                const seenCommands = await loadSeenCommands();
                
                const commandesAvecLivreurs = await Promise.all(
                    data.map(async (commande) => {
                        if (commande.livreur && !commande.livreur.nom) {
                            const livreur = await fetchLivreurInfo(commande.livreur);
                            return { ...commande, livreur };
                        }
                        return commande;
                    })
                );

                // Marquer les nouvelles commandes
                const commandesAvecNouveau = commandesAvecLivreurs.map(commande => ({
                    ...commande,
                    isNew: !seenCommands.includes(commande._id)
                }));

                setCommandes(commandesAvecNouveau.reverse());
                setNewCommandes(commandesAvecNouveau.filter(c => c.isNew).map(c => c._id));
            } else {
                console.error("Erreur lors de la récupération des commandes:", data.message);
            }
        } catch (error) {
            console.error("Erreur de connexion au serveur:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCommandes();

        socket.on("connect", () => {
            console.log("Connecté au serveur WebSocket");
        });

        socket.on("disconnect", () => {
            console.log("Déconnecté du serveur WebSocket");
        });

        return () => {
            socket.off("nouvelleCommande");
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchCommandes();
        }, [])
    );

    useEffect(() => {
        const handleNouvelleCommande = async (nouvelleCommande) => {
            console.log("Nouvelle commande reçue:", nouvelleCommande._id);
            
            if (nouvelleCommande.livreur && !nouvelleCommande.livreur.nom) {
                const livreur = await fetchLivreurInfo(nouvelleCommande.livreur);
                nouvelleCommande.livreur = livreur;
            }
            
            // Marquer comme nouvelle
            const commandeAvecNouveau = { ...nouvelleCommande, isNew: true };
            
            setCommandes(prev => {
                const existeDeja = prev.some(c => c._id === commandeAvecNouveau._id);
                return existeDeja ? prev : [commandeAvecNouveau, ...prev];
            });

            setNewCommandes(prev => 
                prev.includes(commandeAvecNouveau._id) 
                    ? prev 
                    : [...prev, commandeAvecNouveau._id]
            );

            Alert.alert("Nouvelle commande!", `Commande #${nouvelleCommande.numeroCommande}`);
        };

        socket.on("nouvelleCommande", handleNouvelleCommande);
        
        return () => {
            socket.off("nouvelleCommande", handleNouvelleCommande);
        };
    }, []);

    const handlePressCommande = async (commande) => {
        // Marquer comme vue
        const seenCommands = await loadSeenCommands();
        if (!seenCommands.includes(commande._id)) {
            await saveSeenCommands([...seenCommands, commande._id]);
        }
        
        // Mettre à jour l'état
        setCommandes(prev => 
            prev.map(c => 
                c._id === commande._id ? { ...c, isNew: false } : c
            )
        );
        setNewCommandes(prev => prev.filter(id => id !== commande._id));
        
        navigation.navigate("CommandeDetailsAdmin", { commande });
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCommandes();
    };

    const renderCommandeItem = ({ item }) => {
        return (
            <View style={styles.card}>
                {/* Badge Nouveau - TEST VISIBLE */}
                {item.isNew && (
                    <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NOUVEAU</Text>
                    </View>
                )}
                
                <TouchableOpacity 
                    onPress={() => handlePressCommande(item)}
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

                    <View style={styles.clientInfo}>
                        <View style={styles.infoRow}>
                            <Icon name="person" size={16} color="#555" />
                            <Text style={styles.client}> {item.userId?.nom || "Inconnu"}</Text>
                        </View>
                    </View>

                    <View style={styles.statusContainer}>
                        {item.statut === "Assignée" && (
                            <View style={[styles.statusBadge, styles.statusAssignee]}>
                                <Text style={styles.statusText}>
                                    {item.statut}
                                </Text>
                            </View>
                        )}
                        <Text style={styles.total}>{t("total")} : {item.total} DA</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <LayoutCommercant>
            <View style={styles.header}>
                <Text style={styles.title}>{t("listedescommandes")}</Text>
                <TouchableOpacity onPress={() => onRefresh()} style={styles.refreshButton}>
                    <Icon name="refresh" size={24} color="#329171" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#329171" />
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
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="assignment" size={50} color="#cccccc" />
                            <Text style={styles.emptyText}>{t("Aucune commande")}</Text>
                        </View>
                    }
                />
            )}
        </LayoutCommercant>
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
        padding: 50,
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
        position: 'relative',
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
    dateText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5,
    },
    clientInfo: {
        marginVertical: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    client: {
        fontSize: 15,
        color: '#555',
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    statusAssignee: {
        backgroundColor: '#e3f2fd',
    },
    total: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    newBadge: {
        position: 'absolute',
        top: -6,
        right: -10,
        backgroundColor: '#E63946',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 3,
        zIndex: 10,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    newBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default GestionDesCommandes;