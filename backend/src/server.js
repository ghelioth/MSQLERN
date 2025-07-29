const express = require("express");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { checkUser, requireAuth } = require("./middleware/auth.middleware");
require("../config/db");
require("dotenv").config({ path: "./config/.env" });
const cors = require("cors");
const app = express();

// ------------------------ Middlewares ---------------------------
// cors
const corsOptions = {
  origin: process.env.CLIENT_URL,
  Credential: true,
  allowedHeaders: ["sessionId", "Content-Type"],
  exposedHeaders: ["sessionId"],
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  preflightContinue: false,
};
app.use(cors({ corsOptions }));
// app.use(express.json);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// jwt middleware
// verifie si l'utilisateur est connecté
app.use(checkUser);
// verifie si l'utilisateur qui se connecte a un token valide
app.get("/jwtid", requireAuth, (req, res) => {
  const [user] = res.locals.user;
  res.status(200).send(user.id);
});

// ------------------------ routes --------------------------------
// users routes
app.use("/api/user", userRoutes);
// posts routes
app.use("/api/post", postRoutes);
//  comments routes
app.use("/api/comment", commentRoutes);

// ------------------------ server --------------------------------
app.listen(process.env.PORT, () => {
  console.log("Listening on port " + process.env.PORT);
});

module.exports = app;
