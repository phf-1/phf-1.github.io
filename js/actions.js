const toc_id = "table-of-content";

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
