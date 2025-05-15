import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';


const PaiementCIB = ({ navigation, route }) => {
  
  const {commande = route.params, total = commande.total, adresse, nomClient, telephoneClient,numeroCommande= null,infoSupplementaire } = route.params || {};
  const {livreur} = route.params;
  const [cardNumber, setCardNumber] = useState('');
  const [expirationMonth, setExpirationMonth] = useState('');
  const [expirationYear, setExpirationYear] = useState('');
  const [fullName, setFullName] = useState('');
  const [cvv, setCvv] = useState('');



  const handleValidation = async () => {
    try {
      const response = await fetch(`http://192.168.1.36:8080/api/commandes/payer/${commande.numeroCommande}`, {

        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paiement: "Payée",
          paymentMethod: 'Carte' })
      });
   
      const data = await response.json();
      //console.log('Réponse backend:', data);

      if (!cardNumber || cardNumber.length < 16) {
        alert("Numéro de carte invalide ou manquant.");
        return;
      }
    
      if (!expirationMonth) {
        alert("Veuillez sélectionner le mois d'expiration.");
        return;
      }
    
      if (!expirationYear) {
        alert("Veuillez sélectionner l'année d'expiration.");
        return;
      }
    
      if (!fullName.trim()) {
        alert("Le nom complet est requis.");
        return;
      } 
    
      if (!/^[A-Za-zÀ-ÿ\s]+$/.test(fullName)) {
        alert("Le nom complet ne doit contenir que des lettres.");
        return;
      }
    
      if (!cvv || cvv.length < 3) {
        alert("Code CVV invalide ou manquant.");
        return;
      }
  
      alert('Paiement CIB effectué');
  
      navigation.navigate('Confirmation', {
        total,
        adresse,
        nomClient,
        telephoneClient,
        paymentMethod: 'Carte CIB',
        numeroCommande,
        infoSupplementaire,
        livreur
      });
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error);
      
    }
   
  };  
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Paiement par carte CIB</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Commande N°#{numeroCommande}</Text>
        <Text style={styles.label}>Total: {commande.total} DZD</Text>
      </View>

      <Text style={styles.inputLabel}>Numéro de la carte de crédit</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        maxLength={16}
        placeholder="0000 0000 0000 0000"
        onChangeText={setCardNumber}
        value={cardNumber}
      />

      <Text style={styles.inputLabel}>Date d’expiration</Text>
      <View style={styles.expirationContainer}>
  <View style={styles.pickerWrapper}>
    <Picker
      selectedValue={expirationMonth}
      onValueChange={(itemValue) => setExpirationMonth(itemValue)}
      style={styles.picker}
    >
      <Picker.Item label="Mois" value="" />
      {[...Array(12)].map((_, i) => {
        const month = (i + 1).toString().padStart(2, '0');
        return <Picker.Item key={month} label={month} value={month} />;
      })}
    </Picker>
  </View>

  <View style={styles.pickerWrapper}>
    <Picker
      selectedValue={expirationYear}
      onValueChange={(itemValue) => setExpirationYear(itemValue)}
      style={styles.picker}
    >
      <Picker.Item label="Année" value="" />
      {[...Array(7)].map((_, i) => {
        const year = (new Date().getFullYear() + i).toString();
        return <Picker.Item key={year} label={year} value={year} />;
      })}
    </Picker>
  </View>
</View>


      <Text style={styles.inputLabel}>Nom et Prénom</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom complet"
        onChangeText={setFullName}
        value={fullName}
      />

      <Text style={styles.inputLabel}>Code CVC2/CVV2</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        maxLength={3}
        placeholder="***"
        onChangeText={setCvv}
        value={cvv}
      />

      <TouchableOpacity style={styles.button} onPress={handleValidation}>
        <Text style={styles.buttonText}>VALIDER</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F3F3F3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004C98',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 14,
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    borderColor: '#CCC',
    borderWidth: 1,
  },
  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expInput: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    borderColor: '#CCC',
    borderWidth: 1,
  },
  slash: {
    marginHorizontal: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#004C98',
    padding: 15,
    //borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    //fontWeight: 'bold',
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    marginRight: 10,   
  },
  picker: {
    height: 50,
    width: '100%',
  },  
});

export default PaiementCIB;
