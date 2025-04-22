import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import LayoutAdmin from "../../components/LayoutAdmin/LayoutAdmin";
import { AntDesign, MaterialIcons, FontAwesome, Entypo } from 'react-native-vector-icons';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from "react";


const AcceuilAdmin = ({ navigation }) => {
  const { t } = useTranslation();
  const [nombreCommercants, setNombreCommercants] = useState(0);
  const [nombreConsommateursActifs, setNombreConsommateursActifs] = useState(0);
  const [nombreConsommateursNotActifs, setNombreConsommateursNotActifs] = useState(0);
  const [nombreLivreurs, setNombreLivreurs] = useState(0);

  //Récupérer le nombre des commerçants
  useEffect(() => {
    fetch("http://192.168.1.9:8080/api/v1/commercant/count")
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setNombreCommercants(data.count); 
        } else {
          console.error("Erreur : " + data.message);
        }
      })
      .catch(error => {
        console.error("Erreur lors du chargement des commerçants", error);
      });
  }, []);

  //Récupérer le nombre des consommateurs actifs

  useEffect(() => {
    fetch("http://192.168.1.9:8080/api/v1/consommateur/activeConsommateurs/count")
      .then(response => response.json())
      .then(data => {
        console.log("Réponse reçue :", data);
        if (data.success) {
          setNombreConsommateursActifs(data.count);  
        } else {
          console.error("Erreur : " + data.message);
        }
      })
      .catch(error => {
        console.error("Erreur lors du chargement des consommateurs actifs", error);
      });
  }, []);

  //Récuperer le nombre des consommateurs non actifs
  useEffect(() => {
    fetch("http://192.168.1.9:8080/api/v1/consommateur/nonactiveConsommateurs/count")
      .then(response => response.json())
      .then(data => {
        console.log("Réponse reçue :", data);
        if (data.success) {
          setNombreConsommateursNotActifs(data.count);  
        } else {
          console.error("Erreur : " + data.message);
        }
      })
      .catch(error => {
        console.error("Erreur lors du chargement des consommateurs actifs", error);
      });
  }, []);

  //Récupérer le nombre des livreurs
  useEffect(() => {
    fetch("http://192.168.1.9:8080/api/v1/livreur/count")
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setNombreLivreurs(data.count); 
        } else {
          console.error("Erreur : " + data.message);
        }
      })
      .catch(error => {
        console.error("Erreur lors du chargement des livreurs", error);
      });
  }, []);


  

  const menuItems = [
    {
      title: t('Liste_des_commercant'),
      icon: <Entypo name="shop" style={styles.icone} />,
      nav: 'ListeDesCommercants',
      color: '#4CAF50'
    },
    {
      title: t('Liste_des_clients'),
      icon: <FontAwesome name="users" style={styles.icone} />,
      nav: 'ListeDesClients',
      color: '#9C27B0'
    },
    {
      title: t('Liste_des_livreurs'),
      icon: <MaterialIcons name="delivery-dining" style={styles.icone} />,
      nav: 'ListeDesLivreurs',
      color: '#2196F3'
    },
    
  ];

  return (
    <LayoutAdmin>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>{t('Bienvenue_admin')}</Text>
          <Text style={styles.subHeader}>{t('Gestion_plateforme')}</Text>
        </View>
        <View style={styles.viewContainer}>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{nombreCommercants}</Text>
              <Text style={styles.statLabel}>Commerçants</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{nombreConsommateursActifs}</Text>
              <Text style={styles.statLabel}>{t('Clients_actifs')}</Text>
            </View>

          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{nombreConsommateursNotActifs}</Text>
              <Text style={styles.statLabel}>Clients désactifs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{nombreLivreurs}</Text>
              <Text style={styles.statLabel}>{t('Livreurs_disponibles')}</Text>
            </View>

          </View>

        </View>

        <View style={styles.cardsContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: item.color }]}
              onPress={() => navigation.navigate(item.nav)}
            >
              <View style={styles.iconContainer}>
                {item.icon}
              </View>
              <Text style={styles.cardText}>{item.title}</Text>
              <AntDesign name="arrowright" style={styles.arrowIcon} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LayoutAdmin>
  );
};

export default AcceuilAdmin;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
    //backgroundColor: '#f5f7fa'
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 15
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 5
  },
  subHeader: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10
  },
  cardsContainer: {
    paddingHorizontal: 15,
    marginTop: 10
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 10,
    marginRight: 15
  },
  icone: {
    fontSize: 24,
    color: '#fff'
  },
  cardText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  },
  arrowIcon: {
    fontSize: 20,
    color: '#fff'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 20
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
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 5
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center'
  },
  viewContainer: {
    bottom: 20,
  }
});