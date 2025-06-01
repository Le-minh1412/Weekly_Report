<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user'])) {
    $user = $_SESSION['user'];
    $isAdmin = isset($user['user_type']) && $user['user_type'] == 1; // 1 là admin
    unset($user['password']); 

    echo json_encode([
        'user' => $user,
        'isAdmin' => $isAdmin
    ]);
} else {
    echo json_encode(['user' => null]);
}
