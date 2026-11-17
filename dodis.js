// DODIS - FINAL - Appwrite Live + Local Products + GALLERY
const PROJECT_ID = "6ae27aad00007b481204";
const DATABASE_ID = "illumilight-db";
const TABLE_ID = "6afb96090029e4927ee3";
const APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1";

const PRODUCTS = [
  { id:7, name:"Illuminatiam: The First Testament", category:"materials", price:750, symbol:"📖", image:"../Images/testament1.jpg", desc:"Illuminatiam: The First Testament - The Book of Light. 300 copies.", stock:"300 in stock", details:"Illuminatiam: The First Testament - Limited first edition. Blue cloth cover with gold foil. The Book of Light." }
];

async function loadAppwriteProducts(){
  try{
    const url = `${APPWRITE_ENDPOINT}/tablesdb/${DATABASE_ID}/tables/${TABLE_ID}/rows`;
    const res = await fetch(url, { headers: { "X-Appwrite-Project": PROJECT_ID } });
    const data = await res.json();
    const rows = data.rows || data.documents || [];
    rows.forEach(doc => {
      if(PRODUCTS.find(p => String(p.id) === String(doc.$id))) return;
      PRODUCTS.push({
        id: doc.$id,
        name: doc.name,
        category: (doc.category || "materials").toLowerCase(),
        price: Number(doc.price),
        symbol: "📖",
        image: doc.image,
        desc: doc.description || doc.name,
        stock: doc.stock ? doc.stock + " in stock" : "In Stock",
        details: doc.description || doc.name
      });
    });
    // Put Testament with images first
    PRODUCTS.sort((a,b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));
    renderProducts();
  }catch(e){
    console.log("Appwrite error", e);
    try{
      const res2 = await fetch(`${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${TABLE_ID}/documents`, { headers: { "X-Appwrite-Project": PROJECT_ID } });
      const data2 = await res2.json();
      (data2.documents||[]).forEach(doc=>{
        if(PRODUCTS.find(p=>String(p.id)===String(doc.$id))) return;
        PRODUCTS.push({ id: doc.$id, name: doc.name, category: (doc.category||"materials").toLowerCase(), price: Number(doc.price), symbol:"📖", image: doc.image, desc: doc.description||doc.name, stock: doc.stock+" in stock", details: doc.description||doc.name });
      });
      PRODUCTS.sort((a,b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));
      renderProducts();
    }catch(e2){ console.log(e2); }
  }
}

let activeFilter = "all";
let searchTerm = "";
let cart = JSON.parse(localStorage.getItem("dodis_cart") || "[]");

const grid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");

function formatPrice(n){ return "R " + Number(n).toLocaleString(); }

function renderProducts(){
  const filtered = PRODUCTS.filter(p => {
    const matchFilter = activeFilter === "all" || p.category === activeFilter;
    const matchSearch = p.name.toLowerCase().includes(searchTerm) || p.desc.toLowerCase().includes(searchTerm);
    return matchFilter && matchSearch;
  });
  emptyState.hidden = filtered.length > 0;
  grid.innerHTML = filtered.map(p => `
    <article class="product-card" data-id="${p.id}">
      ${p.image ? `<img src="${p.image}" class="product-thumb-img" style="width:100%;height:300px;object-fit:contain;background:#000;border-radius:10px;display:block;">` : `<div class="product-thumb">${p.symbol}</div>`}
      <span class="product-cat">${p.category.toUpperCase()} · ${String(p.stock).toUpperCase()}</span>
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="product-foot"><span class="price">${formatPrice(p.price)}</span><span class="view-btn">VIEW DETAILS ↗</span></div>
    </article>
  `).join("");
  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => openModal(card.dataset.id));
  });
}

searchInput.addEventListener("input", e => { searchTerm = e.target.value.toLowerCase().trim(); renderProducts(); });
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderProducts();
  });
});

// --- GALLERY LOGIC ---
const modal = document.getElementById("productModal");
let currentProduct = null;
let galleryImages = [];
let galleryIndex = 0;

function openModal(id){
  currentProduct = PRODUCTS.find(p => String(p.id) === String(id));
  if(!currentProduct) return;

  // If Testament -> 3 images, else 1 image, else symbol
  if(currentProduct.image && currentProduct.name.toLowerCase().includes("testament")){
    galleryImages = ["../Images/testament1.jpg","../images/testament2.jpg","../images/testament3.jpg"];
  } else if(currentProduct.image){
    galleryImages = [currentProduct.image];
  } else {
    galleryImages = [];
  }
  galleryIndex = 0;
  updateGallery();

  document.getElementById("modalCategory").textContent = currentProduct.category.toUpperCase() + " · DODIS";
  document.getElementById("modalName").textContent = currentProduct.name;
  document.getElementById("modalDesc").textContent = currentProduct.details;
  document.getElementById("modalPrice").textContent = formatPrice(currentProduct.price);
  document.getElementById("modalStock").textContent = "● " + currentProduct.stock;
  modal.hidden = false;
}

