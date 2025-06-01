// Doi sang dinh dang tien VND
function vnd(price) {
    return Number(price).toLocaleString('vi-VN') + ' đ';
}

// Close popup 
const body = document.querySelector("body");
let modalContainer = document.querySelectorAll('.modal');
let modalBox = document.querySelectorAll('.mdl-cnt');
let formLogSign = document.querySelector('.forms');

// Click vùng ngoài sẽ tắt Popup
modalContainer.forEach(item => {
    item.addEventListener('click', closeModal);
});

modalBox.forEach(item => {
    item.addEventListener('click', function (event) {
        event.stopPropagation();
    })
});

function closeModal() {
    modalContainer.forEach(item => {
        item.classList.remove('open');
    });
    console.log(modalContainer)
    body.style.overflow = "auto";
}

// Back to top
window.onscroll = () => {
    let backtopTop = document.querySelector(".back-to-top")
    if (document.documentElement.scrollTop > 100) {
        backtopTop.classList.add("active");
    } else {
        backtopTop.classList.remove("active");
    }
}

// Tự động ẩn tiêu đề khi cuộn
const headerNav = document.querySelector(".header-bottom");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
    if(lastScrollY < window.scrollY) {
        headerNav.classList.add("hide")
    } else {
        headerNav.classList.remove("hide")
    }
    lastScrollY = window.scrollY;
})

// Page
// Hiển thị danh sách sản phẩm
function renderProducts(showProduct) {
    allProducts = showProduct; 
    let productHtml = '';
    if (showProduct.length == 0) {
        document.getElementById("home-title").style.display = "none";
        productHtml = `<div class="no-result">
            <div class="no-result-h">Tìm kiếm không có kết quả</div>
            <div class="no-result-p">Xin lỗi, chúng tôi không thể tìm được kết quả hợp với tìm kiếm của bạn</div>
            <div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div>
        </div>`;
    } else {
        document.getElementById("home-title").style.display = "block";
        showProduct.forEach((product) => {
            productHtml += `<div class="col-product">
                <article class="card-product">
                    <div class="card-header">
                        <a href="#" class="card-image-link" onclick="detailProduct(${product.id})">
                        <img class="card-image" src="${product.img}" alt="${product.title}">
                        </a>
                    </div>
                    <div class="food-info">
                        <div class="card-content">
                            <div class="card-title">
                                <a href="#" class="card-title-link" onclick="detailProduct(${product.id})">${product.title}</a>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="product-price">
                                <span class="current-price">${vnd(product.price)}</span>
                            </div>
                            <div class="product-buy">
                                <button onclick="detailProduct(${product.id})" class="card-button order-item"><i class="fa-regular fa-cart-shopping-fast"></i> Đặt món</button>
                            </div>
                        </div>
                    </div>
                </article>
            </div>`;
        });
    }

    document.getElementById('home-products').innerHTML = productHtml;
}

function showHomeProduct(products) {
    let productAll = products.filter(item => item.status == 1)
    displayList(productAll, perPage, currentPage);
    setupPagination(productAll, perPage, currentPage);
}

