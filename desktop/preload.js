const { contextBridge } = require('electron');
const { authenticator } = require('otplib');
const csvp = require('./src/lib/papaparse');
contextBridge.exposeInMainWorld('api', {
  generateKeyOtp: () => {
    const secret = authenticator.generateSecret();
    console.log('secret:', secret);
    const accountName = 'pre-alpha-user';
    const issuer = 'AppC';
    const otpauthURI = authenticator.keyuri(accountName, issuer, secret);
    const secrets = [secret, otpauthURI];
    return secrets;
  },
  checkOtp: (keys) => {
    let isValid = authenticator.check(keys[0],keys[1]);
    console.log('isValid:', isValid);
  },
  csv: csvp,
});