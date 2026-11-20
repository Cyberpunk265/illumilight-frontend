const PROJECT_ID="6ae27aad00007b481204";const DATABASE_ID="illumilight-db";const TABLE_ID="6afb96090029e4927ee3";const BUCKET_ID="6aff738b001323f8ed0d";const APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1";
function storageUrl(f){if(!f)return"";if(f.startsWith("http")){try{const u=new URL(f);const id=u.pathname.split("/files/")[1].split("/")[0];return`${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${id}/view?project=${PROJECT_ID}`;}catch(e){return f.split("?")[0]+"?project="+PROJECT_ID;}}return`${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${f}/view?project=${PROJECT_ID}`;}
function normalizeCategory(c){c=(c||"materials").toLowerCase().trim();if(c.includes("book")||c.includes("light"))return"books";if(c.includes("access")||c.includes("essential")||c.includes("collection"))return"accessories";return"materials";}
function isMember(){return localStorage.getItem("illumi_member")==="ILL-2026";}
function memberPrice(p){if(!isMember())return Number(p.price);if(p.category==="books")return 650;return Math.round(Number(p.price)*0.9);}
const PRODUCTS=[];
async function loadAppwriteProducts(){try{const res=await fetch(`${APPWRITE_ENDPOINT}/tablesdb/${DATABASE_ID}/tables/${TABLE_ID}/rows`,{headers:{"X-Appwrite-Project":PROJECT_ID}});const data=await res.json();const rows=data.rows||data.documents||[];rows.forEach(doc=>{if(PRODUCTS.find(p=>String(p.id)===String(doc.$id)))return;let imgs=[];if(doc.image)imgs.push(storageUrl(doc.image));if(doc.image2)imgs.push(storageUrl(doc.image2));if(doc.image3)imgs.push(storageUrl(doc.image3));PRODUCTS.push({id:doc.$id,name:doc.name,category:normalizeCategory(doc.category),price:Number(doc.price),symbol:"⛧",image:imgs[0]||"",images:imgs.length?imgs:[],video:doc.video?storageUrl(doc.video):null,desc:doc.description||doc.name,stock:doc.stock?doc.stock+" in stock":"In Stock",details:doc.description||doc.name});});renderProducts();}catch(e){}}
let activeFilter="all";let searchTerm="";let cart=JSON.parse(localStorage.getItem("dodis_cart")||"[]");
const grid=document.getElementById("productGrid");const emptyState=document.getElementById("emptyState");const searchInput=document.getElementById("searchInput");
function formatPrice(n){return"R "+Number(n).toLocaleString();}
function renderProducts(){
const filtered=PRODUCTS.filter(p=>{const mf=activeFilter==="all"||p.category===activeFilter;const ms=p.name.toLowerCase().includes(searchTerm)||p.desc.toLowerCase().includes(searchTerm);return mf&&ms;});
if(emptyState)emptyState.hidden=filtered.length>0;if(!grid)return;
grid.innerHTML=filtered.map(p=>{
const mPrice=memberPrice(p);const showMember=isMember()&&mPrice!==Number(p.price);
return`<article class="behance-card" data-id="${p.id}">
${p.image?`<img src="${p.image}" loading="lazy">`:`<div style="height:190px;display:flex;align-items:center;justify-content:center;font-size:40px;background:#000;">⛧</div>`}
<div class="b-cat">${p.category.toUpperCase()} · ${String(p.stock).toUpperCase()}</div>
<h3>${p.name}</h3>
<div class="b-price">${showMember?`<s style="opacity:.5;font-weight:400;font-size:11px;">${formatPrice(p.price)}</s> ${formatPrice(mPrice)}`:`${formatPrice(p.price)}`}</div>
</article>`;}).join("");
document.querySelectorAll(".behance-card").forEach(c=>c.addEventListener("click",()=>openModal(c.dataset.id)));
}
if(searchInput)searchInput.addEventListener("input",e=>{searchTerm=e.target.value.toLowerCase().trim();renderProducts();});
document.querySelectorAll(".filter-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");activeFilter=b.dataset.filter;renderProducts();}));
const modal=document.getElementById("productModal");let currentProduct=null;let galleryImages=[];let galleryIndex=0;
function openModal(id){currentProduct=PRODUCTS.find(p=>String(p.id)===String(id));if(!currentProduct)return;galleryImages=currentProduct.images.length?currentProduct.images:[currentProduct.image];galleryIndex=0;updateGallery();document.getElementById("modalCategory").textContent=currentProduct.category.toUpperCase()+" ⛧";document.getElementById("modalName").textContent=currentProduct.name;document.getElementById("modalDesc").textContent=currentProduct.details;const mp=memberPrice(currentProduct);document.getElementById("modalPrice").textContent=isMember()&&mp!==Number(currentProduct.price)?`${formatPrice(mp)} (MEMBER)` : formatPrice(currentProduct.price);document.getElementById("modalStock").textContent="● "+currentProduct.stock;modal.hidden=false;}
function updateGallery(){const img=document.getElementById("modalImage");const cnt=document.getElementById("imgCounter");const thumbs=document.getElementById("thumbRow");if(!galleryImages[0]){img.style.display="none";return;}img.style.display="block";img.src=galleryImages[galleryIndex];cnt.textContent=`${galleryIndex+1} / ${galleryImages.length}`;thumbs.innerHTML=galleryImages.map((s,i)=>`<img src="${s}" data-i="${i}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;cursor:pointer;border:${i===galleryIndex?'2px solid #ff1a1a':'1px solid #3a0000'};">`).join("");thumbs.querySelectorAll("img").forEach(t=>t.addEventListener("click",()=>{galleryIndex=+t.dataset.i;updateGallery();}));}
document.getElementById("prevImg").addEventListener("click",()=>{galleryIndex=(galleryIndex-1+galleryImages.length)%galleryImages.length;updateGallery();});
document.getElementById("nextImg").addEventListener("click",()=>{galleryIndex=(galleryIndex+1)%galleryImages.length;updateGallery();});
document.getElementById("modalClose").addEventListener("click",()=>modal.hidden=true);modal.addEventListener("click",e=>{if(e.target===modal)modal.hidden=true;});
document.getElementById("modalBuyBtn").addEventListener("click",()=>{addToCart(currentProduct.id);modal.hidden=true;document.getElementById("behanceSheet").classList.add("show");});
function saveCart(){localStorage.setItem("dodis_cart",JSON.stringify(cart));updateCartUI();}
function addToCart(id){const ex=cart.find(i=>String(i.id)===String(id));if(ex)ex.qty++;else cart.push({id,qty:1});saveCart();}
function changeQty(id,d){const it=cart.find(i=>String(i.id)===String(id));if(!it)return;it.qty+=d;if(it.qty<=0)cart=cart.filter(i=>String(i.id)!==String(id));saveCart();}
function removeItem(id){cart=cart.filter(i=>String(i.id)!==String(id));saveCart();}
function updateCartUI(){
const count=cart.reduce((s,i)=>s+i.qty,0);const total=cart.reduce((s,i)=>{const p=PRODUCTS.find(x=>String(x.id)===String(i.id));return p?s+memberPrice(p)*i.qty:s;},0);
document.getElementById("pillTotal").textContent=formatPrice(total);
document.getElementById("pillCount").textContent=count?`· ${count}`:"";
document.getElementById("cartTotal").textContent=formatPrice(total);
document.getElementById("freeBar").style.width=Math.min(100,total/1500*100)+"%";
document.getElementById("freeMsg").textContent=total>=1500?"✓ FREE DELIVERY UNLOCKED":total===0?"":`Add ${formatPrice(1500-total)} for FREE delivery`;
const thumbs=document.getElementById("pillThumbs");
thumbs.innerHTML=cart.length===0?`<span>⛧</span>`:cart.slice(0,3).map(it=>{const p=PRODUCTS.find(x=>String(x.id)===String(it.id));return p&&p.image?`<img src="${p.image}">`:"";}).join("");
const box=document.getElementById("cartItems");
if(cart.length===0)box.innerHTML=`<div style="text-align:center;padding:30px;color:#777;">Your vault is empty ⛧</div>`;
else box.innerHTML=cart.map(it=>{const p=PRODUCTS.find(x=>String(x.id)===String(it.id));if(!p)return"";const pr=memberPrice(p);return`<div style="display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid #2a0000;"><img src="${p.image||''}" style="width:56px;height:56px;object-fit:cover;border-radius:10px;background:#000;"><div style="flex:1;"><b style="font-size:13px;">${p.name}</b><br><small style="color:#ff1a1a;">${formatPrice(pr)}</small><div style="display:flex;gap:8px;margin-top:6px;align-items:center;"><button class="qty-btn" onclick="changeQty('${p.id}',-1)">−</button><span>${it.qty}</span><button class="qty-btn" onclick="changeQty('${p.id}',1)">+</button></div></div><div style="text-align:right;"><b>${formatPrice(pr*it.qty)}</b><br><button onclick="removeItem('${p.id}')" style="background:none;border:none;color:#888;font-size:11px;cursor:pointer;">✕ Remove</button></div></div>`;}).join("");
}
document.getElementById("pillExpand").addEventListener("click",()=>document.getElementById("behanceSheet").classList.toggle("show"));
document.getElementById("sheetClose").addEventListener("click",()=>document.getElementById("behanceSheet").classList.remove("show"));
document.getElementById("clearCart").addEventListener("click",()=>{cart=[];saveCart();});
const memberInput=document.getElementById("memberCode");const memberBtn=document.getElementById("applyMember");const memberStatus=document.getElementById("memberStatus");
function refreshMemberUI(){if(isMember()){memberStatus.textContent="● MEMBER - R650 TESTAMENT ⛧";memberInput.value="ILL-2026";}}
if(memberBtn)memberBtn.addEventListener("click",()=>{if(memberInput.value.trim().toUpperCase()==="ILL-2026"){localStorage.setItem("illumi_member","ILL-2026");refreshMemberUI();renderProducts();updateCartUI();alert("Welcome to the Order");}else alert("Try ILL-2026");});
refreshMemberUI();renderProducts();updateCartUI();loadAppwriteProducts();
const WHATSAPP_NUMBER="19304651058";
document.getElementById("whatsappOrder").addEventListener("click",()=>{if(cart.length===0){alert("Vault empty");return;}let msg="Hello Illumilight / DODIS,%0A%0AI would like to order:%0A%0A";let total=0;cart.forEach(it=>{const p=PRODUCTS.find(x=>String(x.id)===String(it.id));if(!p)return;const pr=memberPrice(p);const lt=pr*it.qty;total+=lt;msg+=`• ${p.name} x${it.qty} - R ${lt}%0A`;});msg+=`%0ATotal: R ${total}%0A%0AName: %0ACity: %0A`;window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`,"_blank");});