// Xem chi tiết sản phẩm (dữ liệu lấy trực tiếp từ server)
function detailProduct(id) {
    event.preventDefault();

    const infoProduct = allProducts.find(sp => sp.id == id);
    if (!infoProduct) {
        alert("Không tìm thấy sản phẩm!");
        return;
    }

    let modal = document.querySelector('.modal.product-detail');
    let modalHtml = `<div class="modal-header">
        <img class="product-image" src="${infoProduct.img}" alt="">
        </div>
        <div class="modal-body">
            <h2 class="product-title">${infoProduct.title}</h2>
            <div class="product-control">
                <div class="priceBox">
                    <span class="current-price">${vnd(infoProduct.price)}</span>
                </div>
                <div class="buttons_added">
                    <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                    <input class="input-qty" max="100" min="1" name="" type="number" value="1">
                    <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
                </div>
            </div>
            <p class="product-description">${infoProduct.description}</p>
        </div>
        <div class="notebox">
            <p class="notebox-title">Ghi chú</p>
            <textarea class="text-note" id="popup-detail-note" placeholder="Nhập thông tin cần lưu ý..."></textarea>
        </div>
        <div class="modal-footer">
            <div class="price-total">
                <span class="thanhtien">Thành tiền</span>
                <span class="price">${vnd(infoProduct.price)}</span>
            </div>
            <div class="modal-footer-control">
                <button class="button-dathangngay" data-product="${infoProduct.id}">Đặt hàng ngay</button>
                <button class="button-dat" id="add-cart" onclick="animationCart()"><i class="fa-light fa-basket-shopping"></i></button>
            </div>
        </div>`;

    document.querySelector('#product-detail-content').innerHTML = modalHtml;
    modal.classList.add('open');
    document.body.style.overflow = "hidden";

    // Cập nhật tổng tiền khi thay đổi số lượng
    const qty = document.querySelector('.product-control .input-qty');
    const priceText = document.querySelector('.price');
    document.querySelectorAll('.is-form').forEach(btn => {
        btn.addEventListener('click', () => {
            const price = infoProduct.price * parseInt(qty.value);
            priceText.innerHTML = vnd(price);
        });
    });

    // Thêm vào giỏ hàng
    document.querySelector('.button-dat').addEventListener('click', async () => {
    try {
        const res = await fetch('php/check_session.php', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await res.json();
        if (data.user) {
            addCart(infoProduct.id);
        } else {
            toast({
                title: 'Warning',
                message: 'Chưa đăng nhập tài khoản!',
                type: 'warning',
                duration: 3000
            });
        }
    } catch (error) {
    }
});
    // Mua ngay
    dathangngay();
} 

/// thêm sản phẩm vào giỏ hàg
async function addCart(productId) {
    let soluong = document.querySelector('.input-qty').value;
    let note = document.querySelector('#popup-detail-note').value || "Không có ghi chú";
    console.log('productId:', productId);
    console.log('soluong:', soluong);
    console.log('note:', note);
    try {
        const res = await fetch('php/add_cart.php', {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({productId, quantity: soluong, note})
        });

        const data = await res.json();

        if (data.success) {
            updateAmount();
            closeModal();
        } else {
            toast({ title: 'Error', message: data.message, type: 'error', duration: 3000 });
        }
    } catch (error) {
    }
}

function animationCart() {
    document.querySelector(".count-product-cart").style.animation = "slidein ease 1s"
    setTimeout(()=>{
        document.querySelector(".count-product-cart").style.animation = "none"
    },1000)
}
//show giỏ hàng
async function showCart() {
    try {
        const res = await fetch('php/get_cart.php', {
            method: 'GET',
            credentials: 'include'
        });

        const result = await res.json();

        if (!result.success || !result.data || result.data.length === 0) {
            document.querySelector('.gio-hang-trong').style.display = 'flex';
            return;
        }

        document.querySelector('.gio-hang-trong').style.display = 'none';
        document.querySelector('button.thanh-toan').classList.remove('disabled');

        let productcarthtml = '';
        result.data.forEach(item => {
            productcarthtml += `
            <li class="cart-item" data-id="${item.product_id}">
                <div class="cart-item-info">
                    <p class="cart-item-title">${item.title}</p>
                    <span class="cart-item-price price" data-price="${item.price}">
                        ${vnd(parseInt(item.price))}
                    </span>
                </div>
                <p class="product-note"><i class="fa-light fa-pencil"></i><span>${item.note}</span></p>
                <div class="cart-item-control">
                    <button class="cart-item-delete" onclick="deleteCartItem(${item.product_id}, this)">Xóa</button>
                    <div class="buttons_added">
                        <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                        <input class="input-qty" max="100" min="1" type="number" value="${item.quantity}">
                        <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
                    </div>
                </div>
            </li>`;
        });

        document.querySelector('.cart-list').innerHTML = productcarthtml;
        updateCartTotal(); 
        saveAmountCart();  

        // Mở modal giỏ hàng
        let modalCart = document.querySelector('.modal-cart');
        let containerCart = document.querySelector('.cart-container');
        let themmon = document.querySelector('.them-mon');
        modalCart.onclick = function () { closeCart(); }
        themmon.onclick = function () { closeCart(); }
        containerCart.addEventListener('click', (e) => { e.stopPropagation(); });

    } catch (error) {
    }
}

//tăng số lượng
function increasingNumber(button) {
    const input = button.parentElement.querySelector('.input-qty');
    let value = parseInt(input.value);
    if (!isNaN(value) && value < 100) {
        input.value = value + 1;
        input.dispatchEvent(new Event('change')); 
    }
}
//giảm số lượng
function decreasingNumber(button) {
    const input = button.parentElement.querySelector('.input-qty');
    let value = parseInt(input.value);
    if (!isNaN(value) && value > 1) {
        input.value = value - 1;
        input.dispatchEvent(new Event('change')); 
    }
}

//Hiển thị tổng só sản phẩm 
async function updateAmount() {
    try {
        const res = await fetch('php/get_cart.php', {
            method: 'GET',
            credentials: 'include'
        });
        const result = await res.json();

        let amount = 0;
        if (result.success && result.data) {
            amount = result.data.reduce((total, item) => total + parseInt(item.quantity), 0);
        }
        document.querySelector('.count-product-cart').innerText = amount;
        return amount;
    } catch (error) {
        console.error('Lỗi khi lấy số lượng giỏ hàng:', error);
        document.querySelector('.count-product-cart').innerText = 0;
        return 0;
    }
}


//Cập nhập số lượng sau khi tăng giảm 
function saveAmountCart() {
    const listItems = document.querySelectorAll('.cart-item');
    listItems.forEach(item => {
        const input = item.querySelector('.input-qty');
        const productId = item.getAttribute('data-id');

        input.addEventListener('change', async () => {
            const quantity = parseInt(input.value);
            if (quantity < 1) return;
            const noteElement = item.querySelector('.product-note span');
            const note = noteElement ? noteElement.textContent.trim() : '';
            try {
                const res = await fetch('php/update_cart_quantity.php', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId, quantity,note })
                });

                const data = await res.json();
                if (data.success) {
                    updateCartTotal();
                    updateAmount();
                } else {
                    toast({ title: 'Lỗi', message: data.message, type: 'error', duration: 3000 });
                }
            } catch (err) {
                toast({ title: 'Lỗi', message: 'Không thể cập nhật số lượng', type: 'error', duration: 3000 });
            }
        });
    });
}

