import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LayoutLivreur from '../../components/LayoutLivreur/LayoutLivreur';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CompteLivreur = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
                Alert.alert(t('erreur'), t('impossible_charger_info'));
            } finally {
                setLoading(false);
            }
        };

        fetchUser(); 
    }, []);

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
                    <Text style={styles.errorText}>{t('aucune_donnee_utilisateur')}</Text>
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
                            <Icon name="directions-car" size={24} color="#2E7D32" style={styles.icon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('Catégorie_de_véhicule')}</Text>
                                <Text style={styles.infoValue}>{user.categorie}</Text>
                            </View>
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.infoItem}>
                            <Icon name="badge" size={24} color="#2E7D32" style={styles.icon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('Matricule')}</Text>
                                <Text style={styles.infoValue}>{user.matricule}</Text>
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
        //borderWidth: 2,
        //borderColor: '#2E7D32',
    },
    avatar: {
        width: '100%',
        height: '100%',
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
});

export default CompteLivreur;