const { contextBridge } = require('electron');
const { authenticator } = require('otplib');
const csvp = require('papaparse');
let token;
contextBridge.exposeInMainWorld('api', {
  generateKeyOtp: () => {
    const secret = authenticator.generateSecret();
    console.log('secret:', secret);
    //const accountName = 'user@example.com';
    const accountName = 'pre-alpha-user';
    const issuer = 'AppC';
    const otpauthURI = authenticator.keyuri(accountName, issuer, secret);
    const secrets = [secret, otpauthURI];
    return secrets;
  },
  checkOtp: (keys) => {
    token = authenticator.generate(keys[1]);
    //console.log('tokenMatch:', token);
    let isValid = authenticator.check(keys[0],keys[1]);
    console.log('isValid:', isValid);
  },
  csv: csvp,
});