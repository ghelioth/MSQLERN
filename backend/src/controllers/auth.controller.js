const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const { crypt, trim, isEmail } = require("../utilities/user.utility");
const { createToken } = require("../utilities/auth.utility");
const { signUpErrors } = require("../utilities/error.utility");

module.exports.signUp = async (req, res) => {
  if (req.body === undefined) {
    return res.status(400).json({ message: "Champs requis" });
  } else {
    const { pseudo, email, password } = req.body;
    // on supprime les espaces contenus dans le pseudo avec la fonction trim()
    const trimPseudo = await trim(pseudo);
    // if (!trimPseudo)
    //   return res.status(400).json({ message: "Pseudo invalide" });
    if (trimPseudo.error)
      return res.status(400).json({ message: trimPseudo.error });

    // on verifie le format de l'email avec isEmail()
    const valideEmail = await isEmail(email);
    if (valideEmail.error)
      return res.status(400).json({ message: valideEmail.error });

    // on hash le mot de passe afin de le sécuriser avant de le stocker dans la bd
    const hashPassword = await crypt(password);
    console.log(await crypt(password));
    if (hashPassword.error)
      return res.status(400).json({ message: hashPassword.error });

    // on crée notre utilisateur par la suite
    try {
      const user = await userModel.createUser(
        trimPseudo,
        valideEmail,
        hashPassword
      );
      res.status(200).json({ user_id: user.insertId, message: "créé" });
    } catch (err) {
      const errors = signUpErrors(err);
      res.status(400).send({ errors });
    }
  }
};

module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    // on recupère l'utilisateur
    const [user] = await userModel.login(email);

    if (!user) {
      return res.status(200).json({ error: "Email inconnu" });
    }

    // on vérifie le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(200).json({ error: "Mot de passe incorrect" });
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
    return res.status(200).json(err);
  }
};

module.exports.logout = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
