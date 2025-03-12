import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import LayoutAdmin from '../../components/LayoutAdmin/LayoutAdmin';
import { io } from 'socket.io-client';

const socket = io("http://192.168.43.107:8080"); // Remplace par l'URL de ton backend

const NotificationsAdmin = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Charger les notifications depuis l'API au démarrage
    fetch("http://192.168.43.107:8080/api/v1/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      });

    // Écouter les nouvelles notifications en temps réel
    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("newNotification");
    };
  }, []);

  // Marquer une notification comme lue
  const markAsRead = (id) => {
    fetch(`http://192.168.43.107:8080/api/v1/notifications/${id}/read`, { method: "PUT" })
      .then(() => {
        setNotifications((prev) => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      });
  };

  return (
    <LayoutAdmin>
      <View style={styles.container}>
        {/* Liste des notifications */}
        <FlatList
  data={notifications}
  keyExtractor={(item) => item._id}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => markAsRead(item._id)} style={[styles.notification, item.isRead && styles.read]}>
      <View style={styles.notificationRow}>
        {!item.isRead && <View style={styles.redDot} />}
        <Text>{item.message}</Text>
      </View>
    </TouchableOpacity>
  )}
/>
      </View>
    </LayoutAdmin>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  notificationIcon: {
    position: 'absolute',
    right: 20,
    top: 10,
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
  notification: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  read: {
    backgroundColor: '#f0f0f0',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redDot: {
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    marginRight: 10, // Espacement entre la boule rouge et le texte
  },
});

export default NotificationsAdmin;
