// DODIS - FINAL 2026 - RAIL + FLIP + MEMBER + APPWRITE 1-BUCKET WEBP/MP4
const PROJECT_ID = "6ae27aad00007b481204";
const DATABASE_ID = "illumilight-db";
const TABLE_ID = "6afb96090029e4927ee3";
const BUCKET_ID = "6aff738b001323f8ed0d";
const APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1";

function storageUrl(fileIdOrUrl){
  if(!fileIdOrUrl) return "";
  if(fileIdOrUrl.startsWith("http")){
    try{
      const u = new URL(fileIdOrUrl);
      const fileId = u.pathname.split("/files/")[1].split("/")[0];
      return `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`;
    }catch(e){ return fileIdOrUrl.split("?")[0] + "?project=" + PROJECT_ID; }
  }
  return `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileIdOrUrl}/view?project=${PROJECT_ID}`;
}

function normalizeCategory(cat){
  cat = (cat||"materials").toLowerCase().trim();
  if(cat==="materials"||cat==="material") return "materials";
  if(cat==="accessories"||cat==="accessory"||cat==="essentials"||cat==="collection") return "accessories";
  if(cat==="books"||cat==="book"||cat==="light") return "books";
  return "materials";
}

function isMember(){ return localStorage.getItem("illumi_member") === "ILL-2026"; }
function memberPrice(p){
  if(!isMember()) return Number(p.price);
  if(p.category==="books") return 650;
  return Math.round(Number(p.price)*0.9);
}

const PRODUCTS = [];

async function loadAppwriteProducts(){
  try{
    const url = `${APPWRITE_ENDPOINT}/tablesdb/${DATABASE_ID}/tables/${TABLE_ID}/rows`;
    const res = await fetch(url, { headers: { "X-Appwrite-Project": PROJECT_ID } });
    const data = await res.json();
    const rows = data.rows || data.documents || [];
    rows.forEach(doc => {
      if(PRODUCTS.find(p => String(p.id) === String(doc.$id))) return;
      let imgs = [];
      if(doc.image) imgs.push(storageUrl(doc.image));
      if(doc.image2) imgs.push(storageUrl(doc.image2));
      if(doc.image3) imgs.push(storageUrl(doc.image3));
      let mainImg = imgs[0] || "";
      PRODUCTS.push({ 
        id: doc.$id, 
        name: doc.name, 
        category: normalizeCategory(doc.category), 
        price: Number(doc.price), 
        symbol:"📖", 
        image: mainImg, 
        images: imgs.length?imgs:[mainImg], 
        video: doc.video ? storageUrl(doc.video) : null,
        desc: doc.description||doc.name, 
        stock: doc.stock?doc.stock+" in stock":"In Stock", 
        details: doc.description||doc.name 
      });
    });
    PRODUCTS.sort((a,b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));
    renderProducts();
  }catch(e){ console.log("Appwrite error", e); }
}

async function loadMedia(){
  const mediaGrid = document.getElementById("mediaGrid");
  if(!mediaGrid) return;
  try{
    const mediaTableId = "media";
    const url = `${APPWRITE_ENDPOINT}/tablesdb/${DATABASE_ID}/tables/${mediaTableId}/rows`;
    const res = await fetch(url, { headers: { "X-Appwrite-Project": PROJECT_ID } });
    const data = await res.json();
    const rows = data.rows || data.documents || [];
    if(rows.length===0) return;
    mediaGrid.innerHTML = rows.map(m=>{
      const u = storageUrl(m.url || m.fileId);
      const poster = m.poster ? storageUrl(m.poster) : "";
      const isVideo = (m.type==="video") || u.endsWith(".mp4");
      if(isVideo){
        return `<div class="media-item"><video src="${u}" poster="${poster}" controls playsinline style="width:100%;border-radius:10px;background:#000;"></video><p>${m.title||""}</p></div>`;
      } else {
        return `<div class="media-item"><img src="${u}" loading="lazy" style="width:100%;border-radius:10px;background:#000;"><p>${m.title||""}</p></div>`;
      }
    }).join("");
  }catch(e){ console.log("media not yet setup, skipping", e); }
}

