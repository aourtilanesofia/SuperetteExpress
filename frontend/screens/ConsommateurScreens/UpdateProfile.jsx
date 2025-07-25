import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Octicons from 'react-native-vector-icons/Octicons';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

const UpdateProfile = ({ navigation }) => {
    const [formData, setFormData] = useState({
        name: '',
        numTel: '',
        adr: '',
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
                        numTel: user.numTel ? user.numTel.toString() : '',
                        adr: user.adresse || '',
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
                Alert.alert(t('erreur'), t('non_authentifie'));
                return;
            }

            if (!formData.name || !formData.numTel || !formData.adr) {
                Alert.alert(t('champs_requis'), t('remplir_tous_champs'));
                return;
            }

            const updateData = {
                nom: formData.name,
                numTel: formData.numTel.toString(),
                adresse: formData.adr,
                ...(formData.newPassword && { mdp: formData.newPassword })
            };


            const response = await fetch('http://192.168.43.145:8080/api/v1/consommateur/profile-update', {

                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erreur de mise a jour');
            }

            await AsyncStorage.setItem('user', JSON.stringify({
                ...JSON.parse(await AsyncStorage.getItem('user')),
                nom: formData.name,
                numTel: formData.numTel,
                adresse: formData.adr
            }));

            Alert.alert(t('succes'), t('Mise à jour reussie'), [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error("Update error:", error);
            Alert.alert(t('erreur'), error.message || t('Erreur de mise a jour'));
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
    // Fonction pour générer les initiales
   const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '';

    const names = name.trim().split(' ').filter(n => n);
    if (names.length === 0) return '';

    let initials = names[0][0]?.toUpperCase() || '';

    if (names.length > 1) {
        initials += names[names.length - 1][0]?.toUpperCase() || '';
    }

    return initials;
};


    return (
        <Layout>
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
                                    value={formData.adr}
                                    onChangeText={(text) => handleChange('adr', text)}
                                    placeholder={t('adresse')}
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
        </Layout>
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
        marginTop:40,
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
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 60,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        overflow: 'hidden',
        marginTop: 25,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2, // Centrer la lettre verticalement
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#fff',
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

export default UpdateProfile;