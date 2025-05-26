<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Chưa đăng nhập']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['productId'], $data['quantity'])) {
    echo json_encode(['success' => false, 'message' => 'Thiếu productId hoặc quantity']);
    exit;
}

require_once 'connect.php';
$conn = getConnection();

$user_id = $_SESSION['user']['id'];
$product_id = intval($data['productId']);
$quantity = intval($data['quantity']);
$note = isset($data['note']) ? $data['note'] : "";

if ($quantity < 1) {
    echo json_encode(['success' => false, 'message' => 'Số lượng phải lớn hơn 0']);
    exit;
}

// Kiểm tra sản phẩm có trong giỏ hàng chưa
$sql_check = "SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?";
$stmt = $conn->prepare($sql_check);
$stmt->bind_param("ii", $user_id, $product_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Cập nhật số lượng và ghi chú
    $sql_update = "UPDATE cart SET quantity = ?, note = ? WHERE user_id = ? AND product_id = ?";
    $stmt_update = $conn->prepare($sql_update);
    $stmt_update->bind_param("isii", $quantity, $note, $user_id, $product_id);
    
    if ($stmt_update->execute()) {
        echo json_encode(['success' => true, 'message' => 'Cập nhật số lượng thành công']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Lỗi khi cập nhật', 'error' => $stmt_update->error]);
    }
    $stmt_update->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Sản phẩm không tồn tại trong giỏ hàng']);
}

$stmt->close();
$conn->close();