//Tính tổng tiền 
function updateCartTotal() {
    const prices = document.querySelectorAll('.cart-item-price');
    const quantities = document.querySelectorAll('.input-qty');
    let total = 0;

    prices.forEach((priceEl, index) => {
        const price = parseInt(priceEl.getAttribute('data-price')) || 0;
        const qty = parseInt(quantities[index].value) || 0;
        total += price * qty;
    });

    // Cập nhật hiển thị tổng tiền (nếu cần)
    document.querySelector('.text-price').innerText = vnd(total);

    return total;
}

//Xoá vật phẩm 
async function deleteCartItem(productId, el) {
    try {
        const res = await fetch('php/delete_cart_item.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId })
        });
        const data = await res.json();
        if (data.success) {
            el.closest('.cart-item').remove();
            toast({ title: 'Đã xóa', message: data.message, type: 'success', duration: 3000 });
            await showCart(); // load lại giỏ hàng
        } else {
            toast({ title: 'Lỗi', message: data.message, type: 'error', duration: 3000 });
        }
    } catch (err) {
        toast({ title: 'Lỗi', message: 'Không thể xóa sản phẩm', type: 'error', duration: 3000 });
    }
}

// Open & Close Cart
function openCart() {
    showCart();
    document.querySelector('.modal-cart').classList.add('open');
    body.style.overflow = "hidden";
}

function closeCart() {
    document.querySelector('.modal-cart').classList.remove('open');
    body.style.overflow = "auto";
    updateAmount();
}

// Find Product
function searchProducts(mode) {
    const valeSearchInput = document.querySelector('.form-search-input').value.trim();
    const valueCategory = document.getElementById("advanced-search-category-select").value;
    const minPrice = document.getElementById("min-price").value.trim();
    const maxPrice = document.getElementById("max-price").value.trim();

    // Kiểm tra giá nhập hợp lệ
    if (minPrice !== "" && maxPrice !== "" && parseInt(minPrice) > parseInt(maxPrice)) {
        alert("Giá đã nhập sai!");
        return;
    }

    // Lấy sản phẩm active từ biến toàn cục
    let result = productAll;

    // Lọc theo category (nếu không phải "Tất cả")
    if (valueCategory !== "Tất cả") {
        result = result.filter(item => item.category === valueCategory);
    }

    // Lọc theo từ khóa tìm kiếm (title, không phân biệt hoa thường)
    if (valeSearchInput !== "") {
        const keyword = valeSearchInput.toUpperCase();
        result = result.filter(item => item.title.toUpperCase().includes(keyword));
    }

    // Lọc theo khoảng giá
    if (minPrice !== "" && maxPrice === "") {
        result = result.filter(item => item.price >= parseInt(minPrice));
    } else if (minPrice === "" && maxPrice !== "") {
        result = result.filter(item => item.price <= parseInt(maxPrice));
    } else if (minPrice !== "" && maxPrice !== "") {
        result = result.filter(item => item.price >= parseInt(minPrice) && item.price <= parseInt(maxPrice));
    }

    // Xử lý reset filter khi mode = 0
    if (mode === 0) {
        result = productAll;
        document.querySelector('.form-search-input').value = "";
        document.getElementById("advanced-search-category-select").value = "Tất cả";
        document.getElementById("min-price").value = "";
        document.getElementById("max-price").value = "";
    }

    // Sắp xếp theo mode
    if (mode === 1) {
        result.sort((a, b) => a.price - b.price);
    } else if (mode === 2) {
        result.sort((a, b) => b.price - a.price);
    }

    // Cuộn trang đến vị trí sản phẩm
    document.getElementById("home-service").scrollIntoView();

    // Nếu không tìm thấy sản phẩm phù hợp, hiển thị thông báo
    if (result.length === 0) {
        document.getElementById('home-products').innerHTML = '<p style="color:red; text-align:center;">Không tìm thấy sản phẩm phù hợp.</p>';
        return;
    }

    // Hiển thị danh sách sản phẩm lọc được
    showHomeProduct(result);
}

// Open Search Advanced
document.querySelector(".filter-btn").addEventListener("click",(e) => {
    e.preventDefault();
    document.querySelector(".advanced-search").classList.toggle("open");
    document.getElementById("home-service").scrollIntoView();
})

document.querySelector(".form-search-input").addEventListener("click",(e) => {
    e.preventDefault();
    document.getElementById("home-service").scrollIntoView();
})

function closeSearchAdvanced() {
    document.querySelector(".advanced-search").classList.toggle("open");
}

