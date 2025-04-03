import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native'
import React, { useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { fonts } from '../node_modules/@react-navigation/native/lib/module/theming/fonts';
import { Alert } from 'react-native';
import Octicons from 'react-native-vector-icons/Octicons';

 
const InsConsommateur = ({ navigation }) => {
    const [secureEntery, setSecureEntery] = useState(true);
    const [nom, setNom] = useState('');
    const [numTel, setNumTel] = useState('');
    const [adresse, setAdresse] = useState('');
    const [email, setEmail] = useState('');
    const [mdp, setMdp] = useState('');

    const handleSignup = async () => {
        if (!nom || !numTel || !adresse || !email || !mdp) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs !");
            setNom(' ');
            setNumTel('');
            setAdresse('');
            setEmail('');
            setMdp('');
            return;
        }

        try {
            const response = await fetch("http://192.168.1.47:8080/api/v1/consommateur/inscription", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nom, numTel, adresse, email, mdp }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Erreur", data.message || "Inscription échouée !");
                setNom(' ');
                setNumTel('');
                setAdresse(''); 
                setEmail('');
                setMdp('');
                return;
            }


            Alert.alert(" ", "Vous êtes maintenant inscrit !");
            setNom(' ');
            setNumTel('');
            setAdresse('');
            setEmail('');
            setMdp('');
            navigation.navigate("ConConsommateur");
        } catch (error) {
            console.error("Erreur d'inscription :", error);
            Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
        }
    };

    return (
        <ScrollView>
        <View style={styles.container}>
            <Text style={styles.txt1}>Inscription</Text>
 
            {/*formulaire*/}
            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <FontAwesome name='user-o' size={22} color={'#939494'} />
                    <TextInput style={styles.textInput} placeholder='Entrez votre nom complet'  value={nom}
                        onChangeText={setNom} />
                </View>

                <View style={styles.inputContainer}>
                    <SimpleLineIcons name='phone' size={22} color={'#939494'} />
                    <TextInput style={styles.textInput} placeholder='Entrez votre numéro de téléphone' keyboardType='phone-pad'
                        value={numTel}
                        onChangeText={setNumTel} />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name='map-marker-outline' size={22} color={'#939494'} />
                    <TextInput style={styles.textInput} placeholder='Entrez votre adresse' 
                        value={adresse}
                        onChangeText={setAdresse} />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name='mail-outline' size={22} color={'#939494'} />
                    <TextInput style={styles.textInput} placeholder='Entrez votre E-mail' keyboardType='email-address'
                        value={email}
                        onChangeText={setEmail} />
                </View>

                <View style={styles.inputContainer}>
                    <SimpleLineIcon name='lock' size={22} color={'#939494'} />
                    <TextInput style={styles.textInput} placeholder='Entrez votre mot de passe' secureTextEntry={secureEntery}
                        value={mdp}
                        onChangeText={setMdp} />
                    <TouchableOpacity onPress={() => { setSecureEntery((prev) => !prev); }}>
                        <Octicons name={secureEntery ? 'eye-closed' : 'eye'} size={19} color={'#939494'} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.cnxButton} onPress={handleSignup}>
                    <Text style={styles.cnxtxt}>S'inscrire</Text>
                </TouchableOpacity>


                <View style={styles.footerContainer}>
                    <Text style={styles.accountText}>Vous avez déja un compte!</Text>
                    <Text style={styles.signuptext} onPress={() => navigation.navigate('ConConsommateur')}>Se connecter</Text>
                </View>

            </View>
        </View>
        </ScrollView>
    )
}

export default InsConsommateur

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
        marginTop: 30,

    },
    formContainer: {
        marginTop: 60,
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: '#329171',
        borderRadius: 15,
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
        borderRadius: 15,
        marginVertical: 33,
    },
    cnxtxt: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 12,
    },


    img: {
        width: 25,
        height: 25,

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