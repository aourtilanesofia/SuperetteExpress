import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState } from 'react';
import Layout from "../components/Layout/Layout";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importation manquante

const AutresOptions = ({ navigation }) => {
    const [isDeleting, setIsDeleting] = useState(false);

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
                                alert('Vous devez être connecté pour supprimer votre compte.');
                                return;
                            }
                            const response = await fetch('http://192.168.43.107:8080/api/v1/consommateur/delete-account', {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });

                            const data = await response.json();

                            if (response.ok) {
                                await AsyncStorage.removeItem('token'); // Supprimer le token après la suppression
                                alert('Votre compte a été supprimé avec succès.');
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

    return (
        <Layout>
            <View style={styles.container}>
                <View style={styles.line} />
                <View>
                    <TouchableOpacity style={styles.btn}>
                        <MaterialCommunityIcons name='syllabary-hiragana' size={30} />
                        <Text style={styles.txt1}>Langues</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.line} />

                <View>
                    <TouchableOpacity style={styles.btn} onPress={handleDelete} disabled={isDeleting}>
                        <Fontisto name='close-a' size={20} />
                        <Text style={styles.txt2}>Supprimer mon compte</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.line} />

                <View>
                    <TouchableOpacity style={styles.btn}>
                        <MaterialIcons name='logout' size={29} />
                        <Text style={styles.txt3}>Se déconnecter</Text>
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
        padding: 15,
    },
    txt1: {
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 17,
        marginLeft: 13,
    },
    txt2: {
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 17,
        marginLeft: 23,
    },
    txt3: {
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 17,
        marginLeft: 15,
    },
});
