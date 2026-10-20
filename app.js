// Session 4 — semantic catalogue. The TODOs below are the spec: give them to
// your assistant, then check the result against Done means in README.md.
// MDN: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
//
// This file is loaded with <script defer>, so the page already exists when it
// runs: querySelector finds every element below.

const catalogue = document.querySelector('#catalogue');
const cartCount = document.querySelector('#cart-count');
const cartTotal = document.querySelector('#cart-total');
const searchInput = document.querySelector('#q');
const statusBox = document.querySelector('#status');
const loadMoreButton = document.querySelector('#load-more');
const template = document.querySelector('#card-template');

// How many of each product is in the cart, by product id: { tshirt: 2, cap: 1 }
const cart = {};

// ---------------------------------------------------------------------------
// B1 — Add to cart, with ONE listener
// ---------------------------------------------------------------------------
catalogue.addEventListener('click', (event) => {
  // Tìm xem thẻ được click có phải là nút .add không
  const button = event.target.closest('.add');
  
  // Nếu click ra ngoài, hoặc click vào sản phẩm "Sold out" (có class disabled) thì bỏ qua
  if (!button || button.classList.contains('disabled')) return;

  // 1. Tìm thẻ cha .card
  const card = button.closest('.card');
  
  // 2. Đọc id của sản phẩm
  const id = card.dataset.id;
  
  // 3. Tăng số lượng trong giỏ hàng
  if (!cart[id]) {
    cart[id] = 0;
  }
  cart[id]++;
  
  // 4. Gọi hàm render
  renderCart();
});

function renderCart() {
  let count = 0;
  let total = 0;

  // Duyệt qua từng sản phẩm trong giỏ hàng để tính tổng
  for (const [id, qty] of Object.entries(cart)) {
    count += qty;
    
    // Stretch B4: Lấy giá của sản phẩm bằng cách tìm thẻ card tương ứng
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (card) {
      const price = Number(card.dataset.price);
      total += price * qty;
    }
  }

  // TODO B1: Ghi số lượng vào cartCount
  cartCount.textContent = count;

  // Stretch B4: Tính tổng tiền và ghi vào cartTotal
  if (total > 0) {
    cartTotal.textContent = ` · ${total.toLocaleString('vi-VN')} đ`;
  } else {
    cartTotal.textContent = '';
  }
}

// ---------------------------------------------------------------------------
// B2 — Filter as you type
// ---------------------------------------------------------------------------
function applyFilter() {
  // Lấy giá trị chính xác người dùng nhập (để hiển thị trạng thái)
  const exactQuery = searchInput.value;
  // Xử lý chuỗi để lọc (xóa khoảng trắng thừa, viết thường)
  const query = exactQuery.trim().toLowerCase();
  
  const cards = catalogue.querySelectorAll('.card');
  let visibleCount = 0;

  for (const card of cards) {
    const name = card.querySelector('.name').textContent.toLowerCase();
    
    // Kiểm tra xem tên sản phẩm có chứa chuỗi tìm kiếm không
    if (name.includes(query)) {
      card.hidden = false;
      visibleCount++;
    } else {
      card.hidden = true;
    }
  }

  // Hiển thị trạng thái bằng textContent (chống XSS)
  if (query === '') {
    statusBox.textContent = '';
  } else if (visibleCount > 0) {
    statusBox.textContent = `Showing ${visibleCount} of ${cards.length} products`;
  } else {
    statusBox.textContent = `No products match "${exactQuery}"`;
  }
}

// Gọi applyFilter mỗi khi người dùng gõ phím
searchInput.addEventListener('input', applyFilter);


// ---------------------------------------------------------------------------
// B3 — The search form must not reload the page
// ---------------------------------------------------------------------------
// Chặn hành vi submit form mặc định (reload trang và thêm ?q= lên thanh địa chỉ)
if (searchInput.form) {
  searchInput.form.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilter();
  });
}


// ---------------------------------------------------------------------------
// Given: "Load more". Read it, do not change it.
// ---------------------------------------------------------------------------
const moreProducts = [
  { id: 'belt', name: 'Belt', price: 140000, stock: 'In stock' },
  { id: 'raincoat', name: 'Raincoat', price: 310000, stock: 'In stock' },
  { id: 'backpack', name: 'Backpack', price: 450000, stock: 'Low stock' },
  { id: 'beanie', name: 'Beanie', price: 85000, stock: 'In stock' },
];

function loadMore() {
  for (const p of moreProducts) {
    // Copy the card inside <template>, then fill it with textContent.
    // No innerHTML: a product name is data, not markup.
    const card = template.content.firstElementChild.cloneNode(true);
    card.dataset.id = p.id;
    card.dataset.price = String(p.price);
    card.querySelector('.name').textContent = p.name;
    card.querySelector('.price').textContent = p.price.toLocaleString('vi-VN') + ' đ';
    card.querySelector('.stock').textContent = p.stock;
    catalogue.append(card);
  }
  loadMoreButton.hidden = true;
  applyFilter(); // so a search that is already typed applies to the new cards
}

loadMoreButton.addEventListener('click', loadMore);