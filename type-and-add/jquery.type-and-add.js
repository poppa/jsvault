/*!
 * Like the "add people to invite" function on Google+. Lets you type in an
 * invisible input field. A callback is called and if an array is passed back
 * from there a drop-down list is populated from which you can choose.
 *
 * Copyright © 2009-2015 Pontus Östlund <https://profiles.google.com/poppanator>
 *
 * Permission to copy, modify, and distribute this source for any legal
 * purpose granted as long as my name is still attached to it. More
 * specifically, the GPL, LGPL and MPL licenses apply to this software.
 */

// jshint esversion: 5, undef: true, unused: true
/* global window, document, jQuery, setTimeout, clearTimeout */

(function(window, document, $) {
  'use strict';

  if ($ === undefined) throw 'jQuery not available';

  var cssIsSet = false;
  var css =
  '.sx-container {' +
    'z-index: 2;' +
    'width: auto;' +
    'max-width: 350px;' +
    'max-height: 300px;' +
    'overflow-y: auto;' +
    'position: absolute;' +
    'background: white;' +
    'border: 1px solid #aaa;' +
    'margin-top: -1px;' +
    'margin-left: 0px;' +
    'box-shadow: 2px 2px 5px rgba(0,0,0,.2);' +
  '}' +
  '.sx-container a {' +
    'display: block;' +
    'padding: 5px 5px;' +
    'border-bottom: 1px dotted #ccc;' +
    'overflow: hidden;' +
    'text-overflow: ellipsis;' +
    'white-space: nowrap;' +
    'text-decoration:none;' +
    'min-width:180px;' +
  '}' +
  '.sx-container a:focus,.sx-container a:active { background: #f1f1f1; }' +
  '.sx-container a:hover { background: #f1f1f1; }' +
  '.sx-container a:last-child { border-bottom: none; }';

  var Handler = function(cfg, el) {
    var searcher,
      aAdd,
      inp,
      blur,
      checkMax,
      spinner,
      popup,
      mklink,
      handler = this,
      storage = new Storage(),
      showHideAdd,
      spinnerShow,
      placeholder;

    if (!cssIsSet) {
      cssIsSet = true;
      $('head').prepend('<style>' + css + '</style>');
    }

    cfg = $.extend({
      searchDelay:     500,
      searchMinLength: 3,
      onSearch:        function() {},
      onAdd:           function() {},
      onRemove:        function() {},
      defaultData:     null,
      duplicates:      false,
      max:             0
    }, cfg);

    el = $(el);

    spinner = $('<i class="fa fa-spinner fa-spin"></i>');
    el.append(spinner);
    spinner.css({
      position: 'absolute',
      zIndex: 3
    }).hide();

    spinnerShow = function() {
      spinner.css({
        left: inp.position().left + inp.outerWidth(),
        top: inp.position().top + (inp.outerHeight()/2-spinner.outerHeight()/2)
      }).fadeIn('fast');
    };

    aAdd = el.find('a');

    if (aAdd.attr('data-type-and-add-placeholder')) {
      placeholder = aAdd.attr('data-type-and-add-placeholder');
    }
    else {
      placeholder = aAdd.text();
    }

    inp = $('<input type="text" placeholder="' + placeholder + '" />')
          .css({ border: 'none',  background: 'transparent', display: 'none' })
          .addClass('type-and-find');
    inp[0].noblur = false;
    inp.click(function(ev) { ev.stopPropagation(); })
    .on('focus', function() {
      popup.show();
      $(document).on('click.typeandadd', function() { blur(true); });
    })
    .on('blur', function() {
      blur();
    })
    .on('keyup', function(e) {
      var val = inp.val();
      if (val.length === 0) {
        popup.close();
      }
      if (e.ctrlKey === true || val.length < cfg.searchMinLength)
        return;

      if ((e.keyCode < 49) &&
          (e.keyCode !== 45 || e.keyCode !== 46) && // insert, del
          (e.keyCode !== 8))                        // backspace
      {
        return;
      }

      spinnerShow();
      searcher.search(val);
    })
    .on('keydown', function() { searcher.abort(); });

    el.prepend(inp).keyup(function(ev) {
      if (ev.keyCode === 27) { // esc
        inp[0].noblur = false;
        blur();
        aAdd.focus();
        return;
      }
    });

    blur = function(force) {
      if (force || inp[0].noblur === false || popup.isClosed()) {
        inp.css('display', 'none');
        showHideAdd();
        spinner.fadeOut('fast');
        popup.close();
        inp[0].noblur = false;
        $(document).off('click.typeandadd');
      }
    };

    checkMax = function () {
      return !(cfg.max && storage.length() >= cfg.max);
    };

    mklink = function(obj) {
      var lnk = $('<a href="#">');
      lnk.text(obj.display || '?')
      .attr('title', obj.title||'')
      .click(function(ev) {
        ev.stopPropagation();
        if (cfg.onAdd($.data(this, 'typeandadd'), handler, this) !== false) {
          storage.add($.data(this, 'typeandadd'));
          $(this).css({ display: 'inline-block' })
                 .addClass('selected-item')
                 .unbind('click')
                 .click(function() {
                   if (cfg.onRemove($.data(this, 'typeandadd'),
                                    handler, this) !== false)
                   {
                     handler.remove(this);
                     blur(true);
                     aAdd.focus();
                   }

                   return false;
                 })
                 .focus(function(e) {
                   e.stopPropagation();
                 })
                 .blur(function(e) {
                   e.stopPropagation();
                   inp.trigger('blur');
                 })
                 .insertBefore(inp);
        }

        blur(true);
        showHideAdd(true);

        return false;
      })
      .keyup(function(ev) {
        if (ev.keyCode === 46 || ev.keyCode === 8)
          $(this).click();
      });

      $.data(lnk[0], 'typeandadd', obj);
      return lnk;
    };

    var _searcher = function() {
      this.isSearching = false;
      this.ival = 0;

      this.search = function(value) {
        if (this.isSearching)
          return;

        if (this.ival)
          clearTimeout(this.ival);

        this.ival = setTimeout(function() {
          searcher.isSearching = true;
          cfg.onSearch(value, handler);
        }, 300);
      };

      this.abort = function() {
        searcher.isSearching = false;
        clearTimeout(this.ival);
      };
    };

    searcher = new _searcher();

    var _popup = function() {
      var container = $('<div class=\"sx-container\">').hide();

      container.insertAfter(inp).click(function(e) {
        e.stopPropagation();
        return false;
      });

      this.populate = function(rows) {
        var item, link, oldelems = container.find('a');

        for (var i = 0; i < rows.length; i++) {
          item = rows[i];
          if (!cfg.duplicates && storage.exists(item))
            continue;

          link = mklink(item);
          container.append(link);
        }

        oldelems.remove();
        this.show();
      };

      this.isClosed = function() {
        return container.css('display') === 'none';
      };

      this.close = function(force) {
        if (force) {
          container.hide();
          container.empty();
        }
        else {
          container.slideUp('fast', function() {
            container.empty();
          });
          inp[0].noblur = false;
        }
      };

      this.show = function() {
        if (container.find('a').length)
          container.slideDown('fast');

        container.css({
          left: inp.position().left
        });

        inp[0].noblur = true;
      };
    };

    popup = new _popup();

    showHideAdd = function(trigger) {
      if (checkMax()) {
        aAdd.css('display', 'inline-block');
        if (trigger) aAdd.trigger('click');
      }
      else
        aAdd.css('display', 'none');
    };

    aAdd.click(function(e) {
      popup.close(true);
      e.stopPropagation();
      $(this).hide();
      inp.css('display', 'inline-block').val('').focus();
      return false;
    });

    this.remove = function(element) {
      storage.remove($.data(element, 'typeandadd'));
      $(element).remove();
    };

    this.populatePopup = function(rows) {
      spinner.fadeOut('fast');

      if (this.isAborted() || !rows || !rows.length) {
        popup.close();
        return;
      }

      searcher.abort();

      popup.populate(rows);
    };

    this.getSelections = function() {
      return storage.getList();
    };

    this.isAborted = function() {
      return searcher.isSearching === false;
    };

    this.reset = function() {
      storage.clear();
      el.find('a.selected-item').remove();
      blur(true);
    };

    if (cfg.defaultData) {
      for (var i = 0; i < cfg.defaultData.length; i++) {
        mklink(cfg.defaultData[i]).click();
      }
    }
  };

  // The storage class is where we keep added elements in an instance. This is
  // to be able to prevent duplicates to be added.
  var Storage = function() {
    var list = [];
    this.length = function() { return list.length; };
    this.getList = function() { return list; };
    this.add = function(obj) { list.push(obj); };
    this.remove = function(obj) {
      var n = [];
      for (var i in list)
        if (!equals(list[i], obj))
          n.push(list[i]);

      list = n;
    };
    this.exists = function(which) {
      for (var i = 0; i < list.length; i++) {
        if (equals(list[i], which))
          return true;
      }
      return false;
    };
    this.clear = function() { list = []; };
  };

  //! Compare a to b
  var equals = function (a, b) {
    var t1 = typeof a, t2 = typeof b;
    if (t1 !== t2) return false;

    if (t1 === 'object') {
      for (var name in a) {
        // Key mismatch
        if (!(name in b)) return false;

        var _a = a[name], _b = b[name];

        if (typeof _a !== typeof _b) return false;
        if (typeof _a === 'object')  return equals(_a, _b);
        if (typeof _a === 'function') {
          // If argument length mismatch it's definitely different funcs.
          // Don't know of any foolproof way of comparing functions
          return _a.length === _b.length;
        }

        return a[name] === b[name];
      }
    }
    else if (t1 === 'function') {
      return a.length === b.length;
    }
    else {
      return a === b;
    }
  };

  $.fn.typeAndAdd = function(config) {
    return this.each(function() {
      if (config) {
        var h = new Handler(config, this);
        $.data(this, 'typeAndAdd', h);
      }
    });
  };

  $.fn.typeAndAddReset = function() {
    return this.each(function() {
      var h = $.data(this, 'typeAndAdd');
      if (h) h.reset();
    });
  };

}(window, document, jQuery));
