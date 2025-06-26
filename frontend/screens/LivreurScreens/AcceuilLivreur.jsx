import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert } from "react-native";
import React, { useEffect, useState } from 'react';
import Layout from "../../components/LayoutLivreur/LayoutLivreur";
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const AcceuilLivreur = ({ navigation }) => {
  const [stats, setStats] = useState({
    livrees: 0,
    enAttente: 0,
    nonLivrees: 0,
    tauxLivraison: '0%'
  });
  const [todayOrdersCount, setTodayOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  // Récupérer le token JWT
  const getToken = async () => {
    try {
      const [token, user] = await AsyncStorage.multiGet(['token', 'user']);
      if (!token || !user) {
        navigation.replace('ConLivreur');
        throw new Error('Redirection vers la connexion');
      }
      return token[1]; // Retourne la valeur du token
    } catch (error) {
      console.error("Erreur récupération token:", error);
      navigation.replace('ConLivreur');
      throw error;
    }
  };


  const updatePosition = async (coords) => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch('http://192.168.43.145:8080/api/v1/livreur/position', {

        method: 'POST', // Gardez POST pour matcher le backend
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          longitude: coords.longitude,
          latitude: coords.latitude
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur serveur');
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur position:", error);
      // Gestion d'erreur plus robuste
      if (error.message.includes('Failed to fetch')) {
        Alert.alert('Erreur réseau', 'Impossible de se connecter au serveur');
      }
      throw error;
    }
  };

  // Modifiez également la fonction setupLocation
  const setupLocation = async () => {
    try {
      // Vérifier si la géolocalisation est activée
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          'Géolocalisation désactivée',
          'Veuillez activer la géolocalisation pour continuer',
          [
            {
              text: 'Annuler',
              style: 'cancel'
            },
            {
              text: 'Paramètres',
              onPress: () => Location.openSettings()
            }
          ]
        );
        return;
      }

      // Demander les permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'L\'application a besoin de votre position pour fonctionner',
          [{ text: 'OK' }]
        );
        return;
      }

      // Configurer les options
      const locationOptions = {
        accuracy: Location.Accuracy.High,
        distanceInterval: 100,
        timeInterval: 30000
      };

      // Envoyer la position initiale
      const initialLocation = await Location.getCurrentPositionAsync({});
      await updatePosition(initialLocation.coords);

      // Démarrer le suivi continu
      await Location.watchPositionAsync(
        locationOptions,
        async (location) => {
          try {
            await updatePosition(location.coords);
          } catch (error) {
            console.warn("Erreur suivi position:", error.message);
          }
        }
      );

    } catch (error) {
      console.error("Erreur setup location:", error);
      Alert.alert(
        'Erreur',
        'Impossible d\'accéder à la géolocalisation: ' + error.message
      );
    }
  }; 
  // Récupérer les statistiques
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_URL = 'http://192.168.43.145:8080/api/commandes';

      const endpoints = [
        '/count/livre',
        '/count/en-attente',
        '/count/non-livre',
        '/count/today'
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint =>
          fetch(`${API_URL}${endpoint}`)
            .then(res => res.ok ? res.json() : Promise.reject('Erreur réseau'))
        )
      );

      const [livrees, enAttente, nonLivrees, today] = responses;
      const taux = Math.round((livrees.count / (today.count || 1)) * 100);

      setStats({
        livrees: livrees.data?.count || 0,
        enAttente: enAttente.count || 0,
        nonLivrees: nonLivrees.count || 0,
        tauxLivraison: `${taux}%`
      });
      setTodayOrdersCount(today.count || 0);
      console.log('Réponse livrées:', livrees);
      console.log('Réponse aujourd\'hui:', today);

    } catch (err) {
      console.error('Erreur stats:', err);
      setError(t('stats_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await setupLocation();
        await fetchStats();

        // Rafraîchissement périodique des stats
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
      } catch (error) {
        console.error("Erreur initialisation:", error);
      }
    };

    initialize();
  }, []);



  return (
    <Layout>
      {/* Header */}
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        style={styles.hdr}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>{t('Dashboard')}</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('AutresOptionsLivreur')}
        >
          <AntDesign name="bars" size={26} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages d'état */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2E7D32" />
        </View>
      )}

      {/* Contenu principal */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Bienvenue */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>{t('bjrlivreur')}</Text>
          <Text style={styles.subWelcomeText}>{t('actv')}</Text>
        </View>

        {/* Statistiques principales */}
        <View style={styles.mainStatsContainer}>
          <View style={[styles.statCard, styles.cardToday]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="calendar-today" size={22} color="#fff" />
              <Text style={styles.cardTitle}>{t('ajrdh')}</Text>
            </View>
            <Text style={styles.cardValue}>
              {loading ? '...' : todayOrdersCount}
            </Text>
            <Text style={styles.cardLabel}>{t('Commande')}</Text>
          </View>
        </View>

        {/* Statistiques secondaires */}
        <Text style={styles.sectionTitle}>{t('detailcommande')}</Text>

        <View style={styles.statsGrid}>
          {/* Carte Commandes livrées */}
          <View style={[styles.gridCard, styles.cardDelivered]}>
            <MaterialCommunityIcons name="check-circle" size={28} color="#fff" />
            <Text style={styles.gridCardTitle}>{t('Livrées')}</Text>
            <Text style={styles.gridCardValue}>
              {loading ? '...' : stats.livrees}
            </Text>
          </View>

          {/* Carte Commandes en attente */}
          <View style={[styles.gridCard, styles.cardPending]}>
            <MaterialCommunityIcons name="clock" size={28} color="#fff" />
            <Text style={styles.gridCardTitle}>{t('attente')}</Text>
            <Text style={styles.gridCardValue}>
              {loading ? '...' : stats.enAttente}
            </Text>
          </View>

          {/* Carte Commandes non livrées */}
          <View style={[styles.gridCard, styles.cardNotDelivered]}>
            <MaterialCommunityIcons name="close-circle" size={28} color="#fff" />
            <Text style={styles.gridCardTitle}>{t('Nonlivrées')}</Text>
            <Text style={styles.gridCardValue}>
              {loading ? '...' : stats.nonLivrees}
            </Text>
          </View>

          {/* Carte pour action rapide */}
          <TouchableOpacity
            style={[styles.gridCard, styles.cardAction]}
            onPress={() => navigation.navigate('ListeCommandeALivre')}
          >
            <MaterialCommunityIcons name="truck-delivery" size={28} color="#fff" />
            <Text style={styles.gridCardTitle}>{t('voircommande')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Layout>
  );
};

// Styles (inchangés par rapport à votre version originale)
const styles = StyleSheet.create({
  hdr: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
    marginTop: 46,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  menuButton: {
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  welcomeContainer: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 5,
  },
  subWelcomeText: {
    fontSize: 16,
    color: "#666",
  },
  mainStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    width: width * 0.43,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    bottom: 38,
    marginLeft: 50,
    fontSize: 18,
  },
  cardToday: {
    backgroundColor: 'rgb(87, 150, 252)',
    width: '100%'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  gridCard: {
    width: width * 0.43,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gridCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  gridCardValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardDelivered: {
    backgroundColor: 'rgb(66, 186, 98)',
  },
  cardPending: {
    backgroundColor: 'rgb(248, 199, 51)',
  },
  cardNotDelivered: {
    backgroundColor: 'rgb(252, 98, 84)',
  },
  cardAction: {
    backgroundColor: 'rgb(203, 109, 244)',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 15,
    marginTop: 10,
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
});

export default AcceuilLivreur;