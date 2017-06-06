<?php
$filename = $_POST['filename'];

header('Content-disposition: attachment; filename="'.$filename.'.json"');
header('Content-type: application/json');

$data = $_POST['data'];
echo $data;
?>