//Open Search Mobile 
function openSearchMb() {
    document.querySelector(".header-middle-left").style.display = "none";
    document.querySelector(".header-middle-center").style.display = "block";
    document.querySelector(".header-middle-right-item.close").style.display = "block";
    let liItem = document.querySelectorAll(".header-middle-right-item.open");
    for(let i = 0; i < liItem.length; i++) {
        liItem[i].style.setProperty("display", "none", "important")
    }
}

//Close Search Mobile 
function closeSearchMb() {
    document.querySelector(".header-middle-left").style.display = "block";
    document.querySelector(".header-middle-center").style.display = "none";
    document.querySelector(".header-middle-right-item.close").style.display = "none";
    let liItem = document.querySelectorAll(".header-middle-right-item.open");
    for(let i = 0; i < liItem.length; i++) {
        liItem[i].style.setProperty("display", "block", "important")
    }
}


// Phân trang 
let perPage = 12;
let currentPage = 1;
let totalPage = 0;
let perProducts = [];

// Hiển thị sản phẩm theo trang
function displayList(productAll, perPage, currentPage) {
    let start = (currentPage - 1) * perPage;
    let end = (currentPage - 1) * perPage + perPage;
    let productShow = productAll.slice(start, end);
    renderProducts(productShow);
}

// Tạo phân trang dựa trên tổng sản phẩm
function setupPagination(productAll, perPage) {
    document.querySelector('.page-nav-list').innerHTML = '';
    let page_count = Math.ceil(productAll.length / perPage);
    for (let i = 1; i <= page_count; i++) {
        let li = paginationChange(i, productAll, currentPage);
        document.querySelector('.page-nav-list').appendChild(li);
    }
}

// Xử lý chuyển trang khi click phân trang
function paginationChange(page, productAll, currentPage) {
    let node = document.createElement(`li`);
    node.classList.add('page-nav-item');
    node.innerHTML = `<a href="javascript:;">${page}</a>`;
    if (currentPage == page) node.classList.add('active');
    node.addEventListener('click', function () {
        currentPage = page;
        displayList(productAll, perPage, currentPage);
        let t = document.querySelectorAll('.page-nav-item.active');
        for (let i = 0; i < t.length; i++) {
            t[i].classList.remove('active');
        }
        node.classList.add('active');
        document.getElementById("home-service").scrollIntoView();
    })
    return node;
}

