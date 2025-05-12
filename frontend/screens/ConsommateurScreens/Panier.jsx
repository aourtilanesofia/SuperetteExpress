import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import Layout from "../../components/Layout/Layout";
import Cartitem from '../../components/cart/CartItem';
import PriceTable from '../../components/cart/PriceTable';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from "react-i18next";
const Panier = () => {
    const [cartItems, setCartItems] = useState([]);
    const navigation = useNavigation();
    const [cartCount, setCartCount] = useState(0);
    const { t } = useTranslation();
     


    useEffect(() => {
        const chargerPanier = async () => {
            try {
                const panierRaw = await AsyncStorage.getItem('cart');
                setCartItems(JSON.parse(panierRaw) || []);
            } catch (error) {
                console.error("Erreur lors du chargement du panier :", error);
            }
        };
        chargerPanier();
    }, []);

    const handleRemoveItem = async (id) => {
        try {
            const newCart = cartItems.filter(item => item._id !== id);
            setCartItems(newCart);
            await AsyncStorage.setItem('cart', JSON.stringify(newCart));

            setCartCount(newCart.length);
            // Recalculer le total des articles dans le panier
            const totalArticles = newCart.reduce((total, item) => total + item.qty, 0);
            await AsyncStorage.setItem('cartTotal', JSON.stringify(totalArticles));
        } catch (error) {
            console.error("Erreur suppression panier :", error);
        }
    };

    const handleQuantityChange = async (id, action) => {
        const newCart = cartItems.map(item => {
            if (item._id === id) {
                let newQty = action === "increase" ? item.qty + 1 : Math.max(1, item.qty - 1);
                return { ...item, qty: newQty };
            }
            return item;
        });
        setCartItems(newCart);
        await AsyncStorage.setItem('cart', JSON.stringify(newCart));
    };

    const totalPrice = cartItems.reduce((total, item) => total + (item.prix || 0) * (item.qty || 1), 0);

    const handleValidateOrder = async () => {
        try {
          const userId = await AsyncStorage.getItem("userId");
          if (!userId) {
            alert("Utilisateur non connecté !");
            return;
          }
      
          const response = await fetch("http://192.168.38.149:8080/api/commandes/add", {

            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              produits: cartItems.map(item => ({
                produitId: item._id,
                nom: item.nom,
                prix: item.prix,
                quantite: item.qty
              })),
              total: totalPrice
            })
          });
      
          const data = await response.json();
          //console.log("Réponse complète du serveur:", data); // Log complet
      
          if (response.ok) {
            // Modification ici: utilisez data.numeroCommande au lieu de data.commande.numeroCommande
            if (!data.numeroCommande) {
              throw new Error("Le serveur n'a pas renvoyé de numéro de commande");
            }
      
            await AsyncStorage.setItem("cart", JSON.stringify([]));
            
            navigation.navigate("Paiement", { 
              commande: {
                numeroCommande: data.numeroCommande, // Numéro de commande
                produits: cartItems,
                total: totalPrice,
                userId: userId
              }
            });
          } else {
            alert(data.message || "Erreur serveur");
          }
        } catch (error) {
          console.error("Erreur complète:", error);
          alert(`Erreur: ${error.message}`);
        }
      };

    const recupererTotalPanier = async (setCartCount) => {
        try {
            const items = await AsyncStorage.getItem('cartItems');
            const parsedItems = items ? JSON.parse(items) : [];
            const totalCount = parsedItems.length;
            setCartCount(totalCount);
        } catch (error) {
            console.error("Erreur lors de la récupération du panier :", error);
            setCartCount(0);
        }
    };

    return(
        <Layout>
            <View style={styles.container}>
                <Text style={styles.txt}>
                    {cartItems.length > 0 ? t("produits_dans_panier_plural", { count: cartItems.length }) : t("paniervide")}
                </Text>
                {cartItems.length > 0 && (
                    <>
                        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                            {cartItems.map((item, index) => (
                                <Cartitem key={item._id || index.toString()} item={item} onRemove={handleRemoveItem} onQuantityChange={handleQuantityChange} />
                            ))}
                        </ScrollView>
                        <View style={styles.footer}>
                            <View style={styles.grandTotal}>
                                <PriceTable title={t("total")} price={totalPrice} />
                            </View>
                            <TouchableOpacity style={styles.btnCheckout} onPress={handleValidateOrder}>
                                <Text style={styles.btnCheckoutText}>{t("validerlacommande")}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </Layout>
    );
};

export default Panier;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    txt: {
        textAlign: "center",
        color: '#000',
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    grandTotal: {
        borderWidth: 1,
        borderColor: "lightgray",
        backgroundColor: "#ffffff",
        padding: 6,
        margin: 5,
        marginHorizontal: 20,
        borderRadius: 10,
    },
    btnCheckout: {
        marginTop: 10,
        justifyContent: "center",
        alignItems: "center",
        height: 46,
        backgroundColor: "#2E7D32",
        width: "90%",
        marginHorizontal: 20,
        borderRadius: 10,

    },
    btnCheckoutText: {
        color: "#ffffff",
        //fontWeight: "700",
        fontSize: 18,
    },
    footer: {
        paddingBottom: 70,
    }
});