var store = {};
store.storage ={};

store.storage.setValue = function (key,value){

    var goForSave = {};
    if (key=="user-group-settings"){
        console.log("group");
        goForSave["user-group-settings"] = value;
        goForSave["user-advance-settings"]=store.storage["user"]["user-advance-settings"];
    }else if (key=="user-advance-settings"){
        console.log("advance");
        goForSave["user-group-settings"] = store.storage["user"]["user-group-settings"];
        goForSave["user-advance-settings"]=value;
    }else{
        console.log("else");
        goForSave["user-advance-settings"]=store.storage["user"]["user-advance-settings"];
        goForSave["user-group-settings"] = store.storage["user"]["user-group-settings"];
    }

    chrome.storage.local.set({"user":JSON.stringify(goForSave)},function(){
        chrome.storage.local.get("user",function(data2) {
            store.storage["user"] = JSON.parse(data2["user"]);
        });
    });
};


chrome.storage.local.get("user",function(data){
    if (isEmpty(data)){
        data = {user:{}};
        data["user"]["user-advance-settings"] = {};
        data["user"]["user-group-settings"] = {};
        store.storage["user"] = data["user"];
        return ;
    }


    if (isEmpty(data["user"])) {
        data["user"]["user-advance-settings"] = {};
        data["user"]["user-group-settings"] = {};
        store.storage["user"] = data["user"];
        return;
    }
    store.storage["user"] = JSON.parse(data["user"]);
    listSavedPages();
});







var DAY ="monday";
var ALL_DAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
var HARDWARE_SUPPORTED =["geolocation","bluetooth", "vibrate","onLine" ,"mediaDevices","oscpu","deviceorientation","orientationchange", "devicelight","userproximity","notification","indexedDB"];
var HARDWARE_SLIDER=[];
var EDIT_FLAG = {edit:false,isGroup:false};
var OLD_PAGE_NAME = "";

var settingsForPage = {
    monday: {},
    tuesday: {},
    wednesday: {},
    thursday: {},
    friday: {},
    saturday: {},
    sunday: {}
};

setTimeout(initializeAll, 500);
$("li.list-group-item.inline").on("click",function (){
    $("li.list-group-item.inline").removeClass("active-access");
    $(this).addClass("active-access");

    var name = $(this).attr("id");
    $(".access").addClass("hide");
    $("#"+ name+ "-access-"+DAY).removeClass("hide");

});

$(".days").on("click",function (){
    $(".days").removeClass("active-access");
    $(this).addClass("active-access");
    $(".settings").addClass("hide");
    $(".loader").removeClass("hide");
    var name = $(this).attr("id");

    setTimeout(function(){
        name = name.substr(0,name.indexOf('-'));

        $(".loader").addClass("hide");
        DAY = name;
        $(".access").addClass("hide");
        $("#" + DAY +"-settings").removeClass("hide");
        $("li.list-group-item.inline").removeClass("active-access");
        $("#hardware").addClass("active-access");
        $("#hardware-access-"+DAY).removeClass("hide");

    },400);


});


/* Copy From One Day To Other Day */
$("#drop-down-menu-left li a").on("click",function (){
    var name =  $(this).text();
    var element='<span class="caret right mycaret"></span>';
    $("#transfer-btn-left").text(name).append(element);

});

$("#drop-down-menu-right li a").on("click",function (){
    var name =  $(this).text();
    var element='<span class="caret right mycaret"></span>';
    $("#transfer-btn-right").text(name).append(element);

});


/**
 * Event that collect the values from day subpanel that collected in the left-copy-button
 * and sets them to the day subpanel on the right-copy-button
 *
 * This is for coping settings.
 */

$("#copy-btn").on("click",function(){

    var leftDay= $("#transfer-btn-left").text().toLowerCase();
    var rightDay= $("#transfer-btn-right").text().toLowerCase();
    if( leftDay==rightDay){
        swal("Please Choose wright options","","warning")
    }else if (leftDay=="choose...(optional)"){
        swal("Please choose a day from right list","","warning");
    }else if (rightDay == "choose...(optional)"){
        swal("Please choose a day from left list","","warning");
    }else {
        var ob = saveAccess(leftDay);
        setAccess(rightDay, ob);
        swal("Settings Copied", "From " + leftDay + " To " + rightDay, "success");
    }
});


/**
 * Function that translate minutes to hours
 *
 */

