import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert, StyleSheet } from "react-native";
import LayoutAdmin from "../../components/LayoutAdmin/LayoutAdmin";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from 'react-i18next';

const API_URL = "http://192.168.43.145:8080/api/superettes/stat";

const Calcule = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { t } = useTranslation();

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(API_URL);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || `Erreur HTTP: ${response.status}`
                );
            }

            const data = await response.json();
            console.log("Données reçues:", data);

            if (!Array.isArray(data)) {
                throw new Error("Format de données invalide");
            }

            setStats(data);
        } catch (error) {
            console.error("Erreur de fetch:", error);
            setError(error.message);
            Alert.alert("Erreur", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <LayoutAdmin>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4e8cff" />
                </View>
            </LayoutAdmin>
        );
    }

    if (error) {
        return (
            <LayoutAdmin>
                <View style={styles.center}>
                    <MaterialIcons name="error-outline" size={50} color="#ff4444" />
                    <Text style={styles.error}>Erreur: {error}</Text>
                </View>
            </LayoutAdmin>
        );
    }

    return (
        <LayoutAdmin>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.header}>{t('Stat')}</Text>
                
                {stats.length > 0 ? (
                    stats.map((s, index) => (
                        <LinearGradient
                            key={index}
                            colors={['#f7f9fc', '#eef2f9']}
                            style={[styles.card, s.nom === "Supérette A" && styles.highlightCard]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.cardHeader}>
                                <MaterialIcons 
                                    name="store" 
                                    size={24} 
                                    color={s.nom === "Supérette A" ? "#4CAF50" : "#607D8B"} 
                                />
                                <Text style={styles.title}>{s.nom}</Text>
                            </View>
                            
                          
                            
                            <View style={styles.statRow}>
                                <MaterialIcons name="shopping-cart" size={20} color="#FF9800" />
                                <Text style={styles.statText}>Total achats: <Text style={styles.statValue}>{s.totalPaye || 0} DA</Text></Text>
                            </View>
                            
                            <View style={styles.statRow}>
                                <MaterialIcons name="local-shipping" size={20} color="#9C27B0" />
                                <Text style={styles.statText}>Frais livraison: <Text style={styles.statValue}>{s.totalLivraison || 0} DA</Text></Text>
                            </View>
                            
                            <View style={styles.statRow}>
                                <MaterialIcons name="attach-money" size={20} color="#4CAF50" />
                                <Text style={styles.statText}>Marge gagnée: <Text style={styles.statValue}>{s.totalMarge || 0} DA</Text></Text>
                            </View>
                        </LinearGradient>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="info-outline" size={40} color="#607D8B" />
                        <Text style={styles.emptyText}>Aucune statistique disponible</Text>
                    </View>
                )}
            </ScrollView>
        </LayoutAdmin>
    );
};

const styles = StyleSheet.create({
    container: { 
        padding: 15,
        
        backgroundColor: '#f5f7fa',
       
    },
    center: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center" 
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
        textAlign: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    card: {
        marginBottom: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    highlightCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10
    },
    title: {
        fontWeight: "bold",
        fontSize: 18,
        marginLeft: 10,
        color: '#34495e'
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5
    },
    statText: {
        marginLeft: 10,
        fontSize: 15,
        color: '#555'
    },
    statValue: {
        fontWeight: '600',
        color: '#2c3e50'
    },
    error: { 
        color: "red", 
        textAlign: "center", 
        marginTop: 20,
        fontSize: 16 
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30
    },
    emptyText: {
        textAlign: "center",
        marginTop: 15,
        fontSize: 16,
        color: '#7f8c8d'
    },
     scrollContent: {
        paddingBottom: 70, // Espace supplémentaire en bas
    },
});

export default Calcule;