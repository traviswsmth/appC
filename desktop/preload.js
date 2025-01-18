const { contextBridge } = require('electron');
const { authenticator } = require('otplib');

contextBridge.exposeInMainWorld('api', {
  otp: () => {
    const secret = authenticator.generateSecret();
    console.log('secret:', secret);

    const token = authenticator.generate(secret);
    console.log('token:', token);

    const isValid = authenticator.check(token, secret);
    console.log('isValid:', isValid);
  },
});
