import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import LayoutCommercant from "../../components/LayoutCommercant/LayoutCommercant";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const CommandeDetailsAdmin = ({ route }) => {
    const navigation = useNavigation(); 
    const { commande } = route.params;
    const [statut, setStatut] = useState(commande.statut);
    const { t } = useTranslation();

    const updateStatutCommande = async (nouveauStatut) => {
        if (statut === "Confirmée" || statut === "Annulée") {
            Alert.alert(t("actionNonAutorisee"), t("statutNonModifiable"));
            return;
        }

        try {
            const response = await fetch(`http://192.168.1.38:8080/api/commandes/${commande._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ statut: nouveauStatut }),
            });

            if (response.ok) {
                setStatut(nouveauStatut);
                Alert.alert(" ", `${t("commande")} ${nouveauStatut} !`);
                navigation.goBack();
            } else {
                Alert.alert(t("erreur"), t("echecMiseAJour"));
            }
        } catch (error) {
            console.error("Erreur de connexion :", error);
            Alert.alert(t("erreur"), t("connexionServeurImpossible"));
        }
    };

    const renderStatutButtons = () => {
        if (statut === "Confirmée" || statut === "Annulée") return null;

       
    };

    const renderProductItem = ({ item }) => (
        <View style={styles.productCard}>
            <Text style={styles.productName}>{item.nom}</Text>
            <View style={styles.detailsContainer}>
                <Text style={styles.quantity}>{t("qte")}: {item.quantite}</Text>
                <Text style={styles.price}>{item.prix} DA</Text>
            </View>
        </View>
    );

    return (
        <LayoutCommercant>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t("commande")} #{commande.numeroCommande}</Text>
                    <View style={[styles.statusBadge, statut === "Confirmée" ? styles.successBadge : statut === "Annulée" ? styles.errorBadge : styles.warningBadge]}>
                        <Text style={styles.statusText}>{statut}</Text>
                    </View>
                </View>
                
                <Text style={styles.client}>{t("client")}: {commande.userId ? commande.userId.nom : "Inconnu"}</Text>
                <Text style={styles.sectionTitle}>{t("listeproduits")}</Text>
            </View>

            <FlatList
                data={commande.produits}
                keyExtractor={(item) => item._id}
                renderItem={renderProductItem}
                contentContainerStyle={styles.listContent}
            />

            <View style={styles.footer}>
                <View style={styles.grandTotal}>
                    <Text style={styles.totalLabel}>{t("total")}:</Text>
                    <Text style={styles.totalValue}>{commande.total} DA</Text>
                </View>

                {renderStatutButtons()}
            </View>
        </LayoutCommercant>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2c3e50",
    },
    client: {
        fontSize: 16,
        color: "#7f8c8d",
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 15,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    productCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    productName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c3e50",
        marginBottom: 8,
    },
    detailsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    quantity: {
        fontSize: 14,
        color: "#7f8c8d",
    },
    price: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#2E7D32",
    },
    footer: {
        paddingHorizontal: 16,
        paddingBottom: 70,
    },
    grandTotal: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2c3e50",
    },
    totalValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2E7D32",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 5,
    },
    confirmButton: {
        backgroundColor: "#27ae60",
    },
    cancelButton: {
        backgroundColor: "#e74c3c",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    successBadge: {
        backgroundColor: "#d5f5e3",
    },
    errorBadge: {
        backgroundColor: "#fadbd8",
    },
    warningBadge: {
        backgroundColor: "#fef9e7",
    },
    statusText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2c3e50",
    },
});

export default CommandeDetailsAdmin;