import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const ConConsommateur = ({ navigation, route }) => {
    const shopId = route?.params?.shopId;
    const shopName = route?.params?.shopName;
    const [secureEntry, setSecureEntry] = useState(true);
    const [numTel, setnumTel] = useState('');
    const [mdp, setMdp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    console.log("ID de la supérette (Connexion):", shopId);


    const validatePhoneNumber = (number) => {
        const phoneRegex = /^(05|06|07)[0-9]{8}$/;
        return phoneRegex.test(number);
    };

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!numTel || !mdp) {
            Alert.alert("Champs requis", "Veuillez remplir tous les champs");
            return;
        }
        if (!validatePhoneNumber(numTel)) {
            Alert.alert("Numéro invalide", "Veuillez saisir un numéro de téléphone valide.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://192.168.43.145:8080/api/v1/consommateur/connexion", {


                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    numTel,
                    mdp,
                    shopId: shopId 
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.consommateur || !data.token) {
                Alert.alert("Erreur", data.message || "Numéro de téléphone ou mot de passe incorrect");
                return;
            }

            await AsyncStorage.multiSet([
                ['token', data.token],
                ['userId', data.consommateur._id],
                ['user', JSON.stringify(data.consommateur)],
                ['currentShopId', shopId]
            ]);

            navigation.navigate("AcceuilConsommateur", { 
            shopId: shopId,
            shopName: shopName 
        });
            Alert.alert("Connexion réussie", `Bienvenue ${data.consommateur.nom || ''}!`);

        } catch (error) {
            console.error("Erreur de connexion:", error);
            Alert.alert("Erreur", "Problème de connexion au serveur");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <LinearGradient
                colors={['#FFFFFF', '#E8F5E9']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Content de vous revoir</Text>
                        <Text style={styles.subtitle}>Connectez-vous pour accéder à votre compte</Text>
                    </View>

                    <View style={styles.formContainer}>
                        {/* Numéro de Téléphone */}
                        <View style={styles.inputContainer}>
                            <Ionicons name='call-outline' size={22} color={'#329171'} style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Numéro Téléphone'
                                placeholderTextColor="#939494"
                                keyboardType='phone-pad'
                                value={numTel}
                                onChangeText={setnumTel}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <SimpleLineIcons name='lock' size={22} color={'#329171'} style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Mot de passe'
                                placeholderTextColor="#939494"
                                secureTextEntry={secureEntry}
                                value={mdp}
                                onChangeText={setMdp}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={() => setSecureEntry(prev => !prev)}
                                style={styles.eyeIcon}
                            >
                                <Octicons
                                    name={secureEntry ? 'eye-closed' : 'eye'}
                                    size={19}
                                    color={'#329171'}
                                />
                            </TouchableOpacity>
                        </View>



                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.disabledButton]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.loginButtonText}>
                                {isLoading ? 'Connexion...' : 'Se connecter'}
                            </Text>
                        </TouchableOpacity>

                        {/* Sign Up Link */}
                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Vous n'avez pas un compte ? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('InsConsommateur')}>
                                <Text style={styles.signupLink}>S'inscrire</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        paddingHorizontal: 30,
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2E7D32',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#616161',
    },
    formContainer: {
        paddingHorizontal: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 56,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    icon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        height: '100%',
        color: '#333',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 5,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 25,
    },
    forgotPasswordText: {
        color: '#329171',
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: '#2E7D32',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 35,
    },
    disabledButton: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    signupText: {
        color: '#616161',
        fontSize: 15,
    },
    signupLink: {
        color: '#2E7D32',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default ConConsommateur;