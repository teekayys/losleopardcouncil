(function () {
  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var page = document.querySelector('.lc-page');
    if (!page) return;

    var bar = document.createElement('div');
    bar.className = 'pgs-bar';
    bar.innerHTML =
      '<div class="pgs-inner">' +
      '<h2 class="pgs-title">ค้นหาในหน้านี้</h2>' +
      '<div class="pgs-input-wrap"><input type="text" id="pgs-input" placeholder="ค้นหาคำสำคัญ..."></div>' +
      '<div class="pgs-tabs" id="pgs-tabs"></div>' +
      '</div>';
    var meta = document.createElement('div');
    meta.className = 'pgs-meta';
    meta.innerHTML = '<span id="pgs-count"></span><button id="pgs-clear" class="pgs-clear-btn" style="display:none">ล้างการค้นหา</button>';

    page.parentNode.insertBefore(bar, page);
    page.parentNode.insertBefore(meta, page);

    var blocks = Array.prototype.slice.call(document.querySelectorAll('.lc-block'));
    var categories = [];
    var blockCategory = new Map();
    var currentCat = null;
    blocks.forEach(function (b) {
      var header = b.querySelector('.lc-section-header');
      if (header) {
        currentCat = header.textContent.trim();
        if (categories.indexOf(currentCat) === -1) categories.push(currentCat);
      }
      blockCategory.set(b, currentCat);
    });

    var tabsEl = document.getElementById('pgs-tabs');
    var allBtn = document.createElement('button');
    allBtn.className = 'pgs-tab active';
    allBtn.textContent = 'ทั้งหมด';
    allBtn.dataset.cat = '__all__';
    tabsEl.appendChild(allBtn);
    categories.forEach(function (c) {
      var btn = document.createElement('button');
      btn.className = 'pgs-tab';
      btn.textContent = c;
      btn.dataset.cat = c;
      tabsEl.appendChild(btn);
    });

    var state = { query: '', cat: '__all__' };
    var input = document.getElementById('pgs-input');
    var countEl = document.getElementById('pgs-count');
    var clearBtn = document.getElementById('pgs-clear');

    function clearHighlights(el) {
      var marks = el.querySelectorAll('mark.pgs-mark');
      marks.forEach(function (m) {
        var parent = m.parentNode;
        parent.replaceChild(document.createTextNode(m.textContent), m);
        parent.normalize();
      });
    }

    function highlightIn(el, q) {
      if (!q) return;
      var re = new RegExp('(' + escapeRegExp(q) + ')', 'gi');
      Array.prototype.forEach.call(el.childNodes, function (node) {
        if (node.nodeType === 3) {
          if (re.test(node.textContent)) {
            var span = document.createElement('span');
            span.innerHTML = node.textContent.replace(re, '<mark class="pgs-mark">$1</mark>');
            node.parentNode.replaceChild(span, node);
          }
        } else if (node.nodeType === 1) {
          highlightIn(node, q);
        }
      });
    }

    function apply() {
      var qRaw = state.query.trim();
      var q = qRaw.toLowerCase();
      var visibleTotal = 0;

      blocks.forEach(function (b) {
        var cat = blockCategory.get(b);
        var catMatch = state.cat === '__all__' || cat === state.cat || cat === null;
        var items = b.querySelectorAll('.lc-list li');
        var emptyNote = b.querySelector('.lc-empty-note');

        if (emptyNote) {
          b.style.display = catMatch && !q ? '' : 'none';
          return;
        }

        var anyVisible = false;
        items.forEach(function (li) {
          clearHighlights(li);
          var text = li.textContent.toLowerCase();
          var match = !q || text.indexOf(q) !== -1;
          li.style.display = match ? '' : 'none';
          if (match) {
            anyVisible = true;
            visibleTotal++;
            if (q) highlightIn(li, qRaw);
          }
        });

        b.style.display = catMatch && (items.length === 0 || anyVisible) ? '' : 'none';
      });

      countEl.textContent = q ? 'พบ ' + visibleTotal + ' รายการ' : '';
      clearBtn.style.display = q ? 'inline' : 'none';
    }

    input.addEventListener('input', function () {
      state.query = input.value;
      apply();
    });
    clearBtn.addEventListener('click', function () {
      input.value = '';
      state.query = '';
      apply();
    });
    tabsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.pgs-tab');
      if (!btn) return;
      state.cat = btn.dataset.cat;
      Array.prototype.forEach.call(tabsEl.querySelectorAll('.pgs-tab'), function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      apply();
    });
  });
})();
