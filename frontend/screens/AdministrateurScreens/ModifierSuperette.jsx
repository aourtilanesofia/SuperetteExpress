import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LayoutAdmin from "../../components/LayoutAdmin/LayoutAdmin";
import { MaterialIcons } from '@expo/vector-icons';

const ModifierSuperette = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { superette } = route.params;
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (superette) {
            setFormData({
                name: superette.name,
                address: superette.address,
                latitude: superette.location?.coordinates[1]?.toString() || '',
                longitude: superette.location?.coordinates[0]?.toString() || ''
            });
        }
    }, [superette]);

    const handleChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
            Alert.alert(t('erreur'), t('Veuillez remplir tous les champs'));
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`http://192.168.43.145:8080/api/superettes/${superette._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    address: formData.address,
                    location: {
                        type: "Point",
                        coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
                    }
                }),
            });

            if (!response.ok) throw new Error('Erreur lors de la modification');

            Alert.alert(t('succes'), t('superette_modifiee'));
            navigation.goBack();
        } catch (error) {
            console.error("Erreur:", error);
            Alert.alert(t('erreur'), t('Erreur lors de la modification de la supérette'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LayoutAdmin>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>{t('Modifier_supérette')}</Text>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('nom')}</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(text) => handleChange('name', text)}
                        placeholder={t('Nom supérette')}
                    />
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('adr')}</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.address}
                        onChangeText={(text) => handleChange('address', text)}
                        placeholder={t('Adresse supérette')}
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
                        {isLoading ? t('En cours') : t('valider')}
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

export default ModifierSuperette;