// Hiển thị chuyên mục
function showCategory(category) {
    // Ẩn phần tin tức
    const newsSection = document.getElementById('news-section');
    newsSection.classList.add('hide');
    newsSection.innerHTML = ''; 
    
    const contactSection = document.getElementById('contact-section');
    contactSection.classList.add('hide'); 
    contactSection.innerHTML = '';

    const trangchu = document.getElementById('trangchu');
    trangchu.classList.remove('hide');

    document.getElementById('account-user').classList.remove('open');
    document.getElementById('order-history').classList.remove('open');

    // Lọc và hiển thị danh sách món ăn theo category
    let productSearch = productAll.filter(value => 
        value.category.toString().toUpperCase().includes(category.toUpperCase())
    );

    let currentPageSeach = 1;
    displayList(productSearch, perPage, currentPageSeach);
    setupPagination(productSearch, perPage, currentPageSeach);

    // Cuộn lên tiêu đề
    document.getElementById("home-title").scrollIntoView();
}
//news
function showNews() {
    const contactSection = document.getElementById('contact-section');
    contactSection.classList.add('hide'); 
    contactSection.innerHTML = '';
    document.getElementById('trangchu').classList.add('hide');
    const newsSection = document.getElementById('news-section');
    newsSection.classList.remove('hide');

    const accountSection = document.getElementById('account-user');
    accountSection.classList.add('hide');
    accountSection.classList.remove('open');

    const orderSection = document.getElementById('order-history');
    orderSection.classList.add('hide');
    orderSection.classList.remove('open');

    // nội dung
    newsSection.innerHTML = `
        <div class="container" style="background-color: #f5f5f5; padding: 40px 20px;">
        <!-- Tiêu đề -->
        <h2 style="padding-bottom: 20px;">
            <i class="fas fa-newspaper"></i> Tin tức
        </h2>

        <div style="display: flex; flex-wrap: wrap; gap: 20px; background-color: #fff; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <!-- Hình món ăn -->
            <div style="flex: 1 1 300px; text-align: center;">
                <img src="./assets/img/food-new.jpg" alt="Món mới ra mắt" style="max-width: 100%; border-radius: 10px;">
            </div>

            <div style="flex: 2 1 400px;">
                <h3 style="margin-top: 0;"> Món Mới Sắp Ra Mắt!</h3>
                <p>Chào đón món ăn mới với hương vị đột phá, sẽ có mặt trên thực đơn của chúng tôi từ tháng sau. Hãy là người đầu tiên trải nghiệm!</p><br>
                <p>Không chỉ ngon mà giá còn cực kì ưu đãi</p><br>
                <p>Hãy liên hệ đặt hàng chúng tôi để được trải nghiệm</p>
            </div>
        </div>

        <div style="background-color: #fff; padding: 20px; border-radius: 10px;">
            <h3><i class="fas fa-gift" style="color:#e67e22;"></i> Khuyến mãi hấp dẫn:</h3>
            <ul style="list-style: none; padding-left: 0;">
                <li style="margin-bottom: 10px;">
                <i class="fas fa-truck" style="color:#2980b9;"></i> Miễn phí vận chuyển cho đơn hàng đầu tiên
                </li>
                <li style="margin-bottom: 10px;">
                    <i class="fas fa-percent" style="color:#27ae60;"></i> Giảm giá đến 50% toàn bộ sản phẩm trong tháng 6
                </li>
                <li style="margin-bottom: 10px;">
                    <i class="fas fa-bolt" style="color:#e74c3c;"></i> Flash Sale cuối tuần: giảm 30% đồ điện tử
                </li>
                <li style="margin-bottom: 10px;">
                    <i class="fas fa-heart" style="color:#c0392b;"></i> Ưu đãi tích điểm đổi quà, giảm 10% cho lần mua tiếp theo
                </li>
                <li style="margin-bottom: 10px;">
                    <i class="fas fa-box-open" style="color:#d35400;"></i> Đặt hàng qua app nhận bộ quà tặng giá trị
                </li>
            </ul>
        </div>
    </div>

    `;
    // Cuộn lên đầu phần tin tức
    newsSection.scrollIntoView();
}
//contact
function showContact() {
    const newsSection = document.getElementById('news-section');
    newsSection.classList.add('hide');
    newsSection.innerHTML = '';

    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('news-section').classList.add('hide');
    const contactSection = document.getElementById('contact-section');
    contactSection.classList.remove('hide');

    const accountSection = document.getElementById('account-user');
    accountSection.classList.add('hide');
    accountSection.classList.remove('open');

    const orderSection = document.getElementById('order-history');
    orderSection.classList.add('hide');
    orderSection.classList.remove('open');

    // Đặt nội dung liên hệ giống khối tin tức
    contactSection.innerHTML = `
        <div class="container" style="background-color: #f5f5f5; padding: 40px 20px;">
            <h2 style="padding-top: 0px; padding-bottom: 20px;">
                <i class=""> Liên hệ</i>
            </h2>

            <div class="contact-item">
            <h3><i class="fas fa-phone" style="color:#2980b9;"></i> Điện thoại :</h3>
            <p>0123456789</p>
            </div>

            <div class="contact-item">
            <h3><i class="fas fa-map-marker-alt" style="color:#e67e22;"></i> Cơ sở 1 :</h3>
            <p>273 Tân Triều , huyện Thanh Trì , TP Hà Nội</p>
            </div>

            <div class="contact-item">
            <h3><i class="fas fa-map-marker-alt" style="color:#e67e22;"></i> Cơ sở 2 :</h3>
            <p>04 Hà Đông , Hà Nội</p>
            </div>

            <div class="contact-item">
            <h3><i class="fas fa-envelope" style="color:#27ae60;"></i> Email :</h3>
            <p>minh@gmail.com</p>
            </div>

            <!-- Bản đồ Google Maps nhúng -->
            <div class="map-container" style="margin-top: 40px; height: 300px;">
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.974575261877!2d106.66631361480184!3d10.762622262535372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1a9e3b8d47%3A0x81f5dce8aa8ff5bb!2zMTIzIMSQ4bqhaSDEkOG7jW5nIEFCQywgUXXhuq1uIFhZWiwgVMOyYSBIw6AgQ-G6p24!5e0!3m2!1sen!2s!4v1684741293347!5m2!1sen!2s" 
                width="100%" 
                height="100%" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
            </iframe>
            </div>
        </div>
    `;

    // Cuộn lên đầu phần liên hệ
    contactSection.scrollIntoView();
}
//Chức năng đăng kí + đăng nhập

//Signup && Login Form
// Chuyen doi qua lai SignUp & Login 
let signup = document.querySelector('.signup-link');
let login = document.querySelector('.login-link');
let container = document.querySelector('.signup-login .modal-container');
login.addEventListener('click', () => {
    container.classList.add('active');
})

signup.addEventListener('click', () => {
    container.classList.remove('active');
})

let signupbtn = document.getElementById('signup');
let loginbtn = document.getElementById('login');
let formsg = document.querySelector('.modal.signup-login')
signupbtn.addEventListener('click', () => {
    formsg.classList.add('open');
    container.classList.remove('active');
    body.style.overflow = "hidden";
})

loginbtn.addEventListener('click', () => {
    document.querySelector('.form-message-check-login').innerHTML = '';
    formsg.classList.add('open');
    container.classList.add('active');
    body.style.overflow = "hidden";
})

//Đăng kí

let signupButton = document.getElementById('signup-button');

