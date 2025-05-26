<?php
require_once '../connect.php';

header('Content-Type: application/json');

// Nhận dữ liệu JSON từ fetch
$data = json_decode(file_get_contents('php://input'), true);

// Kiểm tra id
if (!isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'Thiếu id đơn hàng']);
    exit;
}

$orderId = intval($data['id']);

$conn = getConnection();

// Sử dụng đúng biến $orderId
$sql = "UPDATE orders SET status = 1 WHERE id = '$orderId'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Lỗi khi cập nhật trạng thái: ' . $conn->error]);
}

$conn->close();
