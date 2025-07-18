import { showToast } from "./showToastify.js";
let productDetailsDiv = document.getElementById("product-details");

let productDetails = JSON.parse(window.localStorage.getItem("productDetails"));
let quantity = 1;
let totalPrice = productDetails.price * quantity;

if (productDetails) renderProductDetails();
else window.location.href = "../index.html";

// Render Product Details Page
function renderProductDetails() {
  let details = `
  <div class="product-image" style="background-image: url(${productDetails.src});"></div>
  <p class="product-name">${productDetails.name}</p>
  <p class="product-description">${productDetails.description}</p>

  <div class="quantity">
    <p>Quantity:</p>
    <div>
      <button class="increase-quantity">+</button>
      <input type="number" value=${quantity} min="1" />
      <button class="decrease-quantity">-</button>
    </div>
  </div>

  <div class="price-and-add">
    <p class="total-price">${totalPrice} ₪</p>
    <button class="save-to-cart">Add To Cart</button>
  </div>
  `;
  productDetailsDiv.innerHTML = details;
}

// Update total price based on quantity
function editTotalPrice() {
  totalPrice = productDetails.price * quantity;
  document.querySelector(".total-price").textContent = `${totalPrice} ₪`;
}

// On blur, validate quantity and update total price
document.querySelector("input").addEventListener("blur", function () {
  let val = parseInt(this.value);
  if (isNaN(val) || val < 1) {
    quantity = 1;
    this.value = quantity;
    editTotalPrice();
  } else {
    quantity = val;
    editTotalPrice();
  }
});

// Increment quantity and update total price
document
  .querySelector(".increase-quantity")
  .addEventListener("click", function () {
    quantity++;
    document.querySelector("input").value = quantity;
    editTotalPrice();
  });

// Decrement quantity (min 1) and update total price
document
  .querySelector(".decrease-quantity")
  .addEventListener("click", function () {
    if (quantity > 1) {
      quantity--;
      document.querySelector("input").value = quantity;
      editTotalPrice();
    }
  });

// Add selected product to cart in localStorage and show confirmation toast notification
document.querySelector(".save-to-cart").addEventListener("click", function () {
  let cartProducts =
    JSON.parse(window.localStorage.getItem("cartProducts")) || [];
  let pDetails = {
    src: productDetails.src,
    name: productDetails.name,
    quantity: quantity,
    totalPrice: totalPrice,
    description: productDetails.description,
  };
  cartProducts.push(pDetails);
  window.localStorage.setItem("cartProducts", JSON.stringify(cartProducts));

  showToast(
    "The product was added to the cart",
    "linear-gradient(to right, #00b09b, #96c93d)"
  );
});
