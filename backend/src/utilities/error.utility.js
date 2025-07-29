module.exports.signUpErrors = (err) => {
  let errors = { pseudo: "", email: "", password: "" };

  if (err.message.includes("pseudo"))
    errors.pseudo = "Pseudo incorrect ou déjà pris";

  if (err.message.includes("email")) errors.email = "Email déjà enrégistré";

  if (err.message.includes("password"))
    errors.password = "Le mot de passe doit avoir minimum 6 caractères ";

  return errors;
};

module.exports.uploadErrors = (err) => {
  let errors = { format: "", maxSize: "" };
  if (err.message.includes("Invalid file"))
    errors.format = "Format incompatible";
  if (err.message.includes("Max size"))
    errors.maxSize = "Le fichier dépasse 500ko";

  return errors;
};
