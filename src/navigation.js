/* Dar ekranda bölüm bağlantıları erişilebilir, yerel bir Menü öğesinde kalır. */
export function initNavigation() {
  document.querySelectorAll('.mobile-nav').forEach((menu) => {
    menu.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a')) menu.open = false;
    });
    menu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (menu.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
    });
  });
}
