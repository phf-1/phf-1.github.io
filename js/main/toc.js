/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// return a new id for each invocation.
// id_build() : String
const id_build = (function () {
  let id = 0;
  return function () {
    id = id + 1;
    return id;
  };
})();

// A Toc represents a table of content.
// List Heading → Toc
const toc_build = (function (toc_id) {
  return function (headings) {
    const toc = document.createElement("nav");
    toc.id = toc_id;
    const add_heading_to_toc = function (heading) {
      const toc_heading = heading.cloneNode();
      heading.id = heading.id === null ? heading.id : id_build();
      const a = document.createElement("a");
      a.href = "#" + heading.id;
      a.innerHTML = heading.innerHTML;
      toc_heading.appendChild(a);
      toc.appendChild(toc_heading);
    };
    headings.forEach(add_heading_to_toc);
    return toc;
  };
})(toc_id);

// Element → Toc
const element_toc = function (element) {
  const headings = Array.from(element.children).filter((child) => Heading.includes(child.tagName));
  return toc_build(headings);
};
