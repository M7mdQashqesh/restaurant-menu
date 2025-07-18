import { showToast } from "./showToastify.js";
// Add navigation events to header element go back
document.querySelector(".go-back").addEventListener("click", function () {
  history.back();
});

let productsContainer = document.getElementById("products");
let totalPricesDiv = document.getElementById("total-price-for-total-products");

// Retrieve cart products from localStorage
let products = JSON.parse(window.localStorage.getItem("cartProducts")) || [];

// If cart is empty, display 'No Items In Your Cart' message; otherwise, render cart products
if (products.length === 0) {
  productsContainer.innerHTML = `<p class="empty-cart">No Items In Your Cart</p>`;
} else {
  renderCartProducts();
}

// Render each product in the cart by creating HTML blocks and appending them to the container
function renderCartProducts() {
  let allProductsHTML = ``;
  products.forEach((product) => {
    allProductsHTML += `
    <div class="product-div" >
      <div class="product-image" style="background-image: url(${product.src});"></div>
      <div class="details">
        <div class="name-and-trash">
          <p>${product.name}</p>
          <i class="fa-solid fa-trash"></i>
        </div>
        <p class="description">${product.description}</p>
        <div class="quantity-price">
          <p>Quantity: ${product.quantity}</p>
          <p>${product.totalPrice} ₪</p>
        </div>
        <br />
      </div>
    </div>
    `;
  });
  productsContainer.innerHTML = allProductsHTML;
}

// Remove product at given index from cart, update storage and UI
function removeProduct(index) {
  products.splice(index, 1);
  window.localStorage.setItem("cartProducts", JSON.stringify(products));
  updateCartUI();
}

// Update cart UI: render products, show empty message if needed, update totals
function updateCartUI() {
  productsContainer.innerHTML = "";
  if (products.length === 0) {
    productsContainer.innerHTML = `<p class="empty-cart">No Items In Your Cart</p>`;
    totalPricesDiv.style.display = "none";
  } else {
    renderCartProducts();
    totalPricesDiv.innerHTML = "";
    generateTotalPriceForTotalProducts();
  }
}

productsContainer.addEventListener("click", function (e) {
  if (e.target.classList.contains("fa-trash")) {
    let index = Array.from(
      productsContainer.querySelectorAll(".fa-trash")
    ).indexOf(e.target);
    if (index !== -1) {
      removeProduct(index);
    }

    // Notification
    showToast(
      "The product was removed from the cart",
      "linear-gradient(to right, #ff416c, #ff4b2b)"
    );
  }
});

let shippingCost = 15;

// Calculate and display the total price including shipping
function generateTotalPriceForTotalProducts() {
  let totalPriceForTotalProducts = 0;
  let totalItems = 0;

  // Sum the total prices of all products in the cart
  products.forEach((product) => {
    totalPriceForTotalProducts += Number(product.totalPrice);
    totalItems += product.quantity;
  });

  // Create HTML markup for the price summary
  let totalPriceForTotalProductsHTML = `
  <div class="sub-total">
    <p>Sub Total (${totalItems} item/s)</p>
    <p>${totalPriceForTotalProducts} ₪</p>
  </div>
  <div class="shipping">
    <p>Shipping</p>
    <p>15 ₪</p>
  </div>
  <br />
  <hr />
  <div class="total-cost">
    <p>Total Price</p>
    <p>${totalPriceForTotalProducts + shippingCost} ₪</p>
  </div>
  <button class="checkout">Checkout</button>
  `;

  // Update the total price container with the new markup
  totalPricesDiv.innerHTML = totalPriceForTotalProductsHTML;

  document.querySelector(".checkout").addEventListener("click", function () {
    window.location.href = "../pages/checkout.html";
  });
}

// Show the price summary if there are products in the cart, otherwise hide it
if (products.length > 0) {
  generateTotalPriceForTotalProducts();
} else {
  totalPricesDiv.style.display = "none";
}
