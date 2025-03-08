import consommateurModel from "../models/consommateurModel.js";

//INSCRIPTION
export const inscriptionController = async (req,res) => {
    try {
        const {nom,numTel,adresse,email,mdp} = req.body
        // Validation 
        if(!nom || !numTel || !adresse || !email || !mdp){
            return res.status(500).send({
                success : false,
                message: 'Remplissez tous les champs svp!',

            });
        }
        // Vérifier l'existence du consommateur 
        const existingConsommateur = await consommateurModel.findOne({email})

        //Validation
        if (existingConsommateur) {
            return res.status(500).send({
                success: false,
                message:"Adresse e-mail déja utilisée!",
            });
            
        }


        const consommateur = await consommateurModel.create({nom,numTel,adresse,email,mdp});
        res.status(201).send({
            success: true,
            message: 'Inscription réussie, veuillez vous connecter',
            consommateur
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error in register API',
            error
        });
        
    }
};

//CONNEXION
export const connexionController = async (req,res) => {
    try {
        const {email,mdp} = req.body
        //validation
        if (!email || !mdp) {
            return res.status(500).send({
                success: false,
                message:'svp, entrez votre e-mail ou mot de passe!',
            });
        }
        //check consommateur
        const consommateur = await consommateurModel.findOne({email})
        // validation du consommateur
        if (!consommateur) {
            return res.status(404).send({
                success: false,
                massage:'Utilisateur non trouvé!',
            });
        }
        //check mdp
        const isMatch = await consommateur.comparePassword(mdp);
        //la validation du mdp
        if (!isMatch) {
            return res.status(500).send({
                success:false,
                message:'invalide',
            });
        } 
        //TOKEN
        const token = consommateur.generateToken();
        res.status(200).cookie("token",token).send({
            success: true,
            message:'Connecter avec succés',
            token,
            consommateur
        })
        
    } catch (error) {
        res.status(500).send({
            success: false,
            message:'Error in login API',
            error
        })
    }
};

//obtenir le profile utilisateur
export const getConsommateurProfileController = async (req, res) => {
    try {
        const consommateur = await consommateurModel.findById(req.user._id);
        res.status(200).send({
            success: true,
            message: "Profil utilisateur récupéré avec succès",
            consommateur,
        }); 
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Erreur dans l'API du profil",
            error,
        });
    }
};

//modifier le profile utilisateur

export const updateProfileController =async (req,res) =>{
    try {
        
    } catch (error) {
        const consommateur = await consommateurModel.findById(req.consommateur._id)
        const {nom,numTel,email,adresse,mdp} = req.body
        //validation et mise à jour
        if(nom) consommateur.nom = nom
        if(numTel) consommateur.numTel = numTel
        if(email) consommateur.email = email
        if(adresse) consommateur.adresse = adresse
        if(mdp) consommateur.mdp = mdp

        // Sauvgarder l'utilisateur
        await consommateur.save();
        res.status(200).send({
            success: true,
            message:'Utilisateur mis à jour',
        })
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Erreur dans la mise a jour du profil",
            error,
        });
        
    }
};


//modifier le MDP
export const updateMDPController = async (req, res) => {
    try {
        const consommateur = await consommateurModel.findById(req.user._id);
        if (!consommateur) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
        }

        const { oldMDP, newMDP } = req.body;

        if (!oldMDP || !newMDP) {
            return res.status(400).json({ success: false, message: "Veuillez fournir l'ancien et le nouveau mot de passe" });
        }

        const isMatch = await consommateur.comparePassword(oldMDP);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Ancien mot de passe invalide" });
        }

        consommateur.mdp = newMDP;
        await consommateur.save();

        res.status(200).json({ success: true, message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur lors de la mise à jour du mot de passe", error });
    }
};