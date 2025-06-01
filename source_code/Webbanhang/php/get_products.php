<?php
include 'connect.php';

$conn = getConnection(); // dùng MySQLi

$sql = "SELECT * FROM products";
$result = $conn->query($sql);

$products = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

// Trả về dữ liệu JSON
header('Content-Type: application/json');
echo json_encode($products);

// Đóng kết nối
$conn->close();
?>