/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const toggle_toc = (function (id) {
  const func = function () {
    const toc_el = document.getElementById(id);
    if (toc_el.checkVisibility()) {
      toc_el.style.display = "none";
    } else {
      toc_el.style.display = "unset";
    }
  };
  return func;
})(toc_id);