function test(){

    var sliderName ="#"+ $(this).attr("id");
    var s = HARDWARE_SLIDER[sliderName];
    var h1 =parseInt(s.getValue()[0]/60);
    var m1 =parseInt(s.getValue()[0]%60);

    var h2 =parseInt(s.getValue()[1]/60);
    var m2 =parseInt(s.getValue()[1]%60);

    if (h1<10){
        h1 = "0"+h1;
    }
    if (m1<29){
        m1 = "00";
    }
    if (h2<10){
        h2 = "0"+h2;
    }
    if (m2<29){
        m2 = "00";
    }
    if (h2==24){
        h2="23";
        m2="59";
    }

    var name = $(this).attr("id");

    $(sliderName+"-start").text(h1 + ":" +m1);
    $(sliderName+"-end").text(h2 + ":" + m2);

}


$("#second-bar-wrapper .list-group-item").on("click",function () {

    $("#second-bar-wrapper .list-group-item").removeClass("active-hover");
    $(this).addClass("active-hover");
    $(".panel-body .container-fluid").addClass("hide");
    var t = $(this).attr("id");


    //Every Time when someone changes section clears all panel and make it look like the initialize panel
    $("#" + t + "-content").removeClass("hide");
    if (t == "access-by-day"){
        clearAllValues();
    }
});




function initializeAll () {

    $("[data-toggle='toggle']").bootstrapToggle('destroy');
    $("[data-toggle='toggle']").bootstrapToggle();

    $("#textinput").val("");
    for (var j = 0; j < 7; j++) {
        for (var i = 0; i < HARDWARE_SUPPORTED.length; i++) {
            var sliderName = "#" + HARDWARE_SUPPORTED[i] + "-" + ALL_DAYS[j] + "-time";
            var s = $(sliderName).slider({
                tooltip: 'hide',
                enabled: false
            }).on("slide", test).data("slider");
            HARDWARE_SLIDER[sliderName] = s;
        }
    }
    $("[data-toggle='toggle']").on("change",function (){
        var togName = $(this).attr("id");
        var val = $(this).is(":checked");
        if (togName){
            togName = togName.split("-");
            var  slidName ="#" +togName[0] + "-" + togName[1] + "-time";
            if (val==false) {
                $(slidName).slider('disable');
                $(slidName + "-start + .slider-horizontal > .slider-track > .slider-selection").css("background","darkgrey");
            }else{
                $(slidName).slider('enable');
                $(slidName + "-start + .slider.slider-horizontal > .slider-track > .slider-selection").css("background","#5bc0de");
            }
        }
    });

    $(".loader").addClass("hide");
    $("#monday-settings").removeClass("hide");

}


/**
 * Function that clear all values from sliders and toggles and set them to
 * default values. Besides clears all input boxes and make them invisibles
 */

function clearAllValues(){

    for (var j = 0; j < 7; j++) {
        for (var i = 0; i < HARDWARE_SUPPORTED.length; i++) {
            var sliderName = "#" + HARDWARE_SUPPORTED[i] + "-" + ALL_DAYS[j] + "-time";
            HARDWARE_SLIDER[sliderName].setValue([0, 1440]);
            $(sliderName).slider('enable');
            $(sliderName + "-start + .slider.slider-horizontal > .slider-track > .slider-selection").css("background","#5bc0de");
            $(sliderName+"-start").html("00:00");
            $(sliderName+"-end").html("23:59");
        }
    }

    $( "input:enabled" ).prop("checked", true);
    $("[data-toggle='toggle']").bootstrapToggle("destroy");
    $("[data-toggle='toggle']").bootstrapToggle();

    $("#type-button").text("Choose Type Settings ...");    // make the button for type has no value
    $("#textinput").addClass("hide").val("");              // hide text input for individual add
    $("#textinputgroup").addClass("hide").val("");        // hide text input for group add
    EDIT_FLAG.edit= false;
    EDIT_FLAG.isGroup=false;

    $("#button-list").removeClass("hide");
    $("#id-header").addClass("hide");
    var element='<span class="caret right mycaret"></span>';
    $("#transfer-btn-right").text("Choose...Optional").append(element);
    $("#transfer-btn-left").text("Choose...Optional").append(element);


}



//Code for Save New Settings //

$("#save-button").on("click",saveAllDaysForPage);


