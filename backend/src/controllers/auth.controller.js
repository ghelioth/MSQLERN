const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const { crypt, trim, isEmail } = require("../utilities/user.utility");
const { createToken } = require("../utilities/auth.utility");
const { signUpErrors, signInErrors } = require("../utilities/error.utility");

module.exports.signUp = async (req, res) => {
  if (!req.body) {
    return res.status(200).json({ message: "Champs requis" });
  }

  try {
    const { pseudo, email, password } = req.body;
    // on supprime les espaces contenus dans le pseudo avec la fonction trim()
    const trimPseudo = await trim(pseudo);
    // if (!trimPseudo)
    //   return res.status(400).json({ message: "Pseudo invalide" });
    if (trimPseudo.error) throw new Error(trimPseudo.error);

    // on verifie le format de l'email avec isEmail()
    const valideEmail = await isEmail(email);
    if (valideEmail.error) throw new Error(valideEmail.error);

    // on hash le mot de passe afin de le sécuriser avant de le stocker dans la bd
    const hashPassword = await crypt(password);
    if (hashPassword.error) throw new Error(hashPassword.error);

    const user = await userModel.createUser(
      trimPseudo,
      valideEmail,
      hashPassword
    );

    if (user && user.error) {
      throw new Error(user.error);
    }

    res.status(201).json({ user_id: user.insertId, message: "créé" });
  } catch (err) {
    const errors = signUpErrors(err);
    return res.status(200).json({ errors: errors });
  }
};

module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    // on recupère l'utilisateur
    const [user] = await userModel.login(email);

    if (!user) {
      throw new Error("email inconnu");
    }

    // on vérifie le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("incorrect password");
    }

    // création du token
    const token = createToken(user.id);

    // on renvoie le token en cookie sécurisé
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ user: user.id });
  } catch (err) {
    const errors = signInErrors(err);
    return res.status(200).json({ errors: errors });
  }
};

module.exports.logout = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
