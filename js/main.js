document.addEventListener("DOMContentLoaded", (event) => {
  const main_id = "main";
  const content_id = "content";
  const content = document.getElementById(content_id);
  const toc = element_toc(content);
  const main = document.getElementById(main_id);
  main.appendChild(toc);
  const content_rect = content.getBoundingClientRect();
  const content_children = Array.from(content.children);
  const is_h1 = (el) => el.tagName === "H1";
  const h1 = content_children.find(is_h1);
  if (h1) {
    const h1_rect = h1.getBoundingClientRect();
    const h1_dy = h1_rect.y - content_rect.y;
    const toc_top_margin = h1_dy + h1.offsetHeight;
    toc.style.marginTop = String(toc_top_margin) + "px";
  }
  hljs.highlightAll();
});
