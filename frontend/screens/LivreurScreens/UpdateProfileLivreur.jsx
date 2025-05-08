import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import LayoutLivreur from '../../components/LayoutLivreur/LayoutLivreur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Octicons from 'react-native-vector-icons/Octicons';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';

const UpdateProfileLivreur = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        numTel: '',
        categorie: '',
        marque: '',
        matricule: '',
        mdp: '',
        newPassword: ''
    });
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { t } = useTranslation();

    const getAbsoluteUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://192.168.1.38:8080${path}`;
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    setUser(user);
                    setFormData({
                        name: user.nom || '',
                        email: user.email || '',
                        numTel: user.numTel ? user.numTel.toString() : '',
                        categorie: user.categorie || '',
                        marque: user.marque || '',
                        matricule: user.matricule || '',
                        mdp: '',
                        newPassword: ''
                    });
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

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à vos photos.');
            return;
        }

        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled) {
                await uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection de l\'image');
        }
    };

    const uploadImage = async (uri) => {
        //console.log("Tentative de connexion à :", `http://192.168.1.38:8080`);
        
        try {
          // Test préalable de la connexion
          await fetch(`http://192.168.1.38:8080`, { method: 'HEAD' });
      
          const formData = new FormData();
          formData.append('profilePic', {
            uri,
            name: 'upload.jpg',
            type: 'image/jpeg',
          });
      
          const response = await fetch(`http://192.168.1.38:8080/api/v1/livreur/upload-profile-pic`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
              // NE PAS mettre 'Content-Type' ici (FormData le génère automatiquement)
            },
            body: formData,
          });
      
          //console.log("Réponse brute:", response);
      
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
          }
      
          return await response.json();
        } catch (error) {
          console.error("Détails de l'échec:", {
            error: error.message,
            stack: error.stack,
            uri: uri,
            time: new Date().toISOString(),
          });
          throw error;
        }
      };

    const handleUpdateProfile = async () => {
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert(t('erreur'), t('Non authentifie'));
                return;
            }

            if (!formData.name || !formData.email || !formData.numTel || !formData.categorie || !formData.marque || !formData.matricule) {
                Alert.alert(t('Champs requis'), t('Remplissez tous les champs svp!'));
                return;
            }

            const updateData = {
                nom: formData.name,
                email: formData.email,
                numTel: formData.numTel.toString(),
                categorie: formData.categorie,
                marque: formData.marque,
                matricule: formData.matricule,
                ...(formData.newPassword && { mdp: formData.newPassword })
            };

            const response = await fetch('http://192.168.1.38:8080/api/v1/livreur/profile-updateL', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || t('Erreur de mise a jour'));
            }

            const updatedUser = {
                ...user,
                nom: formData.name,
                email: formData.email,
                numTel: formData.numTel,
                categorie: formData.categorie,
                marque: formData.marque,
                matricule: formData.matricule
            };

            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

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

    return(
        <LayoutLivreur>
            <LinearGradient
                colors={['#FFFFFF', '#E8F5E9']}
                style={styles.gradient}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.container}>
                        <View style={styles.profileHeader}>
                            <TouchableOpacity onPress={pickImage} disabled={uploading}>
                                <View style={styles.avatarContainer}>
                                    {uploading && (
                                        <View style={styles.uploadOverlay}>
                                            <ActivityIndicator size="large" color="#FFFFFF" />
                                        </View>
                                    )}
                                    <Image 
                                        source={{ 
                                            uri: user?.profilePic 
                                                ? getAbsoluteUrl(user.profilePic) 
                                                : 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                                            cache: 'reload'
                                        }} 
                                        style={styles.avatar}
                                        onError={(e) => console.log('Erreur chargement image:', e.nativeEvent.error)}
                                    />
                                    <View style={styles.cameraIcon}>
                                        <Icon name="photo-camera" size={24} color="#FFFFFF" />
                                    </View>
                                </View>
                            </TouchableOpacity>
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
                                <Icon name="directions-car" size={24} color="#2E7D32" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.categorie}
                                    onChangeText={(text) => handleChange('categorie', text)}
                                    placeholder={t('Catégorie_de_véhicule')}
                                    placeholderTextColor="#9E9E9E"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <MaterialCommunityIcons name="car-info" size={24} color="#2E7D32" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.marque}
                                    onChangeText={(text) => handleChange('marque', text)}
                                    placeholder={t('Marque_du_véhicule')}
                                    placeholderTextColor="#9E9E9E"
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <MaterialCommunityIcons name='numeric' size={20} color={'#2E7D32'} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={formData.matricule}
                                    onChangeText={(text) => handleChange('matricule', text)}
                                    placeholder={t('Matricule')}
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
                    </View>
                </ScrollView>
            </LinearGradient>
        </LayoutLivreur>
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
        marginBottom: 5,
        position: 'relative',
        marginTop: 15,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    uploadOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: '100%',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        //marginTop: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 56,
        marginBottom: 10,
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
    saveButton: {
        backgroundColor: '#2E7D32',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
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

export default UpdateProfileLivreur;