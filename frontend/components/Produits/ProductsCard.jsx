/*import { StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native'
import React from 'react'

const ProductsCard = ({p}) => { 
  return (
    <View>
      
      <View style={styles.card}>
      <Image  source={p?.image} style={{width:130, height:130, justifyContent:'center', alignItems:'center'}}/>
      <Text style={styles.titre}>{p?.name}</Text>
      <Text style={styles.desc}>{p?.description.substring(0,30)} ... Plus</Text>
      <View style={styles.btn}>
        <TouchableOpacity style={styles.btnD}>
          <Text style={styles.txt}>Détails</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnA}>
          <Text style={styles.txt}>Ajouter</Text>
        </TouchableOpacity>
      </View>
     </View>
    </View>
  )
}

export default ProductsCard

const styles = StyleSheet.create({
  card:{
    borderWidth:1,
    borderColor:'lightgrey',
    backgroundColor:'#fff',
    padding:10,
    justifyContent:'center',
    marginVertical:5,
    marginHorizontal:9,
    width:"72%",
    borderRadius:10,

  },
  titre:{
    fontSize:12,
    fontWeight:'bold',
    marginBottom:5,
  },
  desc:{
    fontSize:10,
    textAlign:'left',
  },
  btn:{
    marginTop:5,
    flexDirection:'row',
    justifyContent:'space-evenly',
    alignItems:'center',
  },
  btnD:{
    backgroundColor:'#329171',
    height:30,
    width:68,
    borderRadius:5,
    justifyContent:'center',
    alignItems:'center',
  },
  btnA:{
    backgroundColor:'#329171',
    height:30,
    width:68,
    borderRadius:5,
    justifyContent:'center',
    alignItems:'center',
  },
  txt:{
    color:'#fff',
    fontSize:13,
    fontWeight:'bold',
  },
  

})*/
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import ProduitsDetails from '../../screens/ProduitsDetails';

const ProductsCard = ({ p }) => {
  const navigation = useNavigation();
  //datails d'un produit

  const handleMoreDetails= (id)=>{
    navigation.navigate('ProduitsDetails',{_id:id});
    console.log(id);
  }

  //Ajouter au panier

  const handleAddToCart=()=>{
    alert('Produit ajouté au panier');
  }
  return (
    <View style={styles.card}>
      <Image source={p?.image} style={styles.image} />
      <Text style={styles.titre}>{p?.name}</Text>
      <Text style={styles.desc}>{p?.description.substring(0, 30)} ... Plus</Text>
      <View style={styles.btn}>
        <TouchableOpacity style={styles.btnD} onPress={() => handleMoreDetails(p._id)}>
          <Text style={styles.txt}>Détails</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnA} onPress={handleAddToCart}>
          <Text style={styles.txt}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ProductsCard

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#329171',
    backgroundColor: '#fff',
    padding: 10,
    justifyContent: 'center',
    marginVertical: 5,
    width: '48%', // Assure que deux cartes tiennent sur une ligne
    borderRadius: 10,
    marginTop:25,
  },
  image: {
    width: 130,
    height: 130,
    alignSelf: 'center',
  },
  titre: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  desc: {
    fontSize: 10,
    textAlign: 'left',
  },
  btn: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnD: {
    backgroundColor: '#329171',
    height: 30,
    width: 77,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnA: {
    backgroundColor: '#329171',
    height: 30,
    width: 77,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txt: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
})
