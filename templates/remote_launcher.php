{% extends "_base.html" %}
{% block scripts %}

<!-- Handle Remote Data -->
<?php
// Server Settings:
$image_cache_folder = './image-cache';
$image_prefix = 'img-';

// Copy remote image to local directory and provide local and remote url to WPD
$remote_url = $_POST["imageURL"];
$file_extension = image_type_to_extension(exif_imagetype($remote_url), FALSE);
$temp_file_placeholder = tempnam($image_cache_folder, $image_prefix);
$local_image_filename = $temp_file_placeholder.".".$file_extension;
$local_image_relative_path = $image_cache_folder.'/'.pathinfo($local_image_filename, PATHINFO_FILENAME).'.'.$file_extension;

$copy_status = 'fail';
if(copy($remote_url, $local_image_filename)) {
    $file_size = filesize($local_image_filename);
    if($file_size < 50e6) { // Limit file size to ~50MB
        $copy_status = 'success';
        echo("<script>var wpdremote = { status: '{$copy_status}', remoteUrl: '{$remote_url}', localUrl: '{$local_image_relative_path}'};</script>");
    } else {
        $copy_status = 'fail';
    }
} else {
    $copy_status = 'fail';
}
if($copy_status == 'fail') {
    echo("<script>var wpdremote = { status: 'fail' };</script>");
}
unlink($temp_file_placeholder);
?>
<!-- End Remote Data Handling -->

<script src="combined-compiled.js"></script>

<!-- Start of StatCounter code -->
<script type="text/javascript">
var sc_project=9769742; 
var sc_invisible=1; 
var sc_security="3f89a4fe"; 
var scJsHost = (("https:" == document.location.protocol) ?
"https://secure." : "http://www.");
document.write("<sc"+"ript type='text/javascript' src='" +
scJsHost+
"statcounter.com/counter/counter.js'></"+"script>");
</script>
<noscript><div class="statcounter"><a title="free web stats"
href="http://statcounter.com/" target="_blank"><img
class="statcounter"
src="http://c.statcounter.com/9769742/0/3f89a4fe/1/"
alt="free web stats"></a></div></noscript>
<!-- End of StatCounder Code -->

{% endblock %}
