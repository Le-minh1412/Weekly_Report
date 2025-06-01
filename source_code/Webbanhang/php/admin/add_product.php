<?php
header('Content-Type: application/json');
require_once '../connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $price = $_POST['price'] ?? '';
    $description = $_POST['description'] ?? '';
    $category = $_POST['category'] ?? '';
    $img = $_POST['img'] ?? '';
    $status = 1;

    if (!$title || !$price || !$description || !$category) {
        echo json_encode(['success' => false, 'message' => 'Thiếu thông tin']);
        exit;
    }

    $conn = getConnection();

    // Lấy id lớn nhất hiện có
    $result = $conn->query("SELECT MAX(id) AS max_id FROM products");
    $row = $result->fetch_assoc();
    $newId = ($row['max_id'] ?? 0) + 1;

    $stmt = $conn->prepare("INSERT INTO products (id, title, price, description, category, img, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isdsssi", $newId, $title, $price, $description, $category, $img, $status);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'id' => $newId]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Thêm sản phẩm thất bại']);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Phương thức không hợp lệ']);
}
