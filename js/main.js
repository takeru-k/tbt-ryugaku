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

  // PC：メガメニューのホバー制御（liとメニューの間の隙間を移動する間は
  // 消えず、実際に離れた時だけ短い猶予後に閉じる。閉じるタイミングを
  // JS側で一元管理することで、liとメニュー間の遷移中に一瞬消えたり、
  // 背景の暗転フィルターだけ先に消えたりするチラつきを防ぐ）
  document.querySelectorAll(".menu-item-has-children").forEach((li) => {
    const menu = li.querySelector(".p-menu-grid");
    if (!menu) return;

    let closeTimer = null;

    const open = () => {
      clearTimeout(closeTimer);
      li.classList.add("is-hover-open");
    };

    const scheduleClose = () => {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        li.classList.remove("is-hover-open");
      }, 150);
    };

    li.addEventListener("mouseenter", open);
    li.addEventListener("mouseleave", scheduleClose);
    menu.addEventListener("mouseenter", open);
    menu.addEventListener("mouseleave", scheduleClose);
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

  // p-hero__collage（モバイル自動スクロール）の無限ループ用クローン
  document.querySelectorAll(".js-hero-collage-track").forEach((track) => {
    const collage = track.querySelector(".p-hero__collage");
    if (collage) track.appendChild(collage.cloneNode(true));
  });

  // p-card-list の横スクロール用バー（iOS Safariは::-webkit-scrollbar非対応のため自前で描画）
  document.querySelectorAll(".js-card-list-scrollbar").forEach((bar) => {
    const items = bar
      .closest(".p-card-list")
      ?.querySelector(".p-card-list__items");
    const thumb = bar.querySelector(".p-card-list__scrollbar-thumb");
    if (!items || !thumb) return;

    const update = () => {
      const scrollable = items.scrollWidth - items.clientWidth;
      const thumbWidthRatio = items.clientWidth / items.scrollWidth;
      const progress = scrollable > 0 ? items.scrollLeft / scrollable : 0;

      thumb.style.width = `${thumbWidthRatio * 100}%`;
      thumb.style.transform = `translateX(${
        progress * (bar.clientWidth - thumb.offsetWidth)
      }px)`;
    };

    items.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  // お知らせのカテゴリー絞り込み
  document.querySelectorAll(".js-news-filter-list").forEach((filterList) => {
    const section = filterList.closest(".p-news");
    if (!section) return;

    const buttons = filterList.querySelectorAll(".js-news-filter-btn");
    const items = section.querySelectorAll(".js-news-item");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-active"));
        button.classList.add("is-active");

        const target = button.dataset.newsFilter;
        items.forEach((item) => {
          const match = target === "all" || item.dataset.newsCategory === target;
          item.classList.toggle("is-hidden", !match);
        });
      });
    });
  });

  // 提携校の国・地域絞り込み
  document.querySelectorAll(".js-school-filter-list").forEach((filterList) => {
    const container = filterList.closest(".p-school-list");
    if (!container) return;

    const buttons = filterList.querySelectorAll(".js-school-filter-btn");
    const regions = container.querySelectorAll(".js-school-region");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-active"));
        button.classList.add("is-active");

        const target = button.dataset.schoolFilter;
        regions.forEach((region) => {
          const match = target === "all" || region.dataset.schoolRegion === target;
          region.classList.toggle("is-hidden", !match);
        });
      });
    });
  });
});

// 選ばれる理由
(function () {
  const track = document.querySelector(".js-feature-track");
  if (!track) return;

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
    track.classList.add("is-dragging");
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
    track.classList.remove("is-dragging");
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
  const prevBtn = document.querySelector(".js-feature-prev");
  const nextBtn = document.querySelector(".js-feature-next");
  if (prevBtn) prevBtn.addEventListener("click", () => step(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => step(1));
})();
