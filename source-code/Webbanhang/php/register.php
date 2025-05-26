<?php
session_start();
header('Content-Type: application/json');
require_once 'connect.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Dữ liệu không hợp lệ']);
    exit;
}

$conn =getConnection();

$fullname = $conn->real_escape_string($data['fullname']);
$phone = $conn->real_escape_string($data['phone']);
$password = $conn->real_escape_string($data['password']); 
$address = isset($data['address']) ? $conn->real_escape_string($data['address']) : '';
$email = isset($data['email']) ? $conn->real_escape_string($data['email']) : '';
$status = isset($data['status']) ? intval($data['status']) : 1;
$join_date = isset($data['join_date']) ? $conn->real_escape_string($data['join_date']) : date("Y-m-d H:i:s");
$user_type = isset($data['user_type']) ? intval($data['user_type']) : 0;

// Kiểm tra số điện thoại đã tồn tại chưa
$sql_check = "SELECT id FROM users WHERE phone = '$phone' LIMIT 1";
$result_check = $conn->query($sql_check);
if ($result_check->num_rows > 0) {
    $conn->close();
    echo json_encode(['success' => false, 'message' => 'Số điện thoại đã được đăng ký']);
    exit;
}

// Thêm user mới (lưu password thẳng text)
$sql_insert = "INSERT INTO users (fullname, phone, password, address, email, status, join_date, user_type)
               VALUES ('$fullname', '$phone', '$password', '$address', '$email', $status, '$join_date', $user_type)";
if ($conn->query($sql_insert) === TRUE) {
    $conn->close();
    echo json_encode(['success' => true, 'message' => 'Tạo tài khoản thành công!']);
} else {
    $err = $conn->error;
    $conn->close();
    echo json_encode(['success' => false, 'message' => "Lỗi khi tạo tài khoản: $err"]);
}
