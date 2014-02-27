<?php
header('Content-disposition: attachment; filename=data.csv');
header('Content-type: text/csv');

$csvData = $_POST['data'];
$data = json_decode($csvData);

echo $data;
?>
