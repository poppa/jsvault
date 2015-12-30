/*!
 * Random string generator
 *
 * Copyright © 2009-2015 Pontus Östlund <https://profiles.google.com/poppanator>
 *
 * Permission to copy, modify, and distribute this source for any legal
 * purpose granted as long as my name is still attached to it. More
 * specifically, the GPL, LGPL and MPL licenses apply to this software.
 */

/* globals Random */

(function(window, Math) {
'use strict';

window.Random = {
  ALPHA: 1,
  NUMBER: 2,
  SPECIAL: 4,
  ALL: 1|2|4,
  LOWERCASE: 1,
  UPPERCASE: 2,

  _a_z: 'abcdefghijklmnopqrstuvxyz',
  _A_Z: 'ABCDEFGHIJKLMNOPQRSTUVXYZ',
  _pct: '!@£$%&/()=?+-\\}][{#*^:;.<>|-_§~',
  _0_9: '0123456789',

  /**
   * Generates a random string of length len
   *
   * @param int len
   */
  string: function(len, type, _case, exclude) {
    len       = len     || 8;
    type      = type    || (Random.ALPHA|Random.NUMBER);
    _case     = _case   || (Random.LOWERCASE|Random.UPPERCASE);
    exclude   = exclude || '';

    var chars = '',
        requireSpecial = false,
        requireUpper = false,
        requireLower = false,
        requireNumber = false;

    if ((type & Random.ALPHA) === Random.ALPHA) {
      if ((_case & Random.LOWERCASE) === Random.LOWERCASE) {
        chars += Random._a_z;
        requireLower = true;
      }
      if ((_case & Random.UPPERCASE) === Random.UPPERCASE) {
        chars += Random._A_Z;
        requireUpper = true;
      }
    }

    if ((type & Random.NUMBER) === Random.NUMBER) {
      chars += Random._0_9;
      requireNumber = true;
    }

    if ((type & Random.SPECIAL) === Random.SPECIAL) {
      chars += Random._pct;
      requireSpecial = true;
    }

    chars = chars.split('');
    var l = chars.length,
        out = null,
        c = null,
        x = null,
        reset = function() {
          out = '';
          x = {
            lower:   '',
            upper:   '',
            number:  '',
            special: ''
          };
        };

    reset();

    while (out.length <= len+1) {
      if (out.length >= len) {
        if (requireSpecial && x.special.length === 0) {
          reset();
          continue;
        }
        if (requireNumber && x.number.length === 0) {
          reset();
          continue;
        }
        if (requireLower && x.lower.length === 0) {
          reset();
          continue;
        }
        if (requireUpper && x.upper.length === 0) {
          reset();
          continue;
        }

        break;
      }

      c = chars[Math.floor(Math.random() * l)];

      if (exclude.indexOf(c) > -1)
        continue;

      if (Random._pct.indexOf(c) > -1) {
        if (x.special.indexOf(c) > -1) {
          continue;
        }
        if (x.special.length > 0) {
          continue;
        }
        x.special += c;
      }
      else if (Random._0_9.indexOf(c) > -1) {
        x.number += c;
      }
      else if (Random._a_z.indexOf(c) > -1) {
        x.lower += c;
      }
      else if (Random._A_Z.indexOf(c) > -1) {
        x.upper += c;
      }

      out += c;
    }

    return out;
  }
};
}(window, Math));
