import React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const PaiementEspece = ({ navigation, route }) => {
  // Extraction avec valeurs par défaut
  const { t } = useTranslation();
  const {
    commande = route.params, 
    total = '0 DA', 
    adresse = 'Adresse non spécifiée',
    nomClient = 'Nom non renseigné',
    telephoneClient = 'Téléphone non renseigné',
    infoSupplementaire = ' ',
    numeroCommande= null,
    paymentMethod= null,
  } = route.params || {};
   const{livreur} = route.params;
  //console.log('Commande reçue:', commande);
  //console.log('Params reçus dans PaiementEspece:', route.params);
  const [orderNumber] = useState(() => {
    const now = new Date();
    return (
      now.getFullYear().toString().slice(2) + // ex: "25"
      (now.getMonth() + 1).toString().padStart(2, '0') + // ex: "04"
      now.getDate().toString().padStart(2, '0') + // ex: "17"
      Math.floor(1000 + Math.random() * 9000) // ex: "2345"
    ); // => exemple : "2504172345"
  });

  const handleConfirmation = async () => {

    try {
      const response = await fetch(`http://192.168.1.9:8080/api/commandes/payer/${commande.numeroCommande}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paiement: "En attente de paiement",
          paymentMethod: 'Espèce'
         })
      });
  
      const data = await response.json();
      //console.log('Réponse backend:', data);
  
      navigation.navigate('Confirmation', {
        total,
        adresse,
        nomClient,
        telephoneClient,
        paymentMethod: 'En Espèce',
        infoSupplementaire,
        numeroCommande,
        livreur:livreur,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error);
    }
  };
  
  

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Ionicons name="cash" size={40} color="#2E7D32" />
        <Text style={styles.title}>Paiement en espèce</Text>
      </View>

      {/* Carte de confirmation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('montanttotal')} : {commande.total} DA</Text>

        <Text style={styles.sectionTitle}>{t('adr')} :</Text>
        <Text style={styles.addressText}>{adresse}</Text>
        {infoSupplementaire && infoSupplementaire.trim() !== '' && (
          <Text style={styles.addressText}>{infoSupplementaire}</Text>
        )}

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            {t('mercideprepare')}
          </Text>
        </View>
      </View>

      {/* Bouton de confirmation */}
      <TouchableOpacity
  style={styles.confirmButton}
  onPress={async () => {
    await handleConfirmation(); // mise à jour dans la base de données

    navigation.navigate('Confirmation', {
      total: total,
      adresse: adresse,
      nomClient: nomClient,
      telephoneClient: telephoneClient,
      paymentMethod: 'En Espèce',
      infoSupplementaire: infoSupplementaire,
      numeroCommande,
      livreur:livreur,
    }); 
  }}
>
  <Text style={styles.confirmButtonText}>{t('valider')}</Text>
</TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    marginTop: 100,
    //justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
  },
  noteBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 17,
    marginTop: 20,
  },
  noteText: {
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PaiementEspece;