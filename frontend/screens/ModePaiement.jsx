import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Title } from 'react-native-paper';

const ModePaiement = ({ navigation, route }) => {
  console.log('Info supplémentaire reçue:', infoSupplementaire);
  const { 
    total = 5406.00, 
    adresse = "Adresse non spécifiée",
    nomClient = "Nom non renseigné",
    telephoneClient = "Téléphone non renseigné",
    infoSupplementaire = 'Aucune information supplémentaire', // Même nom que dans Paiement.js
    numeroCommande = null,
  } = route.params || {};
  console.log('Params reçus dans ModePaiement:', route.params);

  const [modalVisible, setModalVisible] = useState(false);

  const handleCardChoice = (typeCarte) => {
    setModalVisible(false);

    if (typeCarte === 'CIB') {
      navigation.navigate('PaiementCIB', {
        total,
        adresse,
        nomClient,
        telephoneClient,
        infoSupplementaire,
        numeroCommande,
      });
    } else if (typeCarte === 'DAHABIYA') {
      navigation.navigate('PaiementDahabiya', {
        total,
        adresse,
        nomClient,
        telephoneClient,
        infoSupplementaire,
        numeroCommande,
      }); 
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.mainTitle}>Méthode de paiement</Title>
      </View>

      <Card style={styles.paymentCard}>
        <Card.Content>
          <Title style={styles.cardTitle}>Choisir un mode de paiement</Title>

          <View style={styles.paymentOptions}>
            
            <TouchableOpacity 
              style={[styles.paymentButton, styles.buttonElevation]}
              onPress={() => navigation.navigate('PaiementEspece', { 
                total,
                adresse,
                nomClient,
                telephoneClient,
                infoSupplementaire,
                numeroCommande,
                paymentMethod: 'Espèce'
              })}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="cash" size={28} color="#2E7D32" />
                <Text style={styles.paymentButtonText}>En Espèce</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.paymentButton, styles.buttonElevation]}
              onPress={() => setModalVisible(true)}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="card" size={28} color="#2E7D32" />
                <Text style={styles.paymentButtonText}>Par carte</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <Title style={styles.modalTitle}>Utiliser une carte</Title>

              <TouchableOpacity
                style={styles.cardOption}
                onPress={() => handleCardChoice('CIB')}
              >
                <Image source={require('../assets/cib.png')} style={styles.logo} />
                <Text style={styles.cardText}>CIB</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cardOption}
                onPress={() => handleCardChoice('DAHABIYA')}
              >
                <Image source={require('../assets/dahabiya.png')} style={styles.logo} />
                <Text style={styles.cardText}>DAHABIYA</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    marginTop: 20,
  },
  header: {
    marginVertical: 80,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  paymentCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  paymentOptions: {
    gap: 16,
  },
  paymentButton: {
    backgroundColor: 'white',
    paddingVertical: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
    marginBottom: 10,
  },
  buttonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButtonText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  buttonElevation: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    width: '100%',
    marginBottom: 15,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 15,
    color: '#333',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});

export default ModePaiement;
