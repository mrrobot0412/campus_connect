const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

module.exports = {
  MONGOURI: process.env.MONGOURI,
  PORT: process.env.PORT,
  JWT_SECRET:process.env.JWT_SECRET,

};
