document.addEventListener("DOMContentLoaded", function () {
  // --- ハンバーガーメニューの開閉（既存コード） ---
  const hamburger = document.querySelector(".js-hamburger");
  const nav = document.querySelector(".js-nav");
  const body = document.body;

  hamburger.addEventListener("click", function () {
    const expanded = this.getAttribute("aria-expanded") === "true" || false;
    this.classList.toggle("is-active");
    nav.classList.toggle("is-active");
    this.setAttribute("aria-expanded", !expanded);
    body.style.overflow = !expanded ? "hidden" : "";
  });
});

$(function () {
  // 親メニュー（aタグ）をクリックした時
  $(".menu-item-has-children > a").on("click", function (e) {
    // PCサイズ（1024px以上）では動作させない
    if (window.innerWidth < 1024) {
      e.preventDefault(); // リンク遷移を無効化

      const $subMenu = $(this).next(".sub-menu"); // 隣の.sub-menuを取得
      const $parent = $(this).parent(); // 親のli

      // アコーディオンの開閉
      $subMenu.slideToggle(300);

      // クラスの付け外し（矢印の向きなどを変える用）
      $parent.toggleClass("is-open");
    }
  });
});

// 要素が存在するかチェック
const list = document.querySelector(".p-slideshow__list");
const wrap = document.querySelector(".p-slideshow__wrap");

// list と wrap の両方が存在する場合のみ実行
if (list && wrap) {
  const clone = list.cloneNode(true);
  wrap.appendChild(clone);
}

/**
 * アコーディオン
 */
document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll(".c-accordion__item");

  items.forEach((item, index) => {
    const trigger = item.querySelector(".js-accordion-trigger");
    const content = item.querySelector(".js-accordion-content");

    if (!trigger || !content) return;

    const uniqueId = `accordion-content-${index}`;
    trigger.setAttribute("aria-controls", uniqueId);
    content.setAttribute("id", uniqueId);

    // 初期状態のチェック（HTMLに aria-expanded="true" がある場合は開いておく）
    if (trigger.getAttribute("aria-expanded") === "true") {
      trigger.classList.add("is-active");
      content.classList.add("is-open");
      content.style.height = "auto";
    }

    trigger.addEventListener("click", () => {
      const isOpen = trigger.classList.contains("is-active");

      if (isOpen) {
        // 閉じる処理
        // 数値としての高さを取得してセット（autoだとアニメーションしないため）
        content.style.height = content.scrollHeight + "px";

        // 描画を強制してから 0 にする
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
        // 開く処理
        trigger.classList.add("is-active");
        trigger.setAttribute("aria-expanded", "true");
        content.classList.add("is-open");
        content.setAttribute("aria-hidden", "false");

        // 高さを計算するために一度 display 状態などを確定させる
        content.style.height = "0px"; // 明示的に0から始める

        // 1フレーム待ってから高さを代入（ブラウザに現在の高さを認識させる）
        requestAnimationFrame(() => {
          const contentHeight = content.scrollHeight;
          content.style.height = contentHeight + "px";
        });

        const handleTransitionEnd = (e) => {
          if (e.propertyName === "height") {
            if (trigger.classList.contains("is-active")) {
              content.style.height = "auto";
            }
            content.removeEventListener("transitionend", handleTransitionEnd);
          }
        };
        content.addEventListener("transitionend", handleTransitionEnd);
      }
    });
  });
});
