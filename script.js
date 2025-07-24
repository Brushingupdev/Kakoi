let cart = JSON.parse(localStorage.getItem("cart")) || [];

const saveCart = () => {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("Carrito guardado en localStorage:", JSON.parse(localStorage.getItem("cart"))); // Depuración
  } catch (error) {
    console.error("Error al guardar el carrito en localStorage:", error);
    showToast("Error al guardar el carrito", true);
  }
};

const toggleCart = () => {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("cartOverlay");
  const isOpen = sidebar.classList.contains("translate-x-0");
  sidebar.classList.toggle("translate-x-full");
  sidebar.classList.toggle("translate-x-0");
  overlay.classList.toggle("hidden");
  if (!isOpen) closeModal();
  sidebar.setAttribute("aria-hidden", !sidebar.classList.contains("translate-x-0"));
  console.log("toggleCart ejecutado, sidebar abierto:", !isOpen); // Depuración
};

const openCart = () => {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("cartOverlay");
  if (!sidebar.classList.contains("translate-x-0")) {
    sidebar.classList.remove("translate-x-full");
    sidebar.classList.add("translate-x-0");
    overlay.classList.remove("hidden");
    closeModal();
    sidebar.setAttribute("aria-hidden", "false");
    console.log("openCart ejecutado"); // Depuración
  }
};

const showToast = (message, isError = false) => {
  const toast = document.getElementById("toast");
  const cartSidebar = document.getElementById("cartSidebar");
  if (!toast || !cartSidebar) return; 
  // Mostrar el toast sin abrir el carrito automáticamente
  toast.innerText = message;
  toast.classList.toggle("bg-green-500", !isError);
  toast.classList.toggle("bg-red-500", isError);
  toast.classList.remove("hidden");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 2000);
  console.log("showToast ejecutado:", message); // Depuración
};

const openModal = (product) => {
  try {
    const { nombre, descripcion, tallas, precio, imagen, colores, descuento, precioOriginal, nuevo } = product;
    document.getElementById("modalNombre").innerText = nombre;
    document.getElementById("modalDescripcion").innerText = descripcion;
    document.getElementById("modalImg").src = imagen;
    document.getElementById("modalImg").alt = `Imagen de ${nombre}`;

    const precioDiv = document.getElementById("modalPrecio");
    precioDiv.innerHTML = "";
    const discountLabel = document.getElementById("modalDiscountLabel");
    const newLabel = document.getElementById("modalNewLabel");

    if (descuento && precioOriginal) {
      const discountPercentage = Math.round(((precioOriginal - precio) / precioOriginal) * 100);
      precioDiv.innerHTML = `
        <span class="line-through text-gray-500 text-sm">S/. ${precioOriginal.toFixed(2)}</span>
        <span class="text-xl font-bold text-indigo-600">S/. ${precio.toFixed(2)}</span>
      `;
      document.getElementById("modalDescuento").classList.add("hidden");
      discountLabel.innerText = `${discountPercentage}% OFF`;
      discountLabel.classList.remove("hidden");
      newLabel.classList.add("hidden");
    } else {
      precioDiv.innerText = `S/. ${precio.toFixed(2)}`;
      document.getElementById("modalDescuento").classList.add("hidden");
      discountLabel.classList.add("hidden");
      newLabel.classList.toggle("hidden", !nuevo);
    }

    const tallaSelect = document.getElementById("modalTallaSelect");
    tallaSelect.innerHTML = '<option value="" disabled selected>Selecciona una talla</option>';
    tallas.split(",").forEach(talla => {
      const option = document.createElement("option");
      option.value = talla.trim();
      option.textContent = talla.trim();
      tallaSelect.appendChild(option);
    });

    const colorSelect = document.getElementById("colorSelect");
    colorSelect.innerHTML = "";
    colores.forEach((color, index) => {
      const button = document.createElement("button");
      button.className = `color-option ${index === 0 ? 'selected' : ''}`;
      button.style.backgroundColor = color.hex;
      button.setAttribute("aria-label", `Seleccionar color ${color.nombre}`);
      button.setAttribute("data-color", color.nombre);
      button.tabIndex = 0;
      button.addEventListener("click", () => {
        document.querySelectorAll(".color-option").forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");
      });
      button.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          button.click();
        }
      });
      colorSelect.appendChild(button);
    });

    const modal = document.getElementById("productModal");
    const content = document.getElementById("modalContent");
    modal.classList.remove("hidden");
    modal.classList.add("pointer-events-auto");
    setTimeout(() => {
      content.classList.remove("scale-95", "opacity-0");
      content.classList.add("scale-100", "opacity-100");
      content.focus();
    }, 10);
  } catch (error) {
    console.error("Error opening modal:", error);
    showToast("Error al abrir el producto", true);
  }
};

