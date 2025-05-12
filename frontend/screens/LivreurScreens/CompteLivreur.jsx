import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LayoutLivreur from '../../components/LayoutLivreur/LayoutLivreur';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const CompteLivreur = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const { t } = useTranslation();

    useFocusEffect(
        React.useCallback(() => {
            const fetchUser = async () => {
                try {
                    setLoading(true);
                    const userData = await AsyncStorage.getItem('user');
                    if (userData) {
                        setUser(JSON.parse(userData));
                    }
                } catch (error) {
                    Alert.alert('Erreur', "Impossible de charger les informations");
                } finally {
                    setLoading(false);
                }
            };

            fetchUser();
        }, [])
    );

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

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à votre caméra.');
            return;
        }

        try {
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled) {
                await uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la prise de photo');
        }
    };


    const uploadImage = async (uri) => {
        setUploading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) throw new Error('Utilisateur non authentifié');

            // Convertir l'URI en blob
            const response = await fetch(uri);
            const blob = await response.blob();

            const formData = new FormData();
            formData.append('profilePic', blob, 'profile.jpg');

            const uploadResponse = await fetch('http://192.168.38.149:8080/api/v1/livreur/upload-profile-pic', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await uploadResponse.json();
            if (!uploadResponse.ok) throw new Error(data.message || 'Erreur lors du téléchargement');

            // FORCEZ le rafraîchissement en récupérant les données utilisateur complètes
            const userResponse = await fetch('http://192.168.38.149:8080/api/v1/livreur/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const updatedUserData = await userResponse.json();

            await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
            setUser(updatedUserData);

            Alert.alert('Succès', 'Photo mise à jour !');
        } catch (error) {
            console.error('Erreur complète:', error);
            Alert.alert('Erreur', error.message || 'Échec de la mise à jour');
        } finally {
            setUploading(false);
        }
    };



    const getAbsoluteUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        // Ajoutez un '/' entre l'IP et le chemin si nécessaire
        return `http://192.168.38.149:8080${path.startsWith('/') ? path : '/' + path}`;
    };

    const showImagePickerOptions = () => {
        Alert.alert(
            'Changer la photo de profil',
            'Comment souhaitez-vous ajouter une photo?',
            [
                {
                    text: 'Prendre une photo',
                    onPress: takePhoto,
                },
                {
                    text: 'Choisir depuis la galerie',
                    onPress: pickImage,
                },
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
            ]
        );
    };

    if (loading) {
        return (
            <LayoutLivreur>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                </View>
            </LayoutLivreur>
        );
    }

    if (!user) {
        return (
            <LayoutLivreur>
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={50} color="#FF3B30" />
                    <Text style={styles.errorText}>{t('Aucune donnee utilisateur')}</Text>
                </View>
            </LayoutLivreur>
        );
    }

    return (
        <LayoutLivreur>
            <LinearGradient
                colors={['#FFFFFF', '#E8F5E9']}
                style={styles.gradient}
            >
                <View style={styles.container}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            {user.profilePic ? (
                                <Image
                                    source={{ uri: user.profilePic }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <Text style={styles.avatarText}>{user.nom ? user.nom[0] : ''}</Text>
                            )}
                        </View>
                        <Text style={styles.welcomeText}>{t('Bienvenue')} {user.nom} 👋</Text>
                    </View>

                    <View style={styles.profileInfo}>

                        <View style={styles.infoItem}>
                            <Icon name="phone" size={24} color="#2E7D32" style={styles.icon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('num')}</Text>
                                <Text style={styles.infoValue}>{user.numTel}</Text>
                            </View>
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.infoItem}>
                            <Icon name="directions-car" size={24} color="#2E7D32" style={styles.icon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('Catégorie_de_véhicule')}</Text>
                                <Text style={styles.infoValue}>{user.categorie}</Text>
                            </View>
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="car-info" size={24} color="#2E7D32" style={styles.icon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('Marque de véhicule')}</Text>
                                <Text style={styles.infoValue}>{user.marque || 'Non spécifiée'}</Text>
                            </View>
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name='numeric' size={20} color={'#2E7D32'} style={styles.icon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('Matricule')}</Text>
                                <Text style={styles.infoValue}>
                                    {user.matricule
                                        ? user.matricule.replace(/^(\d{0,5})(\d{0,3})(\d{0,2}).*$/, (match, p1, p2, p3) =>
                                            [p1, p2, p3].filter(Boolean).join(' ')
                                        )
                                        : ''}
                                </Text>

                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('UpdateProfileLivreur')}
                    >
                        <Text style={styles.editButtonText}>{t('Modifier_le_profil')}</Text>
                        <Icon name="edit" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </LayoutLivreur>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginTop: 20,
        fontSize: 16,
        color: '#FF3B30',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 10,
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
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#66BB6A',  
        width: 80, 
        height: 80,  
        borderRadius: 40,  
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        lineHeight: 90, 
    },
    avatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
    uploadOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        marginTop: 10,
    },
    profileInfo: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    icon: {
        marginRight: 15,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#616161',
        marginBottom: 5,
    },
    infoValue: {
        fontSize: 16,
        color: '#212121',
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: '#EEEEEE',
    },
    editButton: {
        flexDirection: 'row',
        backgroundColor: '#2E7D32',
        padding: 15,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 10,
    },
});

export default CompteLivreur;