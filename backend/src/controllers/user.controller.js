const userModel = require("../models/user.model");
const {
  addOneFollowing,
  addOneFollower,
  deleteOneFollowing,
  deleteOneFollower,
} = require("../utilities/user.utility");

// controller renvoyant la liste de tous les utilisateurs
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUser();

    res.status(200).json({
      message: "Voici la liste de tous les utilisateurs",
      users: users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// controller renvoyant les informations d'un utilisateur
module.exports.userInfo = async (req, res) => {
  try {
    const [user] = await userModel.getUserById(req.params.id);

    res.status(200).json({
      message: "Voici l'utilisateur demandé",
      user: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// controller permettant de modifier soit le pseudo soit la bio d'un utilisateur
module.exports.updateUser = async (req, res) => {
  const updates = [];
  const values = [];
  try {
    // on verifie la clé contenue dans le body
    // une fois que la vérification est faite et selon la clé
    // contenue dans le body, l'une des conditions s'exécute puis
    // les tableaux updates et values sont mis à jour
    if ("pseudo" in req.body) {
      updates.push(`pseudo =?`);
      values.push(req.body.pseudo);
    } else if ("bio" in req.body) {
      updates.push(`bio = ?`);
      values.push(req.body.bio);
    } else {
      return res
        .status(200)
        .json({ messaage: "Impossible de modifier ce champ" });
    }
    // ensuite on fait appelle au userModel.updateUser
    // à qui on passe en parametre l'id et les tableaux
    // updates et values
    await userModel.updateUser(req.params.id, updates, values);
    res.status(200).json({
      message: "updated",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// controller permettant de supprimer un utilisateur
module.exports.deleteUser = async (req, res) => {
  try {
    await userModel.deleteUser(req.params.id);
    res.status(200).json({
      message: "Deleted",
      user: req.params.id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.follow = async (req, res) => {
  try {
    const tempListFollowing = await addOneFollowing(
      req.params.id,
      req.body.idToFollow
    );

    await userModel.following(req.params.id, tempListFollowing);
    res.status(200).json({
      message: "follow",
    });

    const tempListFollowers = await addOneFollower(
      req.body.idToFollow,
      req.params.id
    );

    await userModel.followers(tempListFollowers, req.body.idToFollow);
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.error(err);
  }
};

module.exports.unfollow = async (req, res) => {
  try {
    const tempListFollowing = await deleteOneFollowing(
      req.params.id,
      req.body.idToUnFollow
    );

    await userModel.following(req.params.id, tempListFollowing);
    res.status(200).json({
      message: "unfollow",
    });

    const tempListFollowers = await deleteOneFollower(
      req.body.idToUnFollow,
      req.params.id
    );

    await userModel.followers(tempListFollowers, req.body.idToUnFollow);
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.error(err);
  }
};
