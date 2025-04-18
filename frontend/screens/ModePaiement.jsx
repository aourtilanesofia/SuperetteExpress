import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const ModePaiement = ({ navigation, route }) => {
 // Extraction des paramètres avec valeurs par défaut
 const { 
    total = 5406.00,
    adresse = "Adresse non spécifiée",
    nomClient = "Nom non renseigné",
    telephoneClient = "Téléphone non renseigné"
  } = route.params || {};

  const [modalVisible, setModalVisible] = useState(false);

  const handleCardChoice = (typeCarte) => {
    setModalVisible(false);
  
    if (typeCarte === 'CIB') {
      navigation.navigate('PaiementCIB', {
        total,
        adresse,
        nomClient,
        telephoneClient
      });
    } else if (typeCarte === 'DAHABIYA') {
      navigation.navigate('PaiementDahabiya', {
        total,
        adresse,
        nomClient,
        telephoneClient
      });
    }
  };  
  


  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.mainTitle}>Mode de paiement</Text>
      </View>

      {/* Section principale */}
      <View style={styles.mainContent}>
        {/* Titre section */}
        <Text style={styles.methodTitle}>Choisir un mode de paiement</Text>
        
        {/* Boutons centrés */}
        <View style={styles.centeredButtons}>
        <TouchableOpacity 
            style={[styles.methodButton, styles.buttonElevation]}
            onPress={() => navigation.navigate('PaiementEspece', { 
              total: total,
              adresse: adresse,
              nomClient: nomClient,
              telephoneClient: telephoneClient,
              paymentMethod: 'Espèce' 
            })}
          >
             <Ionicons name="cash" size={24} color="#2E7D32" />
             <Text style={styles.methodText}>En Espèce</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.methodButton, styles.buttonElevation]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="card" size={24} color="#2E7D32" />
            <Text style={styles.methodText}>Par carte</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
  transparent={true}
  visible={modalVisible}
  animationType="fade"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Utiliser une carte</Text>

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
    </View>
  </View>
</Modal>
    </ScrollView>

  );
};


const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  centeredButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  methodButton: {
    backgroundColor: 'white',
    width: '45%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    padding: 15,
  },
  buttonElevation: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodText: {
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 10,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderColor: '#C8E6C9',
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