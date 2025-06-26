import { StyleSheet, FlatList, View, Text, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import ProductsCard from './ProductsCard';

const backendUrl = "http://192.168.43.145:8080";

const Produits = ({ searchText, shopId }) => {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = `${backendUrl}/api/produits`;
        const params = new URLSearchParams();
        
        if (shopId) params.append('superetteId', shopId);
        if (searchText) params.append('search', searchText);
        
        url += params.toString() ? `?${params.toString()}` : '';

        const response = await fetch(url);
        if (!response.ok) throw new Error('Erreur réseau');
        
        const data = await response.json();
        setProduits(data);
      } catch (error) {
        console.error("Erreur:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduits();
  }, [shopId, searchText]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (produits.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucun produit trouvé</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={produits}
      keyExtractor={(item) => item._id.toString()}
      renderItem={({ item }) => <ProductsCard p={item} />}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
});

export default Produits;