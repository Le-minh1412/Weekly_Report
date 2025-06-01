async function checkLogin() {
    try {
        const res = await fetch('php/checksession.php'); 
        const data = await res.json();

        if (!data.user || !data.isAdmin) {
            // Nếu chưa đăng nhập hoặc không phải admin
            document.body.innerHTML = `<div class="access-denied-section">
                <img class="access-denied-img" src="./assets/img/access-denied.webp" alt="Access Denied">
            </div>`;
        } else {
            // Nếu là admin, hiển thị tên
            document.getElementById("name-acc").innerText = data.user.fullname;
        }
    } catch (error) {
        console.error("Lỗi khi kiểm tra session:", error);
    }
}
window.onload = checkLogin;

//Xử lí đóng mở 
const menuIconButton = document.querySelector(".menu-icon-btn");
const sidebar = document.querySelector(".sidebar");
menuIconButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

// tab for section
const sidebars = document.querySelectorAll(".sidebar-list-item.tab-content");
const sections = document.querySelectorAll(".section");

for(let i = 0; i < sidebars.length; i++) {
    sidebars[i].onclick = function () {
        document.querySelector(".sidebar-list-item.active").classList.remove("active");
        document.querySelector(".section.active").classList.remove("active");
        sidebars[i].classList.add("active");
        sections[i].classList.add("active");
    };
}

const closeBtn = document.querySelectorAll('.section');
console.log(closeBtn[0])
for(let i=0;i<closeBtn.length;i++){
    closeBtn[i].addEventListener('click',(e) => {
        sidebar.classList.add("open");
    })
}

// Số sản phẩm mỗi trang và trang hiện tại
let perPage = 12;
let currentPage = 1;

// Tải danh sách sản phẩm từ server
async function loadProducts() {
    try {
        const res = await fetch('php/get_products.php');
        if (!res.ok) throw new Error("Lỗi tải sản phẩm");
        
        const data = await res.json();
        let products = [];
        if (Array.isArray(data)) {
            products = data; 
        } else if (Array.isArray(data.products)) {
            products = data.products;
        }

        if (!Array.isArray(products)) {
            console.error("Dữ liệu sản phẩm không phải mảng:", products);
            products = [];
        }

        displayList(products, perPage, currentPage);
        setupPagination(products, perPage);

    } catch (error) {
        console.error(error);
    }
}

// Hiển thị sản phẩm theo trang
function displayList(productAll, perPage, currentPage) {
    if (!Array.isArray(productAll)) {
        console.error("productAll không phải mảng:", productAll);
        return;
    }
    let start = (currentPage - 1) * perPage;
    let end = start + perPage;
    let productShow = productAll.slice(start, end);
    showProductArr(productShow);
}

// Tạo phân trang
function setupPagination(productAll, perPage) {
    document.querySelector('.page-nav-list').innerHTML = '';
    let page_count = Math.ceil(productAll.length / perPage);
    for (let i = 1; i <= page_count; i++) {
        let li = paginationChange(i, productAll, currentPage);
        document.querySelector('.page-nav-list').appendChild(li);
    }
}

// Tạo nút phân trang và xử lý click
function paginationChange(page, productAll, currentPage) {
    let node = document.createElement(`li`);
    node.classList.add('page-nav-item');
    node.innerHTML = `<a href="#">${page}</a>`;
    if (currentPage == page) node.classList.add('active');
    node.addEventListener('click', function () {
        currentPage = page;
        displayList(productAll, perPage, currentPage);
        let t = document.querySelectorAll('.page-nav-item.active');
        for (let i = 0; i < t.length; i++) {
            t[i].classList.remove('active');
        }
        node.classList.add('active');
    })
    return node;
}

window.onload = function () {
    loadProducts();
};


// Lấy số lượng sản phẩm từ server
function getAmoumtProduct() {
    return fetch('php/admin/get_products_count.php')
        .then(res => {
            if (!res.ok) throw new Error("Lỗi tải sản phẩm");
            return res.json();
        })
        .then(data => data.count || 0)
        .catch(err => {
            console.error(err);
            return 0;
        });
}

// Lấy số lượng user khách hàng (user_type = 0)
function getAmoumtUser() {
    return fetch('php/admin/get_user_count.php')
        .then(res => {
            if (!res.ok) throw new Error("Lỗi tải người dùng");
            return res.json();
        })
        .then(data => data.count || 0)
        .catch(err => {
            console.error(err);
            return 0;
        });
}

