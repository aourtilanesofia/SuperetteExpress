
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';
import Octicons from 'react-native-vector-icons/Octicons';

const ConCommerçant = ({ navigation }) => {
    const [secureEntry, setSecureEntry] = useState(true);
    const [email, setEmail] = useState('');
    const [mdp, setMdp] = useState('');

    const handleLogin = () => {
        if (email === "admin@gmail.com" && mdp === "admin123") {
            navigation.navigate("AcceuilCommerçant");
            setEmail('');
            setMdp('');
            Alert.alert("succes","Connecté avec succés!");
        } else {
            Alert.alert("Erreur", "Email ou mot de passe incorrect !");
            setEmail('');
            setMdp('');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.txt1}>Admin</Text>

            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Ionicons name='mail-outline' size={22} color={'#939494'} />
                    <TextInput 
                        style={styles.textInput} 
                        placeholder='Entrez votre E-mail' 
                        keyboardType='email-address' 
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <SimpleLineIcon name='lock' size={22} color={'#939494'} />
                    <TextInput 
                        style={styles.textInput} 
                        placeholder='Entrez votre mot de passe' 
                        secureTextEntry={secureEntry} 
                        value={mdp}
                        onChangeText={setMdp}
                    />
                    <TouchableOpacity onPress={() => setSecureEntry(prev => !prev)}>
                                            <Octicons name={secureEntry ? 'eye-closed' : 'eye'} size={19} color={'#939494'} />
                                        </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.cnxButton} onPress={handleLogin}>
                    <Text style={styles.cnxtxt}>Se connecter</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default ConCommerçant;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    txt1: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#329171',
        marginTop: 190,
        textAlign: 'center',
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
    }
});
