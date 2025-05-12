import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Layout from '../../components/Layout/Layout';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CommandeRefusee = ({ navigation, route }) => {
  const { numeroCommande } = route.params;
 
  const updateLivraison = async () => {
    try {
      await fetch(`http://192.168.38.149:8080/api/commandes/${numeroCommande}/livraison`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ livraison: 'En attente' }),
      });
    } catch (error) {
      console.error("Erreur mise à jour livraison:", error);
    }
  };

  return (
    <Layout>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Commande non envoyée</Text>
          <Text style={styles.message}>
            Nous rencontrons des difficultés pour traiter votre commande #{numeroCommande}.
            Veuillez réessayer dans quelques minutes.
          </Text>

          <Image
            source={require('../../assets/delivery-problem.png')}
            style={styles.image}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={async () => {
                await updateLivraison();
                navigation.pop(2);         
              }}
            >
              <Text style={styles.buttonText}>Retour à la commande</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={async() =>{ 
                await updateLivraison();
                navigation.navigate('AcceuilConsommateur')}}
            >
              <Text style={[styles.buttonText, { color: '#2E7D32' }]}>Retour à l'accueil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    bottom:30,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  image: {
    width: 150,
    height: 150,
    marginVertical: 20,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  primaryButton: {
    backgroundColor: '#2E7D32',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CommandeRefusee;