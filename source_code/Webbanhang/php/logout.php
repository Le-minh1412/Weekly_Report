<?php
session_start();

// Xóa tất cả dữ liệu trong session
$_SESSION = [];

session_destroy();

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'Đăng xuất thành công'
]);
