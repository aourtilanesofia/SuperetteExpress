import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useTranslation } from "react-i18next";

const Confirmation = ({ navigation, route }) => {
  // Récupération des données de la commande
  const params = route.params || {};
   const { t } = useTranslation();

  const {
    total = params.total || '0 DA',
    adresse = params.adresse || 'Adresse non spécifiée',
    infoSupplementaire = params.infoSupplementaire || ' ',
    nomClient = params.nomClient || 'Nom non renseigné',
    telephoneClient = params.telephoneClient || 'Téléphone non renseigné',
    paymentMethod = params.paymentMethod || 'Méthode inconnue',
    numeroCommande = params.numeroCommande || 'Null',
  } = params;
  const{livreur} = route.params;
  useEffect(() => {
    const saveOrderData = async () => {
      const orderKey = `commande_${numeroCommande}`;  // Création d'une clé unique pour chaque commande
      const orderData = {
        total: total.toString(),
        adresse: adresse,
        nomClient: nomClient,
        telephoneClient: telephoneClient,
        infoSupplementaire: infoSupplementaire,
        paymentMethod: paymentMethod, 
        livreur,
      };
  
      try {
        await AsyncStorage.setItem(orderKey, JSON.stringify(orderData));
        //console.log("Commande sauvegardée :", orderKey, orderData);
      } catch (error) {
        console.error("Erreur de sauvegarde AsyncStorage :", error);
      }
    };
  
    saveOrderData();
  }, [total, adresse, nomClient, telephoneClient, infoSupplementaire, numeroCommande, paymentMethod]);
 
  return (
    <View style={styles.container}>
      {/* Icône de confirmation */}
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#2E7D32" />
      </View>

      {/* Titre */}
      <Text style={styles.title}>{t('cmdconf')} !</Text>
      <Text style={styles.subtitle}>Votre paiement {paymentMethod.toLowerCase()} a été accepté</Text>

      {/* Carte de récapitulatif */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{t('summary')}</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('order_number')}:</Text>
          <Text style={styles.detailValue}>#{numeroCommande}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('amount')}:</Text>
          <Text style={styles.detailValue}>{total} DA</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('method')}:</Text>
          <Text style={styles.detailValue}>{paymentMethod}</Text>
        </View>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>{t('delivery_to')}</Text>
        <Text style={styles.address}>{adresse} - {infoSupplementaire}</Text>
        <Text style={styles.clientInfo}>{t('delivery_person')} : {livreur.nom} - {livreur.numTel}</Text>
      </View>

      {/* Boutons d'action */}
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => navigation.navigate('AcceuilConsommateur')}
      >
        <Text style={styles.buttonText}>{t('back_home')}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.secondaryButton}
        
        onPress={() => navigation.navigate('TrackCommande', {
          commandeId: numeroCommande,
          commande:params,  // L'identifiant unique de la commande
          livreur: livreur,
          livreurId: livreur._id,           // Les infos du livreur
          adresseLivraison: adresse,  // L'adresse de livraison
          clientInfo: {
              nom: nomClient,
              telephone: telephoneClient
          },
          positionClient: null        // À remplir si vous avez déjà la position
      })}
      >
        <Text style={styles.secondaryButtonText}>{t('track_order')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2E7D32',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  address: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 5,
  },
  clientInfo: {
    fontSize: 14,
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2E7D32',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default Confirmation;