function updateGallery(){
  const modalImg = document.getElementById("modalImage");
  const counter = document.getElementById("imgCounter");
  const thumbs = document.getElementById("thumbRow");
  const prevBtn = document.getElementById("prevImg");
  const nextBtn = document.getElementById("nextImg");
  if(!modalImg) return;

  if(galleryImages.length === 0){
    modalImg.style.display = "none";
    if(counter) counter.textContent = "";
    if(thumbs) thumbs.innerHTML = `<div style="font-size:50px;text-align:center;">${currentProduct.symbol}</div>`;
    if(prevBtn) prevBtn.style.display = "none";
    if(nextBtn) nextBtn.style.display = "none";
    return;
  }

  modalImg.style.display = "block";
  modalImg.src = galleryImages[galleryIndex];
  if(counter) counter.textContent = `${galleryIndex+1} / ${galleryImages.length}`;

  if(galleryImages.length === 1){
    if(prevBtn) prevBtn.style.display = "none";
    if(nextBtn) nextBtn.style.display = "none";
  } else {
    if(prevBtn) prevBtn.style.display = "block";
    if(nextBtn) nextBtn.style.display = "block";
  }

  if(thumbs){
    thumbs.innerHTML = galleryImages.map((src, i) => `
      <img src="${src}" data-idx="${i}" style="width:55px;height:55px;object-fit:cover;border-radius:6px;cursor:pointer;border:${i===galleryIndex?'2px solid #d6b36a':'1px solid #333'};">
    `).join("");
    thumbs.querySelectorAll("img").forEach(t => {
      t.addEventListener("click", () => { galleryIndex = +t.dataset.idx; updateGallery(); });
    });
  }
}

const prevBtnEl = document.getElementById("prevImg");
const nextBtnEl = document.getElementById("nextImg");
if(prevBtnEl) prevBtnEl.addEventListener("click", (e) => { e.stopPropagation(); galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length; updateGallery(); });
if(nextBtnEl) nextBtnEl.addEventListener("click", (e) => { e.stopPropagation(); galleryIndex = (galleryIndex + 1) % galleryImages.length; updateGallery(); });

document.getElementById("modalClose").addEventListener("click", () => modal.hidden = true);
modal.addEventListener("click", e => { if(e.target === modal) modal.hidden = true; });
document.getElementById("modalBuyBtn").addEventListener("click", () => { addToCart(currentProduct.id); modal.hidden = true; openCart(); });

const cartDrawer = document.getElementById("cartDrawer");
function saveCart(){ localStorage.setItem("dodis_cart", JSON.stringify(cart)); updateCartUI(); }
function addToCart(id){
  const existing = cart.find(i => String(i.id) === String(id));
  if(existing) existing.qty++; else cart.push({ id, qty: 1 });
  saveCart();
}
function updateCartUI(){
  const count = cart.reduce((s,i) => s + i.qty, 0);
  document.getElementById("cartCount").textContent = count;
  const box = document.getElementById("cartItems");
  if(cart.length === 0){
    box.innerHTML = `<p style="color:var(--muted); font-size:13px; line-height:1.7;">Your list is empty.<br>Explore DODIS and add something that belongs in your world.</p>`;
  } else {
    box.innerHTML = cart.map(item => {
      const p = PRODUCTS.find(x => String(x.id) === String(item.id));
      return `<div class="cart-item"><div><strong>${p.name}</strong><small>${formatPrice(p.price)} × ${item.qty}</small></div><div><span>${formatPrice(p.price * item.qty)}</span><br><button class="cart-remove" data-id="${p.id}">Remove</button></div></div>`;
    }).join("");
    document.querySelectorAll(".cart-remove").forEach(b => b.addEventListener("click", () => { cart = cart.filter(i => String(i.id) !== String(b.dataset.id)); saveCart(); }));
  }
  const total = cart.reduce((s,i) => { const p = PRODUCTS.find(x => String(x.id) === String(i.id)); return s + p.price * i.qty; }, 0);
  document.getElementById("cartTotal").textContent = formatPrice(total);
}
function openCart(){ cartDrawer.hidden = false; }
document.getElementById("cartFab").addEventListener("click", () => cartDrawer.hidden = !cartDrawer.hidden);
document.getElementById("cartClose").addEventListener("click", () => cartDrawer.hidden = true);
document.getElementById("clearCart").addEventListener("click", () => { cart = []; saveCart(); });

renderProducts();
updateCartUI();
loadAppwriteProducts();

const WHATSAPP_NUMBER = "19304651058";
document.getElementById("whatsappOrder").addEventListener("click", () => {
  if (cart.length === 0) { alert("Your Interest List is empty. Add a product first."); return; }
  let message = "Hello Illumilight / DODIS,%0A%0AI would like to order:%0A%0A";
  let total = 0;
  cart.forEach(item => {
    const p = PRODUCTS.find(x => String(x.id) === String(item.id));
    const lineTotal = p.price * item.qty;
    total += lineTotal;
    message += `• ${p.name} x${item.qty} - R ${lineTotal}%0A`;
  });
  message += `%0A----------------%0ATotal: R ${total}%0A%0AName: %0ADelivery City: %0AI found this on DODIS.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
});