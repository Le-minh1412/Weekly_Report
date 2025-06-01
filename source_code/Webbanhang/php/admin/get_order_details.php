<?php
include '../connect.php'; 

$conn = getConnection();

$order_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($order_id <= 0) {
    echo json_encode(['error' => 'Invalid order id']);
    exit;
}

// Lấy thông tin đơn hàng
$sqlOrder = "SELECT 
    id,
    user_id,
    order_date AS thoigiandat,
    delivery_method AS hinhthucgiao,
    recipient_name AS tenguoinhan,
    recipient_phone AS sdtnhan,
    delivery_date AS ngaygiaohang,
    delivery_address AS diachinhan,
    note AS ghichu,
    total_price AS tongtien,
    status AS trangthai,
    '' AS thoigiangiao  
FROM orders WHERE id = $order_id";

$resultOrder = $conn->query($sqlOrder);

if (!$resultOrder || $resultOrder->num_rows == 0) {
    echo json_encode(['error' => 'Order not found']);
    exit;
}

$order = $resultOrder->fetch_assoc();

// Lấy chi tiết đơn hàng kèm thông tin sản phẩm (img, title)
$sqlDetails = "SELECT 
    od.product_id AS id,
    p.title,
    p.img,
    od.quantity AS soluong,
    od.price_per_unit AS price,
    od.note
FROM order_items od
JOIN products p ON od.product_id = p.id
WHERE od.order_id = $order_id";

$resultDetails = $conn->query($sqlDetails);

if (!$resultDetails) {
    echo json_encode(['error' => $conn->error]);
    exit;
}

$details = [];
while ($row = $resultDetails->fetch_assoc()) {
    $details[] = $row;
}

// Trả về JSON với 2 phần: order và details
echo json_encode([
    'order' => $order,
    'details' => $details
]);

$conn->close();
