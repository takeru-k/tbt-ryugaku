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
          if (
            e.propertyName === "height" &&
            parent.classList.contains("is-open")
          ) {
            subMenu.style.height = "auto";
          }
          subMenu.removeEventListener("transitionend", handle);
        });
      }
    });
  });

  // 実績スライダー：矢印ボタンでスクロール
  // 手動スクロールされていてもズレないよう、クリックのたびに実際の
  // scrollLeftから「今どのカードに一番近いか」を判定してから1枚分移動する。
  // scrollIntoViewはブラウザ側で範囲・スナップ位置を正しく処理してくれる。
  document.querySelectorAll(".p-achievements__slider").forEach((slider) => {
    const list = slider.querySelector(".js-achievements-list");
    const prev = slider.querySelector(".js-achievements-prev");
    const next = slider.querySelector(".js-achievements-next");
    const cards = Array.from(slider.querySelectorAll(".c-achievement-card"));
    if (!list || !prev || !next || cards.length === 0) return;

    const getNearestIndex = () => {
      // 末尾・先頭はscrollLeftが目的のカード位置まで届かず
      // 手前のカードに誤判定されるため、範囲の両端は先に確定させる
      const maxScroll = list.scrollWidth - list.clientWidth;
      if (list.scrollLeft >= maxScroll - 1) return cards.length - 1;
      if (list.scrollLeft <= 1) return 0;

      let nearest = 0;
      let minDiff = Infinity;
      cards.forEach((card, i) => {
        const diff = Math.abs(card.offsetLeft - list.scrollLeft);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = i;
        }
      });
      return nearest;
    };

    const goTo = (index) => {
      const targetIndex = (index + cards.length) % cards.length;
      cards[targetIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    };

    prev.addEventListener("click", () => goTo(getNearestIndex() - 1));
    next.addEventListener("click", () => goTo(getNearestIndex() + 1));
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
          if (
            e.propertyName === "height" &&
            trigger.classList.contains("is-active")
          ) {
            content.style.height = "auto";
          }
          content.removeEventListener("transitionend", handle);
        });
      }
    });
  });
});

// 選ばれる理由
(function () {
  const track = document.getElementById("track");

  // カードはindex.htmlに直書き。無限スクロールの錯覚を出すため、
  // 元のカード（1セット分）をそのまま複製してもう2セット追加する。
  const originalCards = Array.from(track.children);
  const cardCount = originalCards.length;
  for (let i = 0; i < 2; i++) {
    originalCards.forEach((card) => track.appendChild(card.cloneNode(true)));
  }

  let setWidth = 0;
  function measure() {
    const cards = track.children;
    const first = cards[0];
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap) || 20;
    const cardW = first.getBoundingClientRect().width;
    setWidth = (cardW + gap) * cardCount;
    // start in the middle copy
    track.scrollLeft = setWidth;
  }

  function normalize() {
    if (track.scrollLeft <= 0) {
      track.scrollLeft += setWidth;
    } else if (track.scrollLeft >= setWidth * 2) {
      track.scrollLeft -= setWidth;
    }
  }

  window.addEventListener("load", measure);
  window.addEventListener("resize", () => {
    const ratio = track.scrollLeft / (setWidth || 1);
    measure();
    track.scrollLeft = setWidth; // re-center after resize
  });

  track.addEventListener("scroll", () => {
    normalize();
  });

  // ---- manual drag (mouse / touch) ----
  let isDown = false,
    startX = 0,
    startScroll = 0,
    moved = false;

  track.addEventListener("pointerdown", (e) => {
    isDown = true;
    moved = false;
    track.classList.add("dragging");
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) moved = true;
    track.scrollLeft = startScroll - dx;
  });

  function endDrag(e) {
    if (!isDown) return;
    isDown = false;
    track.classList.remove("dragging");
    normalize();
  }
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointerleave", endDrag);
  track.addEventListener("pointercancel", endDrag);

  // Prevent the eventual click on links inside a card right after a drag.
  track.addEventListener(
    "click",
    (e) => {
      if (moved) e.preventDefault();
    },
    true,
  );

  // ---- nav buttons ----
  function step(dir) {
    const first = track.children[0];
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap) || 20;
    const cardW = first.getBoundingClientRect().width + gap;
    track.scrollBy({ left: dir * cardW, behavior: "smooth" });
    // normalize shortly after the smooth scroll settles
    clearTimeout(step._t);
    step._t = setTimeout(normalize, 420);
  }
  document.getElementById("prevBtn").addEventListener("click", () => step(-1));
  document.getElementById("nextBtn").addEventListener("click", () => step(1));

  // ---- scroll to top ----
  document.getElementById("scrollTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