signupButton.addEventListener('click', async (event) => {
    event.preventDefault();

    let fullNameUser = document.getElementById('fullname').value.trim();
    let phoneUser = document.getElementById('phone').value.trim();
    let passwordUser = document.getElementById('password').value;
    let passwordConfirmation = document.getElementById('password_confirmation').value;
    let checkSignup = document.getElementById('checkbox-signup').checked;

    // Validate từng trường và hiển thị thông báo lỗi
    if (fullNameUser.length === 0) {
        document.querySelector('.form-message-name').innerHTML = 'Vui lòng nhập họ và tên';
        document.getElementById('fullname').focus();
        return;
    } else if (fullNameUser.length < 3) {
        document.querySelector('.form-message-name').innerHTML = 'Họ và tên phải lớn hơn 3 ký tự';
        return;
    } else {
        document.querySelector('.form-message-name').innerHTML = '';
    }

    if (phoneUser.length === 0) {
        document.querySelector('.form-message-phone').innerHTML = 'Vui lòng nhập số điện thoại';
        return;
    } else if (!/^\d{10}$/.test(phoneUser)) {
        document.querySelector('.form-message-phone').innerHTML = 'Số điện thoại phải gồm 10 chữ số';
        return;
    } else {
        document.querySelector('.form-message-phone').innerHTML = '';
    }

    if (passwordUser.length === 0) {
        document.querySelector('.form-message-password').innerHTML = 'Vui lòng nhập mật khẩu';
        return;
    } else if (passwordUser.length < 6) {
        document.querySelector('.form-message-password').innerHTML = 'Mật khẩu phải lớn hơn 6 ký tự';
        return;
    } else {
        document.querySelector('.form-message-password').innerHTML = '';
    }

    if (passwordConfirmation.length === 0) {
        document.querySelector('.form-message-password-confi').innerHTML = 'Vui lòng nhập lại mật khẩu';
        return;
    } else if (passwordConfirmation !== passwordUser) {
        document.querySelector('.form-message-password-confi').innerHTML = 'Mật khẩu không khớp';
        return;
    } else {
        document.querySelector('.form-message-password-confi').innerHTML = '';
    }

    if (!checkSignup) {
        document.querySelector('.form-message-checkbox').innerHTML = 'Vui lòng đồng ý với chính sách';
        return;
    } else {
        document.querySelector('.form-message-checkbox').innerHTML = '';
    }

    // Tạo object user gửi lên server
    const user = {
        fullname: fullNameUser,
        phone: phoneUser,
        password: passwordUser,
        address: '',
        email: '',
        status: 1,
        join_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        user_type: 0
    };

    try {
        const response = await fetch('php/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        const result = await response.json();
        if (result.success) {
            toast({ title: 'Thành công', message: result.message, type: 'success', duration: 3000 });
            closeModal();
            kiemtradangnhap();
            updateAmount();
        } else {
            toast({ title: 'Thất bại', message: result.message, type: 'error', duration: 3000 });
        }
    } catch (error) {
    }
});
//Đăng nhập 
let loginButton = document.getElementById('login-button');

loginButton.addEventListener('click', async (event) => {
    event.preventDefault();

    let phonelog = document.getElementById('phone-login').value.trim();
    let passlog = document.getElementById('password-login').value;

    // Xác thực 
    if (phonelog.length === 0) {
        document.querySelector('.form-message.phonelog').innerHTML = 'Vui lòng nhập vào số điện thoại';
        return;
    } else if (phonelog.length !== 10 || !/^\d{10}$/.test(phonelog)) {
        document.querySelector('.form-message.phonelog').innerHTML = 'Vui lòng nhập vào số điện thoại 10 số';
        return;
    } else {
        document.querySelector('.form-message.phonelog').innerHTML = '';
    }

    if (passlog.length === 0) {
        document.querySelector('.form-message-check-login').innerHTML = 'Vui lòng nhập mật khẩu';
        return;
    } else if (passlog.length < 6) {
        document.querySelector('.form-message-check-login').innerHTML = 'Mật khẩu phải có ít nhất 6 kí tự';
        return;
    } else {
        document.querySelector('.form-message-check-login').innerHTML = '';
    }

    try {
        const response = await fetch('php/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phonelog, password: passlog }),
            credentials: 'same-origin'
        });

        const result = await response.json();

        if (result.success) {
            toast({ title: 'Thành công', message: result.message, type: 'success', duration: 3000 });
            closeModal();
            kiemtradangnhap(); 
            updateAmount();
        } else {
            toast({ title: 'Thất bại', message: result.message, type: 'error', duration: 3000 });
        }

    } catch (error) {
        toast({ title: 'Lỗi', message: 'Không thể kết nối tới server', type: 'error', duration: 3000 });
    }
});

function kiemtradangnhap() {
    fetch('php/check_session.php', { credentials: 'same-origin' })
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                let user = data.user;
                let isAdmin = data.isAdmin;

                document.querySelector('.auth-container').innerHTML = `
                    <span class="text-dndk">Tài khoản</span>
                    <span class="text-tk">${user.fullname} <i class="fa-sharp fa-solid fa-caret-down"></i></span>`;

                let menuHtml = `
                    <li><a href="javascript:;" onclick="myAccount()"><i class="fa-light fa-circle-user"></i> Tài khoản của tôi</a></li>
                    <li><a href="javascript:;" onclick="orderHistory()"><i class="fa-regular fa-bags-shopping"></i> Đơn hàng đã mua</a></li>
                    <li class="border"><a id="logout" href="javascript:;"><i class="fa-light fa-right-from-bracket"></i> Thoát tài khoản</a></li>
                `;

                if (isAdmin) {
                    menuHtml = `
                        <li><a href="http://localhost/Webbanhang/admin.php "><i class="fa-solid fa-user-gear"></i> Trang quản trị</a></li>
                    ` + menuHtml;
                }

                document.querySelector('.header-middle-right-menu').innerHTML = menuHtml;
                document.querySelector('#logout').addEventListener('click', logOut);
            }
        })
        .catch(err => {
            console.error('Lỗi khi kiểm tra đăng nhập:', err);
        });
}

