import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import React, { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { useTranslation } from 'react-i18next';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?', isUser: false },
  ]);
  const [inputText, setInputText] = useState('');
  const { t } = useTranslation();
 

const produits = [
  {
    id: 1,
    nom: "Pomme",
    prix: 350,
    categorie: "Fruits",
    stock: 42,
    description: "Délicieuses pommes rouges croquantes, riches en fibres et vitamines",
    image: "http://192.168.1.33:8080/uploads/1747408121232.jpeg"
  },
  {
    id: 2,
    nom: "Banane",
    prix: 400,
    categorie: "Fruits",
    stock: 83,
    description: "Fruit énergétique et facile à digérer, idéal pour les collations rapides",
    image: "http://192.168.1.33:8080/uploads/1747408005973.jpeg"
  },
  {
    id: 3,
    nom: "Orange",
    prix: 280,
    categorie: "Fruits",
    stock: 80,
    description: "Oranges juteuses et riches en vitamine C, parfaites pour les jus naturels",
    image: "/assets/orange.jpg"
  },
  {
    id: 4,
    nom: "Fraise",
    prix: 250,
    categorie: "Fruits",
    stock: 49,
    description: "Fraises sucrées et parfumées, idéales pour les desserts et les smoothies",
    image: "/assets/fraise.jpeg"
  },
  {
    id: 5,
    nom: "Ananas",
    prix: 500,
    categorie: "Fruits",
    stock: 60,
    description: "Ananas exotique à la chair juteuse et sucrée, riche en enzymes digestives",
    image: "/assets/ananas.jpg"
  },
  {
    id: 6,
    nom: "Raisin",
    prix: 200,
    categorie: "Fruits",
    stock: 110,
    description: "Raisins sucrés et rafraîchissants, riches en antioxydants naturels",
    image: "/assets/raisin.jpeg"
  },
  {
    id: 7,
    nom: "Kiwi",
    prix: 400,
    categorie: "Fruits",
    stock: 50,
    description: "Kiwis verts acidulés, excellents pour renforcer le système immunitaire",
    image: "/assets/kiwi.webp"
  },
   {
    id: "67d98761eda7759ce2657d52",
    nom: "Poire",
    prix: 150,
    categorie: "Fruits",
    stock: 62,
    description: "Poires juteuses et parfumées, parfaites pour les compotes et les salades.",
    image: "/assets/poire.jpg"
  },
  {
    id: "67d9876eeda7759ce2657d54",
    nom: "Citron",
    prix: 200,
    categorie: "Fruits",
    stock: 88,
    description: "Citrons frais et riches en vitamine C, idéals pour les boissons et les plats.",
    image: "/assets/citron.jpg"
  },
  {
    id: "67d9877ceda7759ce2657d56",
    nom: "Datte",
    prix: 450,
    categorie: "Fruits",
    stock: 61,
    description: "Dattes sucrées et moelleuses, une excellente source d'énergie naturelle.",
    image: "/assets/datte.jpg"
  },
  {
    id: "67d9878aeda7759ce2657d58",
    nom: "Grenade",
    prix: 120,
    categorie: "Fruits",
    stock: 23,
    description: "Grenades riches en antioxydants, aux grains juteux et acidulés.",
    image: "/assets/grenade.jpg"
  },
  {
    id: "67d98798eda7759ce2657d5a",
    nom: "Figues",
    prix: 300,
    categorie: "Fruits",
    stock: 18,
    description: "Figues douces et sucrées, riches en fibres et en nutriments essentiels.",
    image: "/assets/figues.jpg"
  },
  {
    id: "67d987a4eda7759ce2657d5c",
    nom: "Abricot",
    prix: 200,
    categorie: "Fruits",
    stock: 30,
    description: "Abricots juteux et parfumés, excellents pour la peau et la digestion.",
    image: "/assets/abricot.jpg"
  },
  {
    id: "67d987afeda7759ce2657d5e",
    nom: "Pêche",
    prix: 200,
    categorie: "Fruits",
    stock: 28,
    description: "Pêches sucrées et veloutées, parfaites pour une collation rafraîchissante.",
    image: "/assets/pêche.jpg"
  },
  {
    id: "67d987bceda7759ce2657d60",
    nom: "Pastèque",
    prix: 100,
    categorie: "Fruits",
    stock: 121,
    description: "Pastèques désaltérantes et rafraîchissantes, riches en eau et en vitamines.",
    image: "/assets/pastèque.jpg"
  },
  {
    id: "67d9b1fdc4d7199001ab315e",
    nom: "Pomme de terre",
    prix: 70,
    categorie: "Légumes",
    stock: 66,
    description: "Pommes de terre nourrissantes et polyvalentes, idéales pour les frites, purées et gratins.",
    image: "/assets/pomme_de_terre.jpg"
  },
  {
    id: "67d9b249c4d7199001ab3160",
    nom: "Oignon",
    prix: 40,
    categorie: "Légumes",
    stock: 94,
    description: "Oignons savoureux, idéals pour relever les plats, riches en antioxydants et en vitamines.",
    image: "/assets/oignon.jpg"
  },
  {
    id: "67e00001eda7759ce2657e01",
    nom: "Tomate",
    prix: 120,
    categorie: "Légumes",
    stock: 80,
    description: "Tomates rouges et mûres, idéales pour les sauces et les salades.",
    image: "/assets/tomate.jpg"
  },
  {
    id: "67e00002eda7759ce2657e02",
    nom: "Poivron",
    prix: 180,
    categorie: "Légumes",
    stock: 50,
    description: "Poivrons croquants et colorés, parfaits pour les grillades et les plats mijotés.",
    image: "/assets/poivron.jpg"
  },
  {
    id: "67e00003eda7759ce2657e03",
    nom: "Carotte",
    prix: 90,
    categorie: "Légumes",
    stock: 100,
    description: "Carottes croquantes riches en bêta-carotène, bonnes crues ou cuites.",
    image: "/assets/carotte.jpg"
  },
  {
    id: "67e00004eda7759ce2657e04",
    nom: "Aubergine",
    prix: 150,
    categorie: "Légumes",
    stock: 40,
    description: "Aubergines tendres, idéales pour les tajines, ratatouilles et gratins.",
    image: "/assets/aubergine.jpg"
  },
  {
    id: "67e00005eda7759ce2657e05",
    nom: "Courgette",
    prix: 130,
    categorie: "Légumes",
    stock: 70,
    description: "Courgettes fraîches et polyvalentes, à cuisiner sautées, farcies ou en soupe.",
    image: "/assets/courgette.jpg"
  },
  {
    id: "67e00006eda7759ce2657e06",
    nom: "Chou-fleur",
    prix: 110,
    categorie: "Légumes",
    stock: 30,
    description: "Chou-fleur croquant, bon en gratin ou vapeur, riche en fibres.",
    image: "/assets/chou_fleur.jpg"
  },
  {
    id: "67e00007eda7759ce2657e07",
    nom: "Haricot vert",
    prix: 140,
    categorie: "Légumes",
    stock: 60,
    description: "Haricots verts tendres, parfaits en accompagnement ou salade.",
    image: "/assets/haricot_vert.jpg"
  },
  {
    id: "67e00008eda7759ce2657e08",
    nom: "Fenouil",
    prix: 160,
    categorie: "Légumes",
    stock: 25,
    description: "Fenouil frais au goût anisé, bon cru ou braisé.",
    image: "/assets/fenouil.jpg"
  },
  {
    id: "67e00009eda7759ce2657e09",
    nom: "Épinard",
    prix: 100,
    categorie: "Légumes",
    stock: 45,
    description: "Épinards frais, riches en fer, à consommer cuits ou en salade.",
    image: "/assets/epinard.jpg"
  },
  {
    id: "67e0000aeda7759ce2657e0a",
    nom: "Navet",
    prix: 80,
    categorie: "Légumes",
    stock: 35,
    description: "Navets doux et fermes, parfaits en soupe ou couscous.",
    image: "/assets/navet.jpg"
  },
   {
    nom: "Lait Partiellement écrémé Viva Candia 1L",
    prix: 135,
    categorie: "Produits laitiers",
    "stock": 59,
    "description": "Le lait partiellement écrémé Viva Candia est riche en calcium, avec une texture légère et un goût agréable, parfait pour une alimentation équilibrée.",
    "image": "/assets/lait_partiellement_ecreme_viva_candia_1l.jpg",
    "codeBarre": "6130433000385"
  },
  {
    "nom": "Candy Choco Candia 1L",
    "prix": 190,
    "categorie": "Produits laitiers",
    "stock": 111,
    "description": "Lait Candia Choco, délicieux mélange de lait et de cacao, idéal pour un moment gourmand et énergétique.",
    "image": "/assets/candy_choco_candia_1l.jpg",
    "codeBarre": "6130433000262"
  },
  {
    "nom": "Candy Choco Candia 20 cl",
    "prix": 50,
    "categorie": "Produits laitiers",
    "stock": 69,
    "description": "Lait Candia Choco, délicieux mélange de lait et de cacao, idéal pour un moment gourmand et énergétique.",
    "image": "/assets/candy_choco_candia_20cl.jpg",
    "codeBarre": "6130433000354"
  },
  {
    "nom": "Lait demi-écrémé Soummam 1L",
    "prix": 130,
    "categorie": "Produits laitiers",
    "stock": 20,
    "description": "Le lait SOUMMAM est stérilisé à ultra haute température, ce qui lui garantit une longue conservation. Il ne contient ni additifs, ni conservateurs.",
    "image": "/assets/lait_demi_ecreme_soummam_1l.png",
    "codeBarre": "6130760003189"
  },
  {
    "nom": "Lait demi-écrémé Soummam 500ml",
    "prix": 85,
    "categorie": "Produits laitiers",
    "stock": 44,
    "description": "Le lait SOUMMAM est stérilisé à ultra haute température, ce qui lui garantit une longue conservation. Il ne contient ni additifs, ni conservateurs.",
    "image": "/assets/lait_demi_ecreme_soummam_500ml.png",
    "codeBarre": "6130760004230"
  },
  {
    "nom": "L'Ben Soummam au bifidus actif 1L",
    "prix": 150,
    "categorie": "Produits laitiers",
    "stock": 94,
    "description": "L'ben au bifidus est un lait de vache fermenté partiellement écrémé pasteurisé, fait avec du bon lait frais issu de nos fermes sélectionnées, auquel est ajouté un Bifidobacterium qui améliore le confort intestinal et facilite la digestion.",
    "image": "/assets/lben_soummam.png",
    "codeBarre": "6130760003769"
  },
  {
    "nom": "Raib Soummam au bifidus actif 1Kg",
    "prix": 150,
    "categorie": "Produits laitiers",
    "stock": 19,
    "description": "Raib au bifidus est produit à base de lait de vache fermenté partiellement écrémé pasteurisé, issu de nos fermes sélectionnées, auquel est ajouté un Bifidobacterium pour améliorer le confort intestinal et la digestion.",
    "image": "/assets/raib_soummam.png",
    "codeBarre": "6130760004247"
  },
  {
    "nom": "Délices 8 portions",
    "prix": 90,
    "categorie": "Produits laitiers",
    "stock": 28,
    "description": "Délices est un fromage fondu à tartiner, UHT. Fait à base de cheddar et de beurre. Sa texture onctueuse et son goût doux, font le bonheur des petits et grands.",
    "image": "/assets/delices8.png"
  },
  {
    "nom": "Délices 16 portions",
    "prix": 170,
    "categorie": "Produits laitiers",
    "stock": 28,
    "description": "Délices est un fromage fondu à tartiner, UHT. Fait à base de cheddar et de beurre. Sa texture onctueuse et son goût doux, font le bonheur des petits et grands.",
    "image": "/assets/delices16.png"
  }
]


  const getAIResponse = async (userInput) => {
    const input = userInput.toLowerCase();
    function findProductByName(name) {
      return produits.find(p =>
        p.nom.toLowerCase().includes(name.toLowerCase())
      );
    }

    const responses = {
      "bonjour": "Bonjour ! Comment puis-je vous aider ?",
      "salut": "Salut ! Posez-moi vos questions sur nos produits/services.",
      "coucou": "Coucou ! Je suis là pour répondre à vos questions.",
      "bonsoir": "Bonsoir ! Comment puis-je vous aider ?",

      "produits": "Nous offrons une large gamme de produits. Que cherchez-vous précisément ?",
      "produit": "Quel type de produit cherchez-vous ? Fruits, snacks, boissons, ou autre ?",
      "produit": "Vous pouvez consulter notre catalogue dans la section Produits de l'application en explorant les catégories.",
      "catalogue": "Vous pouvez consulter notre catalogue dans la section Produits de l'application en explorant les catégories.",
      "snacks": "Nous avons des chips, biscuits, et barres chocolatées. Un produit en tête ?",
      "fruits": "Nous proposons des fruits frais de saison. Vous cherchez quelque chose en particulier ?",
      "boissons": "Nous avons des boissons gazeuses, des jus, et de l’eau. Que souhaitez-vous ?",

      // Produits et catégories
      "produits": "Nous proposons une large gamme de produits répartis en 14 catégories : Fruits, Légumes, Produits laitiers, Snacks, Boissons, Articles de ménage, Légumineuses, Conserves, Boulangerie, Cosmétiques, Pâtes, Huiles/miel/sauces, Blé/riz/farine. Que cherchez-vous précisément ?",

      "catégories": "Voici nos principales catégories : Fruits (pommes, bananes...), Légumes (tomates, carottes...), Produits laitiers (laits, fromages...), Snacks (chocolats, chips...), Boissons (eaux, jus...), Articles ménagers (nettoyants...), Légumineuses (lentilles, pois chiches...), Conserves (thon, concentré...), Boulangerie (pains...), Cosmétiques (shampoings...), Pâtes (spaghetti...), Huiles/miel/sauces, Blé/riz/farine. Quelle catégorie vous intéresse ?",

      "fruits": "Nos fruits frais : Pomme (350 DA), Banane (400 DA), Orange (280 DA), Fraise (250 DA), Ananas (500 DA), Raisin (200 DA), Kiwi (400 DA), Poire (150 DA), Citron (200 DA), Datte (450 DA), Grenade (120 DA), Figues (300 DA), Abricot (200 DA), Pêche (200 DA), Pastèque (100 DA). Lequel vous intéresse ?",

      "légumes": "Nos légumes frais : Pomme de terre (70 DA), Oignon (40 DA), Tomate (80 DA), Poivron (130 DA), Carotte (90 DA), Aubergine (120 DA), Courgette (110 DA), Chou-fleur (90 DA), Haricot vert (300 DA), Fenouil (100 DA), Épinard (85 DA), Navet (90 DA), Laitue (50 DA), Concombre (70 DA), Ail (130 DA). Vous voulez plus d'infos sur lequel ?",

      "produits laitiers": "Nos produits laitiers : Lait entier Candia 1L (140 DA), Lait écrémé (125 DA), Yaourts (à partir de 17 DA), Fromages (à partir de 80 DA), Beurre, Crème fraîche. Vous cherchez quelque chose de précis ?",

      "snacks": "Snacks disponibles : Chocolats (Milka à 200-400 DA), Chips (30 DA), Biscuits (à partir de 25 DA), Gaufrettes (50 DA). Une préférence ?",

      "boissons": "Nos boissons : Eaux minérales (40-50 DA), Jus de fruits (à partir de 50 DA), Sodas (Coca 50-170 DA), Boissons lactées. Vous préférez quelle catégorie ?",

      "légumineuses": "Légumineuses disponibles : Lentilles vertes (180 DA/kg), Pois chiches (250 DA/kg), Haricots blancs (250 DA/kg), Lentilles rouges (320 DA/kg). Quantité souhaitée ?",

      "conserves": "Nos conserves : Thon (à partir de 265 DA), Concentré de tomate (125 DA), Maïs (190 DA), Harissa (55 DA). Vous cherchez quelque chose de particulier ?",

      "boulangerie": "Produits de boulangerie : Pain baguette (15 DA), Pain complet (30 DA), Pain de mie (150 DA). Frais tous les jours !",

      "pâtes": "Pâtes alimentaires : Spaghetti (80 DA/500g), Coude (85-95 DA/500g), Couscous (190 DA/kg). Vous préférez quel type ?",

      "huiles": "Huiles et sauces : Huile végétale 2L (270 DA), Vinaigre (100 DA), Mayonnaise (à partir de 175 DA). Besoin de conseils ?",

      "farine": "Farines et céréales : Farine 5kg (250 DA), Semoule (390 DA/5kg), Riz (225-350 DA/kg). Pour quel usage ?",

      // Recherche de produits spécifiques
      "pomme": "La pomme est disponible à 350 DA le kg. Description : Délicieuses pommes rouges croquantes, riches en fibres et vitamines. Stock actuel : 42. Voulez-vous en ajouter à votre panier ?",

      "banane": "La banane est à 400 DA le kg. Description : Fruit énergétique et facile à digérer, idéal pour les collations. Stock : 83. Intéressé ?",

      "lait": "Nous avons plusieurs laits : Lait entier Candia 1L (140 DA), Lait écrémé (125 DA), Lait aromatisé (à partir de 190 DA). Lequel vous convient ?",

      "coca": "Coca-Cola disponible en : 25cl (50 DA), 50cl (70 DA), 1L (110 DA), 2L (170 DA). Format préféré ?",

      "riz": "Nous proposons : Riz SOS 1kg (225 DA), Riz Basmati 1kg (350 DA). Lequel vous intéresse ?",

      "chocolat": "Chocolats disponibles : Milka (200-400 DA), Maxon (120-170 DA), Maruja (220 DA). Vous avez une préférence ?",

      // Prix et promotions
      "prix [produit]": (produit) => {
        const produitTrouve = produits.find(p => p.nom.toLowerCase().includes(produit.toLowerCase()));
        return produitTrouve
          ? `Le ${produitTrouve.nom} est à ${produitTrouve.prix} DA. ${produitTrouve.description}`
          : "Désolé, je ne trouve pas ce produit. Pouvez-vous préciser ?";
      },

      // Stocks et disponibilité
      "stock [produit]": (produit) => {
        const produitTrouve = produits.find(p => p.nom.toLowerCase().includes(produit.toLowerCase()));
        return produitTrouve
          ? `Nous avons ${produitTrouve.stock} unités de ${produitTrouve.nom} en stock.`
          : "Produit non trouvé. Vérifiez l'orthographe ou demandez-moi nos catégories.";
      },

      "disponible [produit]": (produit) => {
        const produitTrouve = produits.find(p => p.nom.toLowerCase().includes(produit.toLowerCase()));
        if (!produitTrouve) return "Produit non trouvé. Essayez avec un autre nom.";
        return produitTrouve.stock > 0
          ? `Oui, ${produitTrouve.nom} est disponible (${produitTrouve.stock} en stock). Prix : ${produitTrouve.prix} DA`
          : `Désolé, ${produitTrouve.nom} est actuellement en rupture de stock.`;
      },

      // Description des produits
      "description [produit]": (produit) => {
        const produitTrouve = produits.find(p => p.nom.toLowerCase().includes(produit.toLowerCase()));
        return produitTrouve
          ? `Description de ${produitTrouve.nom} : ${produitTrouve.description}. Prix : ${produitTrouve.prix} DA`
          : "Produit non trouvé. Voulez-vous que je liste nos catégories ?";
      },

      // Commandes
      "commander": "Pour commander : 1) Choisissez vos produits 2) Validez le panier 3) Sélectionnez paiement (en ligne ou à la livraison) 4) Confirmez. Besoin d'aide pour un produit précis ?",

      "comment commander": "Ajoutez des produits au panier, cliquez sur 'Commander', choisissez un mode de paiement.",
      "contact": "Nous contacter : Téléphone - 05 23 45 67 89 | Email - superettexpressbejaia@exemple.com | Adresse - 10 rue des Commerçants, Béjaïa.",
      "livrez-vous partout": "Nous livrons uniquement dans la ville de Béjaïa pour le moment.",
      "frais de livraison": "Les frais de livraison varient selon la distance.",
       "prix de livraison": "Le prix de livraison dépend de la distance parcourue.",
      "Livrez-vous à domicile":"Oui, la livraison à domicile est disponible.",
      "Livrez vous à domicile":"Oui, la livraison à domicile est disponible.",
      

      "livraison": "La livraison dure entre 5 et 20 minutes en moyenne. En cas de forte affluence, de mauvais temps ou si vous êtes éloigné, cela peut prendre un peu plus. Vous pouvez suivre votre commande en temps réel depuis l'application.",
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
      "weekends":"Oui nous sommes ouverts pendant les week-end a partir de 9:30h",
      "week-end":"Oui nous sommes ouverts pendant les week-end a partir de 9:30h",

      "contact": "Vous pouvez nous contacter au 05 23 45 67 89 ou par email : superettexpressbejaia@exemple.com",
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
      "supérette express": "L'application vous permet de commander, payer, et suivre vos achats en quelques clics.",
      "services": "L'application vous permet de commander, payer, et suivre vos achats en quelques clics.",
      "commande": "Pour passer commande, allez dans la section Produits, ajoutez au panier et confirmez.",
      "annuler commande": "Vous pouvez annuler une commande tant qu'elle n'a pas été préparée.",
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, marginBottom: 49, }}
        keyboardVerticalOffset={90} // Ajustez cette valeur selon votre mise en page
      >
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
            inverted={false}
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
      </KeyboardAvoidingView>
    </Layout>
  );
};

export default ChatBot;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 16,
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
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 16 : 8,

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