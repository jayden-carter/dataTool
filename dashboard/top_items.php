<?php
header('Content-Type: application/json');
$pdo = new PDO(
  'mysql:host=localhost;dbname=your_db;charset=utf8',
  'user','pass',
  [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]
);

// top 5 items by count sold (last 7 days)
$sql = "
  SELECT
    item_name       AS name,
    COUNT(*)        AS count
  FROM sales
  WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
  GROUP BY item_name
  ORDER BY count DESC
  LIMIT 5
";
$stmt = $pdo->query($sql);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
