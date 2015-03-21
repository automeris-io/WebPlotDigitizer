
var clickHandler = function(e) {
    if(e.mediaType === "image") {
        var formContainer = document.createElement('div'),
            formElement = document.createElement('form'),
            formData = document.createElement('textarea');

        
        formElement.setAttribute('method', 'post');
        formElement.setAttribute('action', 'http://automeris.io/wpd/remote_launcher.php');
        formElement.setAttribute('target', '_blank');
        
        formData.setAttribute('name', "imageURL");
        formData.setAttribute('id', "imageURL");

        formElement.appendChild(formData);
        formContainer.appendChild(formElement);
        document.body.appendChild(formContainer);
        formContainer.style.display = 'none';
        formData.innerHTML = encodeURI(e.srcUrl);
        formElement.submit();
        document.body.removeChild(formContainer);
    }
};

chrome.contextMenus.create({
    "title":"Send to WebPlotDigitizer",
    "contexts": ["image"],
    "onclick": clickHandler
});