const closeModal = () => {
  const modal = document.getElementById("productModal");
  const content = document.getElementById("modalContent");
  content.classList.remove("scale-100", "opacity-100");
  content.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("pointer-events-auto");
    document.querySelector("body").focus();
  }, 200);
};

const addToCartFromModal = () => {
  try {
    const talla = document.getElementById("modalTallaSelect").value;
    if (!talla) {
      showToast("Por favor, selecciona una talla", true);
      return;
    }
    const color = document.querySelector(".color-option.selected")?.getAttribute("data-color");
    if (!color) {
      showToast("Por favor, selecciona un color", true);
      return;
    }
    const nombre = document.getElementById("modalNombre").innerText;
    const precioText = document.getElementById("modalPrecio").querySelector(".text-indigo-600")?.innerText || document.getElementById("modalPrecio").innerText;
    const precio = parseFloat(precioText.replace("S/. ", ""));
    const imagen = document.getElementById("modalImg").src;
    const precioOriginalElem = document.getElementById("modalPrecio").querySelector(".text-gray-500");
    const descuento = precioOriginalElem !== null;
    const precioOriginal = descuento ? parseFloat(precioOriginalElem.innerText.replace("S/. ", "")) : null;
    const nuevo = !document.getElementById("modalNewLabel").classList.contains("hidden");

    const existingItem = cart.find(item => item.nombre === nombre && item.talla === talla && item.color === color);
    if (existingItem) {
      existingItem.cantidad += 1;
    } else {
      cart.push({ nombre, precio, imagen, talla, color, cantidad: 1, descuento, precioOriginal, nuevo });
    }

    saveCart();
    updateCart();
    closeModal();
    openCart();
    showToast("Producto agregado al carrito");
  } catch (error) {
    console.error("Error adding to cart:", error);
    showToast("Error al agregar al carrito", true);
  }
};

