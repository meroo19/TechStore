/* ===== Data ===== */
const products = [
  { id: 1, cat: "electronics", name: "سماعات لاسلكية برو",   image: "image/shopping.webp", old: 9800,  price: 9550,   },
  { id: 2, cat: "mobile",      name: "هاتف ذكي فلاجشيب",     image: "image/images (1).jpg", old: 53000, price: 52600,  },
  { id: 3, cat: "mobile",      name: "هاتف ذكي ألترا",        image: "image/ultra-t-blue.webp", old: 50000, price: 48500,  },
  { id: 4, cat: "accessories", name: "سماعات بلوتوث رياضية", image: "image/SHIO-ML1_V1.avif", old: 350,   price: 270,    },
  { id: 5, cat: "mobile",      name: "تابلت 11 بوصة",         image: "image/ultra-t-blue.webp", old: 18000, price: 16900,  },
  { id: 6, cat: "electronics", name: "ساعة ذكية",             image: "image/ultra-t-blue.webp", old: 4500,  price: 3990,  },
  { id: 7, cat: "electronics", name: "سماعة بلوتوث محمولة",   image: "image/SHIO-ML1_V1.avif", old: 1800,  price: 1500,   },
  { id: 8, cat: "accessories", name: "شاحن سريع 65W",         image: "image/download.avif", old: 600,   price: 480,   },
  { id: 9, cat: "accessories", name: "جراب حماية للموبايل",   image: "image/images.jpg", old: 250,   price: 190,   },
  { id: 10, cat: "accessories", name: "باور بانك 20000mAh",   image: "image/images.jpg", old: 900,   price: 750,    },
];

const fmt = n => new Intl.NumberFormat("ar-EG").format(n) + " ج.م.";
const $ = s => document.querySelector(s);

/* ===== Render products ===== */
const grid = $("#grid");
const catParam = new URLSearchParams(location.search).get("cat");
const limit = +(grid && grid.dataset.limit) || products.length;
const shown = products.filter(p => !catParam || p.cat === catParam).slice(0, limit);
if (grid) grid.innerHTML = shown.map(p => `
  <article class="card reveal">
    <span class="badge">خصم</span>
    <div class="img" style="background:${p.bg}">
  <img
    src="${p.image}"
    alt="${p.name}"
    onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"
  />
  <span style="display:none">${p.icon}</span>
</div>
    <div class="body">
      <h3>${p.name}</h3>
      <div class="price"><span class="new">${fmt(p.price)}</span><span class="old">${fmt(p.old)}</span></div>
      <button class="add" data-id="${p.id}">أضف إلى السلة</button>
    </div>
  </article>`).join("");

/* ===== Product Search ===== */

const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#searchBtn");

function searchProducts() {
  if (!searchInput || !grid) return;

  const query = searchInput.value.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesName = product.name
      .toLowerCase()
      .includes(query);

    const matchesCategory =
      !catParam || product.cat === catParam;

    return matchesName && matchesCategory;
  });

  grid.innerHTML = filteredProducts.map((product) => `
    <article class="card">
      <span class="badge">خصم</span>

      <div class="img" style="background:${product.bg}">
        ${
          product.image
            ? `<img src="${product.image}" alt="${product.name}">`
            : product.icon
        }
      </div>

      <div class="body">
        <h3>${product.name}</h3>

        <div class="price">
          <span class="new">${fmt(product.price)}</span>
          <span class="old">${fmt(product.old)}</span>
        </div>

        <button class="add" data-id="${product.id}">
          أضف إلى السلة
        </button>
      </div>
    </article>
  `).join("");

  if (filteredProducts.length === 0) {
    grid.innerHTML = `
      <p class="search-empty">
        مفيش منتجات مطابقة لبحثك.
      </p>
    `;
  }
}

searchInput?.addEventListener("input", searchProducts);

searchBtn?.addEventListener("click", () => {
  searchProducts();
  document.querySelector("#products")
    ?.scrollIntoView({ behavior: "smooth" });
});

/* ===== Cart ===== */
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

function saveCart(){ localStorage.setItem("cart", JSON.stringify(cart)); }

