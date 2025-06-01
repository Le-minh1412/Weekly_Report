<?php
header('Content-Type: application/json');
include '../connect.php';

$conn = getConnection();

$sql = "SELECT 
            oi.id AS order_item_id,
            oi.order_id,
            o.user_id,
            o.order_date,
            o.total_price AS order_total_price,
            o.status AS order_status,
            oi.product_id,
            oi.quantity,
            oi.price_per_unit,
            p.title,
            p.img,
            p.category
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        ORDER BY o.order_date DESC, oi.id DESC";

$result = $conn->query($sql);

$orderDetails = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $orderDetails[] = $row;
    }
}

$conn->close();

echo json_encode($orderDetails);
?>
