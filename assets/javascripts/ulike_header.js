// Extracted from inline <script> tags in index.html

// Prevent double-initialization if inline scripts already ran
if (window.__ULIKE_HEADER_LOADED__) {
  // Already initialized by inline scripts; skip external init
} else {
  window.__ULIKE_HEADER_LOADED__ = true;

  // 1) Header hover menu and CTA handlers
  document.querySelectorAll('.header-new-popup .header-new-operate-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const link = btn.getAttribute('data-link');
      if (link) {
        window.location.href = link;
      }
    });
  });

  class HeaderHoverMenu {
    constructor(options) {
      this.itemSelector = options.itemSelector;
      this.linkSelector = options.linkSelector;
      this.popupSelector = options.popupSelector;
      this.popupContentSelector = options.popupContentSelector;

      this.items = document.querySelectorAll(this.itemSelector);
      this.popup = document.querySelector(this.popupSelector);
      this.popupContent = document.querySelector(this.popupContentSelector);

      this.activeTarget = null;
      this.hideTimeout = null;

      this.init();
      this.updatePopupPosition();

      // 监听滚动与尺寸变化
      window.addEventListener('scroll', () => this.updatePopupPosition());
      window.addEventListener('resize', () => this.updatePopupPosition());
    }

    init() {
      this.items.forEach(item => {
        const link = item.querySelector(this.linkSelector);
        if (!link) return;

        const targetId = link.getAttribute('ment-id');
        const targetEl = document.getElementById(targetId);

        if (!targetEl) return;

        // 鼠标进入主菜单项
        item.addEventListener('mouseenter', () => {
          this.show(targetEl);
        });

        // 鼠标离开主菜单项
        item.addEventListener('mouseleave', () => {
          this.delayHide();
        });
      });

      // 鼠标进入浮层，不隐藏
      this.popupContent.addEventListener('mouseenter', () => {
        console.log('Mouse entered popup');
        this.cancelHide();
      });

      // 鼠标离开浮层，隐藏
      this.popupContent.addEventListener('mouseleave', () => {
        console.log('Mouse  mouseleave');
        this.delayHide();
      });
    }

    show(targetEl) {
      this.cancelHide();

      // 移除之前的 active
      if (this.activeTarget && this.activeTarget !== targetEl) {
        this.activeTarget.style.setProperty('display', 'none');
        this.activeTarget.querySelector('.header-new-item').classList.remove('active');
      }

      this.activeTarget = targetEl;
      this.popup.style.setProperty('display', 'block');
      this.activeTarget.querySelector('.header-new-item').classList.add('active');
      this.activeTarget.style.setProperty('display', 'flex');
      this.updatePopupPosition();
      const headerEl = document.querySelector('store-header');
      if (headerEl) headerEl.classList.add('bg-color-w');
    }

    delayHide() {
      this.hideTimeout = setTimeout(() => {
        if (this.activeTarget) {
          this.activeTarget.querySelector('.header-new-item').classList.remove('active');
          this.activeTarget.style.setProperty('display', 'none');
        }
        const headerEl = document.querySelector('store-header');
        if (headerEl) headerEl.classList.remove('bg-color-w');
        this.popup.style.setProperty('display', 'none');
      }, 200);
    }

    cancelHide() {
      clearTimeout(this.hideTimeout);
    }

    updatePopupPosition() {
      const headerEl = document.querySelector('store-header');
      if (!headerEl) return;
      const rect = headerEl.getBoundingClientRect();
      this.popup.style.setProperty('--hend-top', `${rect.top}px`);
    }
  }

  // 调用
  new HeaderHoverMenu({
    itemSelector: '.header__linklist-item',
    linkSelector: '.header__linklist-link',
    popupSelector: '.header-new-popup',
    popupContentSelector: '.header-new-popup .header-new-cont'
  });

  // 2) Region dialog interactions (jQuery dependent)
  // Requires jQuery to be available on the page
  if (typeof window.$ !== 'undefined') {
    $(function () {
      const siteDialog = {
        currentSite: '',
        init: function () {
          this.currentSite = this.getShopifyRegion();
          this.currentSiteHighlight();
          this.dialogClose();
          this.siteItemClick();
        },
        getShopifyRegion: function () {
          const host = window.location.hostname;
          const subdomain = host.split('.')[0];
          if (subdomain === 'www' || !subdomain) {
            return 'US';
          }
          return subdomain.toLocaleUpperCase();
        },
        currentSiteHighlight: function () {
          const _this = this;
          $('.site-dialog-group-item').each(function () {
            const $this = $(this);
            const site = $this.attr('data-site');
            const code = $this.attr('data-code');
            if (_this.currentSite === site && $this.hasClass(code)) {
              $this.addClass('active');
            }
          });
        },
        dialogClose: function () {
          $('.site-dialog-close').click(function () {
            $('.site-dialog-wrapper ').removeClass('show');
          });
        },
        siteItemClick: function () {
          const _this = this;
          $('.site-dialog-group-item').click(function () {
            const $this = $(this);
            const code = $this.attr('data-code');
            const link = $this.attr('data-link');
            if (code) {
              _this.switchLanguage(code);
            } else {
              location.href = link;
            }
          });
        },
        switchLanguage: function (lang) {
          const form = document.getElementById('header-localization-form');
          if (!form) return;
          const select = form.querySelector('input[name="locale_code"]');
          if (!select) return;
          select.value = lang;
          form.submit();
        },
      };

      siteDialog.init();
    });
  }

  // 3) Add-to-cart tracking + actions (some jQuery usage)
  // document.querySelectorAll('.header-new-popup .header-new-product-btn').forEach((button, index) => {
  //   button.addEventListener('click', (event) => {
  //     event.preventDefault();
  //     const id = button.getAttribute('data-id');
  //     const code = button.getAttribute('data-code');
  //     if (typeof addToCart === 'function') addToCart(id, null, {}, code);
  //     if (window.innerWidth < 1200 && typeof window.$ !== 'undefined') {
  //       $('.drawer__close-button--block').click();
  //     }
  //     event.stopPropagation();
  //   });
  // });

  // 4) Header height variables and region dialog trigger (jQuery dependent)
  (() => {
    const headerElement = document.getElementById('shopify-section-header');
    if (!headerElement) return;
    const headerHeight = headerElement.clientHeight;
    const wrapper = headerElement.querySelector('.header__wrapper');
    const headerHeightWithoutBottomNav = wrapper ? wrapper.clientHeight : headerHeight;

    document.documentElement.style.setProperty('--header-height', headerHeight + 'px');
    document.documentElement.style.setProperty(
      '--header-height-without-bottom-nav',
      headerHeightWithoutBottomNav + 'px'
    );
  })();

  // $(function () {
  //   $('.site-wrap').click(function () {
  //     $('#mobile-menu-drawer').removeAttr('open');
  //     setTimeout(function () {
  //       $('.site-dialog-wrapper').addClass('show');
  //     }, 1000);
  //   });
  // });
  const $btn = $('.header__icon-wrapper');
  const $drawer = $('#' + $btn.attr('aria-controls'));

  function openDrawer() {
    $btn.attr('aria-expanded', 'true');
    $drawer.removeAttr('hidden')
      .attr('aria-hidden', 'false')
      .attr('open', '');
  }

  function closeDrawer() {
    $btn.attr('aria-expanded', 'false');
    $drawer.attr('hidden', true)
      .attr('aria-hidden', 'true')
      .removeAttr('open');
  }

  // 点击按钮切换
  $btn.on('click', function (e) {
    e.stopPropagation(); // 避免触发外部点击
    if ($btn.attr('aria-expanded') === 'true') {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  // 点击抽屉内部时不关闭
  $drawer.on('click', function (e) {
    console.log(111111, e.target);
    // 如果点到的是关闭按钮，就放行（不阻止冒泡）
    if ($(e.target).closest('.drawer__close-button').length || $(e.target).closest('.drawer__overlay').length) {
      return;
    }
    e.stopPropagation();
  });

  // 点击其他地方关闭
  $(document).on('click', "#mobile-menu-drawer", function () {
    console.log($btn.attr('aria-expanded'), 11111);
    if ($btn.attr('aria-expanded') === 'true') {
      closeDrawer();
      e.stopPropagation();
    }
  });

  $(document).on('click',".drawer__close-button",function () {
    console.log(1111122);
    closeDrawer();
  });


  var $root = $('#mobile-menu-drawer');

  function toggleMenu($trigger) {
    console.log(11111);
    var targetId = $trigger.attr('aria-controls');
    if (!targetId) return;
    var $menu = $('#' + targetId);
    var isOpen = $menu.is('[open]');

    if (isOpen) {
      // 关闭
      $trigger.attr('aria-expanded', 'false');
      $menu.removeAttr('open').attr('aria-hidden', 'true');
    } else {
      // 打开前，先关闭其他
      $root.find('.mobile-nav__link[aria-expanded="true"]').each(function () {
        var $t = $(this);
        var $m = $('#' + $t.attr('aria-controls'));
        $t.attr('aria-expanded', 'false');
        $m.removeAttr('open').attr('aria-hidden', 'true');
      });
      // 打开当前
      $trigger.attr('aria-expanded', 'true');
      $menu.attr('open', '').attr('aria-hidden', 'false');
    }
  }

  // 点击触发
  $root.on('click', '.mobile-nav__link[aria-controls]', function (e) {
    e.preventDefault();
    toggleMenu($(this));
  });

  // 点击外部关闭
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.mobile-navigation, .mobile-menu').length) {
      $root.find('.mobile-nav__link[aria-expanded="true"]').each(function () {
        var $t = $(this);
        var $m = $('#' + $t.attr('aria-controls'));
        $t.attr('aria-expanded', 'false');
        $m.removeAttr('open').attr('aria-hidden', 'true');
      });
    }
  });

  // ESC 关闭
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      $root.find('.mobile-nav__link[aria-expanded="true"]').trigger('click');
    }
  });



}