createBtn.addEventListener("click", async () => {
if (!localStorage.getItem("dappan_agreed")) {
    alert("Please agree to the terms first.");
    return;
}
  if (createBtn.disabled) return;

  createBtn.disabled = true;
  createBtn.innerText = "Launching...";

  const resultEl = document.getElementById("result");
  resultEl.innerHTML = "";

  try {
    // 1) Validate
    const name = document.getElementById("name").value.trim();
    const symbol = document.getElementById("ticker").value.trim();
    const description = document.getElementById("description").value.trim();
    const imageUrl = document.getElementById("imageUrl").value.trim();

    if (!name || !symbol || !imageUrl) {
      resultEl.innerHTML = "<p style='color:red'>Required fields missing</p>";
      return;
    }

    // 2) Privy login (once)
    if (!window.userSolanaAddress) {
      const user = await privy.login();
      const solWallet = user.wallets.find(w => w.chain === "solana");
      if (!solWallet) {
        resultEl.innerHTML = "<p style='color:red'>No Solana wallet found</p>";
        return;
      }
      window.userSolanaAddress = solWallet.address;
      document.getElementById("walletInfo").innerText =
        `Using wallet: ${window.userSolanaAddress.slice(0,6)}...${window.userSolanaAddress.slice(-4)}`;
    }

    // 3) Call backend
    const res = await fetch("http://localhost:3000/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, symbol, description, imageUrl }),
    });

    const json = await res.json();

    if (!json.success) {
      resultEl.innerHTML = `<pre style="color:red">${json.error}</pre>`;
      return;
    }

    // 4) Result
    resultEl.innerHTML = `
      <h3>✅ Token Created</h3>
      <code>${json.mint}</code>
      <p><a href="https://pump.fun/${json.mint}" target="_blank">View on pump.fun</a></p>
    `;

  } catch (e) {
    console.error(e);
    resultEl.innerHTML = "<p style='color:red'>Unexpected error</p>";
  } finally {
    createBtn.disabled = false;
    createBtn.innerText = "Launch your token on Pump.fun";
  }
});
// ===== Disclaimer gate =====
const modal = document.getElementById("termsModal");
const agreeCheck = document.getElementById("agreeCheck");
const agreeBtn = document.getElementById("agreeBtn");

if (!localStorage.getItem("dappan_agreed")) {
  modal.style.display = "block";
}

agreeCheck.addEventListener("change", () => {
  agreeBtn.disabled = !agreeCheck.checked;
});

agreeBtn.addEventListener("click", () => {
  localStorage.setItem("dappan_agreed", "yes");
  modal.style.display = "none";
});