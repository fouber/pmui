(function () {

  function getTimeString(num) {
    var d = new Date();
    d.setTime(num);
    var day = [
      String(d.getFullYear()).substr(-2),
      pad(d.getMonth() + 1),
      pad(d.getDate())
    ].join('/');
    var time = [
      pad(d.getHours()),
      pad(d.getMinutes()),
      pad(d.getSeconds())
    ].join(':');
    return [ day, time ];
  }

  function pad(str) {
    return ('0' + str).substr(-2);
  }

  function getDiff(item, last, ext) {
    return [
      item.root, 'diff',
      last + '-' + item.time + '.' + ext
    ].join('/');
  }

  var router = {
    show: function (path) {
      $.get('/info', {path: path}, function (data) {
        if (data.status === 0) {
          var html = '';
          var last;
          data.object.list.forEach(function (item, index) {
            var currTimeString = getTimeString(item.time);
            var lastTimeString = index ? getTimeString(last) : currTimeString;
            var attr = ' data-diff="' + (last ? getDiff(item, last, data.object.ext) : item.screenshot) + '"';
            var h = '';
            if(index === 0 || currTimeString[0] !== lastTimeString[0]){
              h += '<td>';
              h += '<div class="date">' + currTimeString[0] + '</div>';
              h += '</td>';
            }
            h += '<td>';
            h += '<div class="screenshot"' + attr + ' data-pic="' + item.screenshot + '">';
            h += '<div class="title" title="日期 ' + currTimeString[0] + '">' + currTimeString[1] + '</div>';
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

  function onhashchange() {
    var hash = location.hash;
    if (/^#!\//.test(hash)) {
      hash = hash.substring(3);
      var pos = hash.indexOf('/');
      var method = 'index';
      var param = '';
      if (pos > 0) {
        method = hash.substring(0, pos);
        param = hash.substring(pos + 1);
      }
      if (router.hasOwnProperty(method)) {
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
  //list.mousemove('.pic', function(e){
  //    if(e.target.className === 'pic'){
  //        var $this = $(e.target);
  //        var h = $this.height();
  //        var rY = e.offsetY / h;
  //        var img = $this.find('img');
  //        var H = img.height() - h;
  //        var y = -rY * H;
  //        img.css('transform', 'translate3d(0, ' + y + 'px, 0)');
  //    }
  //});
  //list.mouseout('.pic', function(e){
  //    if(e.target.className === 'pic'){
  //        var $this = $(e.target);
  //        var img = $this.find('img');
  //        img.css('transform', 'translate3d(0, 0, 0)');
  //    }
  //});
  list.contextmenu(function (e) {
    e.stopPropagation();
    e.preventDefault();
  });
  list.on('mousedown', '.screenshot', function (e) {
    list.find('.screenshot').removeClass('actived');
    var $this = $(this);
    $this.addClass('actived');
    var pic = $this.attr('data-pic');
    if (e.button == '2') {
      $('#diff').html('<img src="/' + pic + '">');
    } else {
      var diff = $this.attr('data-diff');
      if (diff) {
        $('#diff').html('<img src="/' + diff + '">');
      } else {
        $('#diff').html('<span>没有对比数据</span>');
      }
    }
    e.preventDefault();
    e.stopPropagation();
  });
})();