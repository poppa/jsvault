/*!
  Author: Pontus Östlund <https://profiles.google.com/poppanator>

  Permission to copy, modify, and distribute this source for any legal
  purpose granted as long as my name is still attached to it. More
  specifically, the GPL, LGPL and MPL licenses apply to this software.
*/

/*
  Simple date formatter

  Formats:
    %Y: Prints the full year
    %m: Prints the month as zero padded number, ie: 01, 02 .. 10, 11
    %d: Prints the date as zero padded number, ie: 01, 02 .. 29, 30
    %H: Prints the hour as zero paddeed number, ie: 00, 01 .. 22, 23
    %M: Prints the minute as zero padded number, ie: 00 .. 59
    %S: Prints the second as zero padded number, ie: 00 .. 59
    %T: Prints the time, same as %H:%M:%S
    %R: Prints the hour and minute, same as %H:%M
    %a: Prints the abbreviated weekday (mon, tue, wed, ...)
    %A: Prints the full weekday (monday, tuesday, ...)
    %b: Prints the abbreviated month name
    %B: Prints the full month name

  Example:
    var date = new Date(Date.parse("2013-04-19T20:13:57"));
    date.format('%Y-%m-%d');    //> 2013-04-19
    date.format('%Y-%m-%d %R'); //> 2013-04-19 20:13
    date.format('%Y-%m-%d %T'); //> 2013-04-19 20:13:57

  To add locales, add your language key to:

    Date.monthNames.langKey      = [ 'Januaray', ... , 'December'];
    Date.monthNamesShort.langKey = [ 'Jan',      ... , 'Dec'];
    Date.dayNames.langKey        = [ 'Monday',   ... , 'Sunday'];
    Date.dayNamesShort.langKey   = [ 'Mon',      ... , 'Sun'];

  To set a default locale ('en' is default), set:

    Date.locale = 'langKey';
*/

(function(Date) {
'use strict';

Date.locale = null;

Date.monthNames = {
  'en' :  [ 'Januari',   'Februari', 'Mars',     'April',
            'May',       'June',     'July',     'August',
            'September', 'October',  'November', 'December' ],

  'sv' :  [ 'januari',   'februari', 'mars',     'april',
            'maj',       'juni',     'juli',     'augusti',
            'september', 'oktober',  'november', 'december' ]
};

Date.monthNamesShort = {
  'en' : [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],

  'sv' : [ 'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
           'jul', 'aug', 'sep', 'okt', 'nov', 'dec' ]
};

Date.dayNames = {
  'en' : [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
           'Saturday', 'Sunday'],

  'sv' : [ 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag',
           'lördag', 'söndag']
};

Date.dayNamesShort = {
  'en' : [ 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' ],
  'sv' : [ 'mån', 'tis', 'ons', 'tor', 'fre', 'lör', 'sön' ]
};

/*
  Returns the full month name
  @param int monthNo     The numeric value from date.getMonth()
  @param string locale   Optional, locale to use
*/
Date.getMonthName = function(monthNo, locale) {
  locale = getLocale(locale, 'monthNames');
  return Date.monthNames[locale][monthNo];
};

/*
  Returns the abbreviated month name
  @param int monthNo     The numeric value from date.getMonth()
  @param string locale   Optional, locale to use
*/
Date.getMonthNameShort = function(monthNo, locale) {
  locale = getLocale(locale, 'monthNamesShort');
  return Date.monthNamesShort[locale][monthNo];
};

/*
  Returns the day name
  @param int dayNo       The numeric value from date.getDay(), i.e weekday
  @param string locale   Optional, locale to use
*/
Date.getDayName = function(dayNo, locale) {
  locale = getLocale(locale, 'dayNames');
  return Date.dayNames[locale][dayNo];
};

/*
  Returns the abbreviated day name
  @param int dayNo       The numeric value from date.getDay(), i.e weekday
  @param string locale   Optional, locale to use
*/
Date.getDayNameShort = function(dayNo, locale) {
  locale = getLocale(locale, 'dayNamesShort');
  return Date.dayNamesShort[locale][dayNo];
};

var lang = window.navigator.userLanguage || window.navigator.language;

// Private method
var getLocale = function(locale, which) {
  locale = locale || Date.locale || lang;
  return Date[which][locale] ? locale : 'en';
};

Date.prototype.format = function(format)
{
  format += "\0"; // so that we don't peek beyond the end
  var s = "",
  len = format.length,
  padzero = function (s) {
    if (s > 9 || s.length >= 2) return s;
    return "0" + s;
  },
  getDay = function(wd, short) {
    wd -= 1;
    if (wd < 0) wd = 6;
    if (short) return Date.getDayNameShort(wd);
    return Date.getDayName(wd);
  };

  for (var i = 0; i < len; i++) {
    var c = format[i];

    if (c === '%') {
      var n = format[++i];

      switch (n)
      {
        case 'a': s += getDay(this.getDay(), true); break;
        case 'A': s += getDay(this.getDay(), false); break;
        case 'b': s += Date.getMonthNameShort(this.getMonth()); break;
        case 'B': s += Date.getMonthName(this.getMonth()); break;
        case 'Y': s += this.getFullYear(); break;
        case 'm': s += padzero(this.getMonth()+1); break;
        case 'd': s += padzero(this.getDate()); break;
        case 'T':
          s += padzero(this.getHours()) + ':' +
               padzero(this.getMinutes()) + ':' +
               padzero(this.getSeconds());
          break;

        case 'R':
          s += padzero(this.getHours()) + ":" + padzero(this.getMinutes());
          break;

        case 'H': s += padzero(this.getHours()); break;
        case 'M': s += padzero(this.getMinutes()); break;
        case 'S': s += padzero(this.getSeconds()); break;

        default:
          s += n;
      }
    }
    else
      s += c;
  }

  return s;
};

}(Date));
