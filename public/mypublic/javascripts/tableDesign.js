function closePop(){
    $(".popover").remove();
}

function namePopOk(){
    var newName = $(".popover #namevalue").val();
    $("[aria-describedby=" +$(".popover").attr("id")+"]").html(newName);
    $(".popover").remove();
}

function plentyPopOk() {
    var newName = $(".popover #namevalue").val();
    var newContents = $(".popover #contentvalue").val().split("\n");
    $("[aria-describedby=" +$(".popover").attr("id")+"]").html(newName);
    var siblingDiv = $(".popover").siblings("div");
    var unittype = siblingDiv.attr("id");

    switch (unittype) {
        case "isdropmenu":
            var select = siblingDiv.find('select');
            select.empty();
            for (var idx in newContents){
                select.append("<option>"+newContents[idx]+"</option>");
            }
            break;
        case "ischeckbox":
            siblingDiv.empty();
            for(var idx in newContents){
                siblingDiv.append("<div class='checkbox'>\
                                        <label><input type='checkbox'>"+newContents[idx]+"</label>\
                                   </div>");
            }
            break;
        case "isradio":
            siblingDiv.empty();
            for(var idx in newContents){
                siblingDiv.append("<div class='radio'>\
                                        <label><input type='radio'>"+newContents[idx]+"</label>\
                                   </div>");
            }
            break;
        default:

    }
    $(".popover").remove();
}

function allowDrop(ev){
    ev.preventDefault();
}
function drag(ev, type){
    ev.dataTransfer.setData("Text",type);
}
function drop(ev){
    ev.preventDefault();
    var data = ev.dataTransfer.getData("Text");
    var node = document.getElementById(data).cloneNode(true);
    node.removeAttribute("id");
    node.removeAttribute("draggable");
    node.removeAttribute("ondragstart");
    //node.setAttribute('onclick', 'unitDesign(this)');

    if(ev.target.id == "designinput")
        ev.target.appendChild(node);

    if(data == 'daterange' || data == 'datepicker' ||
       data == 'textinline'|| data == 'textarea'){
        var label = node.getElementsByTagName("label")[0];
        label.setAttribute("data-toggle", "popover");
        $("[data-toggle='popover']").popover({
                html: true,
                title: function(){
                    return $("#labelEditPopover #popover-head").html();
                },
                content: function(){
                    return $("#labelEditPopover #popover-content").html();
                },
        });
    }else{
        var label = node.getElementsByTagName("label")[0];
        label.setAttribute("data-toggle", "popover");
        $("[data-toggle='popover']").popover({
                html: true,
                title: function(){
                    return $("#plentyEditPopover #popover-head").html();
                },
                content: function(){
                    return $("#plentyEditPopover #popover-content").html();
                },
        });
    }
}

$(document).ready(function() {
    $(".daterange").daterangepicker();

    $("[date-mask]").inputmask("dd/mm/yyyy", {"placeholder": "dd/mm/yyyy"});
    $("[data-mask]").inputmask();

    $("#designinput").css('height', window.innerHeight*0.7);
});

function sendTable(){
    $("#designinput input,select,textarea").each(function() {
        $(this).attr("name", Math.uuid(20));
    });
    $("#designinput #isradio").each(function() {
        var tmp = Math.uuid(20);
        console.log(tmp);
        $(this).find('input').attr("name", tmp);
    });

    $("#designinput .col-sm-3").attr("class", "col-sm-2 control-label");
    $("#designinput .col-sm-9").attr("class", "col-sm-7");

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","/tableDesign",true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    var strSend = "tableTitle=" + $("#titleinput").val()
                + "&tableCategary=" + $("#categoryinput").val()
                + "&tableContent=" + $("#designinput").html();
    xmlhttp.send(strSend);
}
