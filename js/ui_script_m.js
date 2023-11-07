$(function () {
    UIinit();
    // bodyArea();
})
function UIinit() {
    // 상세 헤더 스크롤시 라인추가
    $(window).scroll(function(){
        if ($(this).scrollTop()>0) {
            $('.detail__topline').addClass('line')
        }else {
            $('.detail__topline').removeClass('line')
        }
    })
    // 레이어 모양의 상세 헤더
    $('.layerTopic').scroll(function(){
        if ($(this).scrollTop()>0) {
            $('.layerTopic .detail__topline').addClass('line')
        }else {
            $('.layerTopic .detail__topline').removeClass('line')
        }
    });

	// search input요소 이외 다른영역 터치시 키보드 내림
    var $searchInput = $('.searchHeader__input');
    $searchInput.on('focusin',function(evt){
		var $this = $(evt.target);
		$('html').on('touchstart',function(e){	
			if($(e.target)[0].tagName != $this[0].tagName){$this.blur();}
		});
	}).focusout(function(){
		$('html').unbind('touchstart');
	});

    
    // goToTop 있을경우 실행
    if ($('.goToTop').length>0) {
        var $win = $(window);
        $win.scroll(function(){
            if($(this).scrollTop()>($win.height()/3)) {
                $('.goToTop.hide').removeClass('hide');
            }else {
                $('.goToTop').addClass('hide');
            }
        })
    }
} // UIinit

/** [category]
 * qna, posting, poll, career 등
 */
// [selectbox형 필터] on off
function filterSelectOnOff($this) {
    $('.filterList__select.on').not($this).removeClass('on');
    $this.toggleClass('on');
    disableScroll();
}

// 210812 / 수정 / 갤탭이슈 분기처리
// [버튼형 필터] on off
function filterBtnOnOff($this){
    let userAgent=navigator.userAgent.toLowerCase();

    $this.siblings('.filterBtn.on').removeClass('on');
    $this.addClass('on');

    if(userAgent.indexOf('sm-t295n')>-1) {
        $('.filterBtn--bg').css({
            left: $this.position().left,
            width: $this.width() // 여기만 변경
            // 특정 디바이스로 체크하여 분기처리
            // 갤럭시 탭 A (8인치, 2019) 분기처리함
            // outerWidth()를 다른 디바이스와 달리 잡았으나 width()로 잡으면 정상작동
            // 해당 디바이스 외 추가 디바이스에서도 동일 현상 발생시 그때 작업 처리
        });
    } else {
        // 기본 스크립트
        $('.filterBtn--bg').css({
            left: $this.position().left,
            width: $this.outerWidth()
        });
    }
}
// /210812 / 수정 / 갤탭이슈 분기처리

// 상단버튼 텍스트를 selectbox에서 선택한 텍스트로 변경, 레이어 닫음
function filterSelectMotion($this) {
    var parentEl = $this.closest('.filterList');
    parentEl.prev('.filterList__select').text($this.find('.filterList__text').text()).removeClass('on');
    parentEl.find('.filterList__item.on').removeClass('on');
    $this.addClass('on');
    disableScroll()
}
// 레이어 show일 경우 바닥화면 스크롤 막음
function disableScroll(){
    $('html').toggleClass('disableScroll',$('.filterList__select').hasClass('on'));
}



/**
 * 컨텐츠 높이 고정
 */
function bodyArea() {
    var winH = $(window).height();
    var fixheaderH = $('.fix_header').length > 0 ? $('.fix_header').outerHeight() : 0;
    var fixfooterH = $('.fix_footer').length > 0 ? $('.fix_footer').outerHeight() : 0;
    var fixElH = fixheaderH + fixfooterH;
    $('.contentBody').css({
        // 'height': winH - fixElH,
        'padding-top': fixheaderH,
        'padding-bottom': fixfooterH
    });
}


/**
 * 글쓰기 퀵메뉴 
 */

