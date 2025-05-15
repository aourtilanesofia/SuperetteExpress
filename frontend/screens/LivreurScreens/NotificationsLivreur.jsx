import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import LayoutLivreur from '../../components/LayoutLivreur/LayoutLivreur';
import { io } from 'socket.io-client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const socket = io("http://192.168.1.36:8080"); // Remplace par l'URL de ton backend



const NotificationsLivreur = () => {
  const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
  
    useEffect(() => {

      fetch("http://192.168.1.36:8080/api/v1/notifications")

        .then((res) => res.json())
        .then((data) => {
          const filteredNotifications = data.filter(n => n.role === "livreur");
          setNotifications(filteredNotifications);
          setUnreadCount(filteredNotifications.filter(n => !n.isRead).length);
        });
  
      socket.on("newNotification", (notification) => {
        if (notification.role === "livreur") {
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      });
  
      return () => {
        socket.off("newNotification");
      };
    }, []);
  
    const markAsRead = (id) => {

      fetch(`http://192.168.1.36:8080/api/v1/notifications/${id}/read`, { method: "PUT" })


        .then(() => {
          setNotifications((prev) => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
          setUnreadCount((prev) => Math.max(0, prev - 1));
        });
    };
  
    const deleteNotification = (id) => {

      fetch(`http://192.168.1.36:8080/api/v1/notifications/${id}`, { method: "DELETE" })

      .then(() => {
          setNotifications((prev) => prev.filter(n => n._id !== id));
        });
    };

  return (
    <LayoutLivreur>
      <View style={styles.container}>
        {/* Afficher un message si aucune notification */}
        {notifications.length === 0 ? (
          <Text style={styles.noNotifications}>Aucune notification</Text>
        ) : (
          <FlatList
            data={notifications}
            contentContainerStyle={{ paddingBottom: 55 }}
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
    </LayoutLivreur>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop:40,
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

export default NotificationsLivreur;
