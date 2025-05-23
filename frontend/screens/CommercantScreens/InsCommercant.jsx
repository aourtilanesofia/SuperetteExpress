import { 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ActivityIndicator
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import { Picker } from '@react-native-picker/picker';

const InsCommercant = ({ navigation }) => {
    const [secureEntry, setSecureEntry] = useState(true);
    const [formData, setFormData] = useState({
        nom: '',
        numTel: '',
        adresseBoutique: '',
        mdp: '',
        superetteId: '' // Nouveau champ pour stocker l'ID de la supérette
    });
    const [superettes, setSuperettes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSuperettes, setIsLoadingSuperettes] = useState(false);

    // Charger les supérettes disponibles
    useEffect(() => {
        const fetchSuperettes = async () => {
            setIsLoadingSuperettes(true);
            try {
                const response = await fetch("http://192.168.43.145:8080/api/superettes/disponibles");
                const data = await response.json();
                if (response.ok) {
                    setSuperettes(data);
                } else {
                    Alert.alert("Erreur", "Impossible de charger les supérettes");
                }
            } catch (error) {
                console.error("Erreur:", error);
                Alert.alert("Erreur", "Problème de connexion au serveur");
            } finally {
                setIsLoadingSuperettes(false);
            }
        };
        fetchSuperettes();
    }, []);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignup = async () => {
        const { nom, numTel, adresseBoutique, mdp, superetteId } = formData;
        
        // Validation des champs
        if (!nom || !numTel || !adresseBoutique || !mdp || !superetteId) {
            Alert.alert("Informations incomplètes", "Veuillez renseigner tous les champs obligatoires");
            return;
        }

        if (!/^(05|06|07)[0-9]{8}$/.test(numTel)) {
            Alert.alert("Format incorrect", "Le numéro doit commencer par 05, 06 ou 07 et contenir 10 chiffres");
            return;
        }
        
        if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nom)) {
            Alert.alert("Nom invalide", "Le nom doit contenir uniquement des lettres.");
            return; 
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://192.168.43.145:8080/api/v1/commercant/inscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            }); 

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Erreur d'inscription", data.message || "Veuillez vérifier vos informations et réessayer");
                return;
            }

            Alert.alert("Inscription validée", "Votre compte commerçant a été créé avec succès !", [
                { text: "Accéder à mon espace", onPress: () => navigation.navigate("ConCommercant") }
            ]);

            // Réinitialiser le formulaire
            setFormData({
                nom: '',
                numTel: '',
                adresseBoutique: '',
                mdp: '',
                superetteId: ''
            });

        } catch (error) {
            console.error("Erreur:", error);
            Alert.alert("Erreur technique", "Service momentanément indisponible. Nos équipes y travaillent.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
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
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Ouvrez votre compte professionnel</Text>
                        <Text style={styles.subtitle}>Rejoignez notre réseau de commerçants partenaires</Text>
                    </View>

                    <View style={styles.formContainer}>
                        {/* Nom Complet */}
                        <View style={styles.inputContainer}>
                            <FontAwesome name='user-o' size={20} color={'#329171'} style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Nom du responsable'
                                placeholderTextColor="#939494"
                                value={formData.nom}
                                onChangeText={(text) => handleChange('nom', text)}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Numéro de Téléphone */}
                        <View style={styles.inputContainer}>
                            <Ionicons name='call-outline' size={22} color={'#329171'} style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Téléphone professionnel'
                                placeholderTextColor="#939494"
                                keyboardType='phone-pad'
                                value={formData.numTel}
                                onChangeText={(text) => handleChange('numTel', text)}
                                maxLength={10}
                            />
                        </View>

                       

                             {/* Sélection de la supérette */}
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name='store-outline' size={20} color={'#329171'} style={styles.icon} />
                            {isLoadingSuperettes ? (
                                <ActivityIndicator size="small" color="#329171" style={styles.loader} />
                            ) : (
                                <Picker
                                    selectedValue={formData.superetteId}
                                    onValueChange={(itemValue) => handleChange('superetteId', itemValue)}
                                    style={styles.picker}
                                    dropdownIconColor="#329171"
                                >
                                    <Picker.Item label="Sélectionnez votre supérette" value=""  />
                                    {superettes.map(superette => (
                                        <Picker.Item 
                                            key={superette._id} 
                                            label={`${superette.name} - ${superette.address}`} 
                                            value={superette._id} 
                                        />
                                    ))}
                                </Picker>
                            )}
                        </View>

                         {/* Adresse */}
                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name='map-marker-outline' size={20} color={'#329171'} style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Adresse de votre commerce'
                                placeholderTextColor="#939494"
                                value={formData.adresseBoutique}
                                onChangeText={(text) => handleChange('adresseBoutique', text)}
                            />
                        </View>
 
                        {/* Mot de passe */}
                        <View style={styles.inputContainer}>
                            <Ionicons name='lock-closed-outline' size={20} color={'#329171'} style={styles.icon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Créez votre mot de passe'
                                placeholderTextColor="#939494"
                                secureTextEntry={secureEntry}
                                value={formData.mdp}
                                onChangeText={(text) => handleChange('mdp', text)}
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

                        {/* Bouton d'inscription */}
                        <TouchableOpacity
                            style={[styles.signupButton, (isLoading || isLoadingSuperettes) && styles.disabledButton]}
                            onPress={handleSignup}
                            disabled={isLoading || isLoadingSuperettes}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.signupButtonText}>S'inscrire</Text>
                            )}
                        </TouchableOpacity>

                        {/* Lien vers connexion */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Vous avez déjà un compte ? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('ConCommercant')}>
                                <Text style={styles.loginLink}>Se connecter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContainer: {
        paddingBottom: 30,
    },
    header: {
        paddingHorizontal: 30,
        marginTop: 50,
        marginBottom: 30,
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
        marginTop:15,
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
    picker: {
        flex: 1,
        height: '100%',
        color: '#333',
    },
    loader: {
        flex: 1,
    },
    signupButton: {
        backgroundColor: '#2E7D32',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    disabledButton: {
        opacity: 0.7,
    },
    signupButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    loginText: {
        color: '#616161',
        fontSize: 15,
    },
    loginLink: {
        color: '#2E7D32',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default InsCommercant;