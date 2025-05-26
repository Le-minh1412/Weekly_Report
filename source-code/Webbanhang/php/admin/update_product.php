<?php
header('Content-Type: application/json');
require_once '../connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $title = $_POST['title'] ?? '';
    $price = $_POST['price'] ?? '';
    $description = $_POST['description'] ?? ''; // đổi thành description
    $category = $_POST['category'] ?? '';
    $img = $_POST['img'] ?? '';

    if (!$id || !$title || !$price || !$category) {
        echo json_encode(['success' => false, 'message' => 'Thiếu thông tin']);
        exit;
    }

    $conn = getConnection();

    $stmt = $conn->prepare("UPDATE products SET title = ?, price = ?, description = ?, category = ?, img = ? WHERE id = ?");
    $stmt->bind_param("sisssi", $title, $price, $description, $category, $img, $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Cập nhật thất bại']);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Phương thức không hợp lệ']);
}
