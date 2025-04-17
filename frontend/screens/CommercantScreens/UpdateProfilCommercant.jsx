import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import LayoutCommercant from '../../components/LayoutCommercant/LayoutCommercant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Octicons from 'react-native-vector-icons/Octicons';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

const UpdateProfilCommercant = ({ navigation }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        numTel: '', 
        adresseBoutique: '',
        mdp: '',
        newPassword: ''
    });
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [profilePic, setProfilePic] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    setFormData({
                        name: user.nom || '',
                        email: user.email || '',
                        numTel: user.numTel ? user.numTel.toString() : '',
                        adresseBoutique: user.adresseBoutique || '',
                        mdp: '',
                        newPassword: ''
                    });
                    setProfilePic(user.profilePic || null);
                }
            } catch (error) {
                console.error("Error loading profile:", error);
            }
        };
        loadProfile();
    }, []);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async () => {
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert(t('erreur'), t('non_authentifie'));
                return;
            }

        
            const updateData = {
                nom: formData.name,
                email: formData.email,
                numTel: formData.numTel.toString(),
                adresseBoutique: formData.adresseBoutique,
                ...(formData.newPassword && { mdp: formData.newPassword })
            };

            const response = await fetch('http://192.168.1.42:8080/api/v1/commercant/modifier', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();
            console.log("Réponse du serveur:", data);
            if (!response.ok) {
                throw new Error(data.message || t('erreur_mise_a_jour'));
            }

            await AsyncStorage.setItem('user', JSON.stringify({
                ...JSON.parse(await AsyncStorage.getItem('user')),
                nom: formData.name,
                email: formData.email,
                numTel: formData.numTel,
                adresseBoutique: formData.adresseBoutique,
            }));

            Alert.alert(t('succes'), t('mise_a_jour_reussie'), [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error("Update error:", error);
            Alert.alert(t('erreur'), error.message || t('erreur_mise_a_jour'));
        } finally {
            setIsLoading(false);
        }
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
                            <View style={styles.avatarContainer}>
                                
                                    <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }} style={styles.avatar} />
                                
                                <TouchableOpacity style={styles.editIcon}>
                                    <Icon name="edit" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
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
                                <Icon name="email" size={24} color="#2E7D32" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.email}
                                    onChangeText={(text) => handleChange('email', text)}
                                    placeholder="Email"
                                    placeholderTextColor="#9E9E9E"
                                    keyboardType='email-address'
                                    autoCapitalize="none"
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
                                style={styles.saveButton}
                                onPress={handleUpdateProfile}
                                disabled={isLoading}
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
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        position: 'relative',
        marginTop:35,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#2E7D32',
        borderRadius: 20,
        padding: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#2E7D32',
        marginBottom: 10,
    },
    formContainer: {
        marginTop: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 56,
        marginBottom: 20,
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
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default UpdateProfilCommercant;