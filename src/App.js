document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.querySelector(".cart-items");
  const totalPriceElement = document.getElementById("total-price");
  const qtycart = document.querySelector(".qty-badge");
  const checkoutButton = document.querySelector(".checkout-button");
  const checkoutForm = document.getElementById("checkout-form");

  let cart = {};
  let total;

  if (Object.keys(cart).length === 0) {
    qtycart.style.display = "none";
  }

  // Fungsi untuk memperbarui tampilan total harga
  function updateTotalPrice() {
    total = Object.values(cart).reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    ); // Hitung total harga

    totalPriceElement.textContent = `Rp ${total.toLocaleString("id-ID")}`;
  }

  // Fungsi untuk menambah item ke keranjang
  function addToCart(productId, productName, productPrice, productImage) {
    if (!cart[productId]) {
      cart[productId] = {
        name: productName,
        price: productPrice,
        quantity: 1,
        image: productImage,
      };
    } else {
      cart[productId].quantity++;
    }
    renderCartItems();
    updateTotalPrice();
  }

  // Fungsi untuk mengurangi jumlah item di keranjang
  function decreaseQuantity(productId) {
    if (cart[productId] && cart[productId].quantity > 1) {
      cart[productId].quantity--;
    } else {
      delete cart[productId];
    }
    renderCartItems();
    updateTotalPrice();
  }

  // Fungsi untuk menghapus item dari keranjang
  function removeFromCart(productId) {
    delete cart[productId];
    renderCartItems();
    updateTotalPrice();

    if (Object.keys(cart).length === 0) {
      qtycart.style.display = "none";
    }
  }

  // Fungsi untuk merender item keranjang ke dalam HTML
  function renderCartItems() {
    cartItemsContainer.innerHTML = "";

    for (const itemId in cart) {
      const item = cart[itemId];
      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";
      cartItem.innerHTML = `
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="cart-item-details">
          <div style="font-weight: bold;">${item.name}</div>
          <div style="display: flex; align-items: center; padding-top: 10px;">
            <button class="decrease" data-product-id="${itemId}" style="background: none; cursor: pointer;">
              <i data-feather="minus"></i>
            </button>
            <span style="padding-left: 20px; padding-right: 20px; font-weight: bold;">${
              item.quantity
            }</span>
            <button class="increase" data-product-id="${itemId}" style="background: none; cursor: pointer;">
              <i data-feather="plus"></i>
            </button>
            <button class="remove" data-product-id="${itemId}" style="background: none; padding-left: 80px; cursor: pointer; color: red;">
              <i data-feather="trash-2"></i>
            </button>
          </div>
          <div style="padding-top: 10px;">Rp ${(
            item.price * item.quantity
          ).toLocaleString("id-ID")}</div>
        </div>
      `;
      cartItemsContainer.appendChild(cartItem);
    }

    if (Object.keys(cart).length > 0) {
      qtycart.style.display = "block";
      qtycart.innerText = Object.keys(cart).length; // Tampilkan jumlah item
    }

    addEventListenersToCartButtons();
    feather.replace(); // Refresh feather icons
  }

  // Fungsi untuk menambahkan event listener ke tombol-tombol di item keranjang
  function addEventListenersToCartButtons() {
    document.querySelectorAll(".increase").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const productId = button.getAttribute("data-product-id");
        addToCart(
          productId,
          cart[productId].name,
          cart[productId].price,
          cart[productId].image
        );
      });
    });

    document.querySelectorAll(".decrease").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const productId = button.getAttribute("data-product-id");
        decreaseQuantity(productId);
      });
    });

    document.querySelectorAll(".remove").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const productId = button.getAttribute("data-product-id");
        removeFromCart(productId);
      });
    });
  }

  // Tambahkan event listener untuk tombol "Add to Cart"
  document.querySelectorAll(".add-to-cart-button").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-product-id");
      const productName = button
        .closest(".product-card")
        .querySelector("h3").textContent;
      const productPrice = parseInt(button.getAttribute("data-product-price"));
      const productImage = button
        .closest(".product-card")
        .querySelector("img").src;
      addToCart(productId, productName, productPrice, productImage);
    });
  });

  // Fungsi untuk melakukan checkout
  checkoutButton.addEventListener("click", () => {
    const totalPrice = document.getElementById("co-total-price");
    const totalProduct = document.getElementById("co-total-product");
    const total = Object.values(cart).reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    ); // Hitung total harga
    totalPrice.innerText = `${total.toLocaleString("id-ID")}`;
    totalProduct.innerText = `${Object.keys(cart).length}`;
  });

  // Fungsi untuk melakukan kirim pesan ke admin
  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const fullnameCustomer = document.getElementById("name").value;
      const customerEmail = document.getElementById("email").value;
      const phoneNumber = document.getElementById("phone_number").value;

      const data = {
        customer_name: fullnameCustomer,
        customer_email: customerEmail,
        customer_phone: phoneNumber,
        gross_amount: total,
        item_details: Object.values(cart).map((item) => ({
          id: item.id, // Pastikan properti id tersedia di cart
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
        })),
      };

      const res = await fetch("http://localhost:4040/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      // Midtrans Show Modal

      window.snap.pay(response.transactionToken, {
        onSuccess: function (result) {
          /* You may add your own implementation here */
          alert("Pembayaran Berhasil!");
          console.log(result);
        },
        onPending: function (result) {
          /* You may add your own implementation here */
          alert("Menunggu pembayaran anda");
          console.log(result);
        },
        onError: function (result) {
          /* You may add your own implementation here */
          alert("Pembayaran gagal!");
          console.log(result);
        },
        onClose: function () {
          /* You may add your own implementation here */
          alert("Anda menutup popup tanpa menyelesaikan pembayaran");
        },
      });
    } catch (error) {
      alert(error);
    }
  });
});
