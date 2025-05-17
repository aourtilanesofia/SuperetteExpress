import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator,Modal, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import LayoutLivreur from '../../components/LayoutLivreur/LayoutLivreur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Octicons from 'react-native-vector-icons/Octicons';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';

const UpdateProfileLivreur = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [profilePic, setProfilePic] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
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
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const categories = ['Voiture', 'Scooter', 'Moto']; 
    const { t } = useTranslation();

    const getAbsoluteUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://192.168.1.33:8080${path}`;

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
        console.log("Tentative de connexion à :", `http://192.168.1.33:8080`);

        try {
            // Test préalable de la connexion
            await fetch(`http://192.168.1.33:8080`, { method: 'HEAD' });

            const formData = new FormData();
            formData.append('profilePic', {
                uri,
                name: 'upload.jpg',
                type: 'image/jpeg',
            });

            const response = await fetch(`http://192.168.1.33:8080/api/v1/livreur/upload-profile-pic`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
                    // NE PAS mettre 'Content-Type' ici (FormData le génère automatiquement)
                },
                body: formData,
            });

            console.log("Réponse brute:", response);

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
        // Validation du numéro de téléphone
        if (!/^(05|06|07)[0-9]{8}$/.test(formData.numTel)) {
            Alert.alert("Format incorrect", "Le numéro doit commencer par 05, 06 ou 07 et contenir 10 chiffres");
            return;
        }

        // Validation du nom
        if (!/^[A-Za-zÀ-ÿ\s]+$/.test(formData.name)) {
            Alert.alert("Nom invalide", "Le nom doit contenir uniquement des lettres.");
            return;
        }

        // Validation de la matricule (avec gestion des espaces)
        const matriculeSansEspaces = formData.matricule.replace(/\s/g, '');
        const matriculePattern = /^(\d{5})([1-2]\d{2})(\d{2})$/;
        const match = matriculeSansEspaces.match(matriculePattern);

        if (!match) {
            Alert.alert(
                "Format incorrect", 
                "Le matricule doit respecter le format suivant :\n\n" +
                "• 5 chiffres pour la série\n" +
                "• 1 ou 2 suivi de 2 chiffres pour le type\n" +
                "• 2 chiffres pour la wilaya\n\n" +
                "Exemple : 12345 112 09"
            );
            return;
        }

        // Extraction des parties de la matricule
        const typeVehicule = match[2];
        const annee = parseInt(match[3], 10);
        const wilaya = parseInt(match[4], 10);

        // Vérification de l'année (01 à 25)
        if (annee < 1 || annee > 25) {
            Alert.alert("Année invalide", "L'année doit être comprise entre 01 et 25 (jusqu'à 2025)");
            return;
        }

        // Vérification de la wilaya (01 à 58)
        if (wilaya < 1 || wilaya > 58) {
            Alert.alert("Wilaya invalide", "Le numéro de wilaya doit être entre 01 et 58");
            return;
        }

        // Vérification des champs obligatoires
        if (!formData.name || !formData.numTel || !formData.categorie || !formData.marque || !formData.matricule) {
            Alert.alert(t('Champs requis'), t('Remplissez tous les champs svp!'));
            return;
        }

        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            Alert.alert(t('erreur'), t('Non authentifie'));
            return;
        }

        // Préparation des données à envoyer
        const updateData = {
            nom: formData.name,
            numTel: formData.numTel.toString(),
            categorie: formData.categorie,
            marque: formData.marque,
            matricule: matriculeSansEspaces, // Envoyer sans espaces
            ...(formData.newPassword && { mdp: formData.newPassword })
        };

        // Envoi des données au serveur
        const response = await fetch('http://192.168.1.33:8080/api/v1/livreur/profile-updateL', {
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

        // Mise à jour des données locales
        const updatedUser = {
            ...user,
            nom: formData.name,
            numTel: formData.numTel,
            categorie: formData.categorie,
            marque: formData.marque,
            matricule: matriculeSansEspaces
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

    // Fonction pour générer une couleur aléatoire basée sur le nom
    
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

    const names = name.trim().split(' ').filter(n => n.length > 0);
    if (names.length === 0) return '';

    let initials = names[0][0].toUpperCase();

    if (names.length > 1) {
        initials += names[names.length - 1][0].toUpperCase();
    }

    return initials;
};

    return (
        <LayoutLivreur>
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
                                    <Icon name="directions-car" size={24} color="#2E7D32" style={styles.inputIcon} />
                                    <TouchableOpacity
                                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                                        onPress={() => setShowCategoryDropdown(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.textInput, !formData.categorie && { color: '#9E9E9E' }]}>
                                            {formData.categorie || t('Catégorie_de_véhicule')}
                                        </Text>
                                        <MaterialIcons name="keyboard-arrow-down" size={24} color="#9E9E9E" />
                                    </TouchableOpacity>
                                </View>

                                {/* Modal pour la sélection de catégorie */}
                                <Modal
                                    visible={showCategoryDropdown}
                                    transparent={true}
                                    animationType="fade"
                                    onRequestClose={() => setShowCategoryDropdown(false)}
                                >
                                    <Pressable
                                        style={styles.modalOverlay}
                                        onPress={() => setShowCategoryDropdown(false)}
                                    >
                                        <View style={styles.dropdownContainer}>
                                            {categories.map((category, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[
                                                        styles.dropdownItem,
                                                        index === categories.length - 1 && { borderBottomWidth: 0 }
                                                    ]}
                                                    onPress={() => {
                                                        handleChange('categorie', category);
                                                        setShowCategoryDropdown(false);
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.dropdownItemText}>{category}</Text>
                                                    {formData.categorie === category && (
                                                        <MaterialIcons name="check" size={20} color="#2E7D32" />
                                                    )}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </Pressable>
                                </Modal>

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
                                        value={formData.matricule.replace(/(\d{5})(\d{3})(\d{2})/, '$1 $2 $3')}
                                        onChangeText={(text) => {
                                            // Enlève tous les caractères non numériques
                                            const raw = text.replace(/[^\d]/g, '');
                                            // Limite à 10 chiffres maximum
                                            handleChange('matricule', raw.slice(0, 10));
                                        }}
                                        placeholder={t('Matricule')}
                                        placeholderTextColor="#9E9E9E"
                                        keyboardType="numeric"
                                        maxLength={13} // 10 chiffres + 2 espaces
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
        marginTop:20,
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
     cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
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
        marginTop: 10,
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
        marginTop:10,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
},
dropdownContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
},
dropdownItem: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
},
dropdownItemText: {
    fontSize: 16,
    color: '#333',
},
});

export default UpdateProfileLivreur;