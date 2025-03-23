const excludedChains = ["Moonbeam", "Kava", "Polynomial", "Core",
  "Flare", "Neutron", "Gnosis", "Rootstock", "Bifrost Network",
  "Bsquared", "Moonriver", "IOTA EVM", "Cardano", "Sui",
  "Solana", //"Linea", "zkSync Era", "Sonic",
  "Stellar", "Blast", "Polygon", "Optimism", //"Ethereum",
  "MultiversX", "Fraxtal", "Avalanche",
  "Cronos_zkevm", "Nolus", "Neon", "Starknet", "Osmosis", "Kujira"];
const excludedPlatforms = ['bagful', 'psyoptions', 'yel-finance', 'goldlink', 'deltaprime'];
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
function getFromLS(key) {
  const value = localStorage.getItem(key);
  return value && value !== "";
}
function saveToLS(key, value) {
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
function enterHome() {
  setTimeout(() => {
    window.location.replace("../index.html")
  }, 1000);
}
function loadPage(page){
  link = page.concat(".html");
  setTimeout(window.location.replace(link)
  , 2000);
}
function confirmDeleteSecret() {
  let conf = null;
  if (confirm("~WARNING~\nDelete and generate new OTP QR code?")) {
    txtDelOtp = "deleteotp";
    window.sessionStorage.setItem(txtDelOtp,'true');
    if (confirm("~CONFIRM~\nConfirm delete and generate new OTP QR code")) {
      conf = "confirmDelete";
      window.localStorage.removeItem('secretl');
      window.sessionStorage.setItem(conf,'true');
    } else {
      conf = "notConfirm";
    }
  } else {
    txtDelOtp = "notdeleteotp";
  }      
  console.log(txtDelOtp);
  if(conf)
    console.log(conf);
}
