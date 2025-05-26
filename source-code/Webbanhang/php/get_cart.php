<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(["success" => false, "message" => "Chưa đăng nhập"]);
    exit;
}

require_once 'connect.php';

// Gọi hàm để lấy kết nối
$conn = getConnection();

$user_id = $_SESSION['user']['id'];

$sql = "SELECT cart.product_id, cart.quantity, cart.note, products.title, products.price
        FROM cart
        JOIN products ON cart.product_id = products.id
        WHERE cart.user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$cartItems = [];
while ($row = $result->fetch_assoc()) {
    $cartItems[] = $row;
}

echo json_encode(["success" => true, "data" => $cartItems]);
?>
