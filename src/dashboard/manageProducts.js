import { showToast } from "../showToastify.js";
import { firestore } from "../firebase.js";
import {
  getDocs,
  collection,
  doc,
  deleteDoc,
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
    if (el.children[1].textContent === "Upload Products") {
      window.location.href = "../../pages/dashboard/uploadProduct.html";
    } else if (el.children[1].textContent === "Manage Products") {
      menuNav.classList.remove("show");
      ul.classList.remove("show");

      menuNav.classList.add("hide");
      ul.classList.add("hide");

      // allow scroll
      document.body.style.overflow = "auto";
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

let mainDiv = document.querySelector("main");

async function getCategories() {
  try {
    const useRef = collection(firestore, "categories");
    let querySnapshot = await getDocs(useRef);
    querySnapshot.forEach((doc) => {
      getData(doc.data());
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}
getCategories();

async function getData(categoryDoc) {
  document.getElementById("loading").style.display = "block";
  try {
    const querySnapshot = await getDocs(
      collection(firestore, categoryDoc.categoryName)
    );
    if (querySnapshot.size > 0) {
      querySnapshot.forEach((doc) => {
        createProductDiv(doc.data(), categoryDoc.categoryName);
      });
    } else if (querySnapshot.size > 0 && mainDiv.innerHTML === "") {
      mainDiv.innerHTML = `<p class="empty-products">You Have Not Added Any Product</p>`;
    }
  } catch (error) {
    console.error("Failed To Fetch Data: ", error);
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

function createProductDiv(productInfo, productCollection) {
  let product = document.createElement("div");
  product.className = "product-div";
  product.innerHTML = `
      <div class="product-image" style="background-image: url(${productInfo.productImage});"></div>
      <div class="details">
        <div class="name-and-trash">
          <p>${productInfo.productName}</p>
          <i class="fa-solid fa-trash"></i>
        </div>
        <p class="description">${productInfo.productDescription}</p>
        <p class="price">${productInfo.productPrice} ₪</p>
      </div>
  `;
  mainDiv.appendChild(product);

  // Delete Product from firestore and from page
  let trash = product.querySelector(".fa-trash");
  trash.addEventListener("click", async function () {
    confirmDelete(product, productInfo, productCollection);
  });
}

function confirmDelete(product, productInfo, productCollection) {
  let model = document.createElement("div");
  model.className = "delete-model";
  model.innerHTML = `
  <div>
    <p>Are You Sure To Delete This Product?<b>${productInfo.productName}</b></p>
    <div>
      <button class="delete-btn">Delete</button>
      <button class="cancel-btn">Cancel</button>
    </div>
  </div>
`;
  mainDiv.appendChild(model);

  model
    .querySelector(".delete-btn")
    .addEventListener("click", async function () {
      try {
        const useRef = doc(
          firestore,
          productCollection,
          productInfo.productName
        );

        await deleteDoc(useRef);
        product.remove();
        model.remove();

        showToast(
          "Delete Product Successfully",
          "linear-gradient(to right, #00b09b, #96c93d)"
        );
        const querySnapshot = await getDocs(collection(firestore, "products"));
        if (querySnapshot.size === 0 && mainDiv.innerHTML === "") {
          mainDiv.innerHTML = `<p class="empty-products">You Have Not Added Any Product</p>`;
        }
      } catch (error) {
        console.error("Failed To Delete Product: ", error);
        showToast(error.message, "linear-gradient(to right, #ff416c, #ff4b2b)");
      }
    });

  model.querySelector(".cancel-btn").addEventListener("click", function () {
    model.remove();
  });
}
