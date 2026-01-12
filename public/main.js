// ===== Phantom / Solana wallet connect =====
let userSolanaAddress = null;

const loginBtn = document.getElementById("loginBtn");
const walletInfo = document.getElementById("walletInfo");

function getProvider() {
  // Phantom injects window.solana
  if ("solana" in window) {
    const provider = window.solana;
    if (provider?.isPhantom) return provider;
  }
  return null;
}

async function connectWallet() {
  const provider = getProvider();

  if (!provider) {
    // Phantom not installed
    window.open("https://phantom.app/", "_blank");
    throw new Error("Phantom not found");
  }

  // Request connect (shows Phantom popup)
  const resp = await provider.connect();
  // resp.publicKey is a PublicKey-like object with toString()
  userSolanaAddress = resp.publicKey.toString();

  walletInfo.innerText =
    `Connected: ${userSolanaAddress.slice(0, 6)}...${userSolanaAddress.slice(-4)}`;

  loginBtn.innerText = "Wallet connected";
  loginBtn.disabled = true;

  return userSolanaAddress;
}

// If user already connected previously, Phantom may auto-reconnect
window.addEventListener("load", async () => {
  try {
    const provider = getProvider();
    if (!provider) return;

    // Only connect if already trusted (no popup)
    const resp = await provider.connect({ onlyIfTrusted: true });
    userSolanaAddress = resp.publicKey.toString();

    walletInfo.innerText =
      `Connected: ${userSolanaAddress.slice(0, 6)}...${userSolanaAddress.slice(-4)}`;
    loginBtn.innerText = "Wallet connected";
    loginBtn.disabled = true;
  } catch {
    // ignore (not trusted yet)
  }
});

loginBtn.addEventListener("click", async () => {
  try {
    await connectWallet();
  } catch (e) {
    console.error(e);
    alert("Wallet connect failed");
  }
});

// let privy = null;
// let userSolanaAddress = null;

// const loginBtn = document.getElementById("loginBtn");
// loginBtn.disabled = true; // first break

// window.addEventListener("DOMContentLoaded", () => {
//   if (!window.Privy) {
//     console.error("Privy SDK not loaded");
//     return;
//   }

//   privy = new Privy({
//     appId: "cmkafa3gk007pih0cb1huef0c",
//   });

//   console.log("Privy initialized");
//   loginBtn.disabled = false; // ← when ready
// });


// // ===== Wallet login =====
// const loginBtn = document.getElementById("loginBtn");
// const walletInfo = document.getElementById("walletInfo");

// loginBtn.addEventListener("click", async () => {
//   if (!privy) {
//     alert("Wallet system not ready yet");

//     return;
//   }

//   try {
//     const user = await privy.login();
//     const solWallet = user.wallets.find(w => w.chain === "solana");

//     if (!solWallet) {
//       alert("No Solana wallet found");
//       return;
//     }

//     userSolanaAddress = solWallet.address;

//     walletInfo.innerText =
//       `Connected: ${userSolanaAddress.slice(0,6)}...${userSolanaAddress.slice(-4)}`;

//     loginBtn.innerText = "Wallet connected";
//     loginBtn.disabled = true;
//   } catch (e) {
//     console.error(e);
//     alert("Wallet login failed");
//   }
// });

// ===== Disclaimer gate =====
const modal = document.getElementById("termsModal");
const agreeCheck = document.getElementById("agreeCheck");
const agreeBtn = document.getElementById("agreeBtn");

agreeCheck.addEventListener("change", () => {
  agreeBtn.disabled = !agreeCheck.checked;
});

agreeBtn.addEventListener("click", () => {
  localStorage.setItem("dappan_agreed", "yes");
  modal.style.display = "none";
});

// ===== Create token =====
const createBtn = document.getElementById("createBtn");
createBtn.addEventListener("click", async () => {
  // ① Disclaimer
  if (!localStorage.getItem("dappan_agreed")) {
    modal.style.display = "block";
    return;
  }

  // ② Wallet
  if (!userSolanaAddress) {
    alert("Please connect wallet first");
    return;
  }

  if (createBtn.disabled) return;
createBtn.disabled = true;
createBtn.innerText = "Launching...";

const resultEl = document.getElementById("result");
resultEl.innerHTML = "";

try {
  const name = document.getElementById("name").value.trim();
  const symbol = document.getElementById("ticker").value.trim();
  const description = document.getElementById("description").value.trim();
  const imageUrl = document.getElementById("imageUrl").value.trim();

  if (!name || !symbol || !imageUrl) {
    resultEl.innerHTML = "<p style='color:red'>Required fields missing</p>";
    return;
  }

  const res = await fetch("https://api.dappan.fun/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, symbol, description, imageUrl }),
  });

  const json = await res.json();
  if (!json.success) {
    resultEl.innerHTML = `<pre style="color:red">${json.error}</pre>`;
    return;
  }

  resultEl.innerHTML = `
      <h3>✅ Token Created</h3>
      <code>${json.mint}</code>
      <p>
        <a href="https://pump.fun/${json.mint}" target="_blank">
          View on pump.fun
        </a>
      </p>
    `;
} catch (e) {
  console.error(e);
  resultEl.innerHTML = "<p style='color:red'>Unexpected error</p>";
} finally {
  createBtn.disabled = false;
  createBtn.innerText = "Launch your token on Pump.fun";
}
});