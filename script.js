

let cart = [];
let filteredProducts = [...products];

function renderProducts(productsToRender) {
  const container = document.getElementById('products-container');
  container.innerHTML = '';

  productsToRender.forEach(product => {
      const productElement = document.createElement('div');
      productElement.className = 'product-card';
      productElement.innerHTML = `
          <img src="${product.image}" alt="${product.name}" class="product-image">
          <h3 class="product-title">${product.name.length > 20 ?  product.name.substring(0,20) : product.name}</h3>
          <p class="product-price">$${product.price.toFixed(2)}</p>
          <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
      `;
      container.appendChild(productElement);
  });
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
      existingItem.quantity += 1;
  } else {
      cart.push({
          ...product,
          quantity: 1
      });
  }

  updateCartCount();
  renderCart();
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = `Cart: ${totalItems}`;
}

function renderCart() {
  const cartContainer = document.getElementById('cart-items');
  cartContainer.innerHTML = '';

  cart.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-details">
              <h3>${item.name.length > 20 ?  item.name.substring(0,20) + ' ...' : item.name}</h3>
              <p>$${item.price.toFixed(2)}</p>
              <div class="quantity-controls">
                  <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                  <span>${item.quantity}</span>
                  <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                  <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
              </div>
          </div>
      `;
      cartContainer.appendChild(cartItem);
  });

  renderCartSummary();
}

function renderCartSummary() {
  const summaryContainer = document.getElementById('cart-summary');
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  summaryContainer.innerHTML = `
      <h3>Cart Summary</h3>
      <p>Subtotal: $${subtotal.toFixed(2)}</p>
      <p>Tax (10%): $${tax.toFixed(2)}</p>
      <p><strong>Total: $${total.toFixed(2)}</strong></p>
  `;
}

function updateQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
          removeFromCart(productId);
      } else {
          updateCartCount();
          renderCart();
      }
  }
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartCount();
  renderCart();
}

function toggleCart() {
  const modal = document.getElementById('cart-modal');
  modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
}

function placeOrder() {
  if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
  }
  alert('Order placed successfully!');
  cart = [];
  updateCartCount();
  renderCart();
  toggleCart();
}

function filterProducts() {
  const categoryFilter = document.getElementById('category-filter').value;
  const priceFilter = document.getElementById('price-filter').value;
  const searchTerm = document.getElementById('search-input').value.toLowerCase();

  filteredProducts = products.filter(product => {
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      let matchesPrice = true;

      if (priceFilter === '0-50') {
          matchesPrice = product.price <= 50;
      } else if (priceFilter === '51-100') {
          matchesPrice = product.price > 50 && product.price <= 100;
      } else if (priceFilter === '101+') {
          matchesPrice = product.price > 100;
      }

      const matchesSearch = product.name.toLowerCase().includes(searchTerm);

      return matchesCategory && matchesPrice && matchesSearch;
  });

  renderProducts(filteredProducts);
}

// Add event listeners
document.getElementById('category-filter').addEventListener('change', filterProducts);
document.getElementById('price-filter').addEventListener('change', filterProducts);
document.getElementById('search-input').addEventListener('input', filterProducts);

function placeOrder() {
  if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
  }
  toggleCart();
  toggleDeliveryForm(true);
}

function toggleDeliveryForm(show) {
  const modal = document.getElementById('delivery-modal');
  modal.style.display = show ? 'block' : 'none';
  if (!show) {
      toggleCart();
  }
}

function generateOrderId() {
  return 'ORD' + Math.random().toString(36).substring(2, 9).toUpperCase();
}

function updateOrderStatus(stepIndex) {
  const steps = document.querySelectorAll('.status-step');
  const progressBar = document.getElementById('progress-bar-fill');
  
  steps.forEach((step, index) => {
      const dot = step.querySelector('.step-dot');
      const label = step.querySelector('.step-label');
      if (index <= stepIndex) {
          dot.classList.add('active');
          label.classList.add('active');
      }
  });

  progressBar.style.width = `${(stepIndex / (steps.length - 1)) * 100}%`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function renderOrderProducts() {
  const container = document.getElementById('order-products');
  const totalElement = document.getElementById('order-total');
  let total = 0;

  container.innerHTML = cart.map(item => {
      total += item.price * item.quantity;
      return `
          <div class="order-product-item">
              <img src="${item.image}" alt="${item.name}">
              <div class="order-product-info">
                  <h4>${item.name.length > 50 ?  item.name.substring(0,50) + ' ...' : item.name}</h4>
                  <p>Quantity: ${item.quantity}</p>
                  <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
              </div>
          </div>
      `;
  }).join('');

  const tax = total * 0.1;
  totalElement.innerHTML = `
      <p>Subtotal: $${total.toFixed(2)}</p>
      <p>Tax (10%): $${tax.toFixed(2)}</p>
      <p>Total: $${(total + tax).toFixed(2)}</p>
  `;
}
// Payment method
// Payment method
// Payment method
let selectedPaymentMethod = '';
let deliveryDetails = {};

function togglePaymentForm(show) {
    const modal = document.getElementById('payment-modal');
    modal.style.display = show ? 'block' : 'none';
    if (!show) {
        toggleDeliveryForm(true);
    }
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update radio buttons
    document.querySelectorAll('.payment-method input[type="radio"]')
        .forEach(radio => radio.checked = false);
    document.querySelector(`.payment-method input[value="${method}"]`).checked = true;

    // Update selected styles
    document.querySelectorAll('.payment-method')
        .forEach(div => div.classList.remove('selected'));
    document.querySelector(`.payment-method input[value="${method}"]`)
        .closest('.payment-method').classList.add('selected');

    // Show/hide payment details
    document.querySelectorAll('.payment-details')
        .forEach(div => div.classList.remove('active'));
    document.getElementById(`${method}-details`).classList.add('active');
}

function calculateTotal() {
    return cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}


function confirmOrder() {
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;

  if (!name || !phone || !address) {
    alert('Please fill in all delivery information');
    return;
}

// Store delivery details
deliveryDetails = { name, phone, address };

// Hide delivery form and show payment form
toggleDeliveryForm(false);

// Update payment summary
const total = calculateTotal();
const tax = total * 0.1;
const finalTotal = total + tax;

document.getElementById('payment-summary').innerHTML = `
    <p>Subtotal: $${total.toFixed(2)}</p>
    <p>Tax (10%): $${tax.toFixed(2)}</p>
    <p><strong>Total: $${finalTotal.toFixed(2)}</strong></p>
`;

document.getElementById('cod-amount').textContent = finalTotal.toFixed(2);

togglePaymentForm(true);
}

function processPayment() {
if (!selectedPaymentMethod) {
    alert('Please select a payment method');
    return;
}

// Validate payment details based on method
if (selectedPaymentMethod === 'card') {
    const cardInputs = document.querySelectorAll('#card-details input');
    for (let input of cardInputs) {
        if (!input.value) {
            alert('Please fill in all card details');
            return;
        }
    }
} else if (selectedPaymentMethod === 'upi') {
    const upiId = document.querySelector('#upi-details input').value;
    if (!upiId) {
        alert('Please enter UPI ID');
        return;
    }
}

// Show loading for 2 seconds before proceeding
const payBtn = document.querySelector('.confirm-btn');
payBtn.textContent = 'Processing...';
payBtn.disabled = true;

setTimeout(() => {
    togglePaymentForm(false);
    // Start order tracking
    startOrderTracking();
}, 2000);
}

function startOrderTracking() {
const orderStatusModal = document.getElementById('order-status-modal');
orderStatusModal.style.display = 'block';

// Generate and display order ID
const orderId = generateOrderId();
document.getElementById('order-id').textContent = `Order ID: ${orderId}`;

// Render order products and delivery info
renderOrderProducts();
document.getElementById('delivery-details').innerHTML = `
    <p><strong>Name:</strong> ${deliveryDetails.name}</p>
    <p><strong>Phone:</strong> ${deliveryDetails.phone}</p>
    <div class="delivery-address">
        <strong>Delivering to:</strong><br>
        ${deliveryDetails.address}
    </div>
    <p><strong>Payment Method:</strong> ${selectedPaymentMethod.toUpperCase()}</p>
`;

  // Start countdown timer
  let timeLeft = 4 * 60; // 4 minutes in seconds
  const countdownElement = document.getElementById('countdown');
  const countdownInterval = setInterval(() => {
      timeLeft--;
      countdownElement.textContent = `Estimated delivery in: ${formatTime(timeLeft)}`;
      if (timeLeft <= 0) {
          clearInterval(countdownInterval);
      }
  }, 1000);

  // Start the status updates
  let currentStep = 0;
  const totalSteps = 4;
  const timePerStep = (4 * 60 * 1000) / totalSteps; // 4 minutes divided by steps
  const statusMessages = [
      'Order Confirmed',
      'Preparing Your Order',
      'Out for Delivery',
      'Delivered Successfully!'
  ];

  const statusInterval = setInterval(() => {
      updateOrderStatus(currentStep);
      document.getElementById('status-message').textContent = statusMessages[currentStep];
      currentStep++;

      if (currentStep >= totalSteps) {
          clearInterval(statusInterval);
          document.getElementById('loading-spinner').style.display = 'none';
          document.getElementById('countdown').textContent = 'Order Delivered!';
          setTimeout(() => {
              orderStatusModal.style.display = 'none';
              cart = [];
              updateCartCount();
              renderCart();
          }, 2000);
      }
  }, timePerStep);
}

// Initial render remains the same
renderProducts(products);