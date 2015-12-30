/*!
 * Creates a calendar.
 *
 * Copyright © 2009-2015 Pontus Östlund <https://profiles.google.com/poppanator>
 *
 * Permission to copy, modify, and distribute this source for any legal
 * purpose granted as long as my name is still attached to it. More
 * specifically, the GPL, LGPL and MPL licenses apply to this software.
 */

(function($) {
  'use strict';

  if (!('getWeek' in Date)) {
    Date.prototype.getWeek = function() {
      var a, b, c, d, e, f, g, n, s, w, $y, $m, $d;

      $y = this.getFullYear();
      $m = this.getMonth() + 1;
      $d = this.getDate();

      if ($m <= 2) {
        a = $y - 1;
        b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
        c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
        s = b - c;
        e = 0;
        f = $d - 1 + (31 * ($m - 1));
      }
      else {
        a = $y;
        b = (a / 4 | 0) - (a / 100 | 0) + (a / 400 | 0);
        c = ((a - 1) / 4 | 0) - ((a - 1) / 100 | 0) + ((a - 1) / 400 | 0);
        s = b - c;
        e = s + 1;
        f = $d + ((153 * ($m - 3) + 2) / 5) + 58 + s;
      }

      g = (a + b) % 7;
      d = (f + g - e) % 7;
      n = (f + 3 - d) | 0;

      if (n < 0)
        w = 53 - ((g - s) / 5 | 0);
      else if (n > 364 + s)
        w = 1;
      else
        w = (n / 7 | 0) + 1;

      $y = $m = $d = null;

      return w;
    };
  }

  window.PoppaCalendar = function(element, conf, date) {
    if (!conf) conf = {};

    if (conf.minDate && (typeof conf.minDate === 'string')) {
      conf.minDate = new Date(Date.parse(conf.minDate));
      conf.minTime = conf.minDate.getTime();
    }
    else if (conf.minDate) {
      conf.minTime = conf.minDate.getTime();
    }

    if (conf.maxDate && (typeof conf.maxDate === 'string')) {
      conf.maxDate = new Date(Date.parse(conf.maxDate));
      conf.maxTime = conf.maxDate.getTime();
    }
    else if (conf.maxDate) {
      conf.maxTime = conf.maxDate.getTime();
    }

    var my = this,
    calid = window.PoppaCalendar.count++,
    hashkey = 'date' + calid,
    range = {
      from: new Date(),
      to: new Date()
    },
    table =
      $('<table cellspaing="0" cellpadding="0" class="poppa-calendar">' +
        '  <thead>' +
        '    <tr class="nav"><td class="pdp-nav-container" colspan="7">' +
        '      <table><thead><tr>' +
        '      <td class="pdp-prev">' +
        '        <a href="#" class="prev-year">◀</a> ' +
        '        <a href="#" class="prev-month">◁</a> ' +
        '      </td>' +
        '      <td class="pdp-nav"></td>' +
        '      <td class="pdp-next">' +
        '        <a href="#" class="next-month">▷</a> ' +
        '        <a href="#" class="next-year">▶</a> ' +
        '      </td>' +
        '      </tr></thead></table>' +
        '    </td></tr>' +
        '    <tr class="pdp-wdays">' +
        '      <th></th>' +
        '      <th></th>' +
        '      <th></th>' +
        '      <th></th>' +
        '      <th></th>' +
        '      <th></th>' +
        '      <th></th>' +
        '    </tr>' +
        '  </thead>' +
        '  <tbody>' +
        '  </tbody>' +
        '</table>').hide(),
    thead = null,
    tbody = null,
    yearsel = null,
    monthsel = null,
    currentDate = null,
    hasTable = false,
    showWeeks = conf.showWeeks,
    hasMinMaxTime = !!(conf.maxTime || conf.minTime),
    minTime = conf.minTime,
    maxTime = conf.maxTime,

    getCurrentYear = function() {
      if (currentDate) {
        return currentDate.getFullYear();
      }

      return 0;
    },

    getCurrentMonth = function() {
      if (currentDate) {
        return currentDate.getMonth();
      }

      return -1;
    },

    getCurrentDate = function() {
      if (currentDate) {
        return currentDate.getDate();
      }

      return 0;
    },

    swapDate = function() {
      var yr = thead.find('select.pdp-year').val(),
          md = thead.find('select.pdp-month').val(),
          dd = getCurrentDate();

      md = parseInt(md, 10) + 1;

      var d = yr + '-' + (md < 10 ? '0' + md : md) + '-' +
                         (dd < 10 ? '0' + dd : dd);
      render(d);
    },

    moveYear = function(howMany) {
      var tdate = new Date(currentDate);
      tdate.setYear(tdate.getFullYear() + howMany);
      render(PoppaCalendar.getISO8601Date(tdate));
    },

    moveMonth = function(howMany) {
      var tdate = new Date(currentDate);
      tdate.setMonth(tdate.getMonth() + howMany);
      render(PoppaCalendar.getISO8601Date(tdate));
    },

    selectDate = function(date) {
      if (conf.clickCallback) {
        conf.clickCallback(my, date);
      }
    },

    normalizeDate = function(date) {
      var x = date.match(/(\d\d\d\d\-\d\d\-\d\d)\s+(.+)/), 
          y = null,
          i = 0,
          len = 0;

      if (x) {
        y = x[2].split(':');

        if (y.length < 3) {
          len = y.length;
          for (i = len; i > 1; i--) {
            y.push('00');
          }
        }

        date = x[1] + 'T' + y.join(':');
      }

      return date;
    },

    isClickable = function(tdStamp) {
      return (!hasMinMaxTime ||
              (minTime <= tdStamp && !maxTime) ||
              (maxTime >= tdStamp && !minTime) ||
              (minTime <= tdStamp && maxTime >= tdStamp));
    },

    render = function(date) {
      if (date) {
        window.PoppaCalendar.hashURL.set(hashkey, date).render();
      }
      else {
        window.PoppaCalendar.hashURL.unset(hashkey).render();
      }

      var nowDate = new Date(),
          i = 0;

      if (!hasTable) {
        $(element).empty().append(table);
        hasTable = true;
      }

      if (date) {
        if (typeof date == 'string') {
          date = normalizeDate(date);
          try { date = currentDate = new Date(Date.parse(date)); }
          catch (e) { throw e; }
        }
      }
      else {
        date = currentDate = new Date();
      }

      range.from.setYear(date.getFullYear() - 6);
      range.to.setYear(date.getFullYear() + 5);

      if (thead === null) {
        thead = table.find('thead');
        var ths = thead.find('th');

        for (i = 0; i < PoppaCalendar.config.shortDays.length; i++) {
          $(ths[i]).text(PoppaCalendar.config.shortDays[i]);
        }

        var nav = thead.find('.pdp-nav');

        yearsel = $('<select class="pdp-year"></select>');
        monthsel = $('<select class="pdp-month"></select>');

        nav.append(monthsel);
        nav.append(' ');
        nav.append(yearsel);

        yearsel.change(function() { swapDate(); });
        monthsel.change(function() { swapDate(); });

        thead.find('a.prev-year').attr('title', PoppaCalendar.config.prevYear)
             .on('click', function()
        {
          moveYear(-1);
          return false;
        });

        thead.find('a.prev-month').attr('title', PoppaCalendar.config.prevMonth)
             .on('click', function()
        {
          moveMonth(-1);
          return false;
        });

        thead.find('a.next-year').attr('title', PoppaCalendar.config.nextYear)
             .on('click', function()
        {
          moveYear(1);
          return false;
        });

        thead.find('a.next-month').attr('title', PoppaCalendar.config.nextMonth)
             .on('click', function()
        {
          moveMonth(1);
          return false;
        });

        if (showWeeks) {
          thead.find('.pdp-wdays').prepend('<th class="week"></th>');
          thead.find('.pdp-nav-container').attr('colspan', '8');
        }
      }

      yearsel.empty();
      monthsel.empty();

      var yf = range.from.getFullYear(),
          yt = range.to.getFullYear(),
          opt = null,
          prevDate = null,
          tmptd = null;

      for (var x = 0; x < PoppaCalendar.config.months.length; x++) {
        opt = $('<option value="' + x + '">' +
                PoppaCalendar.config.months[x] + '</option>');

        if (x == getCurrentMonth())
          opt.attr('selected','selected');

        monthsel.append(opt);
      }

      for (x = yt; x > yf; x--) {
        opt = $('<option>' + x + '</option>');

        if (x == getCurrentYear())
          opt.attr('selected', 'selected');

        yearsel.append(opt);
      }

      if (tbody === null)
        tbody = table.find('tbody');

      tbody.empty();

      var firstDay = new Date(date);
      firstDay.setDate(1);

      var lastDay = new Date(firstDay);
      lastDay.setMonth(date.getMonth()+1);
      lastDay.setDate(0);

      var fdow = firstDay.getDay();
      if (fdow === 0) fdow = 7;

      var tr = $('<tr></tr>'),
          rowcount = 1,
          clickfun = function() {
            selectDate($.data(this, 'date'));
          };

      if (fdow > 1) {
        prevDate = new Date(firstDay);

        for (; rowcount < fdow; rowcount++) {
          prevDate = new Date(prevDate);
          prevDate.setDate(prevDate.getDate()-1);
          tmptd = $('<td></td>').addClass('othermonth').html(
            '<div class="daynum">' + prevDate.getDate() + '</div>');

          if (!conf.otherMonthsNotClickable && isClickable(prevDate.getTime())) {
            tmptd.addClass('clickable').on(conf.clickAction||'click', clickfun);
          }

          $.data(tmptd[0], 'date', prevDate);
          tr.prepend(tmptd);
        }

        if (showWeeks)
          tr.prepend('<td class="week">' + firstDay.getWeek() + '</td>');
      }

      var curdate = PoppaCalendar.getISO8601Date(nowDate);
      rowcount--;

      for (i = 1; i <= lastDay.getDate(); i++) {
        if (rowcount++ === 7) {
          tbody.append(tr);
          tr = $('<tr></tr>');
          rowcount = 1;
        }

        var td = $('<td></td>').html('<div class="daynum">' + i + '</div>'),
            tdDate = new Date(date);
        tdDate.setDate(i);

        if (showWeeks && rowcount === 1)
          tr.append('<td class="week">' + tdDate.getWeek() + '</td>');

        var tdStamp = tdDate.getTime();
        $.data(td[0], 'date', tdDate);

        if (PoppaCalendar.getISO8601Date(tdDate) === curdate) {
          td.addClass('current-day');
        }
        else if (PoppaCalendar.getISO8601Date(tdDate) < curdate) {
          td.addClass('historical');
        }

        if (isClickable(tdStamp)) {
          td.addClass('clickable').on(conf.clickAction||'click', clickfun);
        }
        else {
          td.addClass('oob');
        }

        tr.append(td);
      }

      if (rowcount < 7) {
        var nextDate = new Date(lastDay);

        for (; rowcount < 7; rowcount++) {
          nextDate = new Date(nextDate);
          nextDate.setDate(nextDate.getDate() + 1);
          tmptd = $('<td></td>').addClass('othermonth').html(
            '<div class="daynum">' + nextDate.getDate() + '</div>');

          if (!conf.otherMonthsNotClickable && isClickable(nextDate.getTime())) {
            tmptd.addClass('clickable').on(conf.clickAction||'click', clickfun);
          }

          $.data(tmptd[0], 'date', nextDate);
          tr.append(tmptd);
        }
      }

      tbody.append(tr);

      if (conf.renderCallback) {
        conf.renderCallback(my, date);
      }
    }; // Render

    this.getTd = function(date) {
      if (typeof date === 'object')
        date = PoppaCalendar.getISO8601Date(date);

      var tds = tbody.find('td'),
      len = tds.length;
      for (var i = 0; i < len; i++) {
        var td = tds[i],
        tdate = $.data(td, 'date');

        if (tdate && PoppaCalendar.getISO8601Date(tdate) == date)
          return $(td);
      }

      return null;
    };

    this.getCurrentDate = function() {
      return currentDate;
    };

    this.getContainer = function() {
      return element;
    };

    var hash = window.PoppaCalendar.hashURL.get();

    render(hash[hashkey] || date);

    if (conf.className)
      table.addClass(conf.className);

    table.show();
  };

  window.PoppaCalendar.getISO8601Date = function(date) {
    var y = date.getFullYear(),
        m = date.getMonth() + 1,
        d = date.getDate();

    return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
  };

  window.PoppaCalendar.objectToHash = function(o) {
    var a = [];
    for (var name in o)
      a.push(name + '=' + o[name]);

    return a.length && '#' + a.join('&') || undefined;
  };

  window.PoppaCalendar.parseHash = function() {
    var h, m, o = {};
    h = document.location.hash;

    if (h && h.match(/#((.*?)+=(.*?))/)) {
      h = h.substring(1);
      m = h.split('&');
      for (var i = 0; i < m.length; i++) {
        var pair = m[i].split('=');
        if (pair.length > 1)
          o[pair[0]] = pair[1];
        else
          o[pair[0]] = '';
      }
    }

    return o;
  };

  window.PoppaCalendar.getShortMonthName = function(month) {
    return PoppaCalendar.config.shortMonths[month];
  };

  window.PoppaCalendar.getMonthName = function(month) {
    return PoppaCalendar.config.months[month];
  };

  window.PoppaCalendar.hashURL = (function() {
    var o = {}, tmp1, tmp2, i,
    update = function(intit) {
      var h = document.location.hash;
      o = {};
      if (h) {
        h = h.substring(1);
        tmp1 = h.split('&');
        for (i = 0; i < tmp1.length; i++) {
          tmp2 = tmp1[i].split('=');
          o[tmp2[0]] = null;

          if (tmp2.length > 1)
            o[tmp2[0]] = decodeURIComponent(tmp2[1]);
        }
      }
    };

    update();

    return {
      update: update,

      set: function(key, val) {
        if ($.isPlainObject(key)) {
          for (var name in key) {
            this.set(name, key[name]);
          }
        }
        else {
          if (key && key.length && key[0] === '#')
            key = key.substring(1);
          o[key] = val;
        }
        return this;
      },

      append: function(key, val) {
        if (o[key]) {
          if (!o[key].isArray())
            o[key] = [o[key]];
          o[key].push(val);
        }
        else o[key] = val;

        return this;
      },

      isset: function(key) {
        return o[key] !== undefined;
      },

      get: function(key) {
        if (key) return o[key];// && decodeURIComponent(o[key]);
        return o;
      },

      unset: function(key) {
        if (!key) o = {};
        else delete o[key];
        return this;
      },

      render: function() {
        var t = [], name;

        if (Object.keys(o).length === 0) {
          document.location.hash = '_';
          return;
        }

        for (name in o) {
          if (o[name])
            t.push(name + '=' + encodeURIComponent(o[name]));
          else
            t.push(name);
        }

        if (t.length)
          document.location.hash = t.join('&');
        else
          document.location.hash = '_';
      }
    };
  }());

  window.PoppaCalendar.count = 0;

  window.PoppaCalendar.config = {
    prevMonth:   'föregående månad',
    prevYear:    'föregående år',
    nextMonth:   'nästa månad',
    nextYear:    'nästa år',
    weekDays:    [ 'måndag','tisdag','onsdag','torsdag','fredag','lördag',
                   'söndag'],
    shortDays:   [ 'må','ti','on','to','fr','lö','sö' ],
    shortMonths: [ 'jan','feb','mar','apr','maj','jun','jul','aug','sep',
                   'okt','nov','dec' ],
    months:      [ 'januari','februari','mars','april','maj','juni','juli',
                   'augusti','september','oktober','november','december' ]
  };

  $.fn.calendar = function(conf) {
    return this.each(function() {
      var d = $(this).attr('data-calendar-date');
      new PoppaCalendar(this, conf, d);
    });
  };
})(jQuery);
