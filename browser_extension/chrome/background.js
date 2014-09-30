
var clickHandler = function(e) {
    if(e.mediaType === "image") {
        var formContainer = document.createElement('div'),
            formElement = document.createElement('form'),
            formData = document.createElement('textarea');

        
        formElement.setAttribute('method', 'post');
        formElement.setAttribute('action', 'http://localhost:8000/experimental/file_copy.php');
        formElement.setAttribute('target', '_blank');
        
        formData.setAttribute('name', "imageData");
        formData.setAttribute('id', "imageData");

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

