{% extends "_base.html" %}
{% block scripts %}

<!-- Remote data -->
<script type="text/javascript">
var wpdremote = {};
wpdremote.imageData = '<?php echo($_POST["imageData"]); ?>';
</script>
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
