// DODIS - Live from Appwrite
const APPWRITE_ENDPOINT = "https://cloud.appwrite.io/v1"; // same as shop.html
const PROJECT_ID = "6ae27aad00007b481204";
const DATABASE_ID = "illumilight-db";
const TABLE_ID = "6afb96090029e4927ee3";
let allProducts = [];
let cart = [];

async function loadProducts() {
  const res = await fetch(`${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${TABLE_ID}/documents`, {
    headers: { "X-Appwrite-Project": APPWRITE_PROJECT }
  });
  const data = await res.json();
  allProducts = data.documents;
  renderProducts(allProducts);
}

function renderProducts(list) {
  const grid = document.getElementById('productGrid');
  const empty = document.getElementById('emptyState');
  grid.innerHTML = '';
  
  if(!list.length){ empty.hidden = false; return; }
  empty.hidden = true;

  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="product-image" style="width:100%;height:380px;object-fit:contain;background:#000;">
      <div class="product-info">
        <span class="product-category">${p.category || 'DODIS'}</span>
        <h3>${p.name}</h3>
        <p>${(p.description || '').substring(0,80)}...</p>
        <div class="price">R ${p.price}</div>
        <span>${p.stock} in stock</span>
        <button class="buy-btn" onclick="openModal('${p.$id}')">VIEW →</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Search + Filter
document.getElementById('searchInput').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderProducts(allProducts.filter(p => p.name.toLowerCase().includes(q)));
});
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    if(f==='all') renderProducts(allProducts);
    else renderProducts(allProducts.filter(p => (p.category||'').toLowerCase()===f));
  });
});

function openModal(id){
  const p = allProducts.find(x=>x.$id===id);
  document.getElementById('modalImage').src = p.image;
  document.getElementById('modalCategory').textContent = p.category;
  document.getElementById('modalName').textContent = p.name;
  document.getElementById('modalDesc').textContent = p.description;
  document.getElementById('modalPrice').textContent = 'R '+p.price;
  document.getElementById('modalStock').textContent = p.stock+' in stock';
  document.getElementById('productModal').hidden = false;
  document.getElementById('modalBuyBtn').onclick = ()=> addToCart(p);
}
document.getElementById('modalClose').onclick = ()=> document.getElementById('productModal').hidden = true;

function addToCart(p){
  cart.push(p);
  document.getElementById('cartCount').textContent = cart.length;
  document.getElementById('cartTotal').textContent = 'R '+cart.reduce((a,b)=>a+Number(b.price),0);
  document.getElementById('cartItems').innerHTML = cart.map(c=>`<p>${c.name} - R ${c.price}</p>`).join('');
}

document.getElementById('cartFab').onclick = ()=> document.getElementById('cartDrawer').hidden = false;
document.getElementById('cartClose').onclick = ()=> document.getElementById('cartDrawer').hidden = true;
document.getElementById('clearCart').onclick = ()=>{ cart=[]; document.getElementById('cartCount').textContent=0; document.getElementById('cartItems').innerHTML=''; document.getElementById('cartTotal').textContent='R 0'; };

loadProducts();