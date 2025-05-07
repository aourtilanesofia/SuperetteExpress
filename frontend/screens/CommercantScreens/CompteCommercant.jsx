import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LayoutCommercant from '../../components/LayoutCommercant/LayoutCommercant';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

const CompteCommercant = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
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
              Alert.alert(t('erreur'), t('impossible_charger_info'));
            } finally {
              setLoading(false);
            }
          };
      
          fetchUser();
        }, [])
      );
      

    const handleDelete = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            Alert.alert(t('erreur'), t('token_non_trouve'));
            return;
        }
        Alert.alert(
            "Confirmation",
            "Êtes-vous sûr de vouloir supprimer votre compte ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    onPress: async () => {
                        try {
                            setDeleting(true);
                            const token = await AsyncStorage.getItem('token');
                            const user = JSON.parse(await AsyncStorage.getItem('user'));

                            const response = await fetch(`http://192.168.1.9:8080/api/v1/commercant/delete-account`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                }
                            });

                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error(data.message || "Échec de la suppression");
                            }

                            await AsyncStorage.multiRemove(['user', 'token']);
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'ConCommercant' }]
                            });

                        } catch (error) {
                            console.error("Erreur:", error);
                            Alert.alert("Erreur", error.message || "Erreur lors de la suppression");
                        } finally {
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSuccessfulDeletion = async () => {
        await AsyncStorage.multiRemove(['user', 'token']);
        navigation.reset({
            index: 0,
            routes: [{ name: 'Connexion' }],
        });
    };

    if (loading) {
        return (
            <LayoutCommercant>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                </View>
            </LayoutCommercant>
        );
    }

    if (!user) {
        return (
            <LayoutCommercant>
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={50} color="#FF3B30" />
                    <Text style={styles.errorText}>Aucune données utilisateur</Text>
                </View>
            </LayoutCommercant>
        );
    }

    

    return (
        <LayoutCommercant>
            <LinearGradient
                colors={['#FFFFFF', '#E8F5E9']}
                style={[styles.gradient, { paddingTop: 0 }]}
            >
                <View style={styles.container}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={user.profilePic ? { uri: user.profilePic } : { uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                                style={styles.avatar}
                            />
                        </View>
                        <Text style={styles.welcomeText}>{t('Bienvenue')} {user.nom} 👋</Text>
                    </View>

                    <View style={styles.profileInfo}>
                        <View style={styles.infoItem}>
                            <Icon name="email" size={24} color="#2E7D32" style={styles.icon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('email')}</Text>
                                <Text style={styles.infoValue}>{user.email}</Text>
                            </View>
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.infoItem}>
                            <Icon name="phone" size={24} color="#2E7D32" style={styles.icon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('num')}</Text>
                                <Text style={styles.infoValue}>{user.numTel}</Text>
                            </View>
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.infoItem}>
                            <Icon name="location-on" size={24} color="#2E7D32" style={styles.icon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('adresseBoutique')}</Text>
                                <Text style={styles.infoValue}>{user.adresseBoutique}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('UpdateProfilCommercant')}
                    >
                        <Text style={styles.editButtonText}>{t('Modifier_le_profil')}</Text>
                        <Icon name="edit" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.deleteButtonText}>{t('supprimercompte')}</Text>
                                <Icon name="delete" size={20} color="#FFFFFF" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </LayoutCommercant>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        paddingTop: 0,
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
        marginBottom: 30,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        overflow: 'hidden',
        marginTop: 25,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
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
        marginTop: 30,
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
    deleteButton: {
        flexDirection: 'row',
        backgroundColor: '#D32F2F',
        padding: 15,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#D32F2F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 10,
    },
});

export default CompteCommercant;