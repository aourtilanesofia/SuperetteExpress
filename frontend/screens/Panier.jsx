/*import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Layout from "../components/Layout/Layout";
import { CartData } from '../Data/CartData';
import Cartitem from '../components/cart/CartItem';
import PriceTable from '../components/cart/PriceTable';
import { useNavigation } from "@react-navigation/native";

const Panier = () => {
    const [cartItems, setCartItems] = useState(CartData);
    const navigation = useNavigation();

    // Supprimer un produit du panier
    const handleRemoveItem = (id) => {
      setCartItems(cartItems.filter(item => item._id !== id));
    };
    

       // Gérer l'augmentation et la diminution de la quantité
    const handleQuantityChange = (id, action) => {
        setCartItems(cartItems.map(item => {
            if (item._id === id) {
                let newQty = action === "increase" ? item.qty + 1 : item.qty - 1;
                if (newQty < 1) newQty = 1; // Empêcher les quantités inférieures à 1
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };
   // Calculer le total dynamiquement
   const totalPrice = cartItems.reduce((total, item) => total + (Number(item.prix) || 0) * (item.qty || 1), 0);

  
    return (
        <Layout>
            <View>
                <Text style={styles.txt}>
                    {cartItems?.length > 0
                    ? `Vous avez ${cartItems?.length} produits dans votre panier`
                    : 'Votre panier est vide!'
                    }
                </Text>
                {cartItems?.length > 0 && (
        <>
          <ScrollView>
            {cartItems?.map((item) => (
              <Cartitem item={item} key={item._id} onRemove={handleRemoveItem} onQuantityChange={handleQuantityChange} />
            ))}
          </ScrollView>
          <View>
           
            <View style={styles.grandTotal}>
              <PriceTable title={"Total"} price={totalPrice}  />
            </View>
            <TouchableOpacity
              style={styles.btnCheckout}
              onPress={() => navigation.navigate("Valider")}
            >
              <Text style={styles.btnCheckoutText}>Valider la commande</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
            </View>
        </Layout>

    )
}

export default Panier

const styles = StyleSheet.create({
    txt:{
        textAlign: "center",
        color:'#329171',
        fontWeight:'bold'

    },
    grandTotal: {
        borderWidth: 1,
        borderColor: "lightgray",
        backgroundColor: "#ffffff",
        padding: 5,
        margin: 5,
        marginHorizontal: 20,
        borderRadius:5,
      },
      btnCheckout: {
        marginTop: 20,
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        backgroundColor: "#329171",
        width: "90%",
        marginHorizontal: 20,
        borderRadius: 5,
      },
      btnCheckoutText: { 
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 18,
      },
})*/

import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import Layout from "../components/Layout/Layout";
import Cartitem from '../components/cart/CartItem';
import PriceTable from '../components/cart/PriceTable';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Panier = () => {
    const [cartItems, setCartItems] = useState([]);
    const navigation = useNavigation();

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
        const newCart = cartItems.filter(item => item._id !== id);
        setCartItems(newCart);
        await AsyncStorage.setItem('cart', JSON.stringify(newCart));
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
            console.log("ID utilisateur récupéré :", userId); // Debug

            if (!userId) {
                alert("Utilisateur non connecté !");
                return;
            }

            const newOrder = {
                userId,
                produits: cartItems.map(item => ({
                    nom: item.nom,
                    prix: item.prix,
                    quantite: item.qty
                })),
                total: totalPrice,
                statut: "En attente"
            };

            const response = await fetch("http://192.168.43.107:8080/api/commandes/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newOrder)
            });

            const responseText = await response.text();  // Récupérer la réponse brute
            console.log("Réponse brute du serveur :", responseText);

            const data = JSON.parse(responseText);  // Tenter de parser en JSON

            if (response.ok) {
                console.log("Commande enregistrée :", data);
                await AsyncStorage.removeItem("cart");
                setCartItems([]);
                navigation.navigate("Valider");
            } else {
                console.error("Erreur backend :", data.message);
            }
        } catch (error) {
            console.error("Erreur lors de la validation de la commande :", error);
        }
    };



    return (
        <Layout>
            <View style={styles.container}>
                <Text style={styles.txt}>
                    {cartItems.length > 0 ? `Vous avez ${cartItems.length} produits dans votre panier` : 'Votre panier est vide!'}
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
                                <PriceTable title="Total" price={totalPrice} />
                            </View>
                            <TouchableOpacity style={styles.btnCheckout} onPress={handleValidateOrder}>
                                <Text style={styles.btnCheckoutText}>Valider la commande</Text>
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
        marginTop:20,
        marginBottom:10,
    },
    grandTotal: {
        borderWidth: 1,
        borderColor: "lightgray",
        backgroundColor: "#ffffff",
        padding: 6,
        margin: 5,
        marginHorizontal: 20,
        borderRadius: 5,
    },
    btnCheckout: {
        marginTop: 10,
        justifyContent: "center",
        alignItems: "center",
        height: 46,
        backgroundColor: "#329171",
        width: "90%",
        marginHorizontal: 20,
        borderRadius: 5,

    },
    btnCheckoutText: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 18,
    },
    footer: {
        paddingBottom: 70,
    }
});
