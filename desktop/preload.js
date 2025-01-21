const { contextBridge } = require('electron');
const { authenticator } = require('otplib');
const csvp = require('papaparse');
let token;
let keys;
contextBridge.exposeInMainWorld('api', {
  generateKeyOtp: () => {
    const secret = authenticator.generateSecret();
    console.log('secret:', secret);
    //token = authenticator.generate(secret);
    //console.log('token:', token);
    return secret;
    //const isValid = authenticator.check(token, secret);
    //console.log('isValid:', isValid);
  },
  checkOtp: (keys) => {
    token = authenticator.generate(keys[1]);
    console.log('tokenMatch:', token);
    const isValid = authenticator.check(keys[0],keys[1]);
    console.log('isValid:', isValid);
  },
  csv: csvp,
});