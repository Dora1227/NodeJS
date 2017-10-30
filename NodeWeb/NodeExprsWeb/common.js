window.onscroll = function () {
    var scrolltop = document.documentElement.scrollTop || document.body.scrollTop;
    // console.log("向下滚动Y值："+scrolltop);
    //if (scrolltop > 200) {
    //    $("#goTop").addClass("showTo");
    //} else {
    //    $("#goTop").removeClass("showTo");
    //}
}

//文字，图片等等比缩放
$(function () {
    initpage();
    $(window).resize(function () {
        initpage();
    }) 
    function initpage() {
        var view_width = document.getElementsByTagName('html')[0].getBoundingClientRect().width;
        var _html = document.getElementsByTagName('html')[0];
        view_width > 640 ? _html.style.fontSize = 640 / 16 + 'px' : _html.style.fontSize = view_width / 16 + 'px';
    }
});

//obj当前对象
function showTips(obj) {
    var imgId = (obj.id);
    imgId = imgId.substr(imgId.length - 2, 2);
    var tipsId = new Array(count);
    for (var j = 1; j <= count; j++) {

        if (j >= 10) {
            tipsId[j - 1] = j.toString();
        }
        else {
            tipsId[j - 1] = "0" + j;

        }
    }

    for (var i = 0; i <= tipsId.length ; i++) {
        if (imgId == tipsId[i]) {
            $("#contTips_" + tipsId[i]).show();
            //$("#Arrow" + tipsId[j - 1]).removeClass("arrow-bt").addClass("arrow-tt");
        }
        else {
            $("#contTips_" + tipsId[i]).hide();
            //$("#Arrow" + id[i]).removeClass("arrow-tt").addClass("arrow-bt");
        }
    }

}