let activeFilter = "all";
let searchTerm = "";
let cart = JSON.parse(localStorage.getItem("dodis_cart") || "[]");
const grid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const prevRail = document.getElementById("railPrev");
const nextRail = document.getElementById("railNext");
let railIndex = 0;
let isScrolling = false;

function formatPrice(n){ return "R " + Number(n).toLocaleString(); }

function renderProducts(){
  const filtered = PRODUCTS.filter(p => {
    const matchFilter = activeFilter === "all" || p.category === activeFilter;
    const matchSearch = p.name.toLowerCase().includes(searchTerm) || p.desc.toLowerCase().includes(searchTerm);
    return matchFilter && matchSearch;
  });
  if(emptyState) emptyState.hidden = filtered.length > 0;
  if(!grid) return;
  grid.innerHTML = filtered.map((p,i) => {
    const mPrice = memberPrice(p);
    const showMember = isMember() && mPrice !== Number(p.price);
    return `
    <article class="product-card rail-card ${i===railIndex?'active':''}" data-id="${p.id}">
      <div class="hanger"><span></span></div>
      <div class="flip-wrap">
        ${p.image ? `<img src="${p.image}" class="product-thumb-img rail-img" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" style="width:100%;height:300px;object-fit:contain;background:#000;border-radius:10px;display:block;">` : ``}
        <div class="product-thumb" style="${p.image?'display:none;':''}">${p.symbol}</div>
        ${p.images && p.images.length>1 ? `<button class="flip-badge" data-id="${p.id}">FLIP ↻</button>` : ``}
        ${p.video ? `<span style="position:absolute;top:10px;right:10px;background:#d6b36a;color:#000;font-size:10px;padding:3px 7px;border-radius:20px;">VIDEO</span>` : ``}
      </div>
      <span class="product-cat">${p.category.toUpperCase()} · ${String(p.stock).toUpperCase()}</span>
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="product-foot">${showMember ? `<span class="price"><s style="opacity:.5;font-size:13px;">${formatPrice(p.price)}</s> <span style="color:#d6b36a;">${formatPrice(mPrice)} MEMBER</span></span>` : `<span class="price">${formatPrice(p.price)}</span>`}<span class="view-btn">VIEW DETAILS ↗</span></div>
      ${!isMember() && p.category==="books" ? `<small style="color:#888;font-size:11px;">MEMBERS PAY R 650 — CODE ILL-2026</small>` : ``}
    </article>
  `}).join("");
  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", (e)=>{ if(e.target.classList.contains("flip-badge")) return; openModal(card.dataset.id); });
  });
  document.querySelectorAll(".flip-badge").forEach(btn=>{
    btn.addEventListener("click",(e)=>{
      e.stopPropagation();
      const p = PRODUCTS.find(x=>String(x.id)===String(btn.dataset.id));
      const imgEl = btn.parentElement.querySelector("img");
      let cur = p.images.indexOf(imgEl.getAttribute("src"));
      if(cur===-1) cur=0;
      imgEl.src = p.images[(cur+1)%p.images.length];
    });
  });
  updateRailCounter();
}

function updateRailCounter(){
  const el = document.getElementById("railCounter");
  if(!el) return;
  const cards = [...grid.querySelectorAll(".rail-card")];
  el.textContent = `${cards.length? railIndex+1 : 0} / ${cards.length}`;
}

function scrollToCard(dir){
  const cards = [...grid.querySelectorAll(".rail-card")];
  if(!cards.length) return;
  railIndex += dir;
  if(railIndex < 0) railIndex = 0;
  if(railIndex >= cards.length) railIndex = cards.length - 1;
  isScrolling = true;
  cards.forEach(c=>c.classList.remove("active"));
  cards[railIndex].classList.add("active");
  cards[railIndex].scrollIntoView({behavior:"smooth", inline:"center", block:"nearest"});
  updateRailCounter();
  setTimeout(()=> isScrolling=false, 500);
}

// RAIL SCROLL - detect swipe
if(grid){
  grid.addEventListener("scroll", ()=>{
    if(isScrolling) return;
    clearTimeout(grid._t);
    grid._t = setTimeout(()=>{
      const cards = [...grid.querySelectorAll(".rail-card")];
      let center = grid.scrollLeft + grid.offsetWidth/2;
      let closestIdx = 0;
      let closestDist = 999999;
      cards.forEach((c,i)=>{
        const d = Math.abs(c.offsetLeft + c.offsetWidth/2 - center);
        if(d < closestDist){ closestDist = d; closestIdx = i; }
      });
      railIndex = closestIdx;
      cards.forEach(c=>c.classList.remove("active"));
      if(cards[railIndex]) cards[railIndex].classList.add("active");
      updateRailCounter();
    }, 100);
  });
}

if(prevRail) prevRail.onclick = ()=> scrollToCard(-1);
if(nextRail) nextRail.onclick = ()=> scrollToCard(1);

if(searchInput) searchInput.addEventListener("input", e => { searchTerm = e.target.value.toLowerCase().trim(); railIndex=0; renderProducts(); });
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    railIndex = 0;
    grid.scrollLeft = 0;
    renderProducts();
  });
});

const modal = document.getElementById("productModal");
let currentProduct = null;
let galleryImages = [];
let galleryIndex = 0;
function openModal(id){
  currentProduct = PRODUCTS.find(p => String(p.id) === String(id));
  if(!currentProduct) return;
  galleryImages = (currentProduct.images && currentProduct.images.length>0) ? currentProduct.images : (currentProduct.image ? [currentProduct.image] : []);
  galleryIndex = 0;
  updateGallery();
  document.getElementById("modalCategory").textContent = currentProduct.category.toUpperCase() + " · DODIS";
  document.getElementById("modalName").textContent = currentProduct.name;
  document.getElementById("modalDesc").textContent = currentProduct.details;
  const mp = memberPrice(currentProduct);
  if(isMember() && mp !== Number(currentProduct.price)){
    document.getElementById("modalPrice").innerHTML = `<s style="opacity:.5;font-size:15px;">${formatPrice(currentProduct.price)}</s> ${formatPrice(mp)} <small style="color:#d6b36a;">MEMBER</small>`;
  } else {
    document.getElementById("modalPrice").textContent = formatPrice(currentProduct.price);
  }
  document.getElementById("modalStock").textContent = "● " + currentProduct.stock;
  let vidWrap = document.getElementById("modalVideoWrap");
  if(currentProduct.video){
    if(!vidWrap){
      vidWrap = document.createElement("div");
      vidWrap.id = "modalVideoWrap";
      document.getElementById("modalImage").after(vidWrap);
    }
    vidWrap.innerHTML = `<video src="${currentProduct.video}" controls playsinline style="width:100%;border-radius:10px;margin-top:10px;background:#000;"></video>`;
  } else if(vidWrap) vidWrap.innerHTML = "";
  modal.hidden = false;
}
function updateGallery(){
  const modalImg = document.getElementById("modalImage");
  const counter = document.getElementById("imgCounter");
  const thumbs = document.getElementById("thumbRow");
  const prevBtn = document.getElementById("prevImg");
  const nextBtn = document.getElementById("nextImg");
  if(!modalImg) return;
  if(galleryImages.length === 0 || !galleryImages[0]){
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
    thumbs.innerHTML = galleryImages.map((src, i) => `<img src="${src}" data-idx="${i}" style="width:55px;height:55px;object-fit:cover;border-radius:6px;cursor:pointer;border:${i===galleryIndex?'2px solid #d6b36a':'1px solid #333'};">`).join("");
    thumbs.querySelectorAll("img").forEach(t => { t.addEventListener("click", () => { galleryIndex = +t.dataset.idx; updateGallery(); }); });
  }
}
const prevBtnEl = document.getElementById("prevImg");
const nextBtnEl = document.getElementById("nextImg");
if(prevBtnEl) prevBtnEl.addEventListener("click", (e) => { e.stopPropagation(); galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length; updateGallery(); });
if(nextBtnEl) nextBtnEl.addEventListener("click", (e) => { e.stopPropagation(); galleryIndex = (galleryIndex + 1) % galleryImages.length; updateGallery(); });
const modalClose = document.getElementById("modalClose");
if(modalClose) modalClose.addEventListener("click", () => modal.hidden = true);
if(modal) modal.addEventListener("click", e => { if(e.target === modal) modal.hidden = true; });
const modalBuy = document.getElementById("modalBuyBtn");
if(modalBuy) modalBuy.addEventListener("click", () => { addToCart(currentProduct.id); modal.hidden = true; openCart(); });

const cartDrawer = document.getElementById("cartDrawer");
function saveCart(){ localStorage.setItem("dodis_cart", JSON.stringify(cart)); updateCartUI(); }
function addToCart(id){
  const existing = cart.find(i => String(i.id) === String(id));
  if(existing) existing.qty++; else cart.push({ id, qty: 1 });
  saveCart();
}
function updateCartUI(){
  const count = cart.reduce((s,i) => s + i.qty, 0);
  const countEl = document.getElementById("cartCount");
  if(countEl) countEl.textContent = count;
  const box = document.getElementById("cartItems");
  if(!box) return;
  if(cart.length === 0){
    box.innerHTML = `<p style="color:var(--muted); font-size:13px; line-height:1.7;">Your list is empty.<br>Explore DODIS and add something that belongs in your world.</p>`;
  } else {
    box.innerHTML = cart.map(item => {
      const p = PRODUCTS.find(x => String(x.id) === String(item.id));
      if(!p) return "";
      const priceToUse = memberPrice(p);
      return `<div class="cart-item"><div><strong>${p.name}</strong><small>${formatPrice(priceToUse)} × ${item.qty}</small></div><div><span>${formatPrice(priceToUse * item.qty)}</span><br><button class="cart-remove" data-id="${p.id}">Remove</button></div></div>`;
    }).join("");
    document.querySelectorAll(".cart-remove").forEach(b => b.addEventListener("click", () => { cart = cart.filter(i => String(i.id) !== String(b.dataset.id)); saveCart(); }));
  }
  const total = cart.reduce((s,i) => { const p = PRODUCTS.find(x => String(x.id) === String(i.id)); return p ? s + memberPrice(p) * i.qty : s; }, 0);
  const totalEl = document.getElementById("cartTotal");
  if(totalEl) totalEl.textContent = formatPrice(total);
}
function openCart(){ cartDrawer.hidden = false; }
const cartFab = document.getElementById("cartFab");
if(cartFab) cartFab.addEventListener("click", () => cartDrawer.hidden = !cartDrawer.hidden);
const cartClose = document.getElementById("cartClose");
if(cartClose) cartClose.addEventListener("click", () => cartDrawer.hidden = true);
const clearCart = document.getElementById("clearCart");
if(clearCart) clearCart.addEventListener("click", () => { cart = []; saveCart(); });

const memberInput = document.getElementById("memberCode");
const memberBtn = document.getElementById("applyMember");
const memberStatus = document.getElementById("memberStatus");
function refreshMemberUI(){ if(isMember()){ if(memberStatus) memberStatus.textContent = "● MEMBER UNLOCKED - R650 TESTAMENT"; if(memberInput) memberInput.value="ILL-2026"; } }
if(memberBtn) memberBtn.addEventListener("click",()=>{
  if(memberInput.value.trim().toUpperCase()==="ILL-2026"){
    localStorage.setItem("illumi_member","ILL-2026");
    alert("Welcome Member! Testament now R650 for you.");
    refreshMemberUI(); renderProducts(); updateCartUI();
  } else { alert("Invalid code. Hint: ILL-2026"); }
});
refreshMemberUI();
renderProducts();
updateCartUI();
loadAppwriteProducts();
loadMedia();

const WHATSAPP_NUMBER = "19304651058";
const waBtn = document.getElementById("whatsappOrder");
if(waBtn) waBtn.addEventListener("click", () => {
  if (cart.length === 0) { alert("Your Interest List is empty. Add a product first."); return; }
  let message = "Hello Illumilight / DODIS,%0A%0AI would like to order:%0A%0A";
  let total = 0;
  cart.forEach(item => {
    const p = PRODUCTS.find(x => String(x.id) === String(item.id));
    if(!p) return;
    const priceToUse = memberPrice(p);
    const lineTotal = priceToUse * item.qty;
    total += lineTotal;
    message += `• ${p.name} x${item.qty} - R ${lineTotal} ${isMember()?'(MEMBER PRICE)':''}%0A`;
  });
  message += `%0A----------------%0ATotal: R ${total}%0A%0AName: %0ADelivery City: %0AI found this on DODIS.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
});