import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Image,
  ScrollView,
  RefreshControl 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import LayoutAdmin from "../../components/LayoutAdmin/LayoutAdmin";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const GestionDesSuperettes = () => {
    const navigation = useNavigation();
    const [superettes, setSuperettes] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const { t } = useTranslation();

    // Chargement initial et rechargement lors du focus
    useFocusEffect(
        useCallback(() => {
            fetchSuperettes();
        }, [])
    );

    const fetchSuperettes = async () => {
        try {
            setRefreshing(true);
            const response = await fetch('http://192.168.1.33:8080/api/superettes/');
            const data = await response.json();
            //console.log("Réponse de l'API:", data);
            setSuperettes(data);
        } catch (error) {
            console.error("Erreur lors du chargement des supérettes", error);
            Alert.alert("Erreur", "Impossible de charger les supérettes");
        } finally {
            setRefreshing(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert(
            t('confirmation'),
            t('Voulez vous vraiment supprimer la supérette ?'),
            [
                { text: t('annuler'), style: "cancel" },
                {
                    text: t('supprimer'),
                    onPress: async () => {
                        try {
                            await fetch(`http://192.168.1.33:8080/api/superettes/${id}`, { 
                                method: 'DELETE' 
                            });
                            fetchSuperettes();
                            Alert.alert(t('succes'), t('Supérette supprimée !'));
                        } catch (error) {
                            console.error("Erreur lors de la suppression", error);
                            Alert.alert(t('erreur'), t('Erreur suppression'));
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.infoContainer}>
                <FontAwesome name="shopping-basket" size={24} color="#4CAF50" />
                <View style={styles.textContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.address}>{item.address}</Text>
                    <Text style={styles.coordinates}>
                        {item.location?.coordinates[1]?.toFixed(4)}, {item.location?.coordinates[0]?.toFixed(4)}
                    </Text>
                </View>
            </View>
            
            <View style={styles.actionsContainer}>
                <TouchableOpacity 
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => navigation.navigate('ModifierSuperette', { superette: item })}
                >
                    <MaterialIcons name="edit" size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(item._id)}
                >
                    <MaterialIcons name="delete" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <LayoutAdmin>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing}
                        onRefresh={fetchSuperettes}
                        colors={['#4CAF50']}
                    />
                }
            >
                <Text style={styles.title}>{t('Liste des supérettes')}</Text>
                
                <FlatList
                    data={superettes}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>{t('Aucune superette')}</Text>
                    }
                />
            </ScrollView>

            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('AjouterSuperette')}
            >
                <MaterialIcons name="add" size={30} color="white" />
            </TouchableOpacity>
        </LayoutAdmin>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    itemContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    textContainer: {
        marginLeft: 15,
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    address: {
        fontSize: 14,
        color: '#666',
        marginTop: 3,
    },
    coordinates: {
        fontSize: 12,
        color: '#888',
        marginTop: 3,
        fontStyle: 'italic',
    },
    actionsContainer: {
        flexDirection: 'row',
       // marginTop:60,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        //bottom:100,
    },
    editButton: {
        backgroundColor: '#2196F3',
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    addButton: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007BFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 260,
        color: '#888',
        fontSize: 16,
    },
});

export default GestionDesSuperettes;