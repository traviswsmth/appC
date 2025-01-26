async function digestMessage(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return hash;
}
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
  return window.btoa(binary);
}
async function digestMessageHex(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
function getFromLocalStorage(key) {
  const value = localStorage.getItem(key);
  return value && value !== "";
}
function saveToLocalStorage(key, value) {
  localStorage.setItem(key, value);
}
function handleBlurEffect(element) {
  element.addEventListener('mouseover', () => {
    element.style.filter = 'blur(0px)';
  });
  element.addEventListener('mouseleave', () => {
    element.style.filter = 'blur(2px)';
  });
}
function genQR(dataQR)  {
  const typeNumber = 0;
  const errorCorrectionLevel = 'L';
  const qr = qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(dataQR);
  qr.make();
  qrCode.innerHTML = qr.createImgTag();
  setTimeout(hideQRCode, 60000);
  setTimeout(hideSecret, 60000);
}
function hideQRCode() {
  qrCode.style.display = 'none';
}
function hideSecret() {
  secretCode.style.display = 'none';
}
function enterHome()  {
  setTimeout(window.location.replace("../index.html"), 2000);
}