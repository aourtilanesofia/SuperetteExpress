import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const WelcomePageCommercant = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#FFFFFF', '#E8F5E9']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Solution professionnelle pour</Text>
        <Text style={styles.brand}>Commerçants & Épiciers</Text>
        
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>📈</Text>
            <Text style={styles.benefitText}>Augmentez vos ventes</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⏱️</Text>
            <Text style={styles.benefitText}>Gestion simplifiée</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>👥</Text>
            <Text style={styles.benefitText}>Clientèle locale</Text>
          </View>
        </View>

        <Image 
          source={require('../../assets/commercant.png')} // Remplacez par une image plus professionnelle
          style={styles.illustration}
          resizeMode="contain"
        />

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('ConCommercant')}
          >
            <Text style={styles.buttonTextPrimary}>Accéder à mon espace</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('InsCommercant')}
          >
            <Text style={styles.buttonTextSecondary}>Devenir partenaire</Text>
          </TouchableOpacity>
        </View>

        
      </View>
    </LinearGradient>
  );
};

export default WelcomePageCommercant;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: height * 0.08,
    alignItems: 'center',
    top:20,
    //bottom:40,
  },
  title: {
    fontSize: 22,
    color: '#4CAF50',
    fontWeight: '300',
    textAlign: 'center',
  },
  brand: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 25,
    textAlign: 'center',
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: height * 0.04,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  benefitText: {
    fontSize: 16,
    color: '#424242',
    fontWeight: '500',
  },
  illustration: {
    width: width * 0.9,
    height: height * 0.3,
    marginVertical: 15,
  },
  buttonGroup: {
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 30,
    marginVertical: 8,
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
  footerText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 10,
    fontStyle: 'italic',
  },
});