import {showToast} from "../showToastify.js"
import { firestore } from "../firebase.js";
import {
  getDocs,
  collection,
  doc,
  setDoc,
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
      window.location.href = "../../pages/dashboard/manageProducts.html";
    } else if (el.children[1].textContent === "Manage Categories") {
      menuNav.classList.remove("show");
      ul.classList.remove("show");

      menuNav.classList.add("hide");
      ul.classList.add("hide");

      // allow scroll
      document.body.style.overflow = "auto";
    } else if (el.children[1].textContent === "Home Page") {
      window.location.href = "../../index.html";
    } else if (el.children[1].textContent === "Sign out") {
      window.localStorage.removeItem("user");
      window.location.href = "../../pages/login.html";
    }
  });
});

let categoriesDiv = document.querySelector(".categories");

getData();
async function getData() {
  document.getElementById("loading").style.display = "block";
  try {
    const querySnapshot = await getDocs(collection(firestore, "categories"));
    if (querySnapshot.size > 0) {
      querySnapshot.forEach((doc) => {
        createCategories(doc.data());
      });
    } else {
      let emptyCategoryP = document.createElement("p");
      emptyCategoryP.className = "empty-categories";
      emptyCategoryP.textContent = "You Have Not Added Any Categories";

      categoriesDiv.appendChild(emptyCategoryP);
    }
  } catch (error) {
    console.error("Failed To Fetch Data: ", error);
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

function createCategories(category) {
  let categoryDiv = document.createElement("div");
  categoryDiv.className = "category-div";
  categoryDiv.innerHTML = `
    <p>${category.categoryName}</p>
    <i class="fa-solid fa-trash"></i>
  `;
  categoriesDiv.appendChild(categoryDiv);

  // Delete Category from firestore and from page
  let trash = categoryDiv.querySelector(".fa-trash");
  trash.addEventListener("click", async function () {
    confirmDelete(categoryDiv, category);
  });
}

function confirmDelete(categoryDiv, category) {
  let model = document.createElement("div");
  model.className = "delete-model";
  model.innerHTML = `
  <div>
    <p>Are You Sure To Delete This Category?<b>${category.categoryName}</b></p>
    <div>
      <button class="delete-btn">Delete</button>
      <button class="cancel-btn">Cancel</button>
    </div>
  </div>
`;
  categoriesDiv.appendChild(model);

  model
    .querySelector(".delete-btn")
    .addEventListener("click", async function () {
      try {
        const useRef = doc(firestore, "categories", category.categoryName);
        const useRefForProducts = collection(firestore, category.categoryName);
        const querySnapshotForProducts = await getDocs(useRefForProducts);
        if (querySnapshotForProducts.size !== 0) {
          showToast(
            `You Should Remove All Products From ${category.categoryName} Category At First`,
            "linear-gradient(to right, #ff416c, #ff4b2b)"
          );
          return;
        }
        await deleteDoc(useRef);
        categoryDiv.remove();
        model.remove();

        showToast(
          "Delete Category Successfully",
          "linear-gradient(to right, #00b09b, #96c93d)"
        );
        const querySnapshot = await getDocs(
          collection(firestore, "categories")
        );
        if (querySnapshot.size === 0) {
          categoriesDiv.innerHTML = `<p class="empty-categories">You Have Not Added Any Categories</p>`;
        }
      } catch (error) {
        console.error("Failed To Delete Category: ", error);
        showToast(error.message, "linear-gradient(to right, #ff416c, #ff4b2b)");
      }
    });

  model.querySelector(".cancel-btn").addEventListener("click", function () {
    model.remove();
  });
}

let addCategoryBtn = document.getElementById("add-category-btn");
let modal = document.querySelector(".modal");

addCategoryBtn.onclick = function () {
  modal.style.display = "block";
};

let addCategoryForm = document.querySelector("form");
addCategoryForm.onsubmit = async function (e) {
  e.preventDefault();
  if (document.querySelector("#category-name").value.trim() !== "") {
    let categoryName = document.querySelector("#category-name").value.trim();
    try {
      const useRef = doc(firestore, "categories", categoryName);
      await setDoc(useRef, {
        categoryName: categoryName,
        createdAt: new Date().toISOString(),
      });
      showToast(
        "Category created successfully",
        "linear-gradient(to right, #00b09b, #96c93d)"
      );
      categoriesDiv.innerHTML = "";
      getData();
      document.querySelector("#category-name").value = "";
      modal.style.display = "none";
    } catch (error) {
      console.error("Failed to add category", error);
    }
  }
};

let cancelBtn = document.querySelector(".cancel-btn");
cancelBtn.addEventListener("click", function (e) {
  e.preventDefault();
  modal.style.display = "none";
});