// Lấy tổng doanh thu (total_price)
function getMoney() {
    return fetch('php/admin/get_total_revenue.php')
        .then(res => {
            if (!res.ok) throw new Error("Lỗi tải doanh thu");
            return res.json();
        })
        .then(data => data.total || 0)
        .catch(err => {
            console.error(err);
            return 0;
        });
}
// Đổi sang định dang tien VND
function vnd(price) {
    return Number(price).toLocaleString('vi-VN') + ' đ';
}
// Format Date
function formatDate(date) {
    let fm = new Date(date);
    let yyyy = fm.getFullYear();
    let mm = fm.getMonth() + 1;
    let dd = fm.getDate();
    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;
    return dd + "/" + mm + "/" + yyyy;
}

//tạo dashboard
async function updateDashboard() {
    const userCount = await getAmoumtUser();
    const productCount = await getAmoumtProduct();
    const totalRevenue = await getMoney();

    document.getElementById("amount-user").innerHTML = userCount;
    document.getElementById("amount-product").innerHTML = productCount;
    document.getElementById("doanh-thu").innerHTML = vnd(totalRevenue);
}
updateDashboard();

// Hiển thị danh sách sản phẩm 
function showProductArr(arr) {
    let productHtml = "";
    if(arr.length == 0) {
        productHtml = `<div class="no-result"><div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div><div class="no-result-h">Không có sản phẩm để hiển thị</div></div>`;
    } else {
        arr.forEach(product => {
            let btnCtl = product.status == 1 ? 
            `<button class="btn-delete" onclick="deleteProduct(${product.id})"><i class="fa-regular fa-trash"></i></button>` :
            `<button class="btn-delete" onclick="changeStatusProduct(${product.id})"><i class="fa-regular fa-eye"></i></button>`;
            productHtml += `
            <div class="list">
                    <div class="list-left">
                    <img src="${product.img}" alt="">
                    <div class="list-info">
                        <h4>${product.title}</h4>
                        <p class="list-note">${product.description}</p>
                        <span class="list-category">${product.category}</span>
                    </div>
                </div>
                <div class="list-right">
                    <div class="list-price">
                    <span class="list-current-price">${vnd(product.price)}</span>                   
                    </div>
                    <div class="list-control">
                    <div class="list-tool">
                        <button class="btn-edit" onclick="editProduct(${product.id})"><i class="fa-light fa-pen-to-square"></i></button>
                        ${btnCtl}
                    </div>                       
                </div>
                </div> 
            </div>`;
        });
    }
    document.getElementById("show-product").innerHTML = productHtml;
}

//Lọc và hiển thị sản phẩm 
let allProducts = []; 

async function fetchProductsFromServer() {
    try {
        const res = await fetch('php/admin/get_products_count.php'); 
        if (!res.ok) throw new Error('Lỗi tải dữ liệu sản phẩm');
        const data = await res.json();
        allProducts = data.products || []; 
    } catch (error) {
        console.error(error);
        allProducts = [];
    }
}
//Tìm kiếm sản phẩm và reset sau tìm kiếm 
async function showProduct() {
    await fetchProductsFromServer();

    let selectOp = document.getElementById('the-loai').value;
    let valeSearchInput = document.getElementById('form-search-product').value.trim();

    let result = [];

    if (selectOp == "Tất cả") {
        result = allProducts.filter(item => item.status == 1);
    } else if (selectOp == "Đã xóa") {
        result = allProducts.filter(item => item.status == 0);
    } else {
        result = allProducts.filter(item => item.category == selectOp);
    }

    if (valeSearchInput !== "") {
        const searchUpper = valeSearchInput.toUpperCase();
        result = result.filter(item => item.title.toUpperCase().includes(searchUpper));
    }

    displayList(result, perPage, currentPage);
    setupPagination(result, perPage);
    }

    async function cancelSearchProduct() {
    document.getElementById('the-loai').value = "Tất cả";
    document.getElementById('form-search-product').value = "";
    await showProduct();
}

