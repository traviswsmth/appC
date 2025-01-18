const { contextBridge } = require('electron');
const { authenticator } = require('otplib');
let token;
let keys;
contextBridge.exposeInMainWorld('api', {
  otp: () => {
    const secret = authenticator.generateSecret();
    console.log('secret:', secret);

    //token = authenticator.generate(secret);
    //console.log('token:', token);
    keys = [secret]//,token]
    return keys;
    //const isValid = authenticator.check(token, secret);
    //console.log('isValid:', isValid);
  },
  checkOtp: (keys) => {
    token = authenticator.generate(keys[0]);
    console.log('token:', token);
    keys = [keys[0],token]
    const isValid = authenticator.check(token,keys[0]);
    console.log('isValid:', isValid);
}
});