<?php
session_start();
header('Content-Type: application/json');
require_once '../connect.php';

$conn = getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Phương thức không hợp lệ']);
    exit;
}

if (!isset($_POST['phone']) || empty($_POST['phone'])) {
    echo json_encode(['success' => false, 'message' => 'Thiếu dữ liệu phone']);
    exit;
}

$phone = $conn->real_escape_string($_POST['phone']);

// Xóa user theo phone và user_type = 0 (không xóa admin)
$sql = "DELETE FROM users WHERE phone = '$phone' AND user_type = 0";

if ($conn->query($sql) === TRUE) {
    if ($conn->affected_rows > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Không tìm thấy tài khoản']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Lỗi SQL: ' . $conn->error]);
}

$conn->close();
?>
