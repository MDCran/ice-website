(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  function renderGrid(list) {
    var el = document.getElementById('white-papers-grid') || document.getElementById('resources-grid');
    if (!el) return;
    var q = (document.getElementById('wp-search') || {}).value || '';
    var filtered = (list || []).filter(function (p) {
      return !q || (p.name || '').toLowerCase().indexOf(q.toLowerCase()) >= 0;
    });
    el.innerHTML = filtered.length ? filtered.map(function (p) {
      var href = 'resources.html?id=' + encodeURIComponent(p.id);
      var img = (p.cover || p.file) ? '<img src="' + (p.cover || p.file) + '" alt="">' : '';
      return '<div class="col-xl-4 col-md-6" data-aos="fade-up"><div class="tekup-blog-wrap">' +
        '<a href="' + href + '"><div class="tekup-blog-thumb">' + img + '</div></a>' +
        '<div class="tekup-blog-content">' +
        '<div class="tekup-blog-meta"><ul><li>Resource</li><li>' + (p.year || '') + '</li></ul></div>' +
        '<a href="' + href + '"><h3>' + (p.name || '') + '</h3></a>' +
        '<a class="tekup-blog-btn" href="' + href + '">View <i class="ri-arrow-right-up-line"></i></a></div></div></div>';
    }).join('') : '<div class="col-12"><p class="text-muted">No resources match your search.</p></div>';
  }
  ready(function () {
    var list = window.RESOURCES || window.WHITE_PAPERS || [];
    var searchEl = document.getElementById('wp-search');
    if (searchEl) {
      searchEl.addEventListener('input', function () { renderGrid(list); });
      searchEl.addEventListener('keyup', function (e) { if (e.key === 'Enter') renderGrid(list); });
    }
    renderGrid(list);
  });
})();