const updateCart = () => {
  try {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    cartItems.innerHTML = "";

    if (cart.length === 0) {
      cartItems.innerHTML = `<div class="text-center text-gray-500 py-4">Tu carrito está vacío 🛒</div>`;
      cartTotal.innerText = "S/. 0.00";
      document.getElementById("cart-count").innerText = 0;
      document.getElementById("checkoutBtn").classList.add("hidden");
      document.getElementById("clearCartBtn").classList.add("hidden");
      saveCart(); // Guardar carrito vacío en localStorage
      console.log("Carrito vacío, localStorage:", JSON.parse(localStorage.getItem("cart"))); // Depuración
      return;
    }

    let total = 0;
    cart.forEach((item, index) => {
      total += item.precio * item.cantidad;
      const discountPercentage = item.descuento && item.precioOriginal ? 
        Math.round(((item.precioOriginal - item.precio) / item.precioOriginal) * 100) : 0;
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}" class="w-16 h-16 object-cover rounded" />
        <div class="flex-1">
          <div class="flex items-center">
            <p class="font-semibold text-gray-800">${item.nombre}</p>
            ${item.nuevo ? '<span class="ml-2 inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Nuevo</span>' : ''}
            ${item.descuento ? `<span class="ml-2 inline-block bg-green-500 text-white text-xs font-bold px-2 py-1 rounded discount-label whitespace-nowrap">${discountPercentage}% OFF</span>` : ''}
          </div>
          <p class="text-sm text-gray-500">Talla: ${item.talla}</p>
          <p class="text-sm text-gray-500">Color: ${item.color}</p>
          <div class="text-sm mt-1">
            ${item.descuento && item.precioOriginal ? `<span class="line-through text-gray-500">S/. ${item.precioOriginal.toFixed(2)}</span> ` : ''}
            <span class="font-semibold text-indigo-600">S/. ${item.precio.toFixed(2)}</span>
          </div>
          <div class="quantity-controls mt-2">
            <button onclick="decreaseQuantity(${index})" class="bg-gray-200 px-2 rounded hover:bg-gray-300 focus:ring-2 focus:ring-indigo-600" aria-label="Reducir cantidad de ${item.nombre}">−</button>
            <span class="text-sm font-medium" aria-label="Cantidad de ${item.nombre}">${item.cantidad}</span>
            <button onclick="increaseQuantity(${index})" class="bg-gray-200 px-2 rounded hover:bg-gray-300 focus:ring-2 focus:ring-indigo-600" aria-label="Aumentar cantidad de ${item.nombre}">+</button>
          </div>
        </div>
        <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700 text-xl" aria-label="Eliminar ${item.nombre} del carrito">🗑️</button>
      `;
      cartItems.appendChild(div);
    });

    cartTotal.innerText = `S/. ${total.toFixed(2)}`;
    document.getElementById("cart-count").innerText = cart.reduce((acc, item) => acc + item.cantidad, 0);
    document.getElementById("checkoutBtn").classList.remove("hidden");
    document.getElementById("clearCartBtn").classList.remove("hidden");
    saveCart();
    console.log("Carrito actualizado, localStorage:", JSON.parse(localStorage.getItem("cart"))); // Depuración
  } catch (error) {
    console.error("Error updating cart:", error);
    showToast("Error al actualizar el carrito", true);
  }
};

const increaseQuantity = (index) => {
  cart[index].cantidad += 1;
  updateCart();
};

const decreaseQuantity = (index) => {
  if (cart[index].cantidad > 1) {
    cart[index].cantidad -= 1;
    updateCart();
  }
};

const removeFromCart = (index) => {
  try {
    cart.splice(index, 1);
    saveCart(); // Guardar inmediatamente después de eliminar
    updateCart();
    showToast("Producto eliminado del carrito");
    console.log("Producto eliminado, carrito actual:", cart); // Depuración
  } catch (error) {
    console.error("Error eliminando producto del carrito:", error);
    showToast("Error al eliminar el producto", true);
  }
};

const clearCart = () => {
  try {
    cart = []; // Vaciar el array
    localStorage.removeItem("cart"); // Eliminar explícitamente el carrito de localStorage
    updateCart();
    showToast("Carrito vaciado");
    console.log("Carrito vaciado, localStorage:", localStorage.getItem("cart")); // Depuración
  } catch (error) {
    console.error("Error vaciando el carrito:", error);
    showToast("Error al vaciar el carrito", true);
  }
};

const toggleMobileMenu = () => {
  const mobileMenu = document.getElementById("mobileMenu");
  const isOpen = mobileMenu.classList.contains("translate-y-0");
  mobileMenu.classList.toggle("hidden");
  mobileMenu.classList.toggle("translate-y-full");
  mobileMenu.classList.toggle("translate-y-0");
  mobileMenu.setAttribute("aria-hidden", !isOpen);
  document.querySelector("button[aria-label='Abrir menú móvil']").setAttribute("aria-expanded", !isOpen);
};

const renderProducts = (containerId, productList) => {
  try {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    productList.forEach(product => {
      const discountPercentage = product.descuento && product.precioOriginal ? 
        Math.round(((product.precioOriginal - product.precio) / product.precioOriginal) * 100) : 0;
      const div = document.createElement("div");
      div.className = "relative bg-white rounded-xl shadow hover:shadow-lg transition p-4 cursor-pointer group";
      div.innerHTML = `
        ${product.nuevo ? '<span class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Nuevo</span>' : ''}
        ${product.descuento ? `<span class="absolute top-2 ${product.nuevo ? 'left-12' : 'left-2'} bg-green-500 text-white text-xs font-bold px-2 py-1 rounded discount-label">${discountPercentage}% OFF</span>` : ''}
        <img src="${product.imagen}" alt="${product.nombre} en color ${product.colores[0].nombre}" class="w-full h-52 object-cover rounded-lg" loading="lazy" />
        <h3 class="text-lg font-semibold mt-3">${product.nombre}</h3>
        <p class="text-gray-700 text-sm">${product.descripcion}</p>
        
        <div class="mt-1">
          ${product.descuento && product.precioOriginal ? `<span class="line-through text-gray-500 text-sm">S/. ${product.precioOriginal.toFixed(2)}</span> ` : ''}
          <span class="text-xl font-bold text-indigo-600">S/. ${product.precio.toFixed(2)}</span>
        </div>
      `;
      div.onclick = () => openModal(product);
      container.appendChild(div);
    });
  } catch (error) {
    console.error("Error rendering products:", error);
    showToast("Error al cargar productos", true);
  }
};

const filterProducts = (type, searchTerm = '') => {
  try {
    const allProducts = JSON.parse(localStorage.getItem("kakoi-products")) || [];
    const filteredProducts = allProducts.filter(p => {
      if (type === "all") return p.nuevo;
      if (type === "new") return p.nuevo;
      if (type === "polos") return p.nombre.toLowerCase().includes("polo");
      if (type === "casacas") return p.nombre.toLowerCase().includes("casaca");
      if (type === "pantalones") return p.nombre.toLowerCase().includes("pantalón");
      if (type === "descuentos") return p.descuento;
      return false;
    }).filter(p => 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderProducts("productGrid", filteredProducts);
    renderProducts("discountGrid", allProducts.filter(p => p.descuento && !p.nuevo).filter(p => 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    ));
  } catch (error) {
    console.error("Error filtering products:", error);
    showToast("Error al filtrar productos", true);
  }
};

const startCountdown = () => {
  try {
    const countdownElement = document.getElementById("countdown");
    if (!countdownElement) return; 
    const endDate = new Date("2025-07-25T23:59:59");
    const updateCountdown = () => {
      const now = new Date();
      const timeLeft = endDate - now;
      if (timeLeft <= 0) {
        countdownElement.innerHTML = "¡Oferta finalizada!";
        return;
      }
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      countdownElement.innerHTML = `Oferta válida por: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    };
    updateCountdown();
    setInterval(updateCountdown, 1000);
  } catch (error) {
    console.error("Error in countdown:", error);
    showToast("Error en el temporizador", true);
  }
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};


