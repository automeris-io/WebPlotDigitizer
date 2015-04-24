<?php
$filename = $_POST['filename'];

header('Content-disposition: attachment; filename="'.$filename.'.csv"');
header('Content-type: text/csv');

$csvData = $_POST['data'];
$data = json_decode($csvData);

echo $data;
?>
