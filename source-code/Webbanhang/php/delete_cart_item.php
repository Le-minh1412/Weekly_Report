<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Chưa đăng nhập']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['productId'])) {
    echo json_encode(['success' => false, 'message' => 'Thiếu productId']);
    exit;
}

require_once 'connect.php';
$conn = getConnection();

$user_id = $_SESSION['user']['id'];
$product_id = intval($data['productId']);

$sql = "DELETE FROM cart WHERE user_id = ? AND product_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $user_id, $product_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Xóa sản phẩm thành công']);
} else {
    echo json_encode(['success' => false, 'message' => 'Lỗi khi xóa sản phẩm', 'error' => $stmt->error]);
}
$stmt->close();
$conn->close();
