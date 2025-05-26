<?php
require_once '../connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Phương thức không hợp lệ']);
    exit;
}

$phone = $_POST['phone'] ?? '';
$fullname = $_POST['fullname'] ?? '';
$password = $_POST['password'] ?? '';
$status = isset($_POST['status']) ? intval($_POST['status']) : 1;

if (empty($phone) || empty($fullname) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Thiếu dữ liệu']);
    exit;
}

$conn = getConnection();

$stmt = $conn->prepare("UPDATE users SET fullname = ?, password = ?, status = ? WHERE phone = ?");
$stmt->bind_param("ssis", $fullname, $password, $status, $phone);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Cập nhật thất bại']);
}

$stmt->close();
$conn->close();
?>
