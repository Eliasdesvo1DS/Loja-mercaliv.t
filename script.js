const products = [
  { id: 1, name: "Dom Casmurro", author: "Machado de Assis", category: "Literatura", price: 34.90, oldPrice: 44.90, emoji: "📕", description: "Um clássico da literatura brasileira" },
  { id: 2, name: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", category: "Literatura", price: 29.90, oldPrice: 39.90, emoji: "📘", description: "Uma história sobre amizade e imaginação" },
  { id: 3, name: "A Sociedade do Anel", author: "J. R. R. Tolkien", category: "Fantasia", price: 59.90, oldPrice: 74.90, emoji: "📗", description: "Uma aventura épica de fantasia" },
  { id: 4, name: "Harry Potter e a Pedra Filosofal", author: "J. K. Rowling", category: "Fantasia", price: 49.90, oldPrice: 64.90, emoji: "📙", description: "O começo de uma jornada mágica" },
  { id: 5, name: "O Hobbit", author: "J. R. R. Tolkien", category: "Fantasia", price: 39.90, oldPrice: 49.90, emoji: "📔", description: "Uma viagem inesperada" },
  { id: 6, name: "Hábitos Atômicos", author: "James Clear", category: "Desenvolvimento", price: 44.90, oldPrice: 59.90, emoji: "📒", description: "Ideias para construir bons hábitos" },
  { id: 7, name: "Como Fazer Amigos e Influenciar Pessoas", author: "Dale Carnegie", category: "Desenvolvimento", price: 36.90, oldPrice: 49.90, emoji: "📓", description: "Comunicação e relações interpessoais" },
  { id: 8, name: "O Poder do Hábito", author: "Charles Duhigg", category: "Desenvolvimento", price: 42.90, oldPrice: 54.90, emoji: "📚", description: "Como os hábitos se formam" },
  { id: 9, name: "Capitães da Areia", author: "Jorge Amado", category: "Literatura", price: 32.90, oldPrice: 42.90, emoji: "📕", description: "Um romance ambientado em Salvador" },
  { id: 10, name: "Manual de Redação", author: "Equipe editorial", category: "Estudos", price: 27.90, oldPrice: 35.90, emoji: "📖", description: "Apoio para escrita e estudos" },
  { id: 11, name: "Matemática Essencial", author: "Equipe editorial", category: "Estudos", price: 45.90, oldPrice: 59.90, emoji: "📐", description: "Revisão de conceitos matemáticos" },
  { id: 12, name: "Introdução à Programação", author: "Equipe editorial", category: "Estudos", price: 54.90, oldPrice: 69.90, emoji: "💻", description: "Conceitos básicos de programação" }
];

const money = value => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const searchForm = document.querySelector("#searchForm");
const resultCount = document.querySelector("#resultCount");
const productsTitle = document.querySelector("#productsTitle");
const emptyState = document.querySelector("#emptyState");
const cartDrawer = document.querySelector("#cartDrawer");
const overlay = document.querySelector("#overlay");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartEmpty = document.querySelector("#cartEmpty");
const cartSummary = document.querySelector("#cartSummary");
const toast = document.querySelector("#toast");

let selectedCategory = "Todos";
let searchTerm = "";
let toastTimeout;
let cart = loadCart();

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("livraria-demo-cart") || "[]");
    return Array.isArray(saved) ? saved.filter(item => products.some(p => p.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch { return []; }
}
function saveCart() {
  try { localStorage.setItem("livraria-demo-cart", JSON.stringify(cart)); } catch {}
}
function filteredProducts() {
  const query = searchTerm.trim().toLocaleLowerCase("pt-BR");
  return products.filter(product => {
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    const text = `${product.name} ${product.author} ${product.category} ${product.description}`.toLocaleLowerCase("pt-BR");
    return matchesCategory && text.includes(query);
  });
}
function renderProducts() {
  const list = filteredProducts();
  productGrid.innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-image book-cover cover-${product.id % 6}">
        <span class="discount-tag">-${Math.round((1 - product.price / product.oldPrice) * 100)}% OFF</span>
        <span class="product-emoji" role="img" aria-label="Capa ilustrativa de ${product.name}">${product.emoji}</span>
        <span class="cover-label">LIVRO</span>
      </div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="author-name">${product.author}</p>
        <p class="old-price">${money(product.oldPrice)}</p>
        <p class="price">${money(product.price)}</p>
        <p class="installments">ou 3x de ${money(product.price / 3)} sem juros*</p>
        <p class="shipping-label">✓ Disponível (exemplo)</p>
        <button class="add-button" type="button" data-add="${product.id}">Adicionar ao carrinho</button>
      </div>
    </article>`).join("");
  resultCount.textContent = `${list.length} ${list.length === 1 ? "livro" : "livros"}`;
  productsTitle.textContent = searchTerm ? `Resultados para "${searchTerm}"` : selectedCategory === "Todos" ? "Livros em destaque" : selectedCategory;
  emptyState.hidden = list.length > 0;
  productGrid.hidden = list.length === 0;
}
function setCategory(category) {
  selectedCategory = category;
  document.querySelectorAll("[data-category]").forEach(button => button.classList.toggle("active", button.dataset.category === category));
  renderProducts();
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2400);
}
function addToCart(id) {
  const product = products.find(item => item.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveCart(); renderCart(); showToast(`"${product.name}" adicionado ao carrinho.`);
}
function changeQuantity(id, delta) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== id);
  saveCart(); renderCart();
}
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart(); renderCart();
}
function renderCart() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  cartCount.textContent = totalQuantity;
  cartItems.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return `<article class="cart-item">
      <div class="cart-item-image" aria-hidden="true">${product.emoji}</div>
      <div><h3 class="cart-item-name">${product.name}</h3><p class="cart-item-price">${money(product.price)}</p>
        <div class="quantity-controls">
          <button type="button" data-quantity="${product.id}" data-delta="-1" aria-label="Diminuir quantidade de ${product.name}">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-quantity="${product.id}" data-delta="1" aria-label="Aumentar quantidade de ${product.name}">+</button>
        </div>
      </div>
      <button class="remove-item" type="button" data-remove="${product.id}">Remover</button>
    </article>`;
  }).join("");
  const isEmpty = cart.length === 0;
  cartEmpty.hidden = !isEmpty;
  cartSummary.hidden = isEmpty;
  document.querySelector("#cartSubtotal").textContent = money(subtotal);
  document.querySelector("#cartTotal").textContent = money(subtotal);
}
function openCart() {
  cartDrawer.classList.add("open"); cartDrawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false; document.body.classList.add("cart-open"); document.querySelector("#closeCart").focus();
}
function closeCart() {
  cartDrawer.classList.remove("open"); cartDrawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true; document.body.classList.remove("cart-open"); document.querySelector("#openCart").focus();
}
productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});
document.querySelector("#categoryChips").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (button) setCategory(button.dataset.category);
});
document.querySelector(".category-nav").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (button) { setCategory(button.dataset.category); document.querySelector("#productsSection").scrollIntoView({ behavior: "smooth" }); }
});
searchInput.addEventListener("input", () => { searchTerm = searchInput.value; renderProducts(); });
searchForm.addEventListener("submit", event => {
  event.preventDefault(); searchTerm = searchInput.value; renderProducts();
  document.querySelector("#productsSection").scrollIntoView({ behavior: "smooth" });
});
document.querySelector("#clearFilters").addEventListener("click", () => {
  searchTerm = ""; searchInput.value = ""; setCategory("Todos");
});
document.querySelector("#seeOffers").addEventListener("click", () => document.querySelector("#productsSection").scrollIntoView({ behavior: "smooth" }));
document.querySelector("#openCart").addEventListener("click", openCart);
document.querySelector("#closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", event => { if (event.key === "Escape" && cartDrawer.classList.contains("open")) closeCart(); });
cartItems.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) changeQuantity(Number(quantityButton.dataset.quantity), Number(quantityButton.dataset.delta));
  if (removeButton) removeFromCart(Number(removeButton.dataset.remove));
});
document.querySelector("#checkoutButton").addEventListener("click", () => showToast("Demonstração: nenhum pedido ou pagamento foi realizado."));
renderProducts(); renderCart();
