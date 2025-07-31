module.exports.signUpErrors = (err) => {
  let errors = { pseudo: "", email: "" };

  const msg = err?.message || "";

  if (msg.includes("pseudo")) errors.pseudo = "Pseudo incorrect ou déjà pris";

  if (msg.includes("email")) errors.email = "Email déjà enrégistré";

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