document.addEventListener("DOMContentLoaded", () => {
  try {
    const sidebar = document.getElementById("cartSidebar");
    const overlay = document.getElementById("cartOverlay");
    if (sidebar && overlay) {
      sidebar.classList.add("translate-x-full");
      sidebar.classList.remove("translate-x-0");
      overlay.classList.add("hidden");
      sidebar.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        sidebar.classList.remove("no-transition-initial");
        sidebar.style.transition = "transform 0.3s ease-in-out"; 
      }, 0);
    }

    // Inicializar productos y carrito
    localStorage.setItem("kakoi-products", JSON.stringify(products));
    renderProducts("productGrid", products.filter(p => p.nuevo));
    renderProducts("discountGrid", products.filter(p => p.descuento && !p.nuevo));
    renderProducts("allProductsGrid", products);
    startCountdown();
    updateCart();

    
    const modal = document.getElementById("productModal");
    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) {
          closeModal();
        }
      });
    }

    
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        const maxLength = 2000;
        let message = cart.map(item => 
          `${item.nombre} (Talla: ${item.talla}, Color: ${item.color}, Cantidad: ${item.cantidad})`
        ).join("\n");
        if (message.length > maxLength) {
          message = `Resumen del pedido: ${cart.length} productos. Contacte para detalles.`;
        }
        window.open(`https://wa.me/1234567890?text=Pedido:%0A${encodeURIComponent(message)}`);
      });
    }

    
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      const debouncedProductSearch = debounce((value) => filterProducts('all', value), 300);
      searchInput.addEventListener("input", (e) => {
        debouncedProductSearch(e.target.value);
      });
    }

    
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!document.getElementById("productModal").classList.contains("hidden")) {
          closeModal();
        } else if (!document.getElementById("cartSidebar").classList.contains("translate-x-full")) {
          toggleCart();
        } else if (!document.getElementById("mobileMenu").classList.contains("hidden")) {
          toggleMobileMenu();
        }
      }
    });
  } catch (error) {
    console.error("Error initializing shared listeners:", error);
    showToast("Error al inicializar la página", true);
  }
});