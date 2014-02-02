<?php
header('Content-disposition: attachment; filename=data.csv');
header('Content-type: text/plain');

$csvData = $_POST['data'];
$data = json_decode($csvData);
$rows = count($data);
if($rows <= 0) return;

$columns = count($data[0]);
if($columns <= 0) return;

for($rowi = 0; $rowi < $rows; $rowi++) {
    for($coli = 0; $coli < $columns; $coli++) {
        echo $data[$rowi][$coli];
        if($coli < $columns - 1) {
            echo ',';
        }
    }
    echo "\n";
}

?>
