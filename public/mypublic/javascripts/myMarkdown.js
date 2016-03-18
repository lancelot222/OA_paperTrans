$(document).ready( function () {
    var $imgs = $('div#markdown img');
    $imgs.attr('class', 'img-responsive pad');
    $imgs.wrap("<a></a>");
    $imgs.parent().attr('class', 'fancybox').attr('rel', 'group');

    $imgs.each(function(index, img){
        $(img).parent().attr('href', $(img).attr('src'));
    });


    // 代码高亮
    var $code = $('div#markdown pre');
    $code.attr('class', 'prettyprint linenums');
    prettyPrint();

    var $table = $('div#markdown table');
    $table.attr('class', 'table table-bordered table-hover table-striped');

    $(".fancybox").fancybox({
        loop: false,
        helpers: {
            overlay: {
                locked: false
            }
        }
    });
});
