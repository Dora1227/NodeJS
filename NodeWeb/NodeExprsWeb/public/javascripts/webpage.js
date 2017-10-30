//文字，图片等等比缩放
//$(function () {
//    initpage();
//    $(window).resize(function () {
//        initpage();
//    })

//    function initpage() {
//        var view_width = document.getElementsByTagName('html')[0].getBoundingClientRect().width;
//        var _html = document.getElementsByTagName('html')[0];
//        view_width > 640 ? _html.style.fontSize = 640 / 16 + 'px' : _html.style.fontSize = view_width / 16 + 'px';
//    }
//});
//主体页面事件
$(function () {
    //显示修改密码事件
    var tips = $("#resetPwd span.littleTips").text();
    if (tips != "") {
        $("#resetPwd").show();
    } else {
        $("#resetPwd").hide();
    }
     
    //判断是否显示“加载更多”
    var counts = $("#counts").val();
    var currentIndex = $("#currentIndex").val();
    var key = $("#keywords").val();
    if (currentIndex == counts) {
        $(".loadMore").text("数据已全部加载~");
        //alert("数据已全部加载~！");
        location.href = "#loadMore";
        //alert("12345");
        setTimeout(hiddenMore, 2000);
    }

    if (key == null || key == "") {
        setTimeout(hiddenMore,1000);
    }

});

function showResetPwd() {
    var status = $("#resetPwd").css("display"); 
    if (status == "none") {
        $("#resetPwd").show();
    } else {
        $("#resetPwd").hide();
    } 
}

function getUrlParam(url, name) {
    var pattern = new RegExp("[?&]" + name + "\=([^&]+)", "g");
    var matcher = pattern.exec(url);
    var items = null;
    if (matcher != null) {
        try {
            items = decodeURIComponent(decodeURIComponent(matcher[1]));
        } catch (e) {
            try {
                items = decodeURIComponent(matcher[1]);
            } catch (e) {
                items = matcher[1];
            }
        }
    }
    return items;
}

function goSearch() {
   var words = $("#keywords").val();
   // alert(words);
    window.location.href = "/searchPage?keywords=" + words;
    
}
 
function showSearch() {
    var status = $("#searchDiv").css("display");
    if (status == "none") {
        $("#searchDiv").show();
    } else {
        $("#searchDiv").hide();
    }
}
  
//滚动屏幕时，固定顶部及搜索框
window.onscroll = function (){
    var scrollY = document.body.scrollTop;
    if (scrollY > 55){
        $("#searchForm").addClass("searchForm");
        $("section.searchDiv").addClass("searchForm");
    }else { 
        $("#searchForm").removeClass("searchForm");
        $("section.searchDiv").removeClass("searchForm");
    } 
    console.log("移动端滚动Y轴："+scrollY);
}

$("#loadMore").click(function () {
    var words = $("#keywords").val();
    var currentIndex = $("#currentIndex").val(); 
    var pageIndex = currentIndex;
    var pageSize = 3;
    var counts = $("#counts").val();
    var yu = counts % pageSize;
    var pageNum = parseInt(counts / pageSize);

    //当数据取到最后一页，且数据不够pageSize时，则显示当前索引为总数
    if ((currentIndex == (pageNum * pageSize) && yu < pageSize)) {
        currentIndex = counts; 
        setTimeout(hiddenMore, 2000);
    } else {
        currentIndex = currentIndex * 1 + 3;
    } 

    $("#currentIndex").val(currentIndex);

    $.ajax({
        contentType: "application/json",
        type: "get",
        url: "./searchPage",
        data: "keywords=" + words + "&pageSize=" + pageSize + "&recordIndex=" + pageIndex ,
        async: false,
        dataType: 'html',//返回的不是json格式，可以去掉或改为其他
        error: function (rs) {
            alert("加载失败！"); 
        }, 
        success: function (request){
            if (request == "1001") {
                $(".loadMore").text("数据已全部加载~");
                alert("数据已全部加载~！");
                setTimeout(hiddenMore, 2000); 
            }
            else {
                //$("#resultList").append(request);//在被选元素结尾插入数据(被选元素的标签内),after()和before()是在被选元素后面/前面插入数据(被选元素标签外)
                $("#resultList").prepend(request);//prepend() 方法在被选元素的开头插入内容。
                $("#loadMore").show(); 
            } 
        }
    });
});

function hiddenMore() {
    $("#loadMore").hide();
}
