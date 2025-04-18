import React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PaiementEspece = ({ navigation, route }) => {
 // Extraction avec valeurs par défaut
 const { 
    total = '0 DA', 
    adresse = 'Adresse non spécifiée',
    nomClient = 'Nom non renseigné', 
    telephoneClient = 'Téléphone non renseigné' 
  } = route.params || {};

   const [orderNumber] = useState(() => {
      const now = new Date();
      return (
        now.getFullYear().toString().slice(2) + // ex: "25"
        (now.getMonth() + 1).toString().padStart(2, '0') + // ex: "04"
        now.getDate().toString().padStart(2, '0') + // ex: "17"
        Math.floor(1000 + Math.random() * 9000) // ex: "2345"
      ); // => exemple : "2504172345"
    });

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Ionicons name="cash" size={40} color="#2E7D32" />
        <Text style={styles.title}>Paiement en espèce</Text>
      </View>

      {/* Carte de confirmation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Montant Total : {total} DA</Text>

        <Text style={styles.sectionTitle}>Adresse :</Text>
        <Text style={styles.addressText}>{adresse}</Text>

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            Merci de préparer montant et rendez-vous au point de collecte
          </Text>
        </View>
      </View>

      {/* Bouton de confirmation */}
      <TouchableOpacity 
        style={styles.confirmButton}
        onPress={() => navigation.navigate('Confirmation', { 
            total: total,
            adresse: adresse,
            nomClient: nomClient,
            telephoneClient: telephoneClient,
            paymentMethod: 'En Espèce',
            commandeId: 'CMD-' + + orderNumber 
          })}
      >
        <Text style={styles.confirmButtonText}>Valider</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
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