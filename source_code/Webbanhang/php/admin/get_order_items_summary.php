<?php
header('Content-Type: application/json');
include '../connect.php';
$conn = getConnection();

$sql = "
SELECT 
    p.id,
    p.title,
    p.img,
    p.price,
    SUM(oi.quantity) AS quantity,
    SUM(oi.quantity * oi.price_per_unit) AS doanhthu
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY p.id, p.title, p.img, p.price
ORDER BY quantity DESC
";

$result = $conn->query($sql);

$data = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $row['quantity'] = (int)$row['quantity'];
        $row['price'] = (int)$row['price'];
        $row['doanhthu'] = (int)$row['doanhthu'];
        $data[] = $row;
    }
}

echo json_encode($data);
$conn->close();
