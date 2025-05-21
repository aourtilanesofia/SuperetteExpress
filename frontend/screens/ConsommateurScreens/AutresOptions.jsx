import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState } from 'react';
import Layout from "../../components/Layout/Layout";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useTranslation } from 'react-i18next';

const AutresOptions = ({ navigation }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const { t } = useTranslation();

    const handleLanguagePress = () => {
        navigation.navigate('LanguageSelection'); 
      };

    const handleDelete = async () => {
        // Afficher la boîte de dialogue de confirmation
        Alert.alert(
            'Confirmation',
            'Voulez-vous vraiment supprimer votre compte ?',
            [
                {
                    text: 'Annuler',
                    onPress: () => console.log('Suppression annulée'),
                    style: 'cancel',
                },
                {
                    text: 'Supprimer',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            const token = await AsyncStorage.getItem("token");
                            if (!token) {
                                alert('Vous devez être connecté pour supprimer votre compte!');
                                return;
                            }

                            const response = await fetch('http://192.168.43.145:8080/api/v1/consommateur/delete-account', {


                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });

                            const data = await response.json();

                            if (response.ok) {
                                await AsyncStorage.removeItem('token'); // Supprimer le token après la suppression
                                alert('Votre compte a été supprimé avec succès !');
                                navigation.navigate('WelcomePage');
                            } else {
                                alert(data.message || 'Erreur lors de la suppression du compte.');
                            }
                        } catch (error) {
                            console.error('Erreur lors de la suppression du compte:', error);
                            alert('Une erreur s\'est produite.');
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleLogout = () => {
        Alert.alert(
            "Déconnexion",
            "Voulez-vous vraiment vous déconnecter ?",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Oui", onPress: () => navigation.navigate("ConConsommateur") }
            ]
        );
    };

    return (
        <Layout>
            <View style={styles.container}>
                
                <View style={styles.v1}>
                    <TouchableOpacity style={styles.btn} onPress={handleLanguagePress}>
                        <MaterialCommunityIcons name='syllabary-hiragana' size={28} />
                        <Text style={styles.txt1}>{t('language')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.line} />

                <View>
                    <TouchableOpacity style={styles.btn} onPress={handleDelete} disabled={isDeleting}>
                        <Fontisto name='close-a' size={17} />
                        <Text style={styles.txt2}>{t('Supprimer_mon_compte')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.line} />

                <View>
                    <TouchableOpacity style={styles.btn} onPress={handleLogout}>
                        <MaterialIcons name='logout' size={26} />
                        <Text style={styles.txt3}>{t('logout')}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.line} />
            </View>
        </Layout>
    );
};

export default AutresOptions;

const styles = StyleSheet.create({
    line: {
        borderBottomWidth: 1,
        borderBottomColor: 'lightgrey',
        marginVertical: 10,
        width: '100%',
    },
    container: {
        flex: 1,
    },
    btn: {
        flexDirection: 'row',
        padding: 13,
    },
    txt1: {
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 16,
        marginLeft: 13,
    },
    txt2: {
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 16,
        marginLeft: 23,
    },
    txt3: {
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 16,
        marginLeft: 15,
    },
    v1:{
        marginTop:10,
    }
});