function saveAllDaysForPage(){

    swal({title: "Do you want to save these settings?",
            text: "You can edit these settings later",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#fffff",
            cancelButtonColor:"#fffff",
            confirmButtonText: "Yes",
            closeOnConfirm: false },
        function(){
            var userSettings={};
            var check=false;
            if( $("#type-button").text() == "Override Default Settings"){
                EGG = "user-advance-settings";
                pageName = "Override Default Settings";
            }else{
                var pageName = $("#textinput").val();
                pageName = pageName.replace("http://", "");
                pageName = pageName.replace("https://", "");
                if (pageName == "") {
                    pageName = $("#textinputgroup").val();
                    if (pageName.charAt(0) != '.') {
                        swal("Please Insert A Valid Group of Pages (e.x .com", "", "error");
                        return;
                    }
                }
            }

            if (!(pageName == "")) {
                var  EGG="";

                if (EDIT_FLAG.edit) {
                    if (EDIT_FLAG.isGroup) {
                        EGG = "user-group-settings";
                    } else {
                        EGG = "user-advance-settings";
                    }
                }else if ($("#type-button").text() == "Individual Page Settings" || $("#type-button").text() == "Override Default Settings") {
                    EGG = "user-advance-settings";
                }else if( $("#type-button").text() == "Group of Pages Settings"){
                    EGG  ="user-group-settings";
                }else{
                    swal("Please Choose A Settings Type", "", "error");
                    return ;
                }
                console.log(EGG);
                if (!isEmpty(store.storage["user"][EGG])) {
                    check = store.storage["user"][EGG];
                }
                if (!isEmpty(check)) {
                    if ( !EDIT_FLAG.edit && check.hasOwnProperty(pageName)) {
                        swal("This webpage already exist", "", "error");
                        return;
                    }
                }
                for (var i = 0; i < ALL_DAYS.length; i++) {
                    var sets = saveAccess(ALL_DAYS[i]);
                    settingsForPage[ALL_DAYS[i]] = sets;
                }
                if (!isEmpty(check)) {
                    userSettings = check;
                    if (EDIT_FLAG && OLD_PAGE_NAME != "") {
                        delete userSettings[OLD_PAGE_NAME];
                    }
                } else {
                    userSettings = store.storage["user"][EGG];
                }
                userSettings[pageName] = settingsForPage;
                store.storage.setValue(EGG, userSettings);

                swal("Custom Settings Added for:", pageName, "success");
                clearAllValues();
                EDIT_FLAG.edit = false; EDIT_FLAG.isGroup=false;
                OLD_PAGE_NAME ="";

            } else {
                swal("Please Insert A Valid Page's Name", "", "error");
            }

        });

}


/**
 * Function that collects all values grom sliders and toggles and make thaem as JSON
 * for every day. Every day represent a JSON .
 *
 *
 * @param day
 * @returns {{}}
 */

function saveAccess(day){

    var savedSets = {};
    var key;
    for(key in HARDWARE_SUPPORTED){
        savedSets[HARDWARE_SUPPORTED[key]]={access:"on",time:{start:"00:00",end:"23:59"}};
    }

    for(key in HARDWARE_SUPPORTED) {
        if ($("#" + HARDWARE_SUPPORTED[key] + "-" + day + "-toggle").is(":checked")) {
            savedSets[HARDWARE_SUPPORTED[key]].access = "on";
            savedSets[HARDWARE_SUPPORTED[key]].time.start = $("#" + HARDWARE_SUPPORTED[key]  + "-" + day + "-time-start").text();
            savedSets[HARDWARE_SUPPORTED[key]].time.end = $("#" + HARDWARE_SUPPORTED[key]  + "-" + day + "-time-end").text();
        } else {
            savedSets[HARDWARE_SUPPORTED[key]].access = "off";
        }
    }
    return  savedSets;


}

// Edit Settings //
function edit(){
    $("#textinput").addClass("hide").val("");              // hide text input for individual add
    $("#textinputgroup").addClass("hide").val("");
    EDIT_FLAG.edit = true;
    var k = $(this);
    var pageName = k.parent().attr("id");
    OLD_PAGE_NAME = pageName;
    swal({title: "Do you want to edit these settings?",
            text: "",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#fffff",
            cancelButtonColor:"#fffff",
            confirmButtonText: "Yes",
            closeOnConfirm: true },
        function() {
            var EGG = "";

            $("#button-list").addClass("hide");
            if (pageName.charAt(0)!='.') {
                $("#id-header").removeClass("hide").text("Individual Page Settings");
                EGG="user-advance-settings";
                if (pageName=="Override Default Settings" || pageName=="Override"){
                    $("#id-header").removeClass("hide").text("Override Default Settings");
                    $("#textinput").val("Override Default Settings");
                }else{
                    $("#textinput").val(pageName).removeClass("hide");
                }
                EDIT_FLAG.isGroup = false;
            }else{
                $("#id-header").removeClass("hide").text("Group Pages Settings");
                EGG="user-group-settings";
                $("#textinputgroup").val(pageName).removeClass("hide");
                EDIT_FLAG.isGroup = true;

            }
            var settings =store.storage["user"][EGG];
            settings = settings[pageName];
            for (var day in settings) {
                var ob = settings[day];
                setAccess(day,ob);
            }
            $("#second-bar-wrapper .list-group-item").removeClass("active-hover");
            $("#access-by-day").addClass("active-hover");
            $(".panel-body .container-fluid").addClass("hide");
            var t = $(this).attr("id");
            $("#access-by-day-content").removeClass("hide");
        });

}


