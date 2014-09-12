<?php
header('Content-disposition: attachment; filename=wpd_plot_data.json');
header('Content-type: application/json');

$data = $_POST['data'];
echo $data;
?>
