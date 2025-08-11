module.exports.signUpErrors = (err) => {
  let errors = { pseudo: "", email: "" };

  const msg = err?.message || "";

  if (msg.includes("pseudo")) errors.pseudo = "Pseudo incorrect ou déjà pris";

  if (msg.includes("email")) errors.email = "Email déjà enrégistré";

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
