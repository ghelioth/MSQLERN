module.exports.signUpErrors = (err) => {
  let errors = { pseudo: "", email: "", password: "" };

  const msg = err?.message || "";

  if (msg.includes("pseudo"))
    errors.pseudo =
      "Pseudo incorrect ou déjà pris, doit faire 5 caractères minimum";

  if (msg.includes("email"))
    errors.email = "Email incorrect ou déjà enrégistré";

  if (msg.includes("password"))
    errors.password = "Le mot de passe doit faire 6 caractères munimum";

  return errors;
};

module.exports.signInErrors = (err) => {
  let errors = { password: "", email: "" };

  const msg = err?.message || "";

  if (msg.includes("password")) errors.password = "Mot de passe incorrect";

  if (msg.includes("email")) errors.email = "Email inconnu";

  return errors;
};

module.exports.uploadErrors = (err) => {
  let errors = { format: "", maxSize: "" };

  const msg = err?.message || "";
  if (msg.includes("Invalid file")) errors.format = "Format incompatible";
  if (msg.includes("Max size")) errors.maxSize = "Le fichier dépasse 500ko";

  return errors;
};
