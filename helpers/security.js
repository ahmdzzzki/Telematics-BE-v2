var CryptoJS = require("crypto-js");

function encrypt(password) {
  // Encrypt
  var encriptText = CryptoJS.AES.encrypt(
    password,
    process.env.SECRET_KEY
  ).toString();

  return encriptText;
}

function decrypt(password) {
  var bytes = CryptoJS.AES.decrypt(password, process.env.SECRET_KEY);
  var decryptText = bytes.toString(CryptoJS.enc.Utf8);

  return decryptText;
}

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt,
};
