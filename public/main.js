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

// ===== Wallet login =====
const loginBtn = document.getElementById("loginBtn");
const walletInfo = document.getElementById("walletInfo");

loginBtn.addEventListener("click", async () => {
  try {
    const user = await privy.login();
    const solWallet = user.wallets.find(w => w.chain === "solana");

    if (!solWallet) {
      alert("No Solana wallet found");
      return;
    }

    window.userSolanaAddress = solWallet.address;
    walletInfo.innerText =
      `Connected: ${solWallet.address.slice(0,6)}...${solWallet.address.slice(-4)}`;

    loginBtn.innerText = "Wallet connected";
    loginBtn.disabled = true;
  } catch (e) {
    console.error(e);
    alert("Wallet login failed");
  }
});

// ===== Create token =====
createBtn.addEventListener("click", async () => {
  // ① Disclaimer
  if (!localStorage.getItem("dappan_agreed")) {
    modal.style.display = "block";
    return;
  }

  // ② Wallet
  if (!window.userSolanaAddress) {
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