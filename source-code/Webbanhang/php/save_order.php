<?php
session_start();
header('Content-Type: application/json');

// Tắt hiển thị lỗi (nên bật trong dev riêng)
ini_set('display_errors', 0);
error_reporting(0);

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Chưa đăng nhập']);
    exit;
}

require_once 'connect.php';

$conn = getConnection(); 

// Đọc dữ liệu JSON POST
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Dữ liệu gửi lên không hợp lệ']);
    exit;
}

$user_id = $_SESSION['user']['id'] ?? null;
$delivery_date = $data['delivery_date'] ?? null;
$delivery_time = $data['delivery_time'] ?? null; 
$delivery_method = $data['delivery_method'] ?? null;
$recipient_name = $data['recipient_name'] ?? null;
$recipient_phone = $data['recipient_phone'] ?? null;
$delivery_address = $data['delivery_address'] ?? null;
$note = $data['note'] ?? "";
$order_items = $data['order_items'] ?? [];

if (!$user_id || !$delivery_date || !$delivery_method || !$recipient_name || !$recipient_phone || !$delivery_address) {
    echo json_encode(['success' => false, 'message' => 'Thiếu thông tin đơn hàng']);
    exit;
}

if (empty($order_items)) {
    echo json_encode(['success' => false, 'message' => 'Không có sản phẩm trong đơn hàng']);
    exit;
}

// Tính tổng tiền
$total_price = 0;
foreach ($order_items as $item) {
    if (!isset($item['price_per_unit'], $item['quantity'])) {
        echo json_encode(['success' => false, 'message' => 'Thông tin sản phẩm không hợp lệ']);
        exit;
    }
    $total_price += $item['price_per_unit'] * $item['quantity'];
}

try {
    $conn->begin_transaction();
    $stmt = $conn->prepare("INSERT INTO orders (user_id, delivery_date, delivery_time, delivery_method, recipient_name, recipient_phone, delivery_address, note, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $total_price_int = (int)$total_price;

    $stmt->bind_param("isssssssi", $user_id, $delivery_date, $delivery_time, $delivery_method, $recipient_name, $recipient_phone, $delivery_address, $note, $total_price_int);
    $stmt->execute();

    $order_id = $conn->insert_id;

    // CHUẨN BỊ insert từng sản phẩm trong order_items
    $stmt_item = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price_per_unit) VALUES (?, ?, ?, ?)");
    if (!$stmt_item) {
        throw new Exception("Prepare failed (order_items): " . $conn->error);
    }

    foreach ($order_items as $item) {
        $product_id = (int)$item['product_id'];
        $quantity = (int)$item['quantity'];
        $price_per_unit = (int)$item['price_per_unit'];

        $stmt_item->bind_param("iiid", $order_id, $product_id, $quantity, $price_per_unit);
        $stmt_item->execute();
    }

    // Xoá giỏ hàng user sau khi đặt hàng
    $stmt_del = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
    $stmt_del->bind_param("i", $user_id);
    $stmt_del->execute();

    $conn->commit();

    echo json_encode(['success' => true, 'order_id' => $order_id]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()]);
}
