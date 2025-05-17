import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LayoutAdmin from "../../components/LayoutAdmin/LayoutAdmin";
import { MaterialIcons } from '@expo/vector-icons';

const AjouterSuperette = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        });
    };

const handleSubmit = async () => {
  try {
    // Conversion et validation
    const latitude = parseFloat(formData.latitude);
    const longitude = parseFloat(formData.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      Alert.alert("Erreur", "Veuillez entrer des coordonnées valides");
      return;
    }

    const response = await fetch('http://192.168.1.33:8080/api/superettes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        address: formData.address,
        location: {
          type: "Point",
          coordinates: [longitude, latitude] // [long, lat]
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur serveur");
    }

    Alert.alert("Succès", "Supérette créée avec succès");
    navigation.goBack();

  } catch (error) {
    console.error('Erreur complète:', error);
    Alert.alert("Erreur", error.message);
  }
};

    return (
        <LayoutAdmin>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>{t('Ajouter une supérette')}</Text>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('nom')}</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(text) => handleChange('name', text)}
                        placeholder={t('Nom superette')}
                    />
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('adr')}</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.address}
                        onChangeText={(text) => handleChange('address', text)}
                        placeholder={t('Adresse superette')}
                    />
                </View>
                
                <View style={styles.coordinatesContainer}>
                    <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>{t('Latitude')}</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.latitude}
                            onChangeText={(text) => handleChange('latitude', text)}
                            placeholder="ex: 48.8566"
                            keyboardType="numeric"
                        />
                    </View>
                    
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                        <Text style={styles.label}>{t('Longitude')}</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.longitude}
                            onChangeText={(text) => handleChange('longitude', text)}
                            placeholder="ex: 2.3522"
                            keyboardType="numeric"
                        />
                    </View>
                </View>
                
                <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    <Text style={styles.submitButtonText}>
                        {isLoading ? t('En cours') : t('ajouter')}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </LayoutAdmin>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
        marginTop:20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#333',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
        marginTop:10,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#555',
        fontWeight: '500',
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    coordinatesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    submitButton: {
        backgroundColor: '#2E7D32',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default AjouterSuperette;