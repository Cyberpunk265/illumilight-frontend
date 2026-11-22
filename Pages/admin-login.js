const { Client, Account } = Appwrite;

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6ae27aad00007b481204');

const account = new Account(client);

const form = document.getElementById('adminLoginForm');
const emailInput = document.getElementById('adminEmail');
const passInput = document.getElementById('adminPassword');
const btn = document.getElementById('adminLoginButton');
const msg = document.getElementById('loginMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  const password = passInput.value;

  btn.disabled = true;
  btn.textContent = 'Signing in...';
  msg.textContent = '';

  try {
    // 1. Try to logout old session first (avoids 401)
    try { await account.deleteSession('current'); } catch {}

    // 2. Direct Appwrite login - NO FUNCTION NEEDED
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();

    console.log("Logged in as:", user.email);

    // 3. Only allow your admin email
    if (user.email.toLowerCase() === 'pmtraders9@gmail.com') {
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminEmail', user.email);
      msg.textContent = 'Success! Redirecting...';
      window.location.href = 'admin-dashboard.html';
    } else {
      await account.deleteSession('current');
      throw new Error('This account is not an administrator.');
    }

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    msg.textContent = 'Administrator verification failed. ' + err.message;
    msg.style.color = '#ff6b6b';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In ↗';
  }
});