//Đăng xuất 
function logOut() {
    fetch('php/logout.php', { method: 'POST' }) 
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = "/Webbanhang/index.php";
                window.location.reload();
            } else {
                alert('Logout không thành công');
            }
        })
        .catch(err => console.error('Lỗi khi logout:', err));
}

//Thông tin tài khoản 
async function userInfo() {
    try {
        const res = await fetch('php/check_session.php', {
            method: 'GET',
            credentials: 'include'
        });

        const data = await res.json();

        if (data.user) {
            document.getElementById('infoname').value = data.user.fullname || '';
            document.getElementById('infophone').value = data.user.phone || '';
            document.getElementById('infoemail').value = data.user.email || '';
            document.getElementById('infoaddress').value = data.user.address || '';
        } else {
            toast({ title: 'Lỗi', message: 'Chưa đăng nhập', type: 'error', duration: 3000 });
        }
    } catch (error) {
        toast({ title: 'Lỗi', message: 'Lỗi kết nối máy chủ', type: 'error', duration: 3000 });
    }
}

// Chuyển đổi trang chủ và trang thông tin tài khoản
function myAccount() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('news-section').classList.add('hide');
    document.getElementById('news-section').innerHTML = '';

    document.getElementById('contact-section').classList.add('hide');
    document.getElementById('contact-section').innerHTML = '';

    const accountSection = document.getElementById('account-user');
    accountSection.classList.add('open');
    accountSection.classList.remove('hide');

    // Gọi hàm load thông tin user
    userInfo();
}


function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
//Thay đổi thông tin
async function changeInformation() {
    const infoname = document.getElementById('infoname').value.trim();
    const infoemail = document.getElementById('infoemail').value.trim();
    const infoaddress = document.getElementById('infoaddress').value.trim();

    // Kiểm tra định dạng email nếu có nhập
    if (infoemail && !emailIsValid(infoemail)) {
        document.querySelector('.inforemail-error').innerHTML = 'Vui lòng nhập đúng định dạng email!';
        return;
    }

    try {
        const res = await fetch('php/update_user_info.php', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullname: infoname,
                email: infoemail,
                address: infoaddress
            })
        });

        const data = await res.json();

        if (data.success ) {
            toast({ title: 'Thành công', message: 'Cập nhật thông tin thành công!', type: 'success', duration: 3000 });
            userInfo();
        } else {
            toast({ title: 'Lỗi', message: data.message, type: 'error', duration: 3000 });
        }
    } catch (err) {
        toast({ title: 'Lỗi', message: 'Không thể kết nối máy chủ', type: 'error', duration: 3000 });
    }
}
//Thay đổi mật khẩu 
function changePassword() {
    const passwordCur = document.getElementById('password-cur-info');
    const passwordAfter = document.getElementById('password-after-info');
    const passwordConfirm = document.getElementById('password-comfirm-info');

    let valid = true;

    // Reset lỗi
    document.querySelector('.password-cur-info-error').innerHTML = '';
    document.querySelector('.password-after-info-error').innerHTML = '';
    document.querySelector('.password-after-comfirm-error').innerHTML = '';

    // Kiểm tra rỗng
    if (passwordCur.value.trim() === '') {
        document.querySelector('.password-cur-info-error').innerHTML = 'Vui lòng nhập mật khẩu hiện tại';
        valid = false;
    }
    if (passwordAfter.value.trim() === '') {
        document.querySelector('.password-after-info-error').innerHTML = 'Vui lòng nhập mật khẩu mới';
        valid = false;
    } else if (passwordAfter.value.length < 6) {
        document.querySelector('.password-after-info-error').innerHTML = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        valid = false;
    }
    if (passwordConfirm.value.trim() === '') {
        document.querySelector('.password-after-comfirm-error').innerHTML = 'Vui lòng xác nhận mật khẩu mới';
        valid = false;
    } else if (passwordConfirm.value !== passwordAfter.value) {
        document.querySelector('.password-after-comfirm-error').innerHTML = 'Mật khẩu xác nhận không khớp';
        valid = false;
    }

    if (!valid) return;

    // Gửi lên server kiểm tra và đổi mật khẩu
    fetch('php/change_password.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            currentPassword: passwordCur.value,
            newPassword: passwordAfter.value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            toast({ title: 'Success', message: 'Đổi mật khẩu thành công!', type: 'success', duration: 3000 });

            // Xóa các input sau khi đổi thành công
            passwordCur.value = '';
            passwordAfter.value = '';
            passwordConfirm.value = '';
        } else {
            // Hiển thị lỗi do server trả về
            if (data.errorField === 'currentPassword') {
                document.querySelector('.password-cur-info-error').innerHTML = data.message;
            } else {
                toast({ title: 'Error', message: data.message || 'Đổi mật khẩu thất bại', type: 'error', duration: 3000 });
            }
        }
    })
    .catch(() => {
        toast({ title: 'Error', message: 'Lỗi mạng hoặc server', type: 'error', duration: 3000 });
    });
}

