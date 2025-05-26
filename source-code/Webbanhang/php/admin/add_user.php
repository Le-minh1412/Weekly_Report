<?php
header('Content-Type: application/json');
require_once '../connect.php';

$conn = getConnection();

$fullname = $_POST['fullname'] ?? '';
$phone = $_POST['phone'] ?? '';
$password = $_POST['password'] ?? '';
$status = 1;    
$user_type = 0;   

if (!$fullname || !$phone || !$password) {
    echo json_encode(['success' => false, 'message' => 'Thiếu dữ liệu đầu vào']);
    exit;
}

// Kiểm tra số điện thoại đã tồn tại chưa
$stmt = $conn->prepare("SELECT phone FROM users WHERE phone = ?");
$stmt->bind_param("s", $phone);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Số điện thoại đã tồn tại']);
    exit;
}
$stmt->close();

// Thêm user mới với user_type
$stmt = $conn->prepare("INSERT INTO users (fullname, phone, password, status, user_type, join_date) VALUES (?, ?, ?, ?, ?, NOW())");
$stmt->bind_param("sssii", $fullname, $phone, $password, $status, $user_type);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Lỗi khi thêm tài khoản']);
}

$stmt->close();
$conn->close();
?>
