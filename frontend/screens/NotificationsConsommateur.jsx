import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import Layout from '../components/Layout/Layout';
import { io } from 'socket.io-client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";

const socket = io("http://192.168.1.9:8080");

const NotificationsConsommateur = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      //console.log("User ID récupéré depuis AsyncStorage:", id);
      if (id) setUserId(id);
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch(`http://192.168.1.9:8080/api/v1/notifications/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        //console.log("Données reçues de l'API notifications:", data);
        const filteredNotifications = data.filter(n => n.role === "client").reverse();

        setNotifications(filteredNotifications);
        setUnreadCount(filteredNotifications.filter(n => !n.isRead).length);
      })
      .catch(error => console.error("Erreur lors de la récupération des notifications:", error));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    socket.on("newNotification", (newNotif) => {
      //console.log("Nouvelle notification reçue via socket:", newNotif);

      if (newNotif.role === "client") {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => socket.off("newNotification");
  }, [userId]);

  const markAsRead = (id) => {
    fetch(`http://192.168.1.9:8080/api/v1/notifications/${id}/read`, { method: "PUT" })
      .then(() => {
        setNotifications((prev) => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      });
  };

  const deleteNotification = (id) => {
    fetch(`http://192.168.1.9:8080/api/v1/notifications/${id}`, { method: "DELETE" })
      .then(() => {
        setNotifications((prev) => prev.filter(n => n._id !== id));
      });
  };

  return (
    <Layout>
      <View style={styles.container}>
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
    </Layout>
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

export default NotificationsConsommateur;