/***
 * Take as parameter a day and the settings for that day
 * and adds this values to advance panel (toggle, sliders).
 *
 * @param day
 * @param data
 */

function setAccess(day,data){

    for (var key in data){
        $("#"+key+"-"+day+"-time-start").text(data[key].time.start);
        $("#"+key+"-"+day+"-time-end").text(data[key].time.end);
        $("#"+key+"-"+day+"-toggle").bootstrapToggle(data[key].access+"");
        var sliderName = "#" + key + "-" + day + "-time";

        var start = data[key].time.start;
        var h1 = start.substr(0,start.indexOf(':'));
        var m1 = start.substr(start.indexOf(':')+1,start.length);
        var end = data[key].time.end;
        var h2 = end.substr(0,end.indexOf(':'));
        var m2 = end.substr(end.indexOf(':')+1,end.length);

        start=parseInt(h1)*60 + parseInt(m1);
        end = parseInt(h2)*60 + parseInt(m2);

        HARDWARE_SLIDER[sliderName].setValue([start,end]);

    }

}




//Saved Settings Manipulation //

$("#saved-settings").on("click",listSavedPages);
$("#access-by-day").on("click",function (){
    var list = document.getElementById("saved-pages");
    list.innerHTML="";
});

function listSavedPages() {

    var saveSettings = store.storage["user"]["user-advance-settings"];
    var listOfPages = document.getElementById("saved-pages");
    listOfPages.innerHTML="";
    var list;
    var counter=0;
    var pagingCounter=0;

    for (var key in saveSettings) {
        if (counter==0){
            pagingCounter++;
            list = document.createElement("ul");
            list.className="list-group hide lists";
            list.id="saved-pages-"+pagingCounter;
        }
        var item = document.createElement("li");
        item.className = " list-group-item saved-list-item";
        item.id=key;
        item.innerHTML =
            "<h4 style='display: inline'>Page Name: </h4>"+ key +
            '<a class="right delete">Delete<img class="img-of-saved" src="../img/settings-delete-blue.png" width=18px height=18px></a>' +
            '<a class="right edit">Edit<img class="img-of-saved" src="../img/settings-edit-blue.png" width=18px height=18px></a> </li>';
        list.appendChild(item);
        counter++;
        if (counter==11){
            counter=0;
            listOfPages.appendChild(list);
        }

    }

    saveSettings = store.storage["user"]["user-group-settings"];
    for (var key in saveSettings) {
        if (counter==0){
            pagingCounter++;
            list = document.createElement("ul");
            list.className="list-group hide lists";
            list.id="saved-pages-"+pagingCounter;
        }
        var item = document.createElement("li");
        item.className = " list-group-item saved-list-item";
        item.id=key;
        item.innerHTML =
            "<h4 style='display: inline'>Page Name: </h4>"+ key +
            '<a class="right delete">Delete<img class="img-of-saved" src="../img/settings-delete-blue.png" width=18px height=18px></a>' +
            '<a class="right edit">Edit<img class="img-of-saved" src="../img/settings-edit-blue.png" width=18px height=18px></a> </li>';
        list.appendChild(item);
        counter++;
        if (counter==11){
            counter=0;
            listOfPages.appendChild(list);
        }

    }





    if (counter<11 && counter > 0){
        listOfPages.appendChild(list);
    }


    if (pagingCounter>0) {
        $("#saved-pages-1").removeClass("hide");
        for(var i=1;i<=5;i++) {
            $("#pagination-demo-" + i).remove();
        }
        var nameNum = pagingCounter;
        if (pagingCounter>5){ nameNum=5  }

        $("#saved-settings-content").append('<div class="row" id="pagination">' +
        '<div class="col-md-12">'+
        '<ul id="pagination-demo-'+nameNum+'"> </ul></div></div>');
        $('#pagination-demo-'+nameNum).twbsPagination({
            totalPages: pagingCounter,
            visiblePages: 5,
            onPageClick: function (event, page) {
                $('#page-content').text('Page ' + page);
                $(".lists").addClass("hide");
                $("#saved-pages-" + page).removeClass('hide');
            }
        });
    }

    $(".edit").on("click",edit);

    $(".delete").on("click",function (){
        var item = $(this).parent();
        swal({   title: "Are you sure?",
                text: "You will not be able to recover these Settings!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "red",
                confirmButtonText: "Yes, Delete it Anyway!",
                cancelButtonText: "Cancel!",
                closeOnConfirm: false},
            function(isConfirm) {
                if (isConfirm) {
                    deleteSettings(item.attr("id"));
                    swal("Deleted!", "Settings have been deleted.", "success");

                }
            })
    });

}



