// Heading ≡ h1 | … | h6
const Heading = ["H1", "H2", "H3", "H4", "H5", "H6"];

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
const toc_build = function (headings) {
  const toc = document.createElement("nav");
  toc.id = "table-of-content";
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

// Element → Toc
const element_toc = function (element) {
  const headings = Array.from(element.children).filter((child) => Heading.includes(child.tagName));
  return toc_build(headings);
};
