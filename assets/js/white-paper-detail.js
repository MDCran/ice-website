(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  function qs(name) {
    var m = location.search.slice(1).split('&').filter(Boolean);
    for (var i = 0; i < m.length; i++) {
      var p = m[i].split('=');
      if (decodeURIComponent(p[0]) === name) return decodeURIComponent((p[1] || '').replace(/\+/g, ' '));
    }
    return '';
  }
  ready(function () {
    var id = qs('id');
    if (!id) return; // No id parameter, show listing view
    var list = window.RESOURCES || window.WHITE_PAPERS || [];
    var paper = list.filter(function (p) { return p.id === id; })[0];
    var titleEl = document.getElementById('wp-title');
    var breadEl = document.getElementById('wp-breadcrumb');
    var embedEl = document.getElementById('wp-embed');
    var downloadBtn = document.getElementById('wp-download');
    var copyBtn = document.getElementById('wp-copy');
    var copyMsg = document.getElementById('wp-copy-msg');
    var detailView = document.getElementById('resource-detail-view');
    var listingView = document.getElementById('white-papers-grid');
    
    // Show detail view, hide listing view
    if (detailView) detailView.classList.remove('d-none');
    var listingViewSection = document.getElementById('resources-listing-view');
    if (listingViewSection) listingViewSection.style.display = 'none';
    // Update breadcrumb - change "Resources" to a link and add current page
    var breadcrumbList = breadEl ? breadEl.closest('ul') : null;
    if (breadcrumbList && breadEl) {
      breadEl.innerHTML = '<a href="resources.html">Resources</a>';
      breadEl.removeAttribute('aria-current');
      var newCurrent = document.createElement('li');
      newCurrent.setAttribute('aria-current', 'page');
      newCurrent.id = 'wp-breadcrumb';
      breadcrumbList.appendChild(newCurrent);
      breadEl = newCurrent;
    }
    
    if (!paper) {
      if (titleEl) titleEl.textContent = 'Resource not found';
      if (breadEl) breadEl.textContent = 'Not found';
      if (embedEl) embedEl.innerHTML = '<p><a href="resources.html">Back to Resources</a></p>';
      return;
    }
    var name = paper.name || 'Resource';
    if (titleEl) titleEl.textContent = name;
    if (breadEl) breadEl.textContent = name;
    document.title = name + ' | International Computer Exchange';
    var file = paper.file || paper.cover;
    var fileType = (paper.fileType || '').toLowerCase();
    if (embedEl && file) {
      if (fileType === 'pdf' || /\.pdf$/i.test(file)) {
        embedEl.innerHTML = '<iframe src="' + file + '#toolbar=1" width="100%" height="calc(100vh - 50px)" style="border:1px solid #ddd; border-radius:4px; min-height: calc(100vh - 50px);" title="' + (paper.name || '') + '"></iframe>';
      } else if (fileType === 'image' || /\.(png|jpe?g|gif|webp)$/i.test(file)) {
        embedEl.innerHTML = '<img src="' + file + '" alt="' + (paper.name || '') + '" class="img-fluid rounded" style="max-width:100%;">';
      } else {
        embedEl.innerHTML = '<iframe src="' + file + '" width="100%" height="90vh" style="border:1px solid #ddd; border-radius:4px;" title="' + (paper.name || '') + '"></iframe>';
      }
    }
    var fileNameEl = document.getElementById('wp-file-name');
    if (fileNameEl && file) {
      fileNameEl.textContent = file.split('/').pop() || 'N/A';
    }
    var fileSizeEl = document.getElementById('wp-file-size');
    if (fileSizeEl) {
      fileSizeEl.textContent = 'Loading...';
      // Try to get file size via fetch
      fetch(file, { method: 'HEAD' }).then(function(response) {
        if (response.ok) {
          var size = parseInt(response.headers.get('content-length') || '0');
          if (size > 0) {
            var sizeStr = size < 1024 ? size + ' B' : size < 1048576 ? (size / 1024).toFixed(1) + ' KB' : (size / 1048576).toFixed(1) + ' MB';
            if (fileSizeEl) fileSizeEl.textContent = sizeStr;
          } else {
            if (fileSizeEl) fileSizeEl.textContent = 'Unknown';
          }
        } else {
          if (fileSizeEl) fileSizeEl.textContent = 'Unknown';
        }
      }).catch(function() {
        if (fileSizeEl) fileSizeEl.textContent = 'Unknown';
      });
    }
    if (downloadBtn && file) {
      downloadBtn.onclick = function () {
        var a = document.createElement('a');
        a.href = file;
        a.download = (paper.name || 'resource').replace(/\s+/g, '_') + '.' + (file.split('.').pop() || 'pdf');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
    }
    if (copyBtn) {
      copyBtn.onclick = function () {
        var url = location.origin + location.pathname + '?id=' + encodeURIComponent(paper.id);
        if (typeof navigator.clipboard !== 'undefined' && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            if (copyMsg) { copyMsg.style.display = 'block'; copyMsg.textContent = 'Link copied!'; setTimeout(function () { copyMsg.style.display = 'none'; }, 2000); }
          });
        } else {
          var inp = document.createElement('input');
          inp.value = url;
          document.body.appendChild(inp);
          inp.select();
          document.execCommand('copy');
          document.body.removeChild(inp);
          if (copyMsg) { copyMsg.style.display = 'block'; copyMsg.textContent = 'Link copied!'; setTimeout(function () { copyMsg.style.display = 'none'; }, 2000); }
        }
      };
    }
  });
})();
