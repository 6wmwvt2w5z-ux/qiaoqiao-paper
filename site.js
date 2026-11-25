(function () {
  const EMAIL = '2818665148@qq.com';

  function money(n) {
    const v = Math.round(n * 10) / 10;
    return '¥' + (Number.isInteger(v) ? v : v.toFixed(1));
  }

  function toast(message) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  document.querySelectorAll('[data-copy-email]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(EMAIL);
        toast('邮箱已复制：' + EMAIL);
      } catch (e) {
        toast('邮箱：' + EMAIL);
      }
    });
  });

  // Active nav / service switch
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a, .switch-row a').forEach((a) => {
    const href = (a.getAttribute('href') || '').split('#')[0];
    if (href === page || (page === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Carousel
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const track = root.querySelector('.carousel-track');
    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const prev = root.querySelector('[data-car-prev]');
    const next = root.querySelector('[data-car-next]');
    const dotsWrap = root.querySelector('.car-dots');
    const count = root.querySelector('.car-count b');
    if (!track || slides.length < 2) return;

    let index = 0;
    const dots = [];
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', '跳到第 ' + (i + 1) + ' 项服务');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap && dotsWrap.appendChild(dot);
      dots.push(dot);
    });

    function slideLeft(i) {
      return slides[i].offsetLeft - track.offsetLeft;
    }

    function paint(i) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      dots.forEach((d, di) => d.classList.toggle('active', di === index));
      if (count) count.textContent = String(index + 1).padStart(2, '0');
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index === slides.length - 1;
    }

    function goTo(i) {
      const target = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slideLeft(target), behavior: 'smooth' });
      paint(target);
      const rect = root.getBoundingClientRect();
      if (rect.top < 70 || rect.bottom > window.innerHeight + 10) {
        root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    prev && prev.addEventListener('click', () => goTo(index - 1));
    next && next.addEventListener('click', () => goTo(index + 1));

    let scrollTimer;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        let nearest = 0;
        let min = Infinity;
        slides.forEach((s, i) => {
          const d = Math.abs(s.offsetLeft - track.offsetLeft - track.scrollLeft);
          if (d < min) { min = d; nearest = i; }
        });
        paint(nearest);
      }, 90);
    }, { passive: true });

    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
    });

    window.addEventListener('resize', () => {
      track.scrollTo({ left: slideLeft(index), behavior: 'auto' });
    });

    paint(0);
  });

  // Report tabs
  document.querySelectorAll('[data-tabs]').forEach((root) => {
    const buttons = Array.from(root.querySelectorAll('[data-tab]'));
    const panels = Array.from(root.querySelectorAll('[data-panel]'));
    if (!buttons.length || !panels.length) return;
    function show(name) {
      buttons.forEach((b) => b.classList.toggle('is-active', b.dataset.tab === name));
      panels.forEach((p) => p.classList.toggle('is-active', p.dataset.panel === name));
    }
    buttons.forEach((b) => b.addEventListener('click', () => show(b.dataset.tab)));
    show(buttons[0].dataset.tab);
  });

  // Quote widgets
  document.querySelectorAll('.quote-widget').forEach((w) => {
    const service = w.dataset.service || '论文服务';
    const unit = w.dataset.unit || '页';
    const rate = parseFloat(w.dataset.rate || '10');
    const min = parseFloat(w.dataset.min || '0');
    const per = parseFloat(w.dataset.per || '1');
    const qty = w.querySelector('.js-qty');
    const out = w.querySelector('.js-quote');
    const student = w.querySelector('.js-student');
    if (!qty || !out) return;

    function currentAmount() {
      const q = Math.max(0, parseFloat(qty.value) || 0);
      return Math.max(min, q / per * rate);
    }

    function calc() {
      const amount = currentAmount();
      out.textContent = money(amount);
      if (student) student.textContent = money(amount * 0.9);
    }

    qty.addEventListener('input', calc);
    calc();

    const order = w.querySelector('.js-order');
    order && order.addEventListener('click', () => {
      const q = Math.max(0, parseFloat(qty.value) || 0);
      const amount = currentAmount();
      const body = [
        '你好，我想咨询「' + service + '」。',
        '',
        '数量：' + q + ' ' + unit,
        '页面预估：' + money(amount) + '（学生 9 折约 ' + money(amount * 0.9) + '）',
        '姓名 / 学校：',
        '期望交付时间：',
        '文件或网盘链接：',
        '',
        '请帮我确认最终报价，谢谢。'
      ].join('\n');
      location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(service + ' 需求') + '&body=' + encodeURIComponent(body);
    });
  });

  // Static order buttons
  document.querySelectorAll('[data-order-service]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const service = btn.dataset.orderService;
      const body = [
        '你好，我想咨询「' + service + '」。',
        '',
        '姓名 / 学校：',
        '需求说明：',
        '文件或网盘链接：',
        '期望交付时间：',
        '',
        '请帮我确认报价，谢谢。'
      ].join('\n');
      location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(service + ' 需求') + '&body=' + encodeURIComponent(body);
    });
  });
})();
