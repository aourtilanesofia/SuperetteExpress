import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { recupererTotalPanier } from '../../screens/Panier';

const Menu = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [cartCount, setCartCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Récupérer le total des articles dans le panier
  // Récupérer le total des articles dans le panier
const recupererTotalPanier = async () => {
  try {
    const items = await AsyncStorage.getItem('cart');
    const parsedItems = items ? JSON.parse(items) : [];

    // Si chaque item peut avoir une quantité :
    // const totalCount = parsedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    // Sinon, juste la longueur du tableau
    const totalCount = parsedItems.length;

    setCartCount(totalCount);
  } catch (error) {
    console.error("Erreur lors de la récupération du panier :", error);
    setCartCount(0);
  }
};


  // Récupérer les notifications non lues
  const recupererNotificationsNonLues = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId"); // Récupérer l'ID utilisateur
      if (!userId) {
        console.warn("Aucun ID utilisateur trouvé");
        setUnreadNotifications(0);
        return;
      }

      const response = await fetch(`http://192.168.1.9:8080/api/v1/notifications/${userId}`);
      const data = await response.json();

      console.log("Données reçues des notifications :", data); // Debug

      if (!Array.isArray(data)) {
        console.warn("Format de réponse inattendu :", data);
        setUnreadNotifications(0);
        return;
      }

      const nonLues = data.filter(n => !n.isRead).length;
      setUnreadNotifications(nonLues);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications :", error);
      setUnreadNotifications(0);
    }
  };

  // Charger les données au démarrage
  useEffect(() => {
    recupererTotalPanier();
    recupererNotificationsNonLues();

    // Rafraîchir les données lorsqu'on revient sur l'écran
    const unsubscribe = navigation.addListener('focus', () => {
      recupererTotalPanier(setCartCount);
      recupererNotificationsNonLues();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('AcceuilConsommateur')}>
        <AntDesign name='home' style={[styles.icon, route.name === "AcceuilConsommateur" && styles.active]} size={25} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('NotificationsConsommateur')}>
        <Ionicons name='notifications-outline' style={[styles.icon, route.name === "NotificationsConsommateur" && styles.active]} size={26} />
        {unreadNotifications > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadNotifications}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('Panier')}>
        <AntDesign name='shoppingcart' style={[styles.icon, ["Panier", "Valider"].includes(route.name) && styles.active]} size={25} />
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer}>
        <SimpleLineIcons name='location-pin' style={[styles.icon, route.name === " " && styles.active]} size={25} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('ListeDesCommandes')}>
        <Ionicons name='bag-outline' style={[styles.icon, route.name === "ListeDesCommandes" && styles.active]} size={25} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('Compte')}>
        <AntDesign name='user' style={[styles.icon, route.name === "Compte" && styles.active]} size={25} />
      </TouchableOpacity>
    </View>
  );
};

export default Menu;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  menuContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#000',
  },
  active: {
    color: '#2E7D32',
  },
  badge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
