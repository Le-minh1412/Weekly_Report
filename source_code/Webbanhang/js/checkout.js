/// Open Page Checkout
let nutthanhtoan = document.querySelector('.thanh-toan')
let checkoutpage = document.querySelector('.checkout-page');
nutthanhtoan.addEventListener('click', () => {
    checkoutpage.classList.add('active');
    thanhtoanpage(1);
    closeCart();
    body.style.overflow = "hidden"
})
function formatDate(date) {
    return date.toISOString().split('T')[0];
}
const PHIVANCHUYEN = 30000;
let priceFinal = document.getElementById("checkout-cart-price-final");
// Trang thanh toan
async function thanhtoanpage(option, product) {
    // Xử lý ngày nhận hàng như cũ
    let today = new Date();
    let ngaymai = new Date();
    let ngaykia = new Date();
    ngaymai.setDate(today.getDate() + 1);
    ngaykia.setDate(today.getDate() + 2);
    let dateorderhtml = `
    <a href="javascript:;" class="pick-date active" data-date="${formatDate(today)}">
        <span class="text">Hôm nay</span>
        <span class="date">${today.getDate()}/${today.getMonth() + 1}</span>
    </a>
    <a href="javascript:;" class="pick-date" data-date="${formatDate(ngaymai)}">
        <span class="text">Ngày mai</span>
        <span class="date">${ngaymai.getDate()}/${ngaymai.getMonth() + 1}</span>
    </a>
    <a href="javascript:;" class="pick-date" data-date="${formatDate(ngaykia)}">
        <span class="text">Ngày kia</span>
        <span class="date">${ngaykia.getDate()}/${ngaykia.getMonth() + 1}</span>
    </a>`;
    document.querySelector('.date-order').innerHTML = dateorderhtml;

    // Gán sự kiện cho các nút chọn ngày
    let pickdate = document.getElementsByClassName('pick-date')
    for(let i = 0; i < pickdate.length; i++) {
        pickdate[i].onclick = function () {
            document.querySelector(".pick-date.active").classList.remove("active");
            this.classList.add('active');
        }
    }

    let totalBillOrder = document.querySelector('.total-bill-order');
    let totalBillOrderHtml;

    switch (option) {
        case 1: // Thanh toán trong giỏ hàng
            showProductCart();

            // chờ lấy số lượng từ async updateAmount()
            let amount = await updateAmount();

            totalBillOrderHtml = `<div class="priceFlx">
                <div class="text">
                    Tiền hàng 
                    <span class="count">${amount} món</span>
                </div>
                <div class="price-detail">
                    <span id="checkout-cart-total">${vnd(updateCartTotal())}</span>
                </div>
            </div>
            <div class="priceFlx chk-ship">
                <div class="text">Phí vận chuyển</div>
                <div class="price-detail chk-free-ship">
                    <span>${vnd(PHIVANCHUYEN)}</span>
                </div>
            </div>`;
            priceFinal.innerText = vnd(updateCartTotal() + PHIVANCHUYEN);
            break;

        case 2: // Mua ngay
            showProductBuyNow(product);
            totalBillOrderHtml = `<div class="priceFlx">
                <div class="text">
                    Tiền hàng 
                    <span class="count">${product.soluong} món</span>
                </div>
                <div class="price-detail">
                    <span id="checkout-cart-total">${vnd(product.soluong * product.price)}</span>
                </div>
            </div>
            <div class="priceFlx chk-ship">
                <div class="text">Phí vận chuyển</div>
                <div class="price-detail chk-free-ship">
                    <span>${vnd(PHIVANCHUYEN)}</span>
                </div>
            </div>`;
            priceFinal.innerText = vnd((product.soluong * product.price) + PHIVANCHUYEN);
            break;
    }

    totalBillOrder.innerHTML = totalBillOrderHtml;

    // Xử lý hình thức giao hàng
    let giaotannoi = document.querySelector('#giaotannoi');
    let tudenlay = document.querySelector('#tudenlay');
    let tudenlayGroup = document.querySelector('#tudenlay-group');
    let chkShip = document.querySelectorAll(".chk-ship");

    tudenlay.addEventListener('click', () => {
        giaotannoi.classList.remove("active");
        tudenlay.classList.add("active");
        chkShip.forEach(item => {
            item.style.display = "none";
        });
        tudenlayGroup.style.display = "block";
        switch (option) {
            case 1:
                priceFinal.innerText = vnd(updateCartTotal());
                break;
            case 2:
                priceFinal.innerText = vnd((product.soluong * product.price));
                break;
        }
    })

    giaotannoi.addEventListener('click', () => {
        tudenlay.classList.remove("active");
        giaotannoi.classList.add("active");
        tudenlayGroup.style.display = "none";
        chkShip.forEach(item => {
            item.style.display = "flex";
        });
        switch (option) {
            case 1:
                priceFinal.innerText = vnd(updateCartTotal() + PHIVANCHUYEN);
                break;
            case 2:
                priceFinal.innerText = vnd((product.soluong * product.price) + PHIVANCHUYEN);
                break;
        }
    })

    // Sự kiện khi nhấn nút đặt hàng
    document.querySelector(".complete-checkout-btn").onclick = () => {
        switch (option) {
            case 1:
                xulyDathang();
                break;
            case 2:
                xulyDathang(product);
                break;
        }
    }
}

