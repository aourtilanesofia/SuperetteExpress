import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Card, Title } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ModePaiement = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { commande } = route.params;
 
  const { 
    total = '0DA', 
    adresse = "Adresse non spécifiée",
    nomClient = "Nom non renseigné",
    telephoneClient = "Téléphone non renseigné",
    infoSupplementaire = 'Aucune information supplémentaire',
    numeroCommande = null,
  } = route.params || {};

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const {livreur } = route.params;


  const handleCardChoice = (typeCarte) => {
    setModalVisible(false);
    setSelectedMethod(typeCarte);

    if (typeCarte === 'CIB') {
      navigation.navigate('PaiementCIB', {
        commande,
        total: commande.total,
        adresse,
        nomClient,
        telephoneClient,
        infoSupplementaire,
        numeroCommande,
        livreur,
      });
    } else if (typeCarte === 'DAHABIYA') {
      navigation.navigate('PaiementDahabiya', {
        commande,
        total: commande.total,
        adresse,
        nomClient,
        telephoneClient,
        infoSupplementaire,
        numeroCommande,
        livreur,
      }); 
    }
  };

  const paymentMethods = [
    {
      id: 'espece',
     title: t('espec'),
      icon: 'cash', 
      color: '#4CAF50',
      onPress: () => {
        setSelectedMethod('espece');
        navigation.navigate('PaiementEspece', { 
          commande,
          total: commande.total,
          adresse,
          nomClient,
          telephoneClient,
          infoSupplementaire,
          numeroCommande,
          paymentMethod: 'Espèce',
          livreur,
        });
      }
    },
    {
      id: 'carte',
      title: t('carte'),
      icon: 'card',
      color: '#2196F3',
      onPress: () => setModalVisible(true)
    }
  ];

  const cardMethods = [
    {
      id: 'CIB',
      title: 'CIB',
      logo: require('../../assets/cib.png'),
      color: '#FF5722'
    },
    {
      id: 'DAHABIYA',
      title: 'DAHABIYA',
      logo: require('../../assets/dahabiya.png'),
      color: '#9C27B0'
    }
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f5f7fa', '#e4e8f0']}
        style={styles.background}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <MaterialIcons name="payment" size={32} color="#27D32" />
          <Title style={styles.mainTitle}>{t('methodepaiemenr')}</Title>
          <Text style={styles.subTitle}>{t('select')}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('resumer')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('totalpay')}</Text>
            <Text style={styles.summaryAmount}>{commande.total} DA</Text>
          </View>
        </View>

        <Card style={styles.paymentCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>{t('choisirmode')}</Title>

            <View style={styles.paymentOptions}>
              {paymentMethods.map((method) => (
                <TouchableOpacity 
                  key={method.id}
                  style={[
                    styles.paymentButton, 
                    selectedMethod === method.id && styles.selectedButton,
                    { borderLeftColor: method.color }
                  ]}
                  onPress={method.onPress}
                >
                  <View style={styles.buttonContent}>
                    <Ionicons 
                      name={method.icon} 
                      size={28} 
                      color={selectedMethod === method.id ? 'white' : method.color} 
                    />
                    <Text style={[
                      styles.paymentButtonText,
                      selectedMethod === method.id && styles.selectedButtonText
                    ]}>
                      {method.title}
                    </Text>
                  </View>
                  {selectedMethod === method.id && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={24} 
                      color="white" 
                      style={styles.selectedIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={24} color="#2196F3" />
          <Text style={styles.infoText}>
            Votre paiement est sécurisé. Aucune information bancaire n'est stockée sur nos serveurs.
          </Text>
        </View>
      </ScrollView>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <View style={styles.modalHeader}>
                  <Title style={styles.modalTitle}>{t('utilisercarte')}</Title>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                {cardMethods.map((card) => (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.cardOption,
                      { borderLeftColor: card.color }
                    ]}
                    onPress={() => handleCardChoice(card.id)}
                  >
                    <Image source={card.logo} style={styles.logo} />
                    <Text style={styles.cardText}>{card.title}</Text>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                ))}
              </Card.Content>
            </Card>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 10,
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },
  paymentCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  paymentOptions: {
    gap: 15,
  },
  paymentButton: {
    backgroundColor: 'white',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#333',
    fontWeight: '600',
    marginLeft: 15,
    fontSize: 16,
  },
  selectedButtonText: {
    color: 'white',
  },
  selectedIcon: {
    marginLeft: 10,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#1976D2',
    marginLeft: 10,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width - 40,
  },
  modalCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderLeftWidth: 4,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
    color: '#333',
    flex: 1,
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});

export default ModePaiement;