function renderCart(){
  const list = $("#cartItems");
  if(!cart.length){
    list.innerHTML = `<li class="cart-empty">السلة فارغة</li>`;
  } else {
    list.innerHTML = cart.map(i => {
      const p = products.find(x => x.id === i.id);
      return `<li class="cart-item">
        <div class="thumb" style="background:${p.bg}">
  <img src="${p.image}" alt="${p.name}">
</div>
        <div class="info"><b>${p.name}</b>${fmt(p.price)}
          <div class="qty">
            <button data-act="dec" data-id="${p.id}">−</button>
            <span>${i.qty}</span>
            <button data-act="inc" data-id="${p.id}">+</button>
          </div>
        </div>
        <button class="remove" data-act="del" data-id="${p.id}">🗑</button>
      </li>`;
    }).join("");
  }
  const total = cart.reduce((s,i)=> s + products.find(x=>x.id===i.id).price * i.qty, 0);
  const count = cart.reduce((s,i)=> s + i.qty, 0);
  $("#cartTotal").textContent = fmt(total);
  $("#cartSum").textContent = fmt(total);
  $("#cartCount").textContent = count;
  saveCart();
}

function addToCart(id){
  const item = cart.find(i => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  renderCart();
  showToast();
}

if (grid) grid.addEventListener("click", e => {
  const btn = e.target.closest(".add");
  if(btn) addToCart(+btn.dataset.id);
});

$("#cartItems").addEventListener("click", e => {
  const b = e.target.closest("[data-act]");
  if(!b) return;
  const id = +b.dataset.id, item = cart.find(i => i.id === id);
  if(b.dataset.act === "inc") item.qty++;
  if(b.dataset.act === "dec") item.qty--;
  if(b.dataset.act === "del" || item.qty <= 0) cart = cart.filter(i => i.id !== id);
  renderCart();
});

/* ===== Toast ===== */
let toastTimer;
function showToast(msg){
  const t = $("#toast");
  t.textContent = msg || "تمت الإضافة إلى السلة ✓";
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

/* ===== Drawer / cart panel ===== */
const overlay = $("#overlay"), drawer = $("#drawer"), panel = $("#cartPanel");
function openEl(el){ el.classList.add("open"); overlay.classList.add("show"); document.body.style.overflow = "hidden"; }
function closeAll(){
  drawer.classList.remove("open"); panel.classList.remove("open");
  overlay.classList.remove("show"); document.body.style.overflow = "";
}
$("#menuBtn").onclick = () => openEl(drawer);
$("#cartBtn").onclick = () => openEl(panel);
overlay.onclick = closeAll;
document.querySelectorAll("[data-close]").forEach(b => b.onclick = closeAll);
drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", closeAll));
document.addEventListener("keydown", e => e.key === "Escape" && closeAll());

/* ===== Header shadow on scroll ===== */
addEventListener("scroll", () => $("#header").classList.toggle("scrolled", scrollY > 10));

/* ===== Slider (home page only) ===== */
if ($("#slider")) (function(){
const slides = $("#slides"), total = slides.children.length, dots = $("#dots");
let cur = 0, auto;
for(let i = 0; i < total; i++){
  const d = document.createElement("button");
  d.onclick = () => go(i);
  dots.appendChild(d);
}
function go(i){
  cur = (i + total) % total;
  slides.style.transform = `translateX(${-cur * 100}%)`;
  [...dots.children].forEach((d,k) => d.classList.toggle("active", k === cur));
  restart();
}
function restart(){ clearInterval(auto); auto = setInterval(() => go(cur + 1), 4000); }
$("#next").onclick = () => go(cur + 1);
$("#prev").onclick = () => go(cur - 1);
$("#slider").addEventListener("mouseenter", () => clearInterval(auto));
$("#slider").addEventListener("mouseleave", restart);

// swipe support
let startX = 0;
slides.addEventListener("touchstart", e => startX = e.touches[0].clientX, { passive: true });
slides.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - startX;
  if(Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
});

go(0);
})();

/* ===== Reveal on scroll ===== */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
}, { threshold: .15 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* ===== Shop page: title & tabs ===== */
const catNames = { mobile: "موبايل وتابلت", electronics: "إلكترونيات", accessories: "اكسسوارات موبايل" };
const shopTitle = $("#shopTitle");
if (shopTitle) shopTitle.textContent = catNames[catParam] || "المتجر";
document.querySelectorAll(".tabs a").forEach(a => {
  a.classList.toggle("active", new URL(a.href).searchParams.get("cat") === catParam);
});

/* ===== Forms (contact / login) ===== */
document.querySelectorAll("form[data-msg]").forEach(f => f.addEventListener("submit", e => {
  e.preventDefault();
  showToast(f.dataset.msg);
  f.reset();
}));

/* ===== Init ===== */
renderCart();