import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Ionicons } from '@expo/vector-icons';

const Valider = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId, produits = [], total } = route.params || {};  
    const [numeroCommande, setNumeroCommande] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        //console.log("Produits reçus dans Valider :", JSON.stringify(produits, null, 2));
    }, [produits]);

    const produitsFormates = (produits || []).map(p => ({
        produitId: p._id || p.id || "ID_INVALIDE",
        quantite: p.qty || 0 
    }));

    //console.log("Produits formatés :", JSON.stringify(produitsFormates, null, 2));

    useEffect(() => {
        const validerCommande = async () => {
            if (!userId || produitsFormates.length === 0 || !total) {
                return;
            }

            try {
                const dataToSend = {
                    userId,
                    produits: produitsFormates,
                    total
                };

                //console.log("Données envoyées :", JSON.stringify(dataToSend, null, 2));


                const response = await fetch(`http://192.168.1.38:8080/api/commandes/add`, {

                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataToSend)
                });

                const data = await response.json();

                if (response.ok) {
                    setNumeroCommande(data.numeroCommande);
                } else {
                    console.error("Erreur lors de la validation de la commande :", data.message);
                }
            } catch (error) {
                console.error("Erreur lors de la validation de la commande :", error.message);
            } 
        };
 
        validerCommande();
    }, [userId, produitsFormates, total]);

    return (
        <Layout>
            <View>
               <View style={styles.iconContainer}>
                       <Ionicons name="checkmark-circle" size={80} color="#2E7D32" />
                     </View>
                <Text style={styles.txt1}>{t("merci")}</Text>
                <Text style={styles.txt2}>
                    {numeroCommande 
                        ? `Votre commande N° ${numeroCommande} est en cours de traitement` 
                        : t("votrecommande")}
                </Text>
                <TouchableOpacity 
                    style={styles.btnCheckout} 
                    onPress={() => navigation.navigate("ListeDesCommandes")}
                >
                    <Text style={styles.btnCheckoutText}>{t("voirmescommandes")}</Text>
                </TouchableOpacity>
            </View>
        </Layout>
    );
};

export default Valider;

const styles = StyleSheet.create({
    img: {
        width: 60,
        height: 60,
        marginTop: '60%',
        marginLeft: '43%',
    },
    txt1: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 26,
    },
    txt2: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
    },
    btnCheckout: {
        marginTop: '74%',
        justifyContent: "center",
        alignItems: "center",
        height: 50,
        backgroundColor: "#2E7D32",
        width: "90%",
        marginHorizontal: 20,
        borderRadius: 5,
    },
    btnCheckoutText: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 19,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop:190,
      },
});
