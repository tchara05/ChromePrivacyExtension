
// User Unique ID //
var HARDWARE_SUPPORTED =["geolocation","bluetooth", "vibrate","onLine" ,"mediaDevices","oscpu","deviceorientation","orientationchange","notification","indexedDB"];







// Function that set tha saved settings //
$("#settings-button").on("click",restoreUserSettings);


//$("#footer-scan-page").on("click",scanWebPage);
$("#newpage").on("click",openInNewTab);

// Function for show and hide the tabs in every hardware section //
$("a.list-group-item").on("click",function(){
    var t = $("*.collapse.internal").collapse("hide");
    $("."+$(this).href).collapse("show");

});

// Function that highlight the selected section of hardware //
$(".list-group-item.api").on("click",function () {

    if ($(this).hasClass("active-hover")){
        $(".list-group-item.api").removeClass("active-hover");
    } else{
        $(".list-group-item.api").removeClass("active-hover");
        $(this).addClass("active-hover");
    }
});


// Function that runs when user selected a setting to save the new setting//
$("#dev .list-group .list-group-item").on("click",function(){
    setTimeout(takeUserSettings,100);
});
$("#comm .list-group .list-group-item").on("click",function(){
    setTimeout(takeUserSettings,100);
});

$("#dataa .list-group .list-group-item").on("click",function(){
    setTimeout(takeUserSettings,100);
});

// Function that takes the user settings from panel//
function takeUserSettings() {
    var userOption = {};
    for (var i = 0; i < HARDWARE_SUPPORTED.length; i++) {
        userOption[HARDWARE_SUPPORTED[i]] = document.getElementById(HARDWARE_SUPPORTED[i]).checked;
    }
    saveUserSettings(userOption);
}


// Function That Saves User Settings

function saveUserSettings(settings){
    chrome.storage.local.set({"user-settings":JSON.stringify(settings)},function(){
           console.log("Data Saved");
    });

}

// Function That retrieve user settings from local storage //
function restoreUserSettings() {
    var userOptions = chrome.storage.local.get("user-settings", function (userOptions) {
        console.log("Data Retrieved");
        userOptions = JSON.parse(userOptions["user-settings"]);
        console.log(userOptions);
        for (var key in userOptions) {

           if (userOptions[key] === true) {
              document.getElementById(key).checked = true;
               $("#" + key).bootstrapToggle('on');
           } else {
               document.getElementById(key).checked = false;
              $("#" +  key).bootstrapToggle('off');
          }
       }

      });
}


function openInNewTab() {
    var win = window.open("./popup_window/components/page.html", '_blank');
    win.focus();
}

