<?php
session_start();
header('Content-Type: application/json');
require_once 'connect.php'; 

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Bạn chưa đăng nhập']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$currentPassword = $input['currentPassword'] ?? '';
$newPassword = $input['newPassword'] ?? '';

if (empty($currentPassword) || empty($newPassword)) {
    echo json_encode(['success' => false, 'message' => 'Vui lòng nhập đầy đủ dữ liệu']);
    exit;
}

$conn = getConnection();

$user = $_SESSION['user'];
$userId = $user['id'];

$sql = "SELECT password FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Người dùng không tồn tại']);
    exit;
}

$row = $result->fetch_assoc();
$dbPassword = $row['password'];

if ($currentPassword !== $dbPassword) {
    echo json_encode(['success' => false, 'errorField' => 'currentPassword', 'message' => 'Mật khẩu hiện tại không đúng']);
    exit;
}

$updateSql = "UPDATE users SET password = ? WHERE id = ?";
$updateStmt = $conn->prepare($updateSql);
$updateStmt->bind_param("si", $newPassword, $userId);

if ($updateStmt->execute()) {
    $_SESSION['user']['password'] = $newPassword;
    $user = $_SESSION['user'];
    unset($user['password']);

    echo json_encode(['success' => true, 'user' => $user]);
} else {
    echo json_encode(['success' => false, 'message' => 'Cập nhật mật khẩu thất bại']);
}

$stmt->close();
$updateStmt->close();
$conn->close();
?>
