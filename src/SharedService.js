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
    const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""); // convert bytes to hex string
    return hashHex;
  }