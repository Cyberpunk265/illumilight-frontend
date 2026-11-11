
const form = document.getElementById("membershipForm");
const steps = document.querySelectorAll(".form-step");

const nextButton = document.getElementById("nextButton");
const backButton = document.getElementById("backButton");
const submitButton = document.getElementById("submitButton");

const progressBar = document.getElementById("progressBar");
const stepLabel = document.getElementById("stepLabel");
const stepPercent = document.getElementById("stepPercent");

const reviewDetails = document.getElementById("reviewDetails");
const formMessage = document.getElementById("formMessage");

let currentStep = 0;

function showStep(index) {
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === index);
  });

  currentStep = index;

  const progress = ((index + 1) / steps.length) * 100;

  progressBar.style.width = `${progress}%`;
  stepLabel.textContent = `STEP ${index + 1} OF ${steps.length}`;
  stepPercent.textContent = `${progress}%`;

  backButton.disabled = index === 0;

  nextButton.hidden = index === steps.length - 1;
  submitButton.hidden = index !== steps.length - 1;

  formMessage.textContent = "";

  if (index === steps.length - 1) {
    createReview();
  }
}

function validateCurrentStep() {
  const fields = steps[currentStep].querySelectorAll(
    "input:not([type='checkbox']), select, textarea"
  );

  for (const field of fields) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }

  return true;
}

function createReview() {
  const fields = form.querySelectorAll(
    "input:not([type='checkbox']), select, textarea"
  );

  reviewDetails.innerHTML = "";

  fields.forEach(field => {
    const label = form.querySelector(`label[for="${field.id}"]`);

    if (!label || !field.value.trim()) return;

    const item = document.createElement("p");
    const title = document.createElement("strong");

    title.textContent = `${label.textContent.replace("*", "").trim()}: `;
    item.appendChild(title);
    item.appendChild(document.createTextNode(field.value));

    reviewDetails.appendChild(item);
  });
}

nextButton.addEventListener("click", () => {
  if (!validateCurrentStep()) return;

  if (currentStep < steps.length - 1) {
    showStep(currentStep + 1);
  }
});

backButton.addEventListener("click", () => {
  if (currentStep > 0) {
    showStep(currentStep - 1);
  }
});



form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!validateCurrentStep()) return;

  if (
    !document.getElementById("confirmAccuracy").checked ||
    !document.getElementById("agreeTerms").checked
  ) {
    formMessage.textContent = "Please accept both confirmations.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";
  formMessage.textContent = "";

  try {
    const getValue = id => {
      const field = document.getElementById(id);

      if (!field) {
        throw new Error("Form field not found: " + id);
      }

      return field.value.trim();
    };

    const application = {
      full_name: getValue("fullName"),
      email: getValue("email"),
      date_of_birth: getValue("dob"),
      nationality: getValue("nationality"),
      country: getValue("country"),
      city: getValue("city"),
      phone: getValue("phone"),
      whatsapp: getValue("whatsapp"),
      contact_method: getValue("contactMethod"),
      occupation: getValue("occupation"),
      reason: getValue("reason"),
      heard_about: getValue("heardAbout")
    };

    console.log("Submitting membership application:", application);

    const response = await fetch(
      "https://starter-function-2d0q.fra.appwrite.run/",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain"
        },
        body: JSON.stringify(application)
      }
    );

    const result = await response.json();

    formMessage.textContent =
      "Application submitted successfully! Reference: " +
      result.application_id;

    form.reset();

  } catch (error) {
    console.error("Membership submission error:", error);

    formMessage.textContent =
      "Unable to submit: " + error.message;

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit application ↗";
  }
});

showStep(0);