// Chuyển đổi trang chủ và trang xem lịch sử đặt hàng 
function orderHistory() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('account-user').classList.remove('open'); // Nếu có popup menu

    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('news-section').classList.add('hide');
    document.getElementById('news-section').innerHTML = '';

    document.getElementById('contact-section').classList.add('hide');
    document.getElementById('contact-section').innerHTML = '';

    const orderSection = document.getElementById('order-history');
    orderSection.classList.remove('hide');
    orderSection.classList.add('open'); 

    renderOrderProduct();
}

//Quản lí đơn hàng 
async function renderOrderProduct() {
    let res = await fetch('php/get_orders.php');
    let data = await res.json();

    let orderHtml = "";
    if (!data.success || data.orders.length === 0) {
        orderHtml = `<div class="empty-order-section">
            <img src="./assets/img/empty-order.jpg" alt="" class="empty-order-img">
            <p>Chưa có đơn hàng nào</p></div>`;
    } else {
        data.orders.forEach(order => {
            let productHtml = `<div class="order-history-group">`;

            order.items.forEach(sp => {
                productHtml += `<div class="order-history">
                    <div class="order-history-left">
                        <img src="${sp.img}" alt="">
                        <div class="order-history-info">
                            <h4>${sp.title}</h4>
                            <p class="order-history-note"><i class="fa-light fa-pen"></i> ${sp.note || ""}</p>
                            <p class="order-history-quantity">x${sp.quantity}</p>
                        </div>
                    </div>
                    <div class="order-history-right">
                        <div class="order-history-price">
                            <span class="order-history-current-price">${vnd(sp.price_per_unit)}</span>
                        </div>
                    </div>
                </div>`;
            });

            let textCompl = order.status == 1 ? "Đã xử lý" : "Đang xử lý";
            let classCompl = order.status == 1 ? "complete" : "no-complete";
            productHtml += `<div class="order-history-control">
                <div class="order-history-status">
                    <span class="order-history-status-sp ${classCompl}">${textCompl}</span>
                    <button id="order-history-detail" onclick="detailOrder(${order.id})"><i class="fa-regular fa-eye"></i> Xem chi tiết</button>
                </div>
                <div class="order-history-total">
                    <span class="order-history-total-desc">Tổng tiền: </span>
                    <span class="order-history-toltal-price">${vnd(order.total_price)}</span>
                </div>
            </div></div>`;

            orderHtml += productHtml;
        });
    }

    document.querySelector(".order-history-section").innerHTML = orderHtml;
}
async function detailOrder(id) {
    try {
        const res = await fetch(`php/get_order_items.php?order_id=${id}`);
        const data = await res.json();

        if (!data.success) {
            alert("Không thể lấy chi tiết đơn hàng.");
            return;
        }
        // Gọi thêm dữ liệu đơn hàng tổng thể nếu chưa có
        const orderListRes = await fetch('php/get_orders.php');
        const orderListData = await orderListRes.json();

        const order = orderListData.orders.find(o => o.id == id);
        if (!order) {
            alert("Không tìm thấy đơn hàng.");
            return;
        }

        // Mở modal
        document.querySelector(".modal.detail-order").classList.add("open");

        // Tạo HTML chi tiết đơn hàng
        let detailOrderHtml = `<ul class="detail-order-group">
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
                <span class="detail-order-item-right">${order.order_date}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
                <span class="detail-order-item-right">${order.delivery_method}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Ngày nhận hàng</span>
                <span class="detail-order-item-right">${(order.delivery_time ? order.delivery_time + " - " : "") + order.delivery_date}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-location-dot"></i> Địa điểm nhận</span>
                <span class="detail-order-item-right">${order.delivery_address}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
                <span class="detail-order-item-right">${order.recipient_name}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại nhận</span>
                <span class="detail-order-item-right">${order.recipient_phone}</span>
            </li>
        </ul>`;

        // Hiển thị thông tin
        document.querySelector(".detail-order-content").innerHTML = detailOrderHtml;

    } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    }
}


// Load toàn bộ danh sách sản phẩm
window.onload = () => {
    fetch('php/get_products.php')
        .then(response => response.json())
        .then(data => {
            productAll = data.filter(item => item.status == 1); 
            renderProducts(data);
            showHomeProduct(data);
        })
        .catch(error => {
            console.error("Lỗi khi tải sản phẩm:", error);
            document.getElementById('home-products').innerHTML = `<p style="color:red">Không thể tải sản phẩm</p>`;
        });
};