<?php
session_start();
header('Content-Type: application/json');
require_once 'connect.php';

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Bạn chưa đăng nhập']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['productId'], $data['quantity'])) {
    echo json_encode(['success' => false, 'message' => 'Thiếu dữ liệu sản phẩm hoặc số lượng']);
    exit;
}

$user_id = $_SESSION['user']['id'];
$product_id = intval($data['productId']);
$quantity = intval($data['quantity']);
$note = isset($data['note']) ? $data['note'] : 'Không có ghi chú';

if ($quantity < 1) {
    echo json_encode(['success' => false, 'message' => 'Số lượng phải lớn hơn 0']);
    exit;
}

$conn = getConnection();

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Không thể kết nối database']);
    exit;
}

// Kiểm tra sản phẩm đã có trong giỏ hàng chưa
$sql_check = "SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?";
$stmt = $conn->prepare($sql_check);
$stmt->bind_param("ii", $user_id, $product_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Cập nhật số lượng và ghi chú
    $row = $result->fetch_assoc();
    $new_quantity = $row['quantity'] + $quantity;

    $sql_update = "UPDATE cart SET quantity = ?, note = ? WHERE user_id = ? AND product_id = ?";
    $stmt_update = $conn->prepare($sql_update);
    $stmt_update->bind_param("isii", $new_quantity, $note, $user_id, $product_id);
    $stmt_update->execute();
    $stmt_update->close();

    echo json_encode(['success' => true, 'message' => 'Cập nhật giỏ hàng thành công']);
} else {
    // Thêm mới
    $sql_insert = "INSERT INTO cart (user_id, product_id, quantity, note) VALUES (?, ?, ?, ?)";
    $stmt_insert = $conn->prepare($sql_insert);
    $stmt_insert->bind_param("iiis", $user_id, $product_id, $quantity, $note);
    $stmt_insert->execute();
    $stmt_insert->close();

    echo json_encode(['success' => true, 'message' => '']);
}

$stmt->close();
$conn->close();
