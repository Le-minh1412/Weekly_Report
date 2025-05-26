<?php
include 'connect.php'; 

$conn = getConnection(); 
$order_id = isset($_GET['order_id']) ? intval($_GET['order_id']) : 0;

if ($order_id <= 0) {
    echo json_encode(["success" => false, "message" => "ID không hợp lệ"]);
    exit;
}

$sql = "SELECT oi.*, p.title, p.img 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = $order_id";

$result = mysqli_query($conn, $sql);

$items = [];
while ($row = mysqli_fetch_assoc($result)) {
    $items[] = $row;
}

echo json_encode([
    "success" => true,
    "items" => $items
]);
?>
