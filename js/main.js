document.addEventListener("DOMContentLoaded", function () {
  // ハンバーガーメニュー
  const hamburger = document.querySelector(".js-hamburger");
  const nav = document.querySelector(".js-nav");

  if (hamburger && nav) {
    hamburger.addEventListener("click", function () {
      const expanded = this.getAttribute("aria-expanded") === "true";
      this.classList.toggle("is-active");
      nav.classList.toggle("is-active");
      this.setAttribute("aria-expanded", String(!expanded));
      document.body.style.overflow = !expanded ? "hidden" : "";
    });
  }

  // モバイル：子メニューのアコーディオン開閉
  document.querySelectorAll(".menu-item-has-children > a").forEach((link) => {
    link.addEventListener("click", function (e) {
      if (window.innerWidth >= 1024) return;
      e.preventDefault();

      const parent = this.parentElement;
      const subMenu = this.nextElementSibling;
      if (!subMenu) return;

      const isOpen = parent.classList.contains("is-open");

      if (isOpen) {
        subMenu.style.height = subMenu.scrollHeight + "px";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            subMenu.style.height = "0";
          });
        });
        parent.classList.remove("is-open");
      } else {
        parent.classList.add("is-open");
        subMenu.style.height = "0";
        requestAnimationFrame(() => {
          subMenu.style.height = subMenu.scrollHeight + "px";
        });
        subMenu.addEventListener("transitionend", function handle(e) {
          if (e.propertyName === "height" && parent.classList.contains("is-open")) {
            subMenu.style.height = "auto";
          }
          subMenu.removeEventListener("transitionend", handle);
        });
      }
    });
  });

  // スライドショーの無限ループ用クローン（全インスタンス対応）
  document.querySelectorAll(".p-slideshow__wrap").forEach((wrap) => {
    const list = wrap.querySelector(".p-slideshow__list");
    if (list) wrap.appendChild(list.cloneNode(true));
  });

  // アコーディオン
  document.querySelectorAll(".c-accordion__item").forEach((item, index) => {
    const trigger = item.querySelector(".js-accordion-trigger");
    const content = item.querySelector(".js-accordion-content");
    if (!trigger || !content) return;

    const id = `accordion-content-${index}`;
    trigger.setAttribute("aria-controls", id);
    content.setAttribute("id", id);

    if (trigger.getAttribute("aria-expanded") === "true") {
      trigger.classList.add("is-active");
      content.classList.add("is-open");
      content.style.height = "auto";
    }

    trigger.addEventListener("click", () => {
      const isOpen = trigger.classList.contains("is-active");

      if (isOpen) {
        content.style.height = content.scrollHeight + "px";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            content.style.height = "0";
            trigger.classList.remove("is-active");
            trigger.setAttribute("aria-expanded", "false");
            content.setAttribute("aria-hidden", "true");
            content.classList.remove("is-open");
          });
        });
      } else {
        trigger.classList.add("is-active");
        trigger.setAttribute("aria-expanded", "true");
        content.classList.add("is-open");
        content.setAttribute("aria-hidden", "false");
        content.style.height = "0px";
        requestAnimationFrame(() => {
          content.style.height = content.scrollHeight + "px";
        });
        content.addEventListener("transitionend", function handle(e) {
          if (e.propertyName === "height" && trigger.classList.contains("is-active")) {
            content.style.height = "auto";
          }
          content.removeEventListener("transitionend", handle);
        });
      }
    });
  });
});
