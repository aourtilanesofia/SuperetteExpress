import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../utils/colors';

const { width, height } = Dimensions.get('window');

const WelcomePageLivreur = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#FFFFFF', '#E8F5E9']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Bienvenue sur</Text>
        <Text style={styles.appName}>Superette Express</Text>
        <Text style={styles.subtitle}>Plateforme livreur</Text>

        <Image 
          source={require('../../assets/liv3.png')} 
          style={styles.deliveryImage}
          resizeMode="contain"
        />

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('ConLivreur')}
          >
            <Text style={styles.buttonTextPrimary}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('InsLivreur')}
          >
            <Text style={styles.buttonTextSecondary}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default WelcomePageLivreur;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: height * 0.1,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: '300',
    textAlign: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#616161',
    marginBottom: height * 0.05,
    textAlign: 'center',
  },
  deliveryImage: {
    width: width * 0.8,
    height: height * 0.3,
    marginVertical: 30,
  },
  buttonGroup: {
    width: '100%',
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 30,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#2E7D32',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
});