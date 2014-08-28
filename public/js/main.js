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
                        h += '<img src="/' + item.screenshot + '"' + attr + '>';
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

    $('#list').click('img[data-diff]', function(e){
        if(e.target.tagName.toLowerCase() === 'img'){
            var diff = $(e.target).attr('data-diff');
            if(diff){
                $('#diff').html('<img src="/' + diff + '">');
            } else {
                $('#diff').html('<span>没有对比数据</span>');
            }
        }
    });
})();