
const client = new Appwrite.Client();

client
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("6ae27aad00007b481204");

const account = new Appwrite.Account(client);
const functions = new Appwrite.Functions(client);
async function loadApplications() {
  const jwtResponse = await account.createJWT();

  const execution = await functions.createExecution(
    "verify-admin",
    JSON.stringify({
      jwt: jwtResponse.jwt,
      action: "get_applications"
    }),
    false,
    "/",
    "POST"
  );

  const result = JSON.parse(execution.responseBody || "{}");

  if (
    execution.responseStatusCode < 200 ||
    execution.responseStatusCode >= 300 ||
    !result.success
  ) {
    throw new Error(result.message || "Could not load applications.");
  }

  console.log("Membership applications:", result.applications);

  statusMessage.textContent =
    `Applications loaded: ${result.applications.length}`;
}

const loginForm = document.getElementById("adminLoginForm");
const loginButton = document.getElementById("adminLoginButton");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginButton.disabled = true;
  loginButton.textContent = "Verifying...";
  loginMessage.textContent = "";

  try {
    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;

    try {
  await account.getSession("current");
} catch (sessionError) {
  await account.createEmailPasswordSession(email, password);
}

    const jwtResponse = await account.createJWT();
const execution = await functions.createExecution(
  "verify-admin",
  JSON.stringify({
    jwt: jwtResponse.jwt,
  }),
  false,
  "/",
  "POST"
);

const result = JSON.parse(execution.responseBody || "{}");

if (execution.responseStatusCode < 200 ||
    execution.responseStatusCode >= 300 ||
    !result.success) {
  throw new Error(
    result.message || "Administrator verification failed."
  );
}

    loginMessage.textContent = "Administrator verified! Redirecting...";

    window.location.href = "admin-dashboard.html";

  } catch (error) {
    console.error("Admin verification error:", error);
    loginMessage.textContent =
      error.message || "Sign-in or administrator verification failed.";
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign In ↗";
  }
});
