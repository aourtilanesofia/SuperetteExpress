import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?', isUser: false },
  ]);
  const [inputText, setInputText] = useState('');

  // Ajoutez la fonction getAIResponse ici (juste avant handleSend)
  const getAIResponse = async (userInput) => {
    const input = userInput.toLowerCase();
    
    const responses = {
        "bonjour": "Bonjour ! Comment puis-je vous aider ?",
        "salut": "Salut ! Posez-moi vos questions sur nos produits/services.",
        "coucou": "Coucou ! Je suis là pour répondre à vos questions.",
        
        "produits": "Nous offrons une large gamme de produits. Que cherchez-vous précisément ?",
        "produit": "Quel type de produit cherchez-vous ? Fruits, snacks, boissons, ou autre ?",
        "produit":"Vous pouvez consulter notre catalogue dans la section Produits de l'application en explorant les catégories.",
        "catalogue": "Vous pouvez consulter notre catalogue dans la section Produits de l'application en explorant les catégories.",
        
        "livraison": "La livraison dure entre 20 et 30 minutes en moyenne. En cas de forte affluence, de mauvais temps ou si vous êtes éloigné, cela peut prendre un peu plus. Vous pouvez suivre votre commande en temps réel depuis l’application.",
        "suivi": "Pour suivre votre commande, allez dans la section 'Mes commandes' puis cliquez sur la commande en cours.",
        "retard": "Un retard peut être causé par la circulation, la météo ou un grand nombre de commandes. Merci pour votre patience.",
        "où est ma commande": "Vous pouvez la suivre dans la section 'Mes commandes'.",
        "statut": "Vous trouverez le statut dans la page de suivi des commandes.",
        
        "prix": "Nos prix varient selon les produits. Quel produit vous intéresse ?",
        "coût": "Les tarifs dépendent des articles. Vous cherchez quelque chose de précis ?",
        
        "paiement": "Vous pouvez payer en ligne par carte, ou en espèces à la livraison.",
        "moyens de paiement": "Nous acceptons le paiement par carte bancaire, PayPal, et espèces à la livraison.",
        "payer": "Le paiement se fait à la commande ou à la réception selon votre choix.",
        
        "horaires": "Nous sommes ouverts tous les jours de 8h à 20h.",
        "heures d'ouverture": "Tous les jours de 8h à 20h, y compris les weekends.",
        "heure": "Nous sommes ouverts tous les jours de 8h à 20h.",
        
        "contact": "Vous pouvez nous contacter au 01 23 45 67 89 ou par email : superettexpressbejaia@exemple.com",
        "email": "Notre adresse email est : superettexpressbejaia@exemple.com",
        "téléphone": "Appelez-nous au 05 23 45 67 89",
        
        "adresse": "Notre supérette se trouve au 10 rue des Commerçants, Béjaïa.",
        "localisation": "Nous sommes situés à Béjaïa, au 10 rue des Commerçants.",
        
        "merci": "Je vous en prie ! Avez-vous d'autres questions ?",
        "merci beaucoup": "Avec plaisir ! Besoin d'autre chose ?",
        
        "au revoir": "Au revoir ! N'hésitez pas à revenir si vous avez d'autres questions.",
        "bye": "À bientôt !",
        
        "non": "Très bien, n'hésitez pas à me solliciter si besoin.",
        "oui": "Parfait, dites-m'en plus.",
        
        "aide": "Je suis là pour répondre à vos questions sur nos produits, livraisons, commandes, ou horaires.",
        "question": "Posez-moi votre question, je ferai de mon mieux pour vous aider.",
        "application": "L'application vous permet de commander, payer, et suivre vos achats en quelques clics.",
        "commande": "Pour passer commande, allez dans la section Produits, ajoutez au panier et confirmez.",
        "annuler commande": "Vous pouvez annuler une commande tant qu’elle n’a pas été préparée.",
        "remboursement": "En cas de problème, contactez-nous pour un remboursement selon notre politique.",
      };
      
      

    for (const [keyword, response] of Object.entries(responses)) {
      if (input.includes(keyword)) {
        return response;
      }
    }

    const defaultResponses = [
      "Pouvez-vous reformuler votre question ?",
      "Je suis un assistant virtuel. Posez-moi des questions sur les produits, livraison, etc.",
      "Je n'ai pas trouvé d'information sur ce sujet. Essayez avec des mots-clés comme 'livraison' ou 'produits'."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage = { id: messages.length + 1, text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Obtenir et ajouter la réponse de l'IA
    const aiResponse = await getAIResponse(inputText);
    const aiMessage = { id: messages.length + 2, text: aiResponse, isUser: false };
    setMessages(prev => [...prev, aiMessage]);
  };

  return (
    <Layout>
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.message, item.isUser ? styles.userMessage : styles.aiMessage]}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={styles.messagesContainer}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Posez votre question..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Layout>
  );
};

export default ChatBot;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    bottom:50,
    marginTop:45,
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  message: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    padding: 12,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});