<?php
header('Content-Type: application/json');

// adjust these to your own credentials
$pdo = new PDO('mysql:host=localhost;dbname=your_db;charset=utf8', 'user', 'pass', [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
]);

function weekRange($offsetWeeks = 0) {
  $dt = new DateTime();
  $dt->modify(($offsetWeeks * 7) . ' days');
  $dt->modify('Monday this week');
  $start = $dt->format('Y-m-d');
  $dt->modify('Sunday this week');
  $end = $dt->format('Y-m-d');
  return [$start, $end];
}

// fetch sums for a given week offset
function fetchData($pdo, $offset) {
  list($from, $to) = weekRange($offset);
  $sql = "
    SELECT
      SUM(amount)           AS revenue,
      SUM(amount - cost)    AS profit,
      SUM(quantity)         AS time_sold
    FROM sales
    WHERE sale_date BETWEEN :from AND :to
  ";
  $stmt = $pdo->prepare($sql);
  $stmt->execute(['from'=>$from, 'to'=>$to]);
  return $stmt->fetch(PDO::FETCH_ASSOC);
}

$current = fetchData($pdo, 0);
$last    = fetchData($pdo, -1);

// calculate % growth on revenue
if ($last['revenue'] > 0) {
  $current['growth'] = (($current['revenue'] - $last['revenue']) / $last['revenue']) * 100;
  $last['growth']    = 0; // or recalc if you like
} else {
  $current['growth'] = 0;
  $last['growth']    = 0;
}

echo json_encode([
  'current' => $current,
  'last'    => $last
]);
