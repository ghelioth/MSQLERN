const bcrypt = require("bcrypt");
const validator = require("validator");
const db = require("../../config/db");

module.exports.trim = async (pseudo) => {
  if (typeof pseudo !== "string") {
    return { error: "Le pseudo doit être une chaine de caractères." };
  }

  const trimPseudo = pseudo.trim();

  if (trimPseudo.length < 4) {
    return { error: "pseudo trop court : Minimum 4 caractères" };
  }

  if (trimPseudo.length > 55) {
    return { error: "pseudo trop long : Maximum 55 caractères" };
  }

  return trimPseudo;
};

module.exports.isEmail = async (email) => {
  const trimEmail = email.toLowerCase().trim();
  // console.log(trimEmail);
  if (!validator.isEmail(trimEmail)) {
    return { error: "Entrez une adresse email valide" };
  } else return trimEmail;
};

module.exports.crypt = async (password) => {
  if (password.length <= 5) {
    return { error: "mot de passe trop court, minimum 6 caractères" };
  } else {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    return hashPassword;
  }
};

// Cette fonction permet de mettre à jour les listes
// followers et following avant de les stocker dans la bd
module.exports.addOneFollowing = async (id, idToFollow) => {
  const [actualList] = await db
    .promise()
    .query("SELECT following FROM users WHERE id = ?", [id]);
  let tempList = [];

  if (actualList[0]) {
    let following = actualList[0].following;
    if (!following) {
      tempList = [];
    } else if (typeof following === "string") {
      tempList = JSON.parse(following);
    } else {
      tempList = following;
    }
  }
  if (!tempList.includes(idToFollow)) {
    tempList.push(idToFollow);
  }
  return tempList;
};

module.exports.addOneFollower = async (idToFollow, id) => {
  const [actualList] = await db
    .promise()
    .query("SELECT followers FROM users WHERE id = ?", [idToFollow]);
  let tempList = [];

  if (actualList[0]) {
    let followers = actualList[0].followers;
    if (!followers) {
      tempList = [];
    } else if (typeof followers === "string") {
      tempList = JSON.parse(followers);
    } else {
      tempList = followers;
    }
  }
  if (!tempList.includes(id)) {
    tempList.push(id);
  }
  return tempList;
};

module.exports.deleteOneFollowing = async (id, idToUnFollow) => {
  const [actualList] = await db
    .promise()
    .query("SELECT following FROM users WHERE id = ?", [id]);
  let tempList = [];

  if (actualList[0]) {
    let following = actualList[0].following;
    if (!following) {
      tempList = [];
    } else if (typeof following === "string") {
      tempList = JSON.parse(following);
    } else {
      tempList = following;
    }
  }
  // en commentaire ce que j'ai fait mdrrr et qui marche bien
  // if (tempList.includes(idToUnFollow)) {
  //   for (let i = 0; i < tempList.length; i++) {
  //     if (tempList[i] !== idToUnFollow) {
  //       FollowingList.push(tempList[i]);
  //       console.log("FollowingList : " + FollowingList);
  //     }
  //   }
  // }
  // version corrigée avec chatgpt plus optimisée
  const FollowingList = tempList.filter((item) => item != idToUnFollow);
  return FollowingList;
};

module.exports.deleteOneFollower = async (idToUnFollow, id) => {
  const [actualList] = await db
    .promise()
    .query("SELECT followers FROM users WHERE id = ?", [idToUnFollow]);
  let tempList = [];

  if (actualList[0]) {
    let followers = actualList[0].followers;
    if (!followers) {
      tempList = [];
    } else if (typeof followers === "string") {
      tempList = JSON.parse(followers);
    } else {
      tempList = followers;
    }
  }

  // en commentaire ce que j'ai fait mdrrr et qui marche bien
  // if (tempList.includes(id)) {
  //   for (let i = 0; i < tempList.length; i++) {
  //     if (tempList[i] !== id) {
  //       FollowersList.push(tempList[i]);
  //     }
  //   }
  // version corrigée avec chatgpt plus optimisée
  const FollowersList = tempList.filter((item) => item != id);
  return FollowersList;
};