var quick_value = false;

function quick_menu_checker() {
    var quick_mc = $('.quickMenu');
    if (quick_value == false) {
        quick_mc.find('.quick1').css({
            'transform': 'translate(0px,-7.8125rem)',
            'opacity': '1'
        });
        quick_mc.find('.quick2').css({
            'transform': 'translate(0px,-3.9375rem)',
            'opacity': '1'
        });
        $('.quickMenu').addClass('on').css('overflow', 'visible')


        $('.quickMenu__mag').addClass('quickMenu__mag--active');

        $('.quickMenu__mask').html('<i class="xi-close-thin"></i>')
        quick_value = true;
    } else {
        quick_mc.find('.quick1').css({
            'transform': 'none',
            'opacity': '0'
        });
        quick_mc.find('.quick2').css({
            'transform': 'none',
            'opacity': '0'
        });


        $('.quickMenu__mag').removeClass('quickMenu__mag--active');
        $('.quickMenu__mask').html('<span class="icon_quick"></span>')
        setTimeout(function () {
            $('.quickMenu').removeClass('on').css('overflow', 'hidden')
        }, 300)
        quick_value = false;
    };
};

/* 닫기액션 */
function closeEl(target,duration) {
    var $target = $(target);
    var duration = duration != undefined ? duration : 0;
    if ($target.hasClass('on')) $target.removeClass('on').delay(duration).hide(0);
    else $target.hide();
}

/* message, 댓글 */
//파일 첨부완료후 pageContentResize() 호출. 입력영역이 본문영역 덮는현상 방지
function textareaSize(obj){
    if (obj) {
        obj.style.height = "0px";
        obj.style.height = (0 + obj.scrollHeight) + "px";
    }
    pageContentResize();
    
    if( obj.value.length > 0 ){
        if( !$("#btn_msg").hasClass("on") ) {
            $("#btn_msg").addClass("on");
        }
	} else {
		if( obj.value.length == 0 || fileInputArr[0].newFileArr.length <= 0 ){
			$("#btn_msg").removeClass("on");
		} 
	}
 //$(window).scrollTop($('body').height());
}
function pageContentResize(){
    $('.pageWrapDetail').css({'padding-bottom':$('.commentWrite').outerHeight()});
}  


