(function(){

    function getTimeString(num){
        var d = new Date();
        d.setTime(num);
        var day = [
            String(d.getFullYear()).substring(2),
            pad(d.getMonth() + 1),
            pad(d.getDate())
        ].join('/');
        var time = [
            pad(d.getHours()),
            pad(d.getMinutes()),
            pad(d.getSeconds())
        ].join(':');
        return day + ' ' + time;
    }

    function pad(str){
        return ('0' + str).substr(-2);
    }

    function getDiff(item, last){
        return [
            item.root, 'diff',
            last + '-' + item.time + '.png'
        ].join('/');
    }

    var router = {
        show: function(path){
            $.get('/info', {path: path}, function(data){
                if(data.status === 0){
                    var html = '';
                    var last;
                    data.object.list.forEach(function(item){
                        var attr = ' data-diff="' + (last ? getDiff(item, last) : item.screenshot) + '"';
                        var h = '<td>';
                        h += '<div class="screenshot">';
                        h += '<div class="title">' + getTimeString(item.time) + '</div>';
                        h += '<div class="pic"' + attr + ' data-pic="' + item.screenshot + '">';
                        h += '<img src="/' + item.screenshot + '">';
                        h += '</div>';
                        h += '</div>';
                        h += '</td>';
                        last = item.time;
                        html += h;
                    });
                    html = '<table><tr>' + html + '</tr></table>';
                    var list = $('#list');
                    list.html(html);
                    list.parent().scrollLeft(list.get(0).scrollWidth);
                    $('#diff').html('');
                } else {
                    console.error(data.message);
                }
            }, 'json');
        }
    };

    function onhashchange(){
        var hash = location.hash;
        if(/^#!\//.test(hash)){
            hash = hash.substring(3);
            var pos = hash.indexOf('/');
            var method = 'index';
            var param = '';
            if(pos > 0){
                method = hash.substring(0, pos);
                param = hash.substring(pos + 1);
            }
            if(router.hasOwnProperty(method)){
                router[method](param);
            }
        }
    }
    if ('addEventListener' in window) {
        window.addEventListener('hashchange', onhashchange, false);
    } else {
        window.onhashchange = onhashchange;
    }
    onhashchange();

    var list = $('#list');
    list.click('[data-diff]', function(e){
        if(e.target.className === 'pic'){
            var diff = $(e.target).attr('data-diff');
            if(diff){
                $('#diff').html('<img src="/' + diff + '">');
            } else {
                $('#diff').html('<span>没有对比数据</span>');
            }
        }
    });
    list.mousemove('.pic', function(e){
        if(e.target.className === 'pic'){
            var $this = $(e.target);
            var h = $this.height();
            var rY = e.offsetY / h;
            var img = $this.find('img');
            var H = img.height() - h;
            var y = -rY * H;
            img.css('transform', 'translate3d(0, ' + y + 'px, 0)');
        }
    });
    list.mouseout('.pic', function(e){
        if(e.target.className === 'pic'){
            var $this = $(e.target);
            var img = $this.find('img');
            img.css('transform', 'translate3d(0, 0, 0)');
        }
    });
    list.contextmenu(function(e){
        e.stopPropagation();
        e.preventDefault();
    });
    list.mousedown('.pic', function(e){
        if(e.target.className === 'pic'){
            var $this = $(e.target);
            var pic = $this.attr('data-pic');
            if(e.button == '2'){
                $('#diff').html('<img src="/' + pic + '">');
            } else {
                var diff = $this.attr('data-diff');
                if(diff){
                    $('#diff').html('<img src="/' + diff + '">');
                } else {
                    $('#diff').html('<span>没有对比数据</span>');
                }
            }
            e.preventDefault();
            e.stopPropagation();
        }
    });
})();