function deleteSettings(forDelete){
    var EGG = "user-advance-settings";
    if (forDelete.charAt(0)=='.'){
        EGG = "user-group-settings";
    }
    var saveSettings = store.storage["user"][EGG];
    delete saveSettings[forDelete];
    document.getElementById(forDelete).remove();
    store.storage.setValue(EGG,saveSettings);
}

$("#search-settings").click(function(){
    document.getElementById("search-result").innerHTML="";
});


$("#text-search").on("keyup",function (e){
    var userSets = store.storage["user"]["user-advance-settings"];
    var userSets2 = store.storage["user"]["user-group-settings"];
    if (e.keyCode==8 || (90>=e.keyCode &&  48<=e.keyCode  )){
        document.getElementById("search-result").innerHTML="";
        var pageName= $("#text-search").val();
        for(var keys in  userSets){
            if (keys.search(pageName)!=-1){
                $("#search-result").append("<li class='list-group-item saved-list-item' id="+keys + "><h4 style='display: inline'>Page Name: </h4>"+ keys +
                '<a class="right delete">Delete<img class="img-of-saved" src="../img/settings-delete-blue.png" width=18px height=18px></a>' +
                '<a class="right edit">Edit<img class="img-of-saved" src="../img/settings-edit-blue.png" width=18px height=18px></a> '+
                '</li>');
            }
        }
        for(var keys in  userSets2){
            if (keys.search(pageName)!=-1){
                $("#search-result").append("<li class='list-group-item saved-list-item' id="+keys + "><h4 style='display: inline'>Page Name: </h4>"+ keys +
                '<a class="right delete">Delete<img class="img-of-saved" src="../img/settings-delete-blue.png" width=18px height=18px></a>' +
                '<a class="right edit">Edit<img class="img-of-saved" src="../img/settings-edit-blue.png" width=18px height=18px></a> '+
                '</li>');
            }
        }
    }

    $(".edit").on("click",edit);

    $(".delete").on("click",function (){
        var item = $(this).parent();
        swal({   title: "Are you sure?",
                text: "You will not be able to recover these Settings!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "red",
                confirmButtonText: "Yes, Delete it Anyway!",
                cancelButtonText: "Cancel!",
                closeOnConfirm: false},
            function(isConfirm) {
                if (isConfirm) {
                    deleteSettings(item.attr("id"));
                    item.remove();
                    swal("Deleted!", "Settings have been deleted.", "success");

                }


            })
    });

});



$("#close").on("click",function(){
    self.postMessage({method:"close"});
});

$("#individual").on("click",function (){
    $("#type-button").text($(this).text());
    $("#textinputgroup").addClass("hide");
    $("#textinput").removeClass("hide");


});
$("#group").on("click",function (){
    $("#type-button").text($(this).text());
    $("#textinput").addClass("hide");
    $("#textinputgroup").removeClass("hide");
});
$("#allpages").on("click",function (){
    if ( store.storage["user"]["user-advance-settings"].hasOwnProperty("Override Default Settings")){

        swal("Warning!", "Override Default Settings already exist, please edit them!", "warning");
        return;
    }


    $("#type-button").text($(this).text());
    $("#textinput").addClass("hide");
    $("#textinputgroup").addClass("hide");
});


/**
 * Function that checks if an object is empty or not
 * @param e
 * @returns {boolean}
 */
function isEmpty(e){

    if (e==undefined){
        return true;
    }
    for (var key in e){
        return false;
    }
    return true;
}

