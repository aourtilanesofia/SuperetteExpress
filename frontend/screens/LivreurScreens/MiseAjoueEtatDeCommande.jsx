import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  TouchableOpacity
} from 'react-native';
import LayoutLivreur from '../../components/LayoutLivreur/LayoutLivreur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import { useTranslation } from "react-i18next";

const CustomButton = ({ onPress, title, backgroundColor = '#2196F3', disabled = false }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.customButton,
      { backgroundColor },
      disabled && styles.disabledButton
    ]}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const MiseAjoueEtatDeCommande = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disabledButtons, setDisabledButtons] = useState({});
   const { t } = useTranslation();

  const fetchCommandes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://192.168.1.42:8080/api/commandes/payeesouattente');
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error('Format de réponse invalide');
      }
      setCommandes(result.data);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const updateCommande = async (id, data) => {
    try {
      setLoading(true);
      const response = await fetch(`http://192.168.1.42:8080/api/commandes/ModifierStat/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const textResponse = await response.text();
      let result;
      try {
        result = JSON.parse(textResponse);
      } catch (e) {
        throw new Error('Réponse non JSON');
      }

      if (!response.ok) {
        throw new Error(result.message || `Erreur HTTP: ${response.status}`);
      }

      Alert.alert("Succès", result.message || "Statut mis à jour");
      fetchCommandes();

    } catch (err) {
      Alert.alert("Erreur détaillée", err.message);
    } finally {
      setLoading(false);
    }
  };

  const envoyerPosition = async (commandeId) => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée');
        return;
      }
  
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
  
      const response = await fetch(`http://192.168.1.42:8080/api/commandes/commande/${commandeId}/position`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lat: latitude, lng: longitude })
      });
  
      const result = await response.json();
      if (result.success) {
        Alert.alert('Position envoyée avec succès');
      } else {
        Alert.alert('Erreur', result.message || 'Erreur envoi');
      }
  
    } catch (err) {
      console.error('Erreur position:', err);
      Alert.alert('Erreur', err.message);
    }
  };
  

  const renderItem = ({ item }) => {
    const utilisateur = item.utilisateur || item.userId || {};
    const isDisabled = disabledButtons[item._id] || item.livraison === "Livré" || item.livraison === "Non Livré";

    return (
      <View style={styles.card}>
        <Text style={styles.commandeId}>{t('Commande')} #{item.numeroCommande}</Text>

        <View style={styles.infoRow}>
          <Icon name="person" size={16} color="#555" /> 
          <Text> {utilisateur.nom || 'Client inconnu'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="phone" size={16} color="#555" />
          <Text> {utilisateur.numTel || 'Non disponible'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="location-on" size={16} color="#555" />
          <Text> {item.destination?.adresse || 'Adresse non disponible'}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={[
            styles.statusText,
            item.livraison === 'Livré' && styles.statusLivree,
            item.livraison === 'Non Livré' && styles.statusNonLivree,
            item.livraison === 'En cours' && styles.statusEnCours
          ]}>
            Livraison: {item.livraison || 'En attente'}
          </Text>

          <Text style={[
            styles.statusText,
            item.paiement === 'Payée' && styles.statusPayee
          ]}>
            Paiement: {item.paiement || 'Non'}
          </Text>
        </View>

        {item.paiement === "En attente de paiement" && (
          <CustomButton
            title="Payée"
            backgroundColor="#2196F3"
            onPress={() => updateCommande(item._id, { paiement: 'Payée' })}
          />
        )}

        <CustomButton
          title={t('envoyerpos')}
          backgroundColor="#FF9800"
          onPress={() => envoyerPosition(item._id)}
        />

        <View style={styles.buttonContainer}>
          <CustomButton
            title={t('livre')}
            backgroundColor="#4CAF50"
            onPress={() => {
              setDisabledButtons(prev => ({ ...prev, [item._id]: true }));
              updateCommande(item._id, { livraison: 'Livré' });
            }}
            disabled={isDisabled}
          />

          <CustomButton
            title={t('nonlivre')}
            backgroundColor="#F44336"
            onPress={() => {
              setDisabledButtons(prev => ({ ...prev, [item._id]: true }));
              updateCommande(item._id, { livraison: 'Non Livré' });
            }}
            disabled={isDisabled}
          />
        </View>
      </View>
    );
  };

  return (
    <LayoutLivreur>
      <View style={styles.container}>
        <Text style={styles.header}>{t('suiviliv')}</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <CustomButton title="Réessayer" onPress={fetchCommandes} backgroundColor="#2196F3" />
          </View>
        ) : (
          <FlatList
            data={commandes}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={[styles.listContent, { paddingBottom: 50 }]}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Aucune commande à afficher</Text>
              </View>
            }
          />
        )}
      </View>
    </LayoutLivreur>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  commandeId: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#2c3e50'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  statusContainer: {
    marginVertical: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  statusText: {
    fontSize: 15,
    marginVertical: 4,
    color: '#7f8c8d'
  },
  statusLivree: {
    color: '#27ae60',
    fontWeight: 'bold'
  },
  statusNonLivree: {
    color: '#e74c3c',
    fontWeight: 'bold'
  },
  statusPayee: {
    color: '#2980b9',
    fontWeight: 'bold'
  },
  statusEnCours: {
    color: '#FFA500',
    fontWeight: 'bold'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center'
  },
  empty: {
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    color: '#95a5a6',
    fontSize: 16
  },
  listContent: {
    paddingBottom: 20
  },
  customButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default MiseAjoueEtatDeCommande;
