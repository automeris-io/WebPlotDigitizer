// helloWorld.js - WPD script to display "Hello World" message in a popup.
//
// TIP: Search online for "Revealing Module Pattern in Javascript" to understand 
// the coding style used in WPD and WPD scripts. 
//
var wpdscript = (function () {
    
    function run () { // This is the entry point
        wpd.messagePopup.show(
                         "Simple script", // title
                         "Hello World!", // message body
                         message_callback // optional callback method.
                        );

    }

    function message_callback() { // Callback method

        wpd.messagePopup.show("Callback method", "Callback message");

    }

    return {
        run: run
    };
})();
