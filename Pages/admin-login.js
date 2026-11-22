const client = new Appwrite.Client();
client
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("6ae27aad00007b481204");

const account = new Appwrite.Account(client);

const loginForm = document.getElementById("adminLoginForm");
const loginButton = document.getElementById("adminLoginButton");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginButton.disabled = true;
  loginButton.textContent = "Verifying...";
  loginMessage.textContent = "";

  try {
    const email = document.getElementById("adminEmail").value.trim().toLowerCase();
    const password = document.getElementById("adminPassword").value;

    try { await account.deleteSession('current'); } catch {}

    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    console.log("Logged in as:", user.email);

    const allowedAdmins = ['pmtraders9@gmail.com', 'pmtraders96@gmail.com'];

    if (!allowedAdmins.includes(user.email.toLowerCase())) {
      await account.deleteSession('current');
      throw new Error("This account is not an administrator.");
    }

    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminEmail', user.email);
    loginMessage.textContent = "Administrator verified! Redirecting...";
    loginMessage.style.color = "#4ade80";

    window.location.href = "admin-dashboard.html";

  } catch (error) {
    console.error("Admin verification error:", error);
    loginMessage.textContent = error.message || "Sign-in or administrator verification failed.";
    loginMessage.style.color = "#ff6b6b";
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign In ↗";
  }
});