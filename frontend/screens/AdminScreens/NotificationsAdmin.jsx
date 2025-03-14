import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import LayoutAdmin from '../../components/LayoutAdmin/LayoutAdmin';
import { io } from 'socket.io-client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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

  // Supprimer une notification
  const deleteNotification = (id) => {
    fetch(`http://192.168.43.107:8080/api/v1/notifications/${id}`, { method: "DELETE" })
      .then(() => {
        setNotifications((prev) => prev.filter(n => n._id !== id));
      });
  };

  return (
    <LayoutAdmin>
      <View style={styles.container}>
        {/* Afficher un message si aucune notification */}
        {notifications.length === 0 ? (
          <Text style={styles.noNotifications}>Aucune notification</Text>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => markAsRead(item._id)} style={[styles.notification, item.isRead && styles.read]}>
                <View style={styles.notificationRow}>
                  {!item.isRead && <View style={styles.redDot} />}
                  <Text style={[styles.notificationText, !item.isRead && styles.bold]}>
                    {item.message}
                  </Text>
                  <TouchableOpacity onPress={() => deleteNotification(item._id)} style={styles.deleteButton}>
                    <MaterialIcons name="close" size={20} color="gray" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </LayoutAdmin>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  noNotifications: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    marginTop: 50,
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
    justifyContent: 'space-between',
  },
  redDot: {
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    marginRight: 10,
  },
  notificationText: {
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 5,
  },
});

export default NotificationsAdmin;
