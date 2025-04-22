import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from 'react';
import Layout from "../../components/LayoutLivreur/LayoutLivreur";
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AcceuilLivreur = ({ navigation }) => {
  // États pour les données
  const [stats, setStats] = useState({
    livrees: 0,
    enAttente: 0,
    nonLivrees: 0,
  });
  const [todayOrdersCount, setTodayOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupère toutes les statistiques
  const fetchAllStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE_URL = 'http://192.168.1.9:8080/api/commandes';
      
      // Requêtes parallèles
      const responses = await Promise.all([
        fetch(`${API_BASE_URL}/count/livre`),
        fetch(`${API_BASE_URL}/count/en-attente`),
        fetch(`${API_BASE_URL}/count/non-livre`),
        fetch(`${API_BASE_URL}/count/today`)
      ]);

      // Vérification des erreurs HTTP
      const hasError = responses.some(res => !res.ok);
      if (hasError) throw new Error('Erreur de réseau');

      // Extraction des données
      const [livrees, enAttente, nonLivrees, today] = await Promise.all(
        responses.map(res => res.json())
      );

      // Calcul du taux de livraison
      const total = today.count || 1; // Évite division par zéro
      const taux = Math.round((livrees.count / total) * 100);

      // Mise à jour de l'état
      setStats({
        livrees: livrees.data.count,
        enAttente: enAttente.count,
        nonLivrees: nonLivrees.data.count,
        tauxLivraison: `${taux}%`
      });
      setTodayOrdersCount(today.count);

    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial et rafraîchissement périodique
  useEffect(() => {
    fetchAllStats();
    const interval = setInterval(fetchAllStats, 30000); // Rafraîchit toutes les 30s
    
    return () => clearInterval(interval);
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
        <Text style={styles.headerTitle}>Tableau de Bord</Text>
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
          <Text style={styles.welcomeText}>Bonjour, Livreur!</Text>
          <Text style={styles.subWelcomeText}>Voici votre activité aujourd'hui</Text>
        </View>

        {/* Statistiques principales */}
        <View style={styles.mainStatsContainer}>
          <View style={[styles.statCard, styles.cardToday]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="calendar-today" size={22} color="#fff" />
              <Text style={styles.cardTitle}>Aujourd'hui</Text>
            </View>
            <Text style={styles.cardValue}>
              {loading ? '...' : todayOrdersCount}
            </Text>
            <Text style={styles.cardLabel}>Commandes</Text>
          </View>


        </View>

        {/* Statistiques secondaires */}
        <Text style={styles.sectionTitle}>Détails des Commandes</Text>
        
        <View style={styles.statsGrid}>
          {/* Carte Commandes livrées */}
          <View style={[styles.gridCard, styles.cardDelivered]}>
            <MaterialCommunityIcons name="check-circle" size={28} color="#fff" />
            <Text style={styles.gridCardTitle}>Livrées</Text>
            <Text style={styles.gridCardValue}>
              {loading ? '...' : stats.livrees}
            </Text>
          </View>

          {/* Carte Commandes en attente */}
          <View style={[styles.gridCard, styles.cardPending]}>
            <MaterialCommunityIcons name="clock" size={28} color="#fff" />
            <Text style={styles.gridCardTitle}>En attente</Text>
            <Text style={styles.gridCardValue}>
              {loading ? '...' : stats.enAttente}
            </Text>
          </View>

          {/* Carte Commandes non livrées */}
          <View style={[styles.gridCard, styles.cardNotDelivered]}>
            <MaterialCommunityIcons name="close-circle" size={28} color="#fff" />
            <Text style={styles.gridCardTitle}>Non livrées</Text>
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
            <Text style={styles.gridCardTitle}>Voir commandes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Layout>
  );
};

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
    backgroundColor: '#4285F4',
    width: '100%'
  },
  cardRate: {
    backgroundColor: '#7B1FA2',
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
    backgroundColor: '#34A853',
  },
  cardPending: {
    backgroundColor: '#FBBC05',
  },
  cardNotDelivered: {
    backgroundColor: '#EA4335',
  },
  cardAction: {
    backgroundColor: '#7B1FA2',
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