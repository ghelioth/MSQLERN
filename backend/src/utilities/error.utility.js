module.exports.signUpErrors = (err) => {
  let errors = { pseudo: "", email: "" };

  const msg = err?.message || "";

  if (msg.includes("pseudo")) errors.pseudo = "Pseudo incorrect ou déjà pris";

  if (msg.includes("email")) errors.email = "Email déjà enrégistré";

  return errors;
};

module.exports.uploadErrors = (err) => {
  let errors = { format: "", maxSize: "" };

  const msg = err?.message || "";
  if (msg.includes("Invalid file")) errors.format = "Format incompatible";
  if (msg.includes("Max size")) errors.maxSize = "Le fichier dépasse 500ko";

  return errors;
};
