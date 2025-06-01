<?php
session_start();
header('Content-Type: application/json');
require_once '../connect.php'; 

$conn = getConnection();

// Lấy tổng số sản phẩm
$sqlCount = "SELECT COUNT(*) as count FROM products";
$resultCount = $conn->query($sqlCount);

$count = 0;
if ($resultCount) {
    $rowCount = $resultCount->fetch_assoc();
    $count = (int)$rowCount['count'];
}

// Lấy tất cả sản phẩm
$sqlProducts = "SELECT id, title, img, price, category, status, description FROM products";
$resultProducts = $conn->query($sqlProducts);

$products = [];
if ($resultProducts) {
    while ($row = $resultProducts->fetch_assoc()) {
        $products[] = $row;
    }
}

// Đóng kết nối
$conn->close();

// Trả về json gồm count và danh sách products
echo json_encode([
    'count' => $count,
    'products' => $products
]);
?>
