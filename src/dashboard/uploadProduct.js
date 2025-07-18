import { showToast } from "../showToastify.js";
import { firestore } from "../firebase.js";
import {
  doc,
  setDoc,
  getDocs,
  collection,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

let loggedUser = JSON.parse(window.localStorage.getItem("user"));

if (!loggedUser) {
  window.location.href = "../../pages/login.html";
}

let menuBtn = document.querySelector(".fa-bars");
let menuNav = document.querySelector("nav");
let ul = document.querySelector("ul");

menuBtn.addEventListener("click", function () {
  menuNav.classList.add("show");
  ul.classList.add("show");

  menuNav.classList.remove("hide");
  ul.classList.remove("hide");

  // prevent scroll
  document.body.style.overflow = "hidden";
});

menuNav.addEventListener("click", function (e) {
  if (
    e.target === menuNav ||
    e.target === document.querySelector(".fa-xmark")
  ) {
    menuNav.classList.remove("show");
    ul.classList.remove("show");

    menuNav.classList.add("hide");
    ul.classList.add("hide");

    // allow scroll
    document.body.style.overflow = "auto";
  }
});

let list = document.querySelectorAll("nav ul li:not(:first-of-type)");
list.forEach((el) => {
  el.addEventListener("click", function () {
    if (el.children[1].textContent === "Upload Product") {
      menuNav.classList.remove("show");
      ul.classList.remove("show");

      menuNav.classList.add("hide");
      ul.classList.add("hide");

      // allow scroll
      document.body.style.overflow = "auto";
    } else if (el.children[1].textContent === "Manage Products") {
      window.location.href = "../../pages/dashboard/manageProducts.html";
    } else if (el.children[1].textContent === "Manage Categories") {
      window.location.href = "../../pages/dashboard/manageCategories.html";
    } else if (el.children[1].textContent === "Home Page") {
      window.location.href = "../../index.html";
    } else if (el.children[1].textContent === "Sign out") {
      window.localStorage.removeItem("user");
      window.location.href = "../../pages/login.html";
    }
  });
});

let productCategoriesDiv = document.getElementById("product-categories");
async function getCategories() {
  try {
    const useRef = collection(firestore, "categories");
    let querySnapshot = await getDocs(useRef);
    querySnapshot.forEach((doc) => {
      let selectOption = document.createElement("option");
      selectOption.value = doc.data().categoryName;
      selectOption.textContent = doc.data().categoryName;
      productCategoriesDiv.appendChild(selectOption);
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}
getCategories();

let confirmForm = document.querySelector("form");
confirmForm.addEventListener("submit", uploadAndValidateForm);

// Validate Upload Product Form, And Add Product To Firebase firestore
async function uploadAndValidateForm(e) {
  e.preventDefault();

  let productImageInput = document.getElementById("product-image");
  let productNameInput = document.getElementById("product-name");
  let productDescriptionInput = document.getElementById("product-description");
  let productPriceInput = document.getElementById("product-price");
  let productCategoriesInput = document.getElementById("product-categories");

  let productImage = productImageInput.value.trim();
  let productName = productNameInput.value.trim();
  let productDescription = productDescriptionInput.value.trim();
  let productPrice = parseInt(productPriceInput.value.trim());
  let productCategories = productCategoriesInput.value;

  if (
    !productImage ||
    !productName ||
    !productDescription ||
    !productPrice ||
    !productCategories
  ) {
    showToast(
      "All Fields Are Required",
      "linear-gradient(to right, #ff416c, #ff4b2b)"
    );
    return;
  }

  // Full name should be contain only characters and space
  if (!productName.match(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/)) {
    showToast(
      "Please, Enter Valid Product Name",
      "linear-gradient(to right, #ff416c, #ff4b2b)"
    );
    return;
  }

  if (productPrice <= 0) {
    showToast(
      "Please, Enter Valid Product Price (more then 0)",
      "linear-gradient(to right, #ff416c, #ff4b2b)"
    );
    return;
  }

  try {
    let useRef = doc(firestore, productCategories, productName);
    await setDoc(useRef, {
      productImage,
      productName,
      productDescription,
      productPrice,
    });

    showToast(
      "Upload Product Successfully",
      "linear-gradient(to right, #00b09b, #96c93d)"
    );

    productImageInput.value = "";
    productNameInput.value = "";
    productDescriptionInput.value = "";
    productPriceInput.value = "";
  } catch (error) {
    console.error("Failed to Upload Product" + error);
  }
}
