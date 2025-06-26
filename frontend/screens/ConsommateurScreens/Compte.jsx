import { StyleSheet, Text, View, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from '../../components/Layout/Layout';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

const Compte = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
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
                    Alert.alert('Erreur', "impossible de charger l'information");
                } finally {
                    setLoading(false);
                }
            };

            fetchUser();
        }, [])
    );

    if (loading) {
        return (
            <Layout>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                </View>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout>
                <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={50} color="#FF3B30" />
                    <Text style={styles.errorText}>Aucune donnée utilisateur</Text>
                </View>
            </Layout>
        );
    }
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
                <View style={styles.container}>
                    <View style={styles.profileHeader}>
                        {user.photoProfil ? (
                            <Image source={{ uri: getAbsoluteUrl(user.photoProfil) }} style={styles.avatar} />
                        ) : (
                            <View style={[
                                styles.avatarFallback,
                                { backgroundColor: getAvatarColor(user.nom) }
                            ]}>
                                <Text style={styles.avatarText}>
                                    {getInitials(user.nom)}
                                </Text>

                            </View>
                        )}
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
                            <Icon name="location-on" size={24} color="#2E7D32" style={styles.icon} />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>{t('adr')}</Text>
                                <Text style={styles.infoValue}>{user.adresse}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('UpdateProfile')}
                    >
                        <Text style={styles.editButtonText}>{t('Modifier_le_profil')}</Text>
                        <Icon name="edit" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </Layout>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        marginTop:50,
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
    welcomeText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginTop:10,
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

export default Compte;