//Xoá sản phẩm 
async function deleteProduct(id) {
    if (!confirm("Bạn có chắc muốn xóa?")) return;
    try {
        const response = await fetch('php/admin/delete_product.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });

        const result = await response.json();

        if (result.success) {
            toast({ title: 'Success', message: result.message, type: 'success', duration: 3000 });
            showProduct();//cập nhập lại danh sách để hiển thị
        } else {
            toast({ title: 'Error', message: result.message, type: 'error', duration: 3000 });
        }
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        toast({ title: 'Error', message: 'Lỗi kết nối server', type: 'error', duration: 3000 });
    }
}
//Chỉnh sửa sản phẩm 
async function editProduct(id) {
    try {
        const res = await fetch(`php/admin/get_product_by_id.php?id=${id}`);
        const result = await res.json();

        if (result.success) {
            const product = result.product;

            document.querySelectorAll(".add-product-e").forEach(item => {
                item.style.display = "none";
            });
            document.querySelectorAll(".edit-product-e").forEach(item => {
                item.style.display = "block";
            });
            document.querySelector(".add-product").classList.add("open");

            document.querySelector(".upload-image-preview").src = product.img || "";
            document.getElementById("ten-mon").value = product.title || "";
            document.getElementById("gia-moi").value = product.price || "";
            document.getElementById("mo-ta").value = product.description || "";
            document.getElementById("chon-mon").value = product.category || "";

            // Lưu id hiện tại nếu cần dùng cho update
            indexCur = id;

            // Cập nhật data-* trên nút update để so sánh
            btnUpdateProductIn.dataset.id = product.id;
            btnUpdateProductIn.dataset.title = product.title;
            btnUpdateProductIn.dataset.price = product.price.toString();
            btnUpdateProductIn.dataset.description = product.description || "";
            btnUpdateProductIn.dataset.category = product.category;
            btnUpdateProductIn.dataset.img = product.img || "";
        } else {
            toast({ title: 'Error', message: result.message, type: 'error', duration: 3000 });
        }
    } catch (err) {
        console.error(err);
        toast({ title: 'Error', message: 'Không thể lấy dữ liệu sản phẩm', type: 'error', duration: 3000 });
    }
}
//Luôn lấy ảnh trong đường dẫn 
function getPathImage(path) {
    let patharr = path.split("/");
    return "./assets/img/products/" + patharr[patharr.length - 1];
}

//Lấy dữ liệu để thay đổi
let btnUpdateProductIn = document.getElementById("update-product-button");
btnUpdateProductIn.addEventListener("click", async (e) => {
    e.preventDefault();

    const id = btnUpdateProductIn.dataset.id;
    const titleCur = document.getElementById("ten-mon").value;
    const priceCur = document.getElementById("gia-moi").value;
    const descCur = document.getElementById("mo-ta").value;
    const categoryCur = document.getElementById("chon-mon").value;
    const imgCur = getPathImage(document.querySelector(".upload-image-preview").src);

    // Dữ liệu ban đầu khi click Sửa (được lưu trong thuộc tính data-*)
    const titleOld = btnUpdateProductIn.dataset.title;
    const priceOld = btnUpdateProductIn.dataset.price;
    const descOld = btnUpdateProductIn.dataset.description;
    const categoryOld = btnUpdateProductIn.dataset.category;
    const imgOld = btnUpdateProductIn.dataset.img;

    // Nếu có thay đổi
    if (
        titleCur !== titleOld ||
        priceCur !== priceOld ||
        descCur !== descOld ||
        categoryCur !== categoryOld ||
        imgCur !== imgOld
    ) {
        const formData = new FormData();
        formData.append("id", id);
        formData.append("title", titleCur);
        formData.append("price", priceCur);
        formData.append("description", descCur);
        formData.append("category", categoryCur);
        formData.append("img", imgCur); 

        try {
            const res = await fetch("php/admin/update_product.php", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (data.success) {
                toast({ title: "Success", message: "Cập nhật sản phẩm thành công!", type: "success", duration: 3000 });
                document.querySelector(".add-product").classList.remove("open");
                showProduct(); 
            } else {
                toast({ title: "Error", message: data.message || "Lỗi khi cập nhật", type: "error", duration: 3000 });
            }
        } catch (error) {
            toast({ title: "Error", message: "Kết nối đến máy chủ thất bại", type: "error", duration: 3000 });
            console.error("Lỗi:", error);
        }
    } else {
        toast({ title: "Warning", message: "Sản phẩm của bạn không có thay đổi!", type: "warning", duration: 3000 });
    }
});

//Tạo của sổ mặc định
function setDefaultValue() {
    document.querySelector(".upload-image-preview").src = "./assets/img/blank-image.png";
    document.getElementById("ten-mon").value = "";
    document.getElementById("gia-moi").value = "";
    document.getElementById("mo-ta").value = "";
    document.getElementById("chon-mon").value = "Món chay";
}

document.querySelector(".modal-close.product-form").addEventListener("click",() => {
    setDefaultValue();
})

// Tạo của sổ thêm món
let btnAddProduct = document.getElementById("btn-add-product");
btnAddProduct.addEventListener("click", () => {
    document.querySelectorAll(".add-product-e").forEach(item => {
        item.style.display = "block";
    })
    document.querySelectorAll(".edit-product-e").forEach(item => {
        item.style.display = "none";
    })
    document.querySelector(".add-product").classList.add("open");
});

//Xử lí thêm món 
let btnAddProductIn = document.getElementById("add-product-button");
btnAddProductIn.addEventListener("click", async (e) => {
    e.preventDefault();

    let imgProduct = getPathImage(document.querySelector(".upload-image-preview").src);
    let tenMon = document.getElementById("ten-mon").value;
    let price = document.getElementById("gia-moi").value;
    let moTa = document.getElementById("mo-ta").value;
    let categoryText = document.getElementById("chon-mon").value;

    if (tenMon == "" || price == "" || moTa == "") {
        toast({ title: "Chú ý", message: "Vui lòng nhập đầy đủ thông tin món!", type: "warning", duration: 3000 });
        return;
    }

    if (isNaN(price)) {
        toast({ title: "Chú ý", message: "Giá phải ở dạng số!", type: "warning", duration: 3000 });
        return;
    }

    const formData = new FormData();
    formData.append("title", tenMon);
    formData.append("price", price);
    formData.append("description", moTa);
    formData.append("category", categoryText);
    formData.append("img", imgProduct); 

    try {
        const res = await fetch("php/admin/add_product.php", {
            method: "POST",
            body: formData
        });

        const result = await res.json();

        if (result.success) {
            toast({ title: "Success", message: "Thêm sản phẩm thành công!", type: "success", duration: 3000 });
            document.querySelector(".add-product").classList.remove("open");
            setDefaultValue();
            showProduct(); 
        } else {
            toast({ title: "Error", message: result.message || "Thêm sản phẩm thất bại", type: "error", duration: 3000 });
        }
    } catch (error) {
        toast({ title: "Error", message: "Không thể kết nối máy chủ!", type: "error", duration: 3000 });
        console.error(error);
    }
});

// Đóng cửa sổ 
let closePopup = document.querySelectorAll(".modal-close");
let modalPopup = document.querySelectorAll(".modal");

for (let i = 0; i < closePopup.length; i++) {
    closePopup[i].onclick = () => {
        modalPopup[i].classList.remove("open");
    };
}

// Thay đổi ảnh (chỉ lấy ảnh trong đưòng dẫn )
function uploadImage(el) {
    let path = "./assets/img/products/" + el.value.split("\\")[2];
    document.querySelector(".upload-image-preview").setAttribute("src", path);
}

///Phần user
//Hiển thị user
function showUserArr(arr) {
    let accountHtml = '';
    if(arr.length == 0) {
        accountHtml = `<td colspan="6">Không có dữ liệu</td>`; // 6 cột vì có 6 <td> trong dòng
    } else {
        arr.forEach((account, index) => {
            let tinhtrang = account.status == 0 
                ? `<span class="status-no-complete">Bị khóa</span>` 
                : `<span class="status-complete">Hoạt động</span>`;
            accountHtml += ` <tr>
                <td>${index + 1}</td>
                <td>${account.fullname}</td>
                <td>${account.phone}</td>
                <td>${formatDate(account.join)}</td>
                <td>${tinhtrang}</td>
                <td class="control control-table">
                    <button class="btn-edit" id="edit-account" onclick="editAccount('${account.phone}')">
                        <i class="fa-light fa-pen-to-square"></i>
                    </button>
                    <button class="btn-delete" id="delete-account" onclick="deleteAcount('${account.phone}')">
                        <i class="fa-regular fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });
    }
    document.getElementById('show-user').innerHTML = accountHtml;
}
//lấy thông tin người dùng
async function showUser() {
    try {
        let status = parseInt(document.getElementById("tinh-trang-user").value);
        let search = document.getElementById("form-search-user").value.trim();
        let timeStart = document.getElementById("time-start-user").value;
        let timeEnd = document.getElementById("time-end-user").value;

        if (timeEnd < timeStart && timeEnd !== "" && timeStart !== "") {
            alert("Lựa chọn thời gian sai !");
            return;
        }

        const response = await fetch("php/admin/get_user_count.php");
        if (!response.ok) throw new Error("Lỗi kết nối server");
        
        const data = await response.json();

        let users = data.users;

        if (!Array.isArray(users)) {
            console.error("Dữ liệu users không phải mảng!");
            return;
        }

        // Lọc theo status (status = 2 là lấy tất cả)
        let filtered = (status === 2) ? users : users.filter(u => parseInt(u.status) === status);

        // Lọc theo search theo fullname hoặc phone
        if (search !== "") {
            filtered = filtered.filter(u =>
                u.fullname.toLowerCase().includes(search.toLowerCase()) ||
                u.phone.includes(search)
            );
        }

        // Lọc theo timeStart, timeEnd
        if (timeStart !== "" && timeEnd === "") {
            filtered = filtered.filter(u => new Date(u.join) >= new Date(timeStart + "T00:00:00"));
        } else if (timeStart === "" && timeEnd !== "") {
            filtered = filtered.filter(u => new Date(u.join) <= new Date(timeEnd + "T23:59:59"));
        } else if (timeStart !== "" && timeEnd !== "") {
            filtered = filtered.filter(u =>
                new Date(u.join) >= new Date(timeStart + "T00:00:00") &&
                new Date(u.join) <= new Date(timeEnd + "T23:59:59")
            );
        }

        showUserArr(filtered);

    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
    }
}

//Huỷ tìm kiếm 
function cancelSearchUser() {
    document.getElementById("tinh-trang-user").value = 2;  
    document.getElementById("form-search-user").value = "";
    document.getElementById("time-start-user").value = "";
    document.getElementById("time-end-user").value = "";
    showUser();  
}
//Xoá khách hàng 
async function deleteAcount(phone) {
    if (!confirm("Bạn có chắc muốn xóa?")) return;

    try {
        const formData = new FormData();
        formData.append('phone', phone);

        const res = await fetch("php/admin/delete_user.php", {
            method: "POST",
            body: formData
        });

        const result = await res.json();

        if (result.success) {
            alert("Xóa tài khoản thành công!");
            showUser();  // load lại danh sách user
        } else {
            alert("Xóa thất bại: " + (result.message || ""));
        }
    } catch (error) {
        alert("Lỗi khi xóa tài khoản.");
        console.error(error);
    }
}

//cập nhập tài khoản 
let updateAccount = document.getElementById("btn-update-account");
let currentPhoneToUpdate = null;

// Mở form và lấy dữ liệu từ PHP bằng phone
function editAccount(phone) {
    document.querySelector(".signup").classList.add("open");

    // Ẩn nút thêm, hiện nút cập nhật
    document.querySelectorAll(".add-account-e").forEach(item => {
        item.style.display = "none";
    });
    document.querySelectorAll(".edit-account-e").forEach(item => {
        item.style.display = "block";
    });

    currentPhoneToUpdate = phone;

    fetch(`php/admin/get_user_by_phone.php?phone=${phone}`)
        .then(res => res.json())
        .then(user => {
            if (!user || !user.phone) {
                toast({ title: "Lỗi", message: "Không tìm thấy người dùng!", type: "error", duration: 3000 });
                return;
            }

            document.getElementById("fullname").value = user.fullname;
            document.getElementById("phone").value = user.phone;
            document.getElementById("password").value = user.password; 
            document.getElementById("user-status").checked = user.status == 1;
        })
        .catch(err => {
            toast({ title: "Lỗi", message: "Không thể lấy dữ liệu người dùng!", type: "error", duration: 3000 });
            console.error(err);
        });
}

//  cập nhật thông tin người dùng
updateAccount.addEventListener("click", (e) => {
    e.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const password = document.getElementById("password").value.trim();
    const status = document.getElementById("user-status").checked ? 1 : 0;

    if (fullname === "" || password === "") {
        toast({ title: 'Chú ý', message: 'Vui lòng nhập đầy đủ thông tin!', type: 'warning', duration: 3000 });
        return;
    }

    const formData = new FormData();
    formData.append("phone", currentPhoneToUpdate); 
    formData.append("fullname", fullname);
    formData.append("password", password);
    formData.append("status", status);

    fetch("php/admin/update_user.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            toast({ title: 'Thành công', message: 'Cập nhật người dùng thành công!', type: 'success', duration: 3000 });
            document.querySelector(".signup").classList.remove("open");
            
            showUser();
        } else {
            toast({ title: 'Lỗi', message: result.message || "Cập nhật thất bại!", type: 'error', duration: 3000 });
        }
    })
    .catch(err => {
    });
});

//Thêm người dùng
// Đóng modal đăng ký 
document.querySelector(".modal.signup .modal-close").addEventListener("click", () => {
    signUpFormReset();
})

// Mở modal tạo tài khoản mới 
function openCreateAccount() {
    document.querySelector(".signup").classList.add("open");
    document.querySelectorAll(".edit-account-e").forEach(item => {
        item.style.display = "none"
    })
    document.querySelectorAll(".add-account-e").forEach(item => {
        item.style.display = "block"
    })
}

//reset dữ liệu 
function signUpFormReset() {
    document.getElementById('fullname').value = ""
    document.getElementById('phone').value = ""
    document.getElementById('password').value = ""
    document.querySelector('.form-message-name').innerHTML = '';
    document.querySelector('.form-message-phone').innerHTML = '';
    document.querySelector('.form-message-password').innerHTML = '';
}
let addAccount = document.getElementById('signup-button');
addAccount.addEventListener("click", async (e) => {
    e.preventDefault();

    let fullNameUser = document.getElementById('fullname').value.trim();
    let phoneUser = document.getElementById('phone').value.trim();
    let passwordUser = document.getElementById('password').value.trim();

    let fullNameIP = document.getElementById('fullname');
    let formMessageName = document.querySelector('.form-message-name');
    let formMessagePhone = document.querySelector('.form-message-phone');
    let formMessagePassword = document.querySelector('.form-message-password');

    // Reset lỗi
    formMessageName.innerHTML = '';
    formMessagePhone.innerHTML = '';
    formMessagePassword.innerHTML = '';

    // Validate
    if (fullNameUser.length === 0) {
        formMessageName.innerHTML = 'Vui lòng nhập họ và tên';
        fullNameIP.focus();
        return;
    } else if (fullNameUser.length < 3) {
        formMessageName.innerHTML = 'Vui lòng nhập họ và tên lớn hơn 3 kí tự';
        fullNameIP.focus();
        return;
    }

    if (phoneUser.length === 0) {
        formMessagePhone.innerHTML = 'Vui lòng nhập số điện thoại';
        return;
    } else if (phoneUser.length !== 10) {
        formMessagePhone.innerHTML = 'Vui lòng nhập số điện thoại 10 số';
        return;
    }

    if (passwordUser.length === 0) {
        formMessagePassword.innerHTML = 'Vui lòng nhập mật khẩu';
        return;
    } else if (passwordUser.length < 6) {
        formMessagePassword.innerHTML = 'Vui lòng nhập mật khẩu lớn hơn 6 kí tự';
        return;
    }

    //  gửi dữ liệu lên server
    try {
        const formData = new FormData();
        formData.append('fullname', fullNameUser);
        formData.append('phone', phoneUser);
        formData.append('password', passwordUser);

        const response = await fetch('php/admin/add_user.php', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (result.success) {
            toast({ title: 'Thành công', message: 'Tạo thành công tài khoản!', type: 'success', duration: 3000 });
            document.querySelector(".signup").classList.remove("open");
            showUser();
            signUpFormReset();
        } else {
            toast({ title: 'Lỗi', message: result.message || 'Tạo tài khoản thất bại!', type: 'error', duration: 3000 });
        }
    } catch (error) {
        console.error(error);
        toast({ title: 'Lỗi', message: 'Không thể kết nối máy chủ!', type: 'error', duration: 3000 });
    }
});

//Đơn hàng
//show dơn hàng 
function showOrder(arr) {
    let orderHtml = "";
    if (arr.length == 0) {
        orderHtml = `<td colspan="6">Không có dữ liệu</td>`;
    } else {
        arr.forEach((item) => {
            let status = item.status == 0 ? `<span class="status-no-complete">Chưa xử lý</span>` : `<span class="status-complete">Đã xử lý</span>`;
            let date = formatDate(item.order_date);
            orderHtml += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.khachhang}</td>
                    <td>${date}</td>
                    <td>${vnd(item.total_price)}</td>                               
                    <td>${status}</td>
                    <td class="control">
                        <button class="btn-detail" onclick="detailOrder('${item.id}')"><i class="fa-regular fa-eye"></i> Chi tiết</button>
                    </td>
                </tr>      
            `;
        });
    }
    document.getElementById("showOrder").innerHTML = orderHtml;
}
window.onload = function() {
    fetch("php/admin/get_orders.php")
      .then(response => {
          if (!response.ok) {
              throw new Error("Lỗi kết nối đến server");
          }
          return response.json();
      })
      .then(data => {
          showOrder(data);
      })
      .catch(error => {
          console.error("Lỗi khi fetch dữ liệu:", error);
          document.getElementById("showOrder").innerHTML = `<td colspan="6">Không thể tải dữ liệu</td>`;
      });
    showUser();
    showProduct();  
};

//Chi tiết đơn hàng 
function detailOrder(id) {
    document.querySelector(".modal.detail-order").classList.add("open");

    fetch(`php/admin/get_order_details.php?id=${id}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }

            let order = data.order;
            let details = data.details;

            let spHtml = `<div class="modal-detail-left"><div class="order-item-group">`;

            details.forEach(item => {
                spHtml += `<div class="order-product">
                    <div class="order-product-left">
                        <img src="${item.img}" alt="">
                        <div class="order-product-info">
                            <h4>${item.title}</h4>
                            <p class="order-product-note"><i class="fa-light fa-pen"></i> ${item.note || ''}</p>
                            <p class="order-product-quantity">SL: ${item.soluong}</p>
                        </div>
                    </div>
                    <div class="order-product-right">
                        <div class="order-product-price">
                            <span class="order-product-current-price">${vnd(item.price)}</span>
                        </div>                         
                    </div>
                </div>`;
            });

            spHtml += `</div></div>`;

            spHtml += `<div class="modal-detail-right">
                <ul class="detail-order-group">
                    <li class="detail-order-item">
                        <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
                        <span class="detail-order-item-right">${formatDate(order.thoigiandat)}</span>
                    </li>
                    <li class="detail-order-item">
                        <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
                        <span class="detail-order-item-right">${order.hinhthucgiao}</span>
                    </li>
                    <li class="detail-order-item">
                        <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
                        <span class="detail-order-item-right">${order.tenguoinhan}</span>
                    </li>
                    <li class="detail-order-item">
                        <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại</span>
                        <span class="detail-order-item-right">${order.sdtnhan}</span>
                    </li>
                    <li class="detail-order-item tb">
                        <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Thời gian giao</span>
                        <p class="detail-order-item-b">${(order.thoigiangiao ? (order.thoigiangiao + " - ") : "") + formatDate(order.ngaygiaohang)}</p>
                    </li>
                    <li class="detail-order-item tb">
                        <span class="detail-order-item-t"><i class="fa-light fa-location-dot"></i> Địa chỉ nhận</span>
                        <p class="detail-order-item-b">${order.diachinhan}</p>
                    </li>
                    <li class="detail-order-item tb">
                        <span class="detail-order-item-t"><i class="fa-light fa-note-sticky"></i> Ghi chú</span>
                        <p class="detail-order-item-b">${order.ghichu || ''}</p>
                    </li>
                </ul>
            </div>`;

            document.querySelector(".modal-detail-order").innerHTML = spHtml;

            let classDetailBtn = order.trangthai == 0 ? "btn-chuaxuly" : "btn-daxuly";
            let textDetailBtn = order.trangthai == 0 ? "Chưa xử lý" : "Đã xử lý";
            document.querySelector(
                ".modal-detail-bottom"
            ).innerHTML = `<div class="modal-detail-bottom-left">
                <div class="price-total">
                    <span class="thanhtien">Thành tiền</span>
                    <span class="price">${vnd(order.tongtien)}</span>
                </div>
            </div>
            <div class="modal-detail-bottom-right">
                <button class="modal-detail-btn ${classDetailBtn}" onclick="changeStatus('${order.id}', this)">${textDetailBtn}</button>
            </div>`;
        })
        .catch(err => {
            console.error("Lỗi lấy chi tiết đơn:", err);
        });
}
//Cấp nhập trang thái đơn hàng 
function changeStatus(id, el) {
    fetch('php/admin/update_order_status.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            el.classList.remove("btn-chuaxuly");
            el.classList.add("btn-daxuly");
            el.innerHTML = "Đã xử lý";
            fetch('php/admin/get_orders.php')
                .then(res => res.json())
                .then(orderData => {
                    showOrder(orderData); 
                })
                .catch(err => {
                    console.error("Lỗi khi load đơn hàng:", err);
                });
        } else {
            alert("Lỗi: " + data.message);
        }
    })
    .catch(err => {
        console.error("Lỗi kết nối:", err);
        alert("Không thể kết nối tới server");
    });
}
// Tìm và lọc đơn hàng 
function findOrder() {
    let tinhTrang = parseInt(document.getElementById("tinh-trang").value);
    let ct = document.getElementById("form-search-order").value.trim();
    let timeStart = document.getElementById("time-start").value;
    let timeEnd = document.getElementById("time-end").value;

    if (timeEnd < timeStart && timeEnd !== "" && timeStart !== "") {
        alert("Lựa chọn thời gian sai!");
        return;
    }

    fetch("php/admin/get_orders.php")
        .then(res => res.json())
        .then(orders => {
            // Lọc theo trạng thái
            let result = tinhTrang === 2 ? orders : orders.filter(order => order.status == tinhTrang);

            // Lọc theo tên khách hàng hoặc ID đơn hàng
            if (ct !== "") {
                result = result.filter(order =>
                    order.khachhang.toLowerCase().includes(ct.toLowerCase()) ||
                    order.id.toString().includes(ct)
                );
            }

            // Lọc theo thời gian đặt hàng
            if (timeStart !== "") {
                result = result.filter(order => new Date(order.order_date) >= new Date(timeStart));
            }
            if (timeEnd !== "") {
                let endOfDay = new Date(timeEnd);
                endOfDay.setHours(23, 59, 59);
                result = result.filter(order => new Date(order.order_date) <= endOfDay);
            }

            showOrder(result);
        })
        .catch(err => {
            console.error("Lỗi khi tải đơn hàng:", err);
            alert("Không thể tải danh sách đơn hàng từ server");
        });
}
//huỷ lọc
function cancelSearchOrder() {
    document.getElementById("tinh-trang").value = 2;
    document.getElementById("form-search-order").value = "";
    document.getElementById("time-start").value = "";
    document.getElementById("time-end").value = "";

    findOrder();
}

///Thống kê
//Tạo thống kê 
let allOrderDetails = [];

// Lấy dữ liệu chi tiết đơn hàng từ server
async function fetchOrderDetails() {
    try {
        const res = await fetch("./php/admin/get_all_order_details.php");
        const data = await res.json();
        if (Array.isArray(data)) {
            allOrderDetails = data;
            showThongKe(allOrderDetails, 0);
        } else {
            console.error("Dữ liệu không phải mảng: ", data);
        }
    } catch (error) {
        console.error("Lỗi fetchOrderDetails:", error);
    }
}

// Lọc và lọc lại dữ liệu theo tiêu chí, rồi hiển thị thống kê
function thongKe(mode) {
    const categoryTk = document.getElementById("the-loai-tk").value;
    const ct = document.getElementById("form-search-tk").value;
    const timeStart = document.getElementById("time-start-tk").value;
    const timeEnd = document.getElementById("time-end-tk").value;

    if (timeEnd < timeStart && timeEnd && timeStart) {
        alert("Lựa chọn thời gian sai!");
        return;
    }

    let filtered = [...allOrderDetails];

    if (categoryTk !== "Tất cả") {
        filtered = filtered.filter(item => item.category === categoryTk);
    }

    if (ct) {
        filtered = filtered.filter(item => item.title.toLowerCase().includes(ct.toLowerCase()));
    }

    if (timeStart) {
        const startDate = new Date(timeStart).setHours(0, 0, 0);
        filtered = filtered.filter(item => new Date(item.order_date) >= startDate);
    }

    if (timeEnd) {
        const endDate = new Date(timeEnd).setHours(23, 59, 59);
        filtered = filtered.filter(item => new Date(item.order_date) <= endDate);
    }

    showThongKe(filtered, mode);
}

// Gộp các sản phẩm trùng product_id lại, cộng dồn số lượng và doanh thu
function mergeObjThongKe(arr) {
    const result = [];
    arr.forEach(item => {
        const existing = result.find(i => i.id == item.product_id);
        if (existing) {
            existing.quantity += Number(item.quantity);
            existing.doanhthu += Number(item.quantity) * Number(item.price_per_unit);
        } else {
            result.push({
                id: item.product_id,
                title: item.title,
                img: item.img,
                category: item.category,
                quantity: Number(item.quantity),
                doanhthu: Number(item.quantity) * Number(item.price_per_unit)
            });
        }
    });
    return result;
}

// Hiển thị tổng quan: số sản phẩm, tổng đơn hàng, tổng doanh thu
function showOverview(arr) {
    document.getElementById("quantity-product").innerText = arr.length;
    document.getElementById("quantity-order").innerText = arr.reduce((sum, cur) => sum + cur.quantity, 0);
    document.getElementById("quantity-sale").innerText = vnd(arr.reduce((sum, cur) => sum + cur.doanhthu, 0));
}

// Hiển thị bảng thống kê sản phẩm sau khi gộp và sắp xếp
function showThongKe(arr, mode) {
    let html = "";
    let merged = mergeObjThongKe(arr);

    switch (mode) {
        case 1:
            merged.sort((a, b) => a.quantity - b.quantity);
            break;
        case 2:
            merged.sort((a, b) => b.quantity - a.quantity);
            break;
        case 0:
        default:
            break;
    }

    showOverview(merged);

    merged.forEach((item, index) => {
        html += `
        <tr>
            <td>${index + 1}</td>
            <td><div class="prod-img-title"><img class="prd-img-tbl" src="${item.img}" alt=""><p>${item.title}</p></div></td>
            <td>${item.quantity}</td>
            <td>${vnd(item.doanhthu)}</td>
            <td><button class="btn-detail product-order-detail" data-id="${item.id}"><i class="fa-regular fa-eye"></i> Chi tiết</button></td>
        </tr>`;
    });

    document.getElementById("showTk").innerHTML = html;

    document.querySelectorAll(".product-order-detail").forEach(btn => {
        const productId = btn.getAttribute("data-id");
        btn.addEventListener("click", () => detailOrderProduct(arr, productId));
    });
}

// Hiển thị chi tiết các đơn hàng của sản phẩm được chọn
function detailOrderProduct(arr, id) {
    let html = "";
    arr.filter(item => item.product_id == id).forEach(item => {
        html += `
        <tr>
            <td>${item.order_id}</td>
            <td>${item.quantity}</td>
            <td>${vnd(item.price_per_unit)}</td>
            <td>${formatDate(item.order_date)}</td>
        </tr>`;
    });
    document.getElementById("show-product-order-detail").innerHTML = html;
    document.querySelector(".modal.detail-order-product").classList.add("open");
}

// Khởi tạo dữ liệu khi trang load
fetchOrderDetails();

//log out
document.getElementById("logout-acc").addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem("currentuser");
    window.location.href = "/Webbanhang/index.php";
})