/// Hien thi hang trong gio
function showProductCart() {
    fetch('php/get_cart.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const listOrder = document.getElementById("list-order-checkout");
                let listOrderHtml = '';
                data.data.forEach(product => {
                    listOrderHtml += `
                        <div class="food-total">
                            <div class="count">${product.quantity}x</div>
                            <div class="info-food">
                                <div class="name-food">${product.title}</div>
                            </div>
                        </div>`;
                });
                listOrder.innerHTML = listOrderHtml;
            } else {
                console.error("Lỗi khi tải giỏ hàng:", data.message);
            }
        })
        .catch(error => {
        });
}

/// Hien thi hang mua ngay
function showProductBuyNow(product) {
    let listOrder = document.getElementById("list-order-checkout");
    let listOrderHtml = `<div class="food-total">
        <div class="count">${product.soluong}x</div>
        <div class="info-food">
            <div class="name-food">${product.title}</div>
        </div>
    </div>`;
    listOrder.innerHTML = listOrderHtml;
}

/// Đặt hàng ngay
function dathangngay() {
    let productInfo = document.getElementById("product-detail-content");
    let datHangNgayBtn = productInfo.querySelector(".button-dathangngay");

    datHangNgayBtn.onclick = async () => {
        try {
            const res = await fetch('php/check_session.php', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();

            if (data.user) {
                let productId = datHangNgayBtn.getAttribute("data-product");
                let soluong = parseInt(productInfo.querySelector(".input-qty").value);
                let ghichu = productInfo.querySelector("#popup-detail-note").value || "Không có ghi chú";

                // Lấy dữ liệu sản phẩm từ DOM
                let title = productInfo.querySelector(".product-title").textContent;
                let price = parseFloat(productInfo.querySelector(".current-price").textContent.replace(/[^\d]/g, ""));
                let img = productInfo.querySelector(".product-image").getAttribute("src");

                // Tạo object sản phẩm
                let productData = {
                    id: productId,
                    title: title,
                    price: price,
                    img: img,
                    soluong: soluong,
                    note: ghichu
                };

                // Gọi giao diện thanh toán
                checkoutpage.classList.add('active');
                thanhtoanpage(2, productData);
                closeCart();
                document.body.style.overflow = "hidden";
            } else {
                toast({
                    title: 'Thông báo',
                    message: 'Chưa đăng nhập tài khoản!',
                    type: 'warning',
                    duration: 3000
                });
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra đăng nhập:", error);
        }
    };
}

// Close Page Checkout
function closecheckout() {
    checkoutpage.classList.remove('active');
    body.style.overflow = "auto"
}

// Thong tin cac don hang da mua 
async function xulyDathang(product) {
    try {
        // Lấy thông tin user hiện tại từ server qua API check_session.php
        let response = await fetch('php/check_session.php');
        let sessionData = await response.json();
        console.log('sessionData = ', sessionData);
        
        const currentUser = sessionData.user;

        // Lấy các giá trị form
        let diachinhan = "";
        let hinhthucgiao = "";
        let thoigiangiao = "";

        let giaotannoi = document.querySelector("#giaotannoi");
        let tudenlay = document.querySelector("#tudenlay");
        let giaongay = document.querySelector("#giaongay");
        let giaovaogio = document.querySelector("#deliverytime");

        // Hình thức giao & Địa chỉ nhận hàng
        if (giaotannoi && giaotannoi.classList.contains("active")) {
            diachinhan = document.querySelector("#diachinhan")?.value.trim() || "";
            hinhthucgiao = giaotannoi.innerText.trim();
        } else if (tudenlay && tudenlay.classList.contains("active")) {
            let chinhanh1 = document.querySelector("#chinhanh-1");
            let chinhanh2 = document.querySelector("#chinhanh-2");
            if (chinhanh1?.checked) {
                diachinhan = "273 Tân Triều , Thanh Trì , Hà Nội";
            } else if (chinhanh2?.checked) {
                diachinhan = "04 Hà Đông , Hà Nội";
            }
            hinhthucgiao = tudenlay.innerText.trim();
        }

        // Thời gian nhận hàng
        if (giaongay?.checked) {
            thoigiangiao = "Giao ngay khi xong";
        } else if (giaovaogio?.checked) {
            thoigiangiao = document.querySelector(".choise-time")?.value.trim() || "";
        }

        // Lấy tên người nhận và số điện thoại người nhận
        let tennguoinhan = document.querySelector("#tennguoinhan")?.value.trim() || "";
        let sdtnhan = document.querySelector("#sdtnhan")?.value.trim() || "";

        if (!tennguoinhan || !sdtnhan || !diachinhan) {
            toast({ title: 'Chú ý', message: 'Vui lòng nhập đầy đủ thông tin !', type: 'warning', duration: 4000 });
            return;
        }

        // Tạo orderDetails từ giỏ hàng hoặc sản phẩm mua ngay bằng API gọi server lấy giỏ hàng hoặc lấy product truyền vào
        let orderDetails = [];

        if (product === undefined || product === null) {
            // Trường hợp thanh toán giỏ hàng: gọi API lấy giỏ hàng từ server
            let cartResponse = await fetch('php/get_cart.php');
            let cartData = await cartResponse.json();

            if (!cartData.success || !cartData.data || cartData.data.length === 0) {
                toast({ title: 'Lỗi', message: 'Giỏ hàng trống!', type: 'error', duration: 3000 });
                return;
            }

            orderDetails = cartData.data.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price_per_unit: item.price,
                note: item.note || ""
            }));
        } else {
            // Trường hợp mua ngay 1 sản phẩm
            orderDetails.push({
                product_id: product.id,
                quantity: product.soluong || 1,
                price_per_unit: product.price,
                note: product.note || ""
            });
        }

        // Tính tổng tiền đơn hàng
        let tongtien = orderDetails.reduce((total, item) => total + item.price_per_unit * item.quantity, 0);

        // Lấy ngày giao hàng đã chọn (string) - format nên chuẩn hoá nếu cần
        let ngaygiaohang = document.querySelector(".pick-date.active")?.getAttribute("data-date") || "";

        if (!ngaygiaohang) {
            toast({ title: 'Chú ý', message: 'Vui lòng chọn ngày giao hàng!', type: 'warning', duration: 3000 });
            return;
        }

        // Tạo object đơn hàng để gửi lên server
        let donhang = {
            user_id: currentUser.id,
            delivery_date: ngaygiaohang,
            delivery_method: hinhthucgiao,
            recipient_name: tennguoinhan,
            recipient_phone: sdtnhan,
            delivery_address: diachinhan,
            delivery_time: thoigiangiao,
            note: document.querySelector(".note-order")?.value.trim() || "",
            total_price: tongtien,
            order_items: orderDetails
        };

        // Gửi đơn hàng lên server qua API đặt hàng
        let res = await fetch('php/save_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donhang),
            credentials: 'include'
        });

        let result = await res.json();

        if (result.success) {
            toast({ title: 'Thành công', message: 'Đặt hàng thành công !', type: 'success', duration: 2000 });
            setTimeout(() => {
                window.location.href = "/Webbanhang/index.php";
            }, 2000);
        } else {
            toast({ title: 'Lỗi', message: result.message || 'Đặt hàng thất bại', type: 'error', duration: 3000 });
        }
    } catch (error) {
        toast({ title: 'Lỗi', message: 'Lỗi kết nối server', type: 'error', duration: 3000 });
        console.error(error);
    }
}
