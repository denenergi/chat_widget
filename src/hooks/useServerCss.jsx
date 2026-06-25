import { useEffect } from "react";

/**
 * useServerCss
 * @param {string} cssString - CSS зі сервера
 * @param {Object} opts
 *   - rootElement (HTMLElement) - DOM-елемент / контейнер в який треба додати клас (якщо не вказано, бере #root)
 *   - addClassToRoot (boolean) - чи додавати видобутий клас на rootElement (default true)
 *   - styleId (string) - id тега <style> (щоб оновлювати/видаляти)
 */
export default function useServerCss(cssString, opts = {}) {
  const {
    rootElement = document.getElementById("root") || document.body,
    addClassToRoot = true,
    styleId = "remote-server-css",
  } = opts;

  useEffect(() => {
    if (!cssString) return;

    // 1) знайти першу назву класу у cssString (сервер гарантує що є)
    const classMatch = cssString.match(/\.([a-zA-Z0-9_-]+)(?=[\s\.\:#,{[])/);
    const extractedClass = classMatch ? classMatch[1] : null;

    // 2) вставити/оновити <style>
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    // використовуємо textContent (без innerHTML) — краща практика
    styleEl.textContent = cssString;

    // 3) додати клас на кореневий контейнер, якщо потрібно
    let previousAdded = null;
    if (addClassToRoot && extractedClass && rootElement) {
      rootElement.classList.add(extractedClass);
      previousAdded = extractedClass;
    }

    return () => {
      // cleanup: видалити стилі і клас
      if (styleEl && styleEl.parentNode) {
        // якщо стилі змінюються часто — можливо не видаляти зовсім, але тут робимо cleanup
        styleEl.parentNode.removeChild(styleEl);
      }
      if (previousAdded && rootElement) {
        rootElement.classList.remove(previousAdded);
      }
    };
  }, [cssString, rootElement, addClassToRoot, styleId]);
}
