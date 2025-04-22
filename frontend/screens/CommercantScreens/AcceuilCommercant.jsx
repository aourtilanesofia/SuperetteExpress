import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ImageBackground } from "react-native";
import React from "react";
import LayoutCommercant from "../../components/LayoutCommercant/LayoutCommercant";
import { AntDesign, MaterialCommunityIcons, FontAwesome, Ionicons } from 'react-native-vector-icons';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const AcceuilCommerçant = ({ navigation }) => {
  const { t } = useTranslation();
  const [categorieCount, setCategorieCount] = useState(null);
  const [productCount, setProductCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [todayOrdersCount, setTodayOrdersCount] = useState(null);


  useEffect(() => {
    const fetchCategorieCount = async () => {
      try {
        const response = await fetch('http://192.168.1.9:8080/api/categories/count');
        if (!response.ok) {
          throw new Error('Erreur de récupération des données');
        }
        const data = await response.json();
        setCategorieCount(data.count);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorieCount();
  }, []);

  useEffect(() => {
    const fetchProductsCount = async () => {
      try {
        const response = await fetch('http://192.168.1.9:8080/api/produits/count');
        const text = await response.text();
        console.log('Réponse brute:', text); // ← Regarde ce que tu reçois
        const data = JSON.parse(text); // ← Si HTML, ça va planter ici
        setProductCount(data.count);
      } catch (err) {
        console.error('Erreur lors du chargement des produits', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsCount();
  }, []);

  useEffect(() => {
    const fetchTodayOrdersCount = async () => {
      try {
        const response = await fetch('http://192.168.1.9:8080/api/commandes/count/today');
        if (!response.ok) throw new Error('Erreur de récupération des commandes');
        const data = await response.json();
        setTodayOrdersCount(data.count);
      } catch (err) {
        console.error('Erreur lors de la récupération des commandes :', err);
        setError(err.message);
      }
    };
  
    fetchTodayOrdersCount();
  }, []);
  




  const menuItems = [
    {
      title: t('Gestion_des_catégories'),
      icon: <MaterialCommunityIcons name="shape-outline" style={styles.icone} />,
      nav: 'GestionDesCategories',
      color: '#4CAF50'
    },
    {
      title: t('Gestion_des_produits'),
      icon: <Ionicons name="fast-food-outline" style={styles.icone} />,
      nav: 'GestiondesProduits',
      color: '#2196F3'
    },
    {
      title: t('Gestion_des_commandes'),
      icon: <FontAwesome name="list-alt" style={styles.icone} />,
      nav: 'GestionDesCommandes',
      color: '#FF9800'
    },
   
  ];

  return (
    <LayoutCommercant>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header avec image de fond */}
        <ImageBackground
          source={require('../../assets/sup1.jpg')}
          style={styles.header}
          imageStyle={styles.headerImage}
        >
          <Text style={styles.welcomeText}>Bienvenue Commerçant</Text>
          <Text style={styles.subHeader}>Gestion de votre commerce</Text>
        </ImageBackground>

        {/* Cartes de fonctionnalités */}
        <View style={styles.cardsContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: item.color }]}
              onPress={() => navigation.navigate(item.nav)}
              activeOpacity={0.8}
            >
              <View style={styles.iconTextContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.iconContainer}>
                    {item.icon}
                  </View>
                  <Text style={styles.cardText}>{item.title}</Text>
                </View>
                <AntDesign name="arrowright" style={styles.arrowIcon} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Statistiques rapides */}
        <View>

        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{categorieCount}</Text>
            <Text style={styles.statLabel}>Catégories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{productCount}</Text>
            <Text style={styles.statLabel}>Produits</Text>
          </View>
          <View style={styles.statCardLast}>
            <Text style={styles.statNumber}>{todayOrdersCount}</Text>
            <Text style={styles.statLabel}>Commandes aujourd'hui</Text>
          </View>
        </View>
      </ScrollView>
    </LayoutCommercant>
  );
};

export default AcceuilCommerçant;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
    backgroundColor: '#f8f9fa'
  },
  header: {
    height: 180,
    justifyContent: 'center',
    paddingHorizontal: 25,
    marginBottom: 20
  },
  headerImage: {
    opacity: 0.2,
    backgroundColor: '#2E7D32'
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 5
  },
  subHeader: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500'
  },
  cardsContainer: {
    //flexDirection: 'row',
    flexDirection: 'column',
    paddingHorizontal: 15,
    marginBottom: 20
  },
  card: {
    width: '100%',
    height: '18%',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10
  },
  icone: {
    fontSize: 24,
    color: '#fff'
  },
  cardText: {
    flex: 0.95,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginVertical: 8,
    flexShrink: 1,
    marginLeft: 13,
  },
  arrowIcon: {
    fontSize: 18,
    color: '#fff',

  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    bottom: 190,
    flexWrap: 'wrap', // Permet à la carte de passer à la ligne quand il n'y a plus de place
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  statCardLast: {
    backgroundColor: '#fff',
    width: '100%',
    height: '50%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 20,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 5
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

});