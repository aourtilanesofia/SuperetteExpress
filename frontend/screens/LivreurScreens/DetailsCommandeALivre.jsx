import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import LayoutLivreur from '../../components/LayoutLivreur/LayoutLivreur';
import * as Location from 'expo-location';

const DetailsCommandeALivre = ({ route }) => {
    const navigation = useNavigation();
    const { commande, numTel, nom } = route.params;
    const [statut, setStatut] = useState(commande.statut);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const [nomClient, setNomClient] = useState(commande.userId?.nom || t("inconnu"));
    const [telephoneClient, setTelephoneClient] = useState(commande.userId?.numTel || t("non_specifie"));
    const [adresse, setAdresse] = useState(commande.destination?.adresse || t("non_specifiee"));
    const [infoSupplementaire, setInfoSupplementaire] = useState(commande.destination?.infoSup || "");
    const [total, setTotal] = useState(commande.total || 0);

    useEffect(() => {
        const loadCommandeDetails = async () => {
            try {
                const key = `commande_${commande.numeroCommande}`;
                const data = await AsyncStorage.getItem(key);

                if (data) {
                    const parsed = JSON.parse(data);
                    setAdresse(parsed.adresse || "");
                    setNomClient(parsed.nomClient || "");
                    setTelephoneClient(parsed.telephoneClient || "");
                    setInfoSupplementaire(parsed.infoSupplementaire || "");
                    setTotal(parsed.total || "");
                }
            } catch (error) {
                console.error("Erreur de chargement des détails:", error);
            }
        };

        loadCommandeDetails();
    }, [commande.numeroCommande]);



    const updateLivraisonStatus = async () => {
        if (commande.livraison === "Livré" || commande.livraison === "Non Livré") {
            Alert.alert("Erreur", "Commande déjà traitée !");
            return;
        }
    
        setLoading(true);
        try {
            // Récupérer la position actuelle du livreur
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error("Permission de localisation refusée");
            }
    
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
    
            // Envoyer la position du livreur et mettre à jour le statut
            const livreurId = await AsyncStorage.getItem('livreurId');
            const response = await fetch(`http://192.168.1.9:8080/api/commandes/livstat/${commande._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    livraison: "En cours",
                    livreurId: livreurId,
                    livreurPosition: {
                        latitude,
                        longitude
                    }
                }),
            });
    
            const result = await response.json();
    
            if (!response.ok) {
                throw new Error(result.message || "Échec de la mise à jour");
            }
    
            // Envoyer la position initiale du livreur au serveur
            await fetch('http://192.168.1.9:8080/api/livreur/position', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${await AsyncStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    longitude,
                    latitude
                }),
            });
    
            navigation.navigate('MiseAjoueEtatDeCommande', {
                commandeInitiale: {
                    ...commande,
                    livraison: "En cours"
                },
                numTel: numTel,
                nom: nom,
                adresse: adresse,
                infoSupplementaire: infoSupplementaire,
                total: total,
                livreurPosition: { latitude, longitude }
            });
        } catch (error) {
            console.error("Erreur:", error);
            Alert.alert("Erreur", error.message || "Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    };
    



    const updateStatutCommande = async (nouveauStatut) => {
        if (statut === "Confirmée" || statut === "Annulée") {
            Alert.alert(
                t("action_non_autorisee"),
                t("statut_non_modifiable")
            );
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `http://192.168.1.9:8080/api/commandes/${commande._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ statut: nouveauStatut }),
                }
            );

            if (response.ok) {
                setStatut(nouveauStatut);
                Alert.alert(" ", `${t("commande")} ${nouveauStatut} !`);
                navigation.goBack();
            } else {
                Alert.alert(t("erreur"), t("Echec mise a jour statut"));
            }
        } catch (error) {
            console.error("Erreur de connexion :", error);
            Alert.alert(t("erreur"), t("Connexion serveur impossible"));
        } finally {
            setLoading(false);
        }
    };

    const renderStatusBadge = () => {
        let backgroundColor, iconName, textColor = "#FFF";

        switch (statut) {
            case "Confirmée":
                backgroundColor = "#E8F5E9";
                iconName = "check-circle";
                textColor = "#2E7D32";
                break;
            case "Annulée":
                backgroundColor = "#FFEBEE";
                iconName = "cancel";
                textColor = "#D32F2F";
                break;
            default:
                backgroundColor = "#FFF8E1";
                iconName = "access-time";
                textColor = "#FFA000";
        }

        return (
            <View style={[styles.statusBadge, { backgroundColor }]}>
                <Icon name={iconName} size={18} color={textColor} />
                <Text style={[styles.statusText, { color: textColor }]}>{statut}</Text>
            </View>
        );
    };

    return (
        <LayoutLivreur>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{t('detailComm')}</Text>

                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.orderNumber}>
                                {t('Commande')} #{commande.numeroCommande}
                            </Text>
                            <View style={styles.dateContainer}>
                                <Icon name="event" size={16} color="#6E6E6E" />
                                <Text style={styles.dateText}>
                                    {new Date(commande.date).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('infoclient')}</Text>
                            <View style={styles.infoRow}>
                                <View style={styles.iconContainer}>
                                    <Icon name="person" size={20} color="#2E7D32" />
                                </View>
                                <View>
                                    <Text style={styles.infoLabel}>{t('nom')}</Text>
                                    <Text style={styles.infoText}>
                                        {nom || (commande.userId?.nom ?? t("inconnu"))}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={styles.iconContainer}>
                                    <Icon name="phone" size={20} color="#2E7D32" />
                                </View>
                                <View>
                                    <Text style={styles.infoLabel}>{t('num')}</Text>
                                    <Text style={styles.infoText}>
                                        {numTel || t("non_specifie")}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t('adeLiv')}</Text>
                            <View style={styles.infoRow}>
                                <View style={styles.iconContainer}>
                                    <Icon name="place" size={20} color="#2E7D32" />
                                </View>
                                <View>
                                    <Text style={styles.infoText}>
                                        {adresse || t("non_specifiee")}
                                    </Text>
                                </View>
                            </View>

                            {infoSupplementaire && (
                                <View style={styles.infoRow}>
                                    <View style={styles.iconContainer}>
                                        <Icon name="info" size={20} color="#2E7D32" />
                                    </View>
                                    <View>
                                        <Text style={styles.infoLabel}>{t('infosup')}</Text>
                                        <Text style={styles.infoText}>
                                            {infoSupplementaire}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>{t('totalapayer')}</Text>
                    <Text style={styles.totalValue}>{(commande.total + 130)} DA</Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        styles.confirmButton,
                        loading && styles.disabledButton
                    ]}
                    onPress={updateLivraisonStatus}
                    disabled={loading}
                >
                    <Icon name="directions-bike" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>{t('demmareliv')}</Text>
                </TouchableOpacity>
            </View>
        </LayoutLivreur>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 120,
        //backgroundColor: "#F5F7FA",
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    header: {
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#2C3E50",
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
    },
    statusText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: "600",
    },
    infoCard: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        marginTop: 30,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2C3E50",
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateText: {
        fontSize: 13,
        color: "#6E6E6E",
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: "#ECF0F1",
        marginVertical: 12,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#7F8C8D",
        marginBottom: 12,
        textTransform: "uppercase",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 14,
    },
    iconContainer: {
        width: 32,
        alignItems: "center",
        marginRight: 12,
        paddingTop: 2,
    },
    infoLabel: {
        fontSize: 13,
        color: "#7F8C8D",
        marginBottom: 2,
    },
    infoText: {
        fontSize: 15,
        color: "#34495E",
        lineHeight: 20,
    },
    footer: {
        position: "absolute",
        bottom: 50,
        left: 0,
        right: 0,
        backgroundColor: "#FFF",
        borderTopWidth: 1,
        borderTopColor: "#ECF0F1",
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 5,
    },
    totalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    totalLabel: {
        fontSize: 16,
        color: "#7F8C8D",
    },
    totalValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#2E7D32",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: "#4CAF50",
    },
    confirmButton: {
        backgroundColor: "#2E7D32",
    },
    buttonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    disabledButton: {
        opacity: 0.7,
    },
});

export default DetailsCommandeALivre;