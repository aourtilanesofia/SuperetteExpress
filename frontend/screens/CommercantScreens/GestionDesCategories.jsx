import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LayoutCommercant from "../../components/LayoutCommercant/LayoutCommercant";
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const GestionDesCategories = ({route}) => {
    const { superetteId } = route.params || {};
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useFocusEffect(
        useCallback(() => {
            fetchCategories();
        }, [superetteId])
    );

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://192.168.43.145:8080/api/categories?superetteId=${superetteId}`);
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Erreur lors du chargement des catégories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert(
            "Confirmation",
            "Voulez-vous vraiment supprimer cette catégorie ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    onPress: async () => {
                        try {
                            await fetch(`http://192.168.43.145:8080/api/categories/delete/${id}`, { method: 'DELETE' });
                            fetchCategories();
                        } catch (error) {
                            console.error("Erreur lors de la suppression", error);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    if (loading) {
        return (
            <LayoutCommercant>
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#007BFF" />
                </View>
            </LayoutCommercant>
        );
    }

    return (
        <LayoutCommercant>
            <View style={styles.container}>
                <Text style={styles.title}>{t('Liste_des_catégories')}</Text>
                
                {categories.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Aucune catégorie trouvée</Text>
                    </View>
                ) : (
                    <FlatList
                        data={categories}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={{ paddingBottom: 90 }}
                        renderItem={({ item }) => (
                            <View style={styles.categoryItem}>
                                <Image 
                                    source={{ uri: item.image.startsWith('http') ? item.image : `http://192.168.43.145:8080${item.image}` }} 
                                    style={styles.image} 
                                    resizeMode="contain"
                                    onError={(error) => console.log("Erreur de chargement de l'image", error.nativeEvent)}
                                />
                                <Text style={styles.categoryText}>{item.nom}</Text>
                                <TouchableOpacity 
                                    style={styles.editButton} 
                                    onPress={() => navigation.navigate('ModifierCategories', { category: item })}
                                >
                                    <Text style={styles.buttonText}>{t('modifier')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.deleteButton} 
                                    onPress={() => handleDelete(item._id)}
                                >
                                    <Text style={styles.buttonText}>{t('supprimer')}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )}
                
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => navigation.navigate('AjouterCategories', { superetteId })}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>
        </LayoutCommercant>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: '#fff' 
    },
    categoryItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 15, 
        padding: 10, 
        backgroundColor: '#f0f0f0', 
        borderRadius: 8 
    },
    image: { 
        width: 50, 
        height: 50, 
        marginRight: 10 
    },
    categoryText: { 
        flex: 1, 
        fontSize: 16 
    },
    editButton: { 
        backgroundColor: '#4CAF50', 
        padding: 10, 
        borderRadius: 5, 
        marginRight: 5 
    },
    deleteButton: { 
        backgroundColor: 'red', 
        padding: 10, 
        borderRadius: 5 
    },
    buttonText: { 
        color: '#fff', 
        fontWeight: '600' 
    },
    addButton: {
        position: 'absolute',
        bottom: 65,
        right: 20,
        backgroundColor: '#007BFF',
        width: 60,
        height: 60, 
        borderRadius: 30, 
        elevation: 5, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        alignItems: 'center',
        justifyContent: 'center', 
    },
    addButtonText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        textAlignVertical: 'center', 
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'left',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});

export default GestionDesCategories;