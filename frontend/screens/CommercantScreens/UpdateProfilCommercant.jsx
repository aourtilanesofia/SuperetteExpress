import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import LayoutCommercant from '../../components/LayoutCommercant/LayoutCommercant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Octicons from 'react-native-vector-icons/Octicons';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';

const UpdateProfilCommercant = ({ navigation }) => {
    const [formData, setFormData] = useState({
        name: '',
        numTel: '',
        adresseBoutique: '',
        mdp: '',
        newPassword: ''
    });
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSuperettes, setIsLoadingSuperettes] = useState(false);
    const [profilePic, setProfilePic] = useState(null);
    const [superettes, setSuperettes] = useState([]);
    const [selectedSuperette, setSelectedSuperette] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        const loadProfileAndSuperettes = async () => {
            try {
                setIsLoadingSuperettes(true);
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    setFormData({
                        name: user.nom || '',
                        numTel: user.numTel ? user.numTel.toString() : '',
                        adresseBoutique: user.adresseBoutique || '',
                        mdp: '',
                        newPassword: ''
                    });
                    setProfilePic(user.profilePic || null);
                    
                    // Charger les supérettes disponibles
                    const token = await AsyncStorage.getItem('token');
                    const response = await fetch('http://192.168.43.145:8080/api/superettes/disponibles', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }); 
                    const superettesData = await response.json();
                    setSuperettes(superettesData);
                    
                    // Pré-sélectionner la supérette actuelle si elle existe
                    if (user.superette) {
                        setSelectedSuperette(user.superette._id);
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
                Alert.alert(t('erreur'), t('Erreur de chargement des données'));
            } finally {
                setIsLoadingSuperettes(false);
            }
        };
        
        loadProfileAndSuperettes();
    }, []);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async () => {
        try {
            if (!/^(05|06|07)[0-9]{8}$/.test(formData.numTel)) {
                Alert.alert("Format incorrect", "Le numéro doit commencer par 05, 06 ou 07 et contenir 10 chiffres");
                return;  
            }

            if (!/^[A-Za-zÀ-ÿ\s]+$/.test(formData.name)) {
                Alert.alert("Nom invalide", "Le nom doit contenir uniquement des lettres.");
                return; 
            }

            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert(t('erreur'), t('Non authentifie'));
                return;
            }

            const updateData = {
                nom: formData.name,
                numTel: formData.numTel.toString(),
                adresseBoutique: formData.adresseBoutique,
                ...(formData.newPassword && { mdp: formData.newPassword }),
                ...(selectedSuperette && { superetteId: selectedSuperette })
            };

            const response = await fetch('http://192.168.43.145:8080/api/v1/commercant/modifier', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || t('Erreur de mise à jour'));
            }

            // Mettre à jour les données locales
            const updatedUser = {
                ...JSON.parse(await AsyncStorage.getItem('user')),
                nom: formData.name,
                numTel: formData.numTel,
                adresseBoutique: formData.adresseBoutique,
                ...(selectedSuperette && { 
                    superette: superettes.find(s => s._id === selectedSuperette) 
                })
            };
            
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

            Alert.alert(t('succes'), t('Mise à jour reussie'), [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error("Update error:", error);
            Alert.alert(t('erreur'), error.message || t('Erreur de mise à jour'));
        } finally {
            setIsLoading(false);
        }
    };

    const getAvatarColor = (name) => {
        if (!name) return 'rgb(102, 187, 106)';
        
        const colors = [
            'rgb(228, 134, 127)',     // rouge
            'rgb(233, 30, 99)',     // rose
            'rgb(156, 39, 176)',    // violet
            'rgb(103, 58, 183)',    // violet foncé
            'rgb(63, 81, 181)',     // bleu
            'rgb(33, 150, 243)',    // bleu clair
            'rgb(3, 169, 244)',     // cyan
            'rgb(0, 188, 212)',     // turquoise
            'rgb(0, 150, 136)',     // vert foncé
            'rgb(76, 175, 80)',     // vert
            'rgb(139, 195, 74)',    // vert clair
            'rgb(205, 220, 57)',    // citron
            'rgb(225, 214, 111)',    // jaune
            'rgb(240, 201, 62)',    // jaune foncé
            'rgb(255, 152, 0)',     // orange
            'rgb(121, 85, 72)'      // marron
        ];
        
        const charCode = name.charCodeAt(0) + (name.length > 1 ? name.charCodeAt(1) : 0);
        return colors[charCode % colors.length];
    };

    const getInitials = (name) => {
        if (!name || typeof name !== 'string') return '';
        const names = name.trim().split(' ').filter(Boolean);
        if (names.length === 0) return '';
        let initials = names[0][0]?.toUpperCase() || '';
        if (names.length > 1) {
            initials += names[names.length - 1][0]?.toUpperCase() || '';
        }
        return initials;
    };

    return (
        <LayoutCommercant>
            <LinearGradient
                colors={['#FFFFFF', '#E8F5E9']}
                style={styles.gradient}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.container}>
                        <View style={styles.profileHeader}>
                            {profilePic ? (
                                <Image source={{ uri: profilePic }} style={styles.avatar} />
                            ) : (
                                <View style={[
                                    styles.avatarFallback, 
                                    { backgroundColor: getAvatarColor(formData.name) }
                                ]}>
                                    <Text style={styles.avatarText}>
                                        {getInitials(formData.name)}
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <Icon name="person" size={24} color="#2E7D32" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.name}
                                    onChangeText={(text) => handleChange('name', text)}
                                    placeholder={t('nom')}
                                    placeholderTextColor="#9E9E9E"
                                />
                            </View>
 
                            <View style={styles.inputContainer}>
                                <Icon name="phone" size={24} color="#2E7D32" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.numTel}
                                    onChangeText={(text) => handleChange('numTel', text)}
                                    placeholder={t('telephone')}
                                    placeholderTextColor="#9E9E9E"
                                    keyboardType='phone-pad'
                                    maxLength={10}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Icon name="location-on" size={24} color="#2E7D32" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.adresseBoutique}
                                    onChangeText={(text) => handleChange('adresseBoutique', text)}
                                    placeholder="Adresse de la boutique"
                                    placeholderTextColor="#9E9E9E"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Icon name="store" size={24} color="#2E7D32" style={styles.inputIcon} />
                                {isLoadingSuperettes ? (
                                    <ActivityIndicator size="small" color="#2E7D32" style={styles.loader} />
                                ) : (
                                    <Picker
                                        selectedValue={selectedSuperette}
                                        onValueChange={(itemValue) => setSelectedSuperette(itemValue)}
                                        style={styles.picker}
                                        dropdownIconColor="#2E7D32"
                                    >
                                        <Picker.Item label="Sélectionnez une supérette" value="" />
                                        {superettes.map(superette => (
                                            <Picker.Item 
                                                key={superette._id} 
                                                label={`${superette.name} - ${superette.address}`} 
                                                value={superette._id} 
                                            />
                                        ))}
                                    </Picker>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <Icon name="lock" size={24} color="#2E7D32" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.newPassword}
                                    onChangeText={(text) => handleChange('newPassword', text)}
                                    placeholder={t('Nouveau mot de passe')}
                                    placeholderTextColor="#9E9E9E"
                                    secureTextEntry={!isPasswordVisible}
                                />
                                <TouchableOpacity
                                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                    style={styles.eyeIcon}
                                >
                                    <Octicons
                                        name={isPasswordVisible ? "eye" : "eye-closed"}
                                        size={20}
                                        color="#2E7D32"
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, (isLoading || isLoadingSuperettes) && styles.disabledButton]}
                                onPress={handleUpdateProfile}
                                disabled={isLoading || isLoadingSuperettes}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.saveButtonText}>{t('valider')}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </LayoutCommercant>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 30,
        marginTop: 30,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    avatarFallback: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#fff',
    },
    formContainer: {
        marginTop: 25,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 56,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        height: '100%',
        color: '#333',
        fontSize: 16,
    },
    picker: {
        flex: 1,
        height: '100%',
        color: '#333',
    },
    loader: {
        flex: 1,
    },
    eyeIcon: {
        padding: 10,
    },
    saveButton: {
        backgroundColor: '#2E7D32',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    disabledButton: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default UpdateProfilCommercant;