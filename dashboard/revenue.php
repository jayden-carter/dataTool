<?php
header('Content-Type: application/json');
$pdo = new PDO(
  'mysql:host=localhost;dbname=your_db;charset=utf8',
  'user','pass',
  [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]
);

// date range: last 7 days (incl. today)
$start = (new DateTime('-6 days'))->format('Y-m-d');
$end   = (new DateTime())->format('Y-m-d');

// initialize slots
$data = [];
for ($i = 0; $i < 7; $i++) {
  $d = (new DateTime("-".(6-$i)." days"))->format('Y-m-d');
  $data[$d] = ['date'=>$d, 'revenue'=>0];
}

// aggregate revenue per day
$sql = "
  SELECT
    DATE(sale_date) AS sale_date,
    SUM(amount)     AS revenue
  FROM sales
  WHERE DATE(sale_date) BETWEEN :start AND :end
  GROUP BY sale_date
";
$stmt = $pdo->prepare($sql);
$stmt->execute(['start'=>$start, 'end'=>$end]);
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
  $data[$row['sale_date']]['revenue'] = (float)$row['revenue'];
}

echo json_encode(array_values($data));
