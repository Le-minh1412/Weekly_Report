<?php
header('Content-Type: application/json');
include '../connect.php';
$conn = getConnection();

// JOIN bảng users để lấy tên khách hàng
$sql = "SELECT 
            orders.id,
            orders.user_id,
            users.fullname AS khachhang,
            orders.order_date,
            orders.total_price,
            orders.status
        FROM orders
        JOIN users ON orders.user_id = users.id
        ORDER BY orders.id DESC";

$result = $conn->query($sql);

$orders = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row; 
    }
}

echo json_encode($orders);
$conn->close();
?>
