<?php
session_start();
header('Content-Type: application/json');
require_once '../connect.php'; 

$conn = getConnection();

$sql = "SELECT SUM(total_price) as total FROM orders";
$result = $conn->query($sql);

$total = 0;
if ($result) {
    $row = $result->fetch_assoc();
    $total = (int)($row['total'] ?? 0);
}

header('Content-Type: application/json');
echo json_encode(['total' => $total]);

$conn->close();
?>
