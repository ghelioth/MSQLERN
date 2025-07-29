const userModel = require("../models/user.model");
const fs = require("fs");
const { uploadErrors } = require("../utilities/error.utility");

module.exports.uploadProfil = async (req, res) => {
  try {
    const allowedMimeTypes = ["image/jpg", "image/png", "image/jpeg"];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new Error("Invalid file");
    }

    if (req.file.size > 500000) {
      throw Error("Max size");
    }
  } catch (err) {
    const errors = uploadErrors(err);
    return res.status(400).json({ errors });
  }

  //   on recupère l'image passé dans le body et on l'enregistre dans le dossier profil
  const fileName = req.body.name + ".jpg";
  const filePath = `${__dirname}/../client/public/uploads/profil/${fileName}`;
  await fs.promises.writeFile(filePath, req.file.buffer);

  //   on enrégistre dans la base de données l'image de profil
  try {
    const picture = "./uploads/profil/" + fileName;
    await userModel.upload(req.body.user_id, picture);
    res.status(200).json({
      message: "upload succes",
    });
  } catch (err) {
    return res.status(400).send({ message: err });
  }
};
