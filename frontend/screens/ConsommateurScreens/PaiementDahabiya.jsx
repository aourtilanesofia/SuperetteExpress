import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const PaiementDahabiya = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cardName, setCardName] = useState('');
  const [cvv, setCvv] = useState('');

  const params = route.params || {}; 
  const commande = route.params;
  const livreur = route.params;
  const total = params.total || '0.00';
  const adresse = params.adresse || 'Adresse non spécifiée';
  const nomClient = params.nomClient || 'Nom non renseigné';
  const telephoneClient = params.telephoneClient || 'Téléphone non renseigné';
  const numeroCommande = params.numeroCommande || 'Aucun numéro de commande';
  const infoSupplementaire = params.infoSupplementaire || 'Aucune information splémentaire';


  const handlePayment = async () => {
    try {
      const response = await fetch(`http://192.168.38.149:8080/api/commandes/payer/${commande.numeroCommande}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paiement: "Payée",
          paymentMethod: 'Carte',
         livreur:livreur })
      });
  
      const data = await response.json();
      //console.log('Réponse backend:', data);

      if (
        !cardNumber || !expiryMonth || !expiryYear || !cardName || !cvv
      ) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
        return;
      }
    
      if (!/^\d{16}$/.test(cardNumber)) {
        Alert.alert('Erreur', 'Le numéro de la carte doit contenir 16 chiffres.');
        return;
      }
    
      if (!/^\d{2}$/.test(expiryMonth) || Number(expiryMonth) < 1 || Number(expiryMonth) > 12) {
        Alert.alert('Erreur', 'Le mois doit être entre 01 et 12.');
        return;
      }
    
      if (!/^\d{4}$/.test(expiryYear)) {
        Alert.alert('Erreur', "L'année d'expiration doit contenir 4 chiffres.");
        return;
      }
    
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(cardName)) {
        Alert.alert('Erreur', 'Le nom ne doit contenir que des lettres.');
        return;
      }
    
      if (!/^\d{3}$/.test(cvv)) {
        Alert.alert('Erreur', 'Le code CVC2/CVV2 doit contenir 3 chiffres.');
        return;
      }
  
      navigation.navigate('Confirmation', {
        commandeId: numeroCommande,
        total,
        adresse,
        nomClient,
        telephoneClient,
        paymentMethod: 'Carte Dahabiya',
        numeroCommande,
        infoSupplementaire,
        livreur,
      });
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error);
      
    }
    
  }; 

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Paiement par carte Dahabiya</Text>
      <Text style={styles.header}>INFORMATIONS PERSONNELLES</Text>
      <Text style={styles.subHeader}>VEUILLEZ ENTRER LES INFORMATIONS DE VOTRE CARTE DAHABIA</Text>

      <View style={styles.orderTable}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>COMMANDE N° </Text>
          <Text style={styles.tableHeader}>TOTAL</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>#{numeroCommande}</Text>
          <Text style={styles.tableCell}>{commande.total} DZD</Text>
        </View>
      </View>

      <Text style={styles.label}>Numéro de la carte de crédit:</Text>
      <TextInput
        style={styles.input}
        placeholder="XXXX XXXX XXXX XXXX"
        keyboardType="numeric"
        value={cardNumber}
        onChangeText={setCardNumber}
        maxLength={16}
      />

      <View style={styles.divider} />

      <Text style={styles.label}>Date d'expiration:</Text>
      <View style={styles.expiryContainer}>
    <View style={styles.pickerWrapper}>
    <Picker
      selectedValue={expiryMonth}
      style={styles.picker}
      onValueChange={(itemValue) => setExpiryMonth(itemValue)}
    >
      <Picker.Item label="Mois" value="" />
      {Array.from({ length: 12 }, (_, i) => {
        const month = String(i + 1).padStart(2, '0');
        return (
          <Picker.Item key={month} label={month} value={month} />
        );
      })}
    </Picker>
  </View>

  <View style={styles.pickerWrapper}>
    <Picker
      selectedValue={expiryYear}
      style={styles.picker}
      onValueChange={(itemValue) => setExpiryYear(itemValue)}
    >
      <Picker.Item label="Année" value="" />
      {Array.from({ length: 10 }, (_, i) => {
        const year = (new Date().getFullYear() + i).toString();
        return (
          <Picker.Item key={year} label={year} value={year} />
        );
      })}
    </Picker>
  </View>
  

      </View>

      <Text style={styles.label}>Nom et Prénom:</Text>
      <TextInput
        style={styles.input}
        placeholder="Comme indiqué sur la carte"
        value={cardName}
        onChangeText={setCardName}
      />

      <Text style={styles.label}>Entrez le code CVC2/CVV2:</Text>
      <TextInput
        style={[styles.input, styles.cvvInput]}
        placeholder="XXX"
        keyboardType="numeric"
        value={cvv}
        onChangeText={setCvv}
        maxLength={3}
        secureTextEntry
      />
      <Text style={styles.note}>(Situé au dos de la carte)</Text>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.validateButton} onPress={handlePayment}>
        <Text style={styles.validateButtonText}>VALIDER</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
  },
  orderTable: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tableHeader: {
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
    backgroundColor: '#f2f2f2',
  },
  tableCell: {
    flex: 1,
    padding: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  expiryContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expiryInput: {
    flex: 1,
    textAlign: 'center',
  },
  expirySeparator: {
    marginHorizontal: 5,
    fontSize: 16,
  },
  cvvInput: {
    width: '100%',
  },
  note: {
    fontSize: 12,
    color: '#666',
    marginTop: -10,
    marginBottom: 15,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginVertical: 15,
    borderStyle: 'dashed',
  },
  validateButton: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  validateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerWrapper: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',  
  },
  pickerLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
  },  
});

export default PaiementDahabiya;
