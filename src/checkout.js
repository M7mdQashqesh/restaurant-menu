import { showToast } from "./showToastify.js";

// Add navigation events to header elements: logo, and go back
document.querySelector(".go-back").addEventListener("click", function () {
  history.back();
});

let confirmForm = document.querySelector("form");
confirmForm.addEventListener("submit", validateForm);

// Validate Checkout Form
function validateForm(e) {
  e.preventDefault();

  let fullName = document.getElementById("user-name").value.trim();
  let phoneNumber = document.getElementById("phone-number").value.trim();
  let address = document.getElementById("address").value.trim();

  if (!fullName || !phoneNumber || !address) {
    showToast(
      "All Fields Are Required",
      "linear-gradient(to right, #ff416c, #ff4b2b)"
    );
    return;
  }

  // Full name should be contain only characters and space
  if (!fullName.match(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/)) {
    showToast(
      "Please, Enter Valid Full Name",
      "linear-gradient(to right, #ff416c, #ff4b2b)"
    );
    return;
  }

  // Phone number should start by 059 or 056 and must be 10 digits
  if (!phoneNumber.match(/^(059|056)\d{7}$/)) {
    showToast(
      "Please, Enter Valid Phone Number",
      "linear-gradient(to right, #ff416c, #ff4b2b)"
    );
    return;
  }

  if (!address.match(/^[a-zA-Z0-9\s,.-]+$/i)) {
    showToast(
      "Please, Enter Valid Address",
      "linear-gradient(to right, #ff416c, #ff4b2b)"
    );
    return;
  }

  completeOrder(fullName, phoneNumber, address);
}

// Generate Whatsapp message, and send the information about user and products Details
function completeOrder(fullName, phoneNumber, address) {
  let cartProducts = JSON.parse(window.localStorage.getItem("cartProducts"));
  let number = "+972595834611";
  let url = `https://wa.me/${number}?text=`;
  let userInfo = `Customer Name: ${fullName}\nPhone: ${phoneNumber}\nAddress: ${address}\n\nOrder Details:\n`;

  if (cartProducts && cartProducts.length > 0) {
    let allTextMessage = "";

    cartProducts.forEach((product, index) => {
      allTextMessage += `Product ${index + 1}:\n`;
      allTextMessage += `- Name: ${product.name}\n`;
      allTextMessage += `- Quantity: ${product.quantity}\n`;
      allTextMessage += `- Total Price: ${product.totalPrice} ₪\n`;
      allTextMessage += `--------------------------\n`;
    });

    allTextMessage = userInfo + allTextMessage;
    url += encodeURIComponent(allTextMessage);
    window.localStorage.removeItem("cartProducts");
    showToast(
      "Order Sent Successfully",
      "linear-gradient(to right, #00b09b, #96c93d)"
    );
    window.open(url, "_blank").focus();
    window.location.href = "../index.html";
  } else {
    showToast(
      "Your cart is empty. Please add items before ordering.",
      "linear-gradient(to right, #ff416c, #ff4b2b)"
    );
  }
}
