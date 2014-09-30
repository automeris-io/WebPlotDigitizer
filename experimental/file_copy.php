<!DOCTYPE html>
<html>
<head>
<script>
var img_location = "";

function testFun() {
    var $i = document.getElementById('dwn-image');
    $i.src = img_location;
}

document.addEventListener("DOMContentLoaded", testFun);
</script>
</head>
<body>
<?php 
$img_url = $_POST["imageData"]; // image url
$img_ext = pathinfo($img_url, PATHINFO_EXTENSION); // image extension
$img_tmp_fl = tempnam('./tmp','img-');
$img_copy_filename = $img_tmp_fl.".".$img_ext;
$img_relative_path = './tmp/'.pathinfo($img_copy_filename, PATHINFO_FILENAME).'.'.$img_ext;

echo("<p>".$img_url."</p>");
echo("<p>".$img_ext."</p>");
echo("<p>".$img_copy_filename."</p>");
echo("<p>".$img_relative_path."</p>");
echo "<p>Copying... ";

if(copy($img_url, $img_copy_filename)) {
    echo "Copied!</p>";
} else {
    echo "Copy failed!</p>";
}
echo("<script>img_location = \"".$img_relative_path."\";</script>");
unlink($img_tmp_fl);
?>
<img id="dwn-image"/>
</body>
</html>
