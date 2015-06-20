Date formatter
==============

This is a simple date formatter in Javascript. 

**Available formats are:**

- `%Y`: Prints the full year
- `%m`: Prints the month as zero padded number, ie: 01, 02 .. 10, 11
- `%d`: Prints the date as zero padded number, ie: 01, 02 .. 29, 30
- `%H`: Prints the hour as zero paddeed number, ie: 00, 01 .. 22, 23
- `%M`: Prints the minute as zero padded number, ie: 00 .. 59
- `%S`: Prints the second as zero padded number, ie: 00 .. 59
- `%T`: Prints the time, same as %H:%M:%S
- `%R`: Prints the hour and minute, same as %H:%M
- `%a`: Prints the abbreviated weekday (mon, tue, wed, ...)
- `%A`: Prints the full weekday (monday, tuesday, ...)
- `%b`: Prints the abbreviated month name
- `%B`: Prints the full month name

**Example:**

```js
var date = new Date(Date.parse("2013-04-19T20:13:57"));
date.format('%Y-%m-%d');    //> 2013-04-19
date.format('%Y-%m-%d %R'); //> 2013-04-19 20:13
date.format('%Y-%m-%d %T'); //> 2013-04-19 20:13:57
```

**To add locales, add your language key to:**

```js
Date.monthNames.langKey      = [ 'Januaray', ... , 'December'];
Date.monthNamesShort.langKey = [ 'Jan',      ... , 'Dec'];
Date.dayNames.langKey        = [ 'Monday',   ... , 'Sunday'];
Date.dayNamesShort.langKey   = [ 'Mon',      ... , 'Sun'];
```

**To set a default locale (`en` is default), set:**
```js
Date.locale = 'langKey';
```
