<?php
session_start();
header('Content-Type: application/json');
require_once 'connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['phone'], $data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Thiếu số điện thoại hoặc mật khẩu']);
    exit;
}

$phone = $data['phone'];
$password = $data['password'];

$conn = getConnection();
$phone = $conn->real_escape_string($phone);
$password = $conn->real_escape_string($password);

$sql = "SELECT * FROM users WHERE phone = '$phone' LIMIT 1";
$result = $conn->query($sql);

if ($result && $result->num_rows === 1) {
    $user = $result->fetch_assoc();

    if ($user['password'] === $password) {
        if ($user['status'] == 0) {
            echo json_encode(['success' => false, 'message' => 'Tài khoản của bạn đã bị khóa']);
        } else {
            // Lưu vào session
            $_SESSION['user'] = $user;
            
            //ẩn mật khẩu 
            unset($user['password']);

            echo json_encode([
                'success' => true,
                'message' => 'Đăng nhập thành công',
                'user' => $user
            ]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Sai mật khẩu']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Tài khoản không tồn tại']);
}

$conn->close();
