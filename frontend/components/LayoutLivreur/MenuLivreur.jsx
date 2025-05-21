import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from "@react-navigation/native";
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';


const socket = io("http://192.168.43.145:8080"); // Mets l'URL de ton backend

const MenuLivreur = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);
    const { t } = useTranslation();

  

   useEffect(() => {
    fetch("http://192.168.43.145:8080/api/v1/notifications")

  
      .then((res) => res.json())
      .then((data) => {
        const adminNotifications = data.filter(n => n.role === "livreur" && !n.isRead);
        setUnreadCount(adminNotifications.length);
      });
  
    socket.on("newNotification", (notification) => {
      if (notification.role === "livreur") {
        setUnreadCount((prev) => prev + 1);
      }
    });
  
    return () => {
      socket.off("newNotification");
    };
  }, []);
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('AcceuilLivreur')}>
        <AntDesign name='home' style={[styles.icon , route.name ==="AcceuilLivreur" && styles.active]} size={25}/>
        
      </TouchableOpacity>

      <TouchableOpacity 
              style={styles.menuContainer} 
              onPress={() => {
                setUnreadCount(0); // Réinitialise le compteur lors de l'ouverture
                navigation.navigate('NotificationsLivreur');
              }}
            >
              <Ionicons name='notifications-outline' style={[styles.icon, route.name === "NotificationsLivreur" && styles.active]} size={26} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('ListeCommandeALivre')}>
      <Ionicons name='bag-outline' style={[styles.icon , route.name ==="ListeCommandeALivre" && styles.active]} size={25}/>
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('MiseAjoueEtatDeCommande')}>
        <MaterialCommunityIcons name='update' style={[styles.icon , route.name ==="MiseAjoueEtatDeCommande" && styles.active]} size={25}/>
        
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('CompteLivreur')}>
        <AntDesign name='user' style={[styles.icon , route.name ==="CompteLivreur" && styles.active]} size={25}/>
        
      </TouchableOpacity>

      
    </View>
  )
}

export default MenuLivreur;

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