import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import React, { useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';
import { fonts } from '../../node_modules/@react-navigation/native/lib/module/theming/fonts';
import AcceuilLivreur from './AcceuilLivreur';
import Octicons from 'react-native-vector-icons/Octicons';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConLivreur = ({ navigation }) => {
    const [secureEntery, setSecureEntery] = useState(true);
    const [email, setEmail] = useState('');
    const [mdp, setMdp] = useState('');

    //login function

    const handleLogin = async () => {
        if (!email || !mdp) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs !");
            setEmail('');
            setMdp('');
            return;
        }

        try {
            const response = await fetch("http://192.168.43.107:8080/api/v1/livreur/connexionL", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, mdp }),
            });

            const data = await response.json();
            console.log("Données reçues :", data);

            if (!response.ok || !data.livreur || !data.token) {
                Alert.alert("Erreur", data.message || "Connexion échouée !");
                setEmail('');
                setMdp('');
                return;
            }

            // Sauvegarde du token et des données utilisateur
            await AsyncStorage.setItem('token', data.token);
            await AsyncStorage.setItem('user', JSON.stringify(data.livreur));

            Alert.alert("Succès", "Connecté avec succès !");
            setEmail('');
            setMdp('');
            navigation.navigate("AcceuilLivreur");

        } catch (error) {
            console.error("Erreur de connexion :", error);
            Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
        }
    };




    return (
        <View style={styles.container}>
            <Text style={styles.txt1}>Connexion</Text>

            {/*formulaire*/}
            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Ionicons name='mail-outline' size={22} color={'#939494'} />
                    <TextInput style={styles.textInput} placeholder='Entrez votre E-mail' keyboardType='email-address' value={email}
                        onChangeText={setEmail}
                        autoComplete={'email'} />
                </View>

                <View style={styles.inputContainer}>
                    <SimpleLineIcon name='lock' size={22} color={'#939494'} />
                    <TextInput style={styles.textInput} placeholder='Entrez votre mot de passe' secureTextEntry={secureEntery} value={mdp}
                        onChangeText={setMdp} />
                    <TouchableOpacity onPress={() => setSecureEntery(prev => !prev)}>
                        <Octicons name={secureEntery ? 'eye-closed' : 'eye'} size={19} color={'#939494'} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.cnxButton} onPress={handleLogin}>
                    <Text style={styles.cnxtxt}>Se connecter</Text>
                </TouchableOpacity>


                <View style={styles.footerContainer}>
                    <Text style={styles.accountText}>Vous n'avez pas un compte?</Text>
                    <Text style={styles.signuptext} onPress={() => navigation.navigate('InsLivreur')}>S'inscrire</Text>
                </View>

            </View>
        </View>
    )
}

export default ConLivreur;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 25,
    },
    txt1: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#329171',
        marginTop: 70,

    },
    formContainer: {
        marginTop: 100,
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: '#329171',
        borderRadius: 30,
        height: 50,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 15,
        fontFamily: fonts.Ligth,
    },
    cnxButton: {
        backgroundColor: '#329171',
        borderRadius: 100,
        marginVertical: 33,
    },
    cnxtxt: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 12,
    },
    txtggl: {
        textAlign: 'center',
        marginVertical: 40,
        fontSize: 13,
        color: '#4f4f4f',
    },
    googlBtn: {

        flexDirection: 'row',
        borderWidth: 1.5,
        borderColor: "#329171",
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',


    },
    img: {
        width: 25,
        height: 25,

    },
    googleText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 12,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        gap: 5,
    },
    accountText: {
        color: '#4f4f4f',
        fontFamily: fonts.Regular,
    },
    signuptext: {
        color: '#4f4f4f',
        fontWeight: 'bold',
    }

})