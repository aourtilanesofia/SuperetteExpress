import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LayoutLivreur from '../../components/LayoutLivreur/LayoutLivreur';
import { UserData } from '../../Data/UserData';

const Compte = ({ navigation }) => {
    const [user, setUser] = useState(null);


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    Alert.alert("Erreur", "Aucune donnée utilisateur trouvée.");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
                Alert.alert("Erreur", "Impossible de charger les informations.");
            }
        };

        fetchUser();
    }, []);

    if (!user) {
        return (
            <LayoutLivreur>
                <View style={styles.container}>
                    <Text>Chargement...</Text>
                </View>
            </LayoutLivreur>
        );
    }

    return (
        <LayoutLivreur>
            <View style={styles.container}>
            <Image source={{ uri: UserData[0].profilePic }} style={styles.img} />
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    
                    <Text style={styles.name}>Bienvenue {user.nom} 👋</Text>
                </View>

                <View style={{ marginTop: 40 }}>
                    <View style={styles.line} />

                    <View style={styles.vw}>
                        <Text style={styles.txt1}>Adresse E-mail:</Text>
                        <Text style={styles.txt2}>{user.email}</Text>
                    </View>

                    <View style={styles.line} />

                    <View style={styles.vw}>
                        <Text style={styles.txt1}>Numéro de téléphone:</Text>
                        <Text style={styles.txt2}>{user.numTel}</Text>
                    </View>

                    <View style={styles.line} />

                    <View style={styles.vw}>
                        <Text style={styles.txt1}>Catégorie de véhicule:</Text>
                        <Text style={styles.txt2}>{user.categorie}</Text>
                    </View>

                    <View style={styles.line} />

                    <View style={styles.vw}>
                        <Text style={styles.txt1}>Matricule:</Text>
                        <Text style={styles.txt2}>{user.matricule}</Text>
                    </View>

                    <View style={styles.line} />

                    
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('UpdateProfileLivreur')}>
                        <Text style={styles.txtbtn}>Modifier le profil</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LayoutLivreur>
    );
};

export default Compte;

const styles = StyleSheet.create({
    container: {
        marginVertical: 20,
    },
    img: {
        height: 100,
        width: '100%',
        resizeMode: 'contain',
        marginTop: 17,
    },
    name: {
        marginTop: 15,
        fontSize: 16,
    },
    line: {
        borderBottomWidth: 1,
        borderBottomColor: 'lightgrey',
        marginVertical: 10,
        width: '100%',
    },
    vw: {
        flexDirection: 'row',
        padding: 15,
    },
    txt1: {
        fontWeight: 'bold',
        fontSize: 15,
        flex: 1,
    },
    txt2: {
        marginLeft: 45,
    },
    footer: {
        marginTop: 40,
        margin: 15,
    },
    btn: {
        backgroundColor: '#329171',
        padding: 13,
        borderRadius: 100,
    },
    txtbtn: {
        justifyContent: 'center',
        textAlign: 'center',
        alignItems: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 17,
    }
});
