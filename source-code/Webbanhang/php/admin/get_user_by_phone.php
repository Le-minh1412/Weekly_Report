<?php
header('Content-Type: application/json');
require_once '../connect.php';

$conn = getConnection();

if (!isset($_GET['phone'])) {
    echo json_encode(['error' => 'Thiếu tham số phone']);
    exit;
}

$phone = $_GET['phone'];

// Chuẩn bị truy vấn tránh SQL Injection
$stmt = $conn->prepare("SELECT fullname, phone, password, status FROM users WHERE phone = ?");
if (!$stmt) {
    echo json_encode(['error' => 'Lỗi chuẩn bị truy vấn']);
    exit;
}

$stmt->bind_param("s", $phone);
$stmt->execute();

$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(['error' => 'Không tìm thấy người dùng']);
    exit;
}

$user = $result->fetch_assoc();

echo json_encode($user);

$stmt->close();
$conn->close();
