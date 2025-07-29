const mysql = require("mysql2/promise");
require("dotenv").config({ path: "./config/.env" });

const userTable = `CREATE TABLE IF NOT EXISTS users (
id INT AUTO_INCREMENT PRIMARY KEY,
pseudo VARCHAR(55) NOT NULL UNIQUE,
email VARCHAR(255) NOT NULL UNIQUE,
password VARCHAR(1024) NOT NULL,
picture VARCHAR(255) DEFAULT '',
bio TEXT,
followers JSON,
following JSON,
postLiked JSON,
commentLiked JSON,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);`;

const postTable = `CREATE TABLE IF NOT EXISTS posts (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
message VARCHAR(255) NULL,
picture VARCHAR(255) NULL,
video VARCHAR(255) NULL,
likers JSON,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);`;

const commentTable = `CREATE TABLE IF NOT EXISTS comments (
id INT AUTO_INCREMENT PRIMARY KEY,
message VARCHAR(255) NULL,
likers JSON,
user_id INT NOT NULL,
post_id INT NOT NULL,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);`;

async function setupDatabase() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST_NAME,
      user: process.env.USER_ROOT,
      password: process.env.ROOT_PASSWORD,
      multipleStatements: true,
    });

    // Création de la base de données si elle n'existe pas
    db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE_NAME}`);

    // Création de l'utilisateur si besoin
    db.query(
      `CREATE USER IF NOT EXISTS '${process.env.DB_USER_NAME}'@'${process.env.DB_HOST_NAME}' IDENTIFIED BY '${process.env.DB_PASSWORD}'`
    );

    // Accorder les droits
    db.query(
      `GRANT ALL PRIVILEGES ON ${process.env.DB_DATABASE_NAME}.* TO '${process.env.DB_USER_NAME}'@'${process.env.DB_HOST_NAME}'`
    );
    db.query(`FLUSH PRIVILEGES`);

    // Créer la table en se connectant directement à la bonne base
    db.changeUser({ database: process.env.DB_DATABASE_NAME });
    db.query(userTable);
    db.query(postTable);
    db.query(commentTable);
    console.log(
      "Les tables 'users', 'posts' et 'comments' ont été créées avec succès."
    );
    await db.end();
  } catch (err) {
    console.error("Erreur lors de la creation de la table :", err);
  }
}

setupDatabase();
