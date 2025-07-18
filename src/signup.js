import { showToast } from "./showToastify.js";
import { auth, firestore } from "./firebase.js";
import {
  doc,
  setDoc,
  getDocs,
  collection,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

let signupForm = document.querySelector("form");
signupForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  let emailInput = document.querySelector("#email");
  let passwordInput = document.querySelector("#password");
  let confirmInput = document.querySelector("#confirm-password");

  let email = emailInput.value.trim();
  let password = passwordInput.value.trim();
  let confirmPassword = confirmInput.value.trim();

  if (!email || !password || !confirmPassword) {
    showToast(
      "All fields are required",
      "linear-gradient(to right, #ff416c, #ff4b2b)"
    );

    return;
  }

  if (
    !email.match(/^[\w.-]+@[\w.-]+\.\w{2,10}$/) ||
    !password.match(/^(?=.*?[0-9])(?=.*?[A-Za-z]).{8,32}$/) ||
    password !== confirmPassword
  ) {
    showToast(
      "Wrong in email or password, please try again",
      "linear-gradient(to right, #ff416c, #ff4b2b)"
    );

    return;
  }

  try {
    const signedUpUserRef = collection(firestore, "users");
    const snapshot = await getDocs(signedUpUserRef);

    if (snapshot.size !== 0) {
      showToast(
        "Cannot Create another account, There is a registered account",
        "linear-gradient(to right, #ff416c, #ff4b2b)"
      );
      return;
    }

    let userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userId = userCredential.user.uid;
    const useRef = doc(firestore, "users", userId);

    await setDoc(useRef, {
      email: email,
      createdAt: new Date().toISOString(),
    });

    showToast(
      "Account Created Successfully",
      "linear-gradient(to right, #00b09b, #96c93d)"
    );

    setTimeout(() => {
      emailInput.value = "";
      passwordInput.value = "";
      confirmInput.value = "";
      window.location.href = "../pages/login.html";
    }, 500);
  } catch (error) {
    console.error("Failed To Signup: ", error.code);

    let message = "Signup failed, please try again.";

    if (error.code === "auth/email-already-in-use") {
      message = "This email is already registered.";
    } else if (error.code === "auth/invalid-email") {
      message = "Invalid email address.";
    } else if (error.code === "auth/weak-password") {
      message = "Password is too weak.";
    }

    showToast(message, "linear-gradient(to right, #ff416c, #ff4b2b)");
  }
});
