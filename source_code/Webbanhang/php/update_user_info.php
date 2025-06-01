<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Chưa đăng nhập']);
    exit;
}

require_once 'connect.php';
$conn = getConnection();

$data = json_decode(file_get_contents('php://input'), true);

$fullname = trim($data['fullname'] ?? '');
$email = trim($data['email'] ?? '');
$address = trim($data['address'] ?? '');

if (empty($fullname)) {
    echo json_encode(['success' => false, 'message' => 'Họ tên không được để trống']);
    exit;
}

$user_id = $_SESSION['user']['id'];

$sql = "UPDATE users SET fullname = ?, email = ?, address = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssi", $fullname, $email, $address, $user_id);

if ($stmt->execute()) {
    // Cập nhật session
    $_SESSION['user']['fullname'] = $fullname;
    $_SESSION['user']['email'] = $email;
    $_SESSION['user']['address'] = $address;

    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Cập nhật thất bại']);
}

$stmt->close();
$conn->close();
