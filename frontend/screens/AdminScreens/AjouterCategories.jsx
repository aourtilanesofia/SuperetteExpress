import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const AjouterCategories = ({ navigation }) => {
    const [nom, setName] = useState('');
    const [image, setImage] = useState('');
    const { t } = useTranslation();

    const handleAdd = async () => {
        try {
            await fetch('http://192.168.43.107:8080/api/categories/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nom, image })
            });
            navigation.goBack();
        } catch (error) {
            console.error("Erreur lors de l'ajout", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.txt}>{t('Nom_de_la_catégorie')} :</Text>
            <TextInput style={styles.input} value={nom} onChangeText={setName} />
            <Text style={styles.txt}>{t('URL_de_image')} :</Text>
            <TextInput style={styles.input} value={image} onChangeText={setImage} />
            <TouchableOpacity style={styles.button} onPress={handleAdd}>
                <Text style={styles.buttonText}>{t('ajouter')}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 , borderColor:'#329171'},
    button: { backgroundColor: '#329171', padding: 15, borderRadius: 5, alignItems: 'center' ,marginTop:26},
    buttonText: { color: '#fff', fontWeight: 'bold',fontSize:16 },
    txt:{fontSize:16, fontWeight:'bold',marginBottom:17, marginTop:20}
});

export default AjouterCategories;
