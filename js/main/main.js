/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// Position the toc in the page.
const position_toc = function (main, content, toc) {
  main.appendChild(toc);
  const content_rect = content.getBoundingClientRect();
  const content_children = Array.from(content.children);
  const h1 = content_children.find(is_h1);
  if (h1) {
    const h1_rect = h1.getBoundingClientRect();
    const h1_dy = h1_rect.y - content_rect.y;
    const toc_top_margin = h1_dy + h1.offsetHeight;
    toc.style.marginTop = String(toc_top_margin) + "px";
  }
};

const on_dom_content_loaded = (function (main_id, content_id) {
  return function (event) {
    const main = document.getElementById(main_id);
    const content = document.getElementById(content_id);
    const toc = element_toc(content);
    position_toc(main, content, toc);
    hljs.highlightAll();
  };
})(main_id, content_id);

document.addEventListener("DOMContentLoaded", on_dom_content_loaded);
