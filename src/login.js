import { showToast } from "./showToastify.js";
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

if (JSON.parse(window.localStorage.getItem("user"))) {
  window.location.href = "../pages/dashboard/uploadProduct.html";
}

let loginForm = document.querySelector("form");
let emailInput = document.querySelector("#email");
let passwordInput = document.querySelector("#password");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  let email = emailInput.value.trim();
  let password = passwordInput.value.trim();

  if (!email || !password) {
    showToast(
      "All fields are required",
      "linear-gradient(to right, #ff416c, #ff4b2b)"
    );
    return;
  }

  if (
    !email.match(/^[\w.-]+@[\w.-]+\.\w{2,10}$/) ||
    !password.match(/^(?=.*?[0-9])(?=.*?[A-Za-z]).{8,32}$/)
  ) {
    showToast(
      "Email or password are wrong, please login again",
      "linear-gradient(to right, #ff416c, #ff4b2b)"
    );
    return;
  }

  try {
    let userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    window.localStorage.setItem(
      "user",
      JSON.stringify({ email: userCredential.user.email })
    );

    showToast(
      "Login Successfully",
      "linear-gradient(to right, #00b09b, #96c93d)"
    );

    setTimeout(() => {
      emailInput.value = "";
      passwordInput.value = "";
      window.location.href = "../pages/dashboard/uploadProduct.html";
    }, 500);
  } catch (error) {
    console.error(error);
    showToast(
      "Login failed: " + error.message,
      "linear-gradient(to right, #ff416c, #ff4b2b)"
    );
  }
});
