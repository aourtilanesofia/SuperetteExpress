import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';



const socket = io("http://192.168.43.145:8080"); // Mets l'URL de ton backend




const MenuAdmin = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);
  const { t } = useTranslation();

  const handleLanguagePress = () => {
    navigation.navigate('LanguageSelectionAdmin');
  };

 useEffect(() => {

  fetch("http://192.168.43.145:8080/api/v1/notifications")


    .then((res) => res.json())
    .then((data) => {
      const adminNotifications = data.filter(n => n.role === "administrateur" && !n.isRead);
      setUnreadCount(adminNotifications.length);
    });

  socket.on("newNotification", (notification) => {
    if (notification.role === "administrateur") {
      setUnreadCount((prev) => prev + 1);
    }
  });

  return () => {
    socket.off("newNotification");
  };
}, []);

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Oui", onPress: () => navigation.navigate("ConnAdmin") }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('AcceuilCommerçant')}>
        <AntDesign name='home' style={[styles.icon, route.name === "AcceuilCommerçant" && styles.active]} size={25} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={() => navigation.navigate('Calcule')}>
        <AntDesign name='linechart' style={[styles.icon, route.name === "Calcule" && styles.active]} size={25} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuContainer} 
        onPress={() => {
          setUnreadCount(0); // Réinitialise le compteur lors de l'ouverture
          navigation.navigate('NotificationsAdmin');
        }}
      >
        <Ionicons name='notifications-outline' style={[styles.icon, route.name === "NotificationsAdmin" && styles.active]} size={26} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={handleLanguagePress}>
        <MaterialCommunityIcons name='syllabary-hiragana' style={[styles.icon, route.name === "LanguageSelectionAdmin" && styles.active]} size={26} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuContainer} onPress={handleLogout}>
        <MaterialIcons name='logout' style={[styles.icon, route.name === "" && styles.active]} size={25} />
      </TouchableOpacity>
    </View>
  );
};

export default MenuAdmin;

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
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
});