// poll '결과페이지 참여자 현황' 도넛차트
function toPieChartItemPath(startAngle, endAngle) {
    // x,y = 원 넓이/2, 높이 /2
    // radiusOut - radiusIn = 두께
    var x = 47, y = 47, radiusIn = 32, radiusOut = 47;
    function _toXY(cX, cY, r, degrees) {
        var rad = (degrees) * Math.PI / 180.0;

        return {
            x: cX + (r * Math.cos(rad)),
            y: cY + (r * Math.sin(rad))
        };
    }
    var startIn = _toXY(x, y, radiusIn, endAngle);
    var endIn = _toXY(x, y, radiusIn, startAngle);
    var startOut = _toXY(x, y, radiusOut, endAngle);
    var endOut = _toXY(x, y, radiusOut, startAngle);
    var arcSweep = (endAngle - startAngle) <= 180 ? "0" : "1";
    var d = [
        "M", startIn.x, startIn.y,
        "L", startOut.x, startOut.y,
        "A", radiusOut, radiusOut, 0, arcSweep, 0, endOut.x, endOut.y,
        "L", endIn.x, endIn.y,
        "A", radiusIn, radiusIn, 0, arcSweep, 1, startIn.x, startIn.y,
        "z"
    ].join(" ");
    return d;
}
function chartDraw(chartData) {
    var eachItemNo = new Array();
        eachItemNo[0] = chartData.subject;			
        eachItemNo[1] = new Array();
        eachItemNo[2] = new Array();
    for(var i=0; i<chartData.item.length; i++) {
        eachItemNo[1][i] = chartData.item[i].title;
        eachItemNo[2][i] = chartData.item[i].value;
    }
    draw(eachItemNo, chartData.chartBox);

    function draw(eachItemNo, graphBox){
        var $graphBox = $('.'+graphBox);
        var textTitle = eachItemNo[0];
        var drawPos, befDrawPos=0, graphEndPos=0;
        var text = '';
        var textPercent, beftextPercent = 0;
        var allNo = 0;
        for(var i=0; i<eachItemNo[2].length; i++) allNo = allNo + eachItemNo[2][i];

        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var path1;
        svg.setAttribute("aria-hidden","true");
        svg.setAttribute('viewbox', '0 0 94 94');
        svg.setAttribute('width', '94px');
        svg.setAttribute('height', '94px');

        eachItemNo[2].forEach(function(el,idx) {
            drawPos = Math.round(el * 360 / allNo);
            textPercent = Math.round(el * 100 / allNo);
            // 마지막 항목의 퍼센트: 100 - 이전 퍼센테이지, 
            beftextPercent = parseInt(beftextPercent += textPercent)
            textPercent = idx < eachItemNo[2].length-1 ? Math.round(el * 100 / allNo) : 100 - (beftextPercent - textPercent);
            // 마지막 항목의 그래프 : 270
            graphEndPos = idx < eachItemNo[2].length-1 ? drawPos+befDrawPos-90 : 270;
            
            text += '<li class="donutChart__percent'+(idx+1)+'"><span class="donutChart__lt">'+eachItemNo[1][idx] +'</span><span class="donutChart__rt">'+ textPercent+'%</span>'+'</li>';

            path1 = document.createElementNS("http://www.w3.org/2000/svg", 'path');
            path1.setAttribute('class', 'donutChart__arc'+(idx+1) );
            path1.setAttribute('d', toPieChartItemPath((0+befDrawPos-90), graphEndPos));
            path1.setAttribute('fill', 'none');

            svg.appendChild(path1);
            befDrawPos = drawPos+befDrawPos;
        });
        document.getElementById(graphBox).appendChild(svg);
        $graphBox.find('.donutChart__desc').html(text)
        $graphBox.find('.donutChart__title').html(textTitle)
    }
}

// poll 순서형
function pollOrderType (container,options){
    var settings = $.extend({
        maxlength : 3,
        container : $(container)
    }, options),
    pollTyOrderNo = 1;

    settings.container.find('.pollTyOrder__reset').click(function(){
        settings.container.find('.pollTyOrder__input').val('');
        pollTyOrderNo = 1;
    })
    settings.container.find('.pollTyOrder__label').click(function(){
        var $ipt = $(this).find('.pollTyOrder__input');

        if ($ipt.val().length != 0) {
            var alignNo = $ipt.val();
            $ipt.val('');
            
            pollTyOrderNo--;
            $('.pollTyOrder__label').each(function(i){
                var svysVal = $(this).find('.pollTyOrder__input').val();
                if (svysVal > alignNo ) {
                    $(this).find('.pollTyOrder__input').val(svysVal-1);
                }
            })
        }else {
            if(pollTyOrderNo > settings.maxlength) {
                alert(settings.maxlength + '개 까지 선택 가능합니다.');
                return false;
            }
            $ipt.val(pollTyOrderNo);
            pollTyOrderNo++;
        }
        return false;
    });
}

// 2.0 글쓰기버튼 탑버튼 위치 중첩 이슈
$(window).on('scroll', function(){
    if ($('.topMove').length>0) {
        var $win = $(window);
        if($(this).scrollTop() < (($win.height()/3)) ) {
            $('.topMove.active').removeClass('active');
        }else {
            $('.topMove').addClass('active');
        }
    }
});

// 의대생 Q&A goToTop버튼 위치 수정
$(document).ready(function(){
    if($(".fixBtm").find(".btnWrite").length > 0) {
        $(".fixBtm").css("bottom","0");
    }
});