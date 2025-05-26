<?php
session_start();
header('Content-Type: application/json');
require_once '../connect.php';

$conn = getConnection();

$sql = "SELECT id, fullname, phone, status, join_date FROM users WHERE user_type = 0";
$result = $conn->query($sql);

$users = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['join'] = $row['join_date'];
        unset($row['join_date']);
        $users[] = $row;
    }
}

$response = [
    'count' => count($users),
    'users' => $users
];

echo json_encode($response);

$conn->close();
?>
