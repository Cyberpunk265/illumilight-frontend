// EDIT PRODUCTS HERE - add your real products
const PRODUCTS = [
  { id:1, name:"Illumilight Signature Candle", category:"light", price:349, symbol:"🕯️", desc:"Hand-poured signature candle. Find your light, in your space.", stock:"In Stock", details:"Premium soy wax, 45hr burn time. Signature Illumilight scent with amber and sandalwood." },
  { id:2, name:"DODIS Discovery Box", category:"collection", price:899, symbol:"◇", desc:"A curated collection of discoveries from the Department.", stock:"Limited", details:"5 curated items from DODIS. Each box is unique and numbered." },
  { id:3, name:"Golden Emblem Pin", category:"essentials", price:199, symbol:"✧", desc:"Carry the light with you. Solid gold-finish emblem.", stock:"In Stock", details:"Enamel pin, 25mm. Gold finish with presentation card." },
  { id:4, name:"Illumilight Journal", category:"essentials", price:299, symbol:"◎", desc:"Your next chapter starts here. Premium bound journal.", stock:"In Stock", details:"192 pages, gold foil cover, dot grid interior." },
  { id:5, name:"Orb Light Lamp", category:"light", price:1299, symbol:"◯", desc:"Ambient glow for your world. Dimmable orb lamp.", stock:"Pre-order", details:"Warm 2700K LED, touch dimmable, USB-C." },
  { id:6, name:"DODIS Tote - EST. Collection", category:"collection", price:249, symbol:"D", desc:"Heavyweight canvas tote from the Department.", stock:"In Stock", details:"16oz canvas, interior pocket, gold DODIS print." },
];

let activeFilter = "all";
let searchTerm = "";
let cart = JSON.parse(localStorage.getItem("dodis_cart") || "[]");

const grid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");

function formatPrice(n){ return "R " + n.toLocaleString(); }

function renderProducts(){
  const filtered = PRODUCTS.filter(p => {
    const matchFilter = activeFilter === "all" || p.category === activeFilter;
    const matchSearch = p.name.toLowerCase().includes(searchTerm) || p.desc.toLowerCase().includes(searchTerm);
    return matchFilter && matchSearch;
  });
  emptyState.hidden = filtered.length > 0;
  grid.innerHTML = filtered.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-thumb">${p.symbol}</div>
      <span class="product-cat">${p.category.toUpperCase()} · ${p.stock.toUpperCase()}</span>
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="product-foot"><span class="price">${formatPrice(p.price)}</span><span class="view-btn">VIEW DETAILS ↗</span></div>
    </article>
  `).join("");

  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => openModal(+card.dataset.id));
  });
}

searchInput.addEventListener("input", e => {
  searchTerm = e.target.value.toLowerCase().trim();
  renderProducts();
});

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderProducts();
  });
});

// Modal
const modal = document.getElementById("productModal");
let currentProduct = null;

function openModal(id){
  currentProduct = PRODUCTS.find(p => p.id === id);
  document.getElementById("modalSymbol").textContent = currentProduct.symbol;
  document.getElementById("modalCategory").textContent = currentProduct.category.toUpperCase() + " · DODIS";
  document.getElementById("modalName").textContent = currentProduct.name;
  document.getElementById("modalDesc").textContent = currentProduct.details;
  document.getElementById("modalPrice").textContent = formatPrice(currentProduct.price);
  document.getElementById("modalStock").textContent = "● " + currentProduct.stock;
  modal.hidden = false;
}

document.getElementById("modalClose").addEventListener("click", () => modal.hidden = true);
modal.addEventListener("click", e => { if(e.target === modal) modal.hidden = true; });
document.getElementById("modalBuyBtn").addEventListener("click", () => {
  addToCart(currentProduct.id);
  modal.hidden = true;
  openCart();
});

// Cart
const cartDrawer = document.getElementById("cartDrawer");

function saveCart(){ localStorage.setItem("dodis_cart", JSON.stringify(cart)); updateCartUI(); }
function addToCart(id){
  const existing = cart.find(i => i.id === id);
  if(existing) existing.qty++;
  else cart.push({ id, qty: 1 });
  saveCart();
}
function getCartCount(){
  try { return cart.reduce((s,i)=>s+i.qty,0); } catch { return 0; }
}
function updateCartUI(){
  const count = cart.reduce((s,i) => s + i.qty, 0);
  document.getElementById("cartCount").textContent = count;
  const box = document.getElementById("cartItems");
  if(cart.length === 0){
    box.innerHTML = `<p style="color:var(--muted); font-size:13px; line-height:1.7;">Your list is empty.<br>Explore DODIS and add something that belongs in your world.</p>`;
  } else {
    box.innerHTML = cart.map(item => {
      const p = PRODUCTS.find(x => x.id === item.id);
      return `<div class="cart-item"><div><strong>${p.name}</strong><small>${formatPrice(p.price)} × ${item.qty}</small></div><div><span>${formatPrice(p.price * item.qty)}</span><br><button class="cart-remove" data-id="${p.id}">Remove</button></div></div>`;
    }).join("");
    document.querySelectorAll(".cart-remove").forEach(b => b.addEventListener("click", () => {
      cart = cart.filter(i => i.id !== +b.dataset.id);
      saveCart();
    }));
  }
  const total = cart.reduce((s,i) => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return s + p.price * i.qty;
  }, 0);
  document.getElementById("cartTotal").textContent = formatPrice(total);
}

function openCart(){ cartDrawer.hidden = false; }
document.getElementById("cartFab").addEventListener("click", () => cartDrawer.hidden = !cartDrawer.hidden);
document.getElementById("cartClose").addEventListener("click", () => cartDrawer.hidden = true);
document.getElementById("clearCart").addEventListener("click", () => { cart = []; saveCart(); });

renderProducts();
updateCartUI();

// --- WHATSAPP ORDER ---
// CHANGE THIS TO YOUR NUMBER: country code + number, no + or spaces
// Example America: 19304651058
const WHATSAPP_NUMBER = "19304651058";

document.getElementById("whatsappOrder").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your Interest List is empty. Add a product first.");
    return;
  }

  let message = "Hello Illumilight / DODIS,%0A%0AI would like to order:%0A%0A";
  let total = 0;

  cart.forEach(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    const lineTotal = p.price * item.qty;
    total += lineTotal;
    message += `• ${p.name} x${item.qty} - R ${lineTotal}%0A`;
  });

  message += `%0A----------------%0ATotal: R ${total}%0A%0A`;
  message += `Name: %0A`;
  message += `Delivery City: %0A`;
  message += `I found this on DODIS.`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(url, "_blank");
});