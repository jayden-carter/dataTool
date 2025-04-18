<?php
header('Content-Type: application/json');

// adjust to your credentials
$pdo = new PDO(
  'mysql:host=localhost;dbname=your_db;charset=utf8',
  'user',
  'pass',
  [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

// date range: last 7 days (inclusive)
$start = (new DateTime('-6 days'))->format('Y-m-d');
$end   = (new DateTime())->format('Y-m-d');

// fetch grouped counts
$sql = "
  SELECT
    DATE(sale_date)    AS sale_date,
    HOUR(sale_date)    AS hour,
    COUNT(*)           AS cnt
  FROM sales
  WHERE DATE(sale_date) BETWEEN :start AND :end
  GROUP BY sale_date, hour
";
$stmt = $pdo->prepare($sql);
$stmt->execute(['start' => $start, 'end' => $end]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// initialize full grid to 0
$data = [];
for ($i = 0; $i < 7; $i++) {
  $day = (new DateTime("-".(6-$i)." days"))->format('Y-m-d');
  $data[$day] = array_fill(0, 24, 0);
}
// populate with real counts
foreach ($rows as $r) {
  $data[$r['sale_date']][(int)$r['hour']] = (int)$r['cnt'];
}

// output
echo json_encode(['data' => $data]);
