(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  function byId(id) { return document.getElementById(id); }
  function qs(name) {
    var m = location.search.slice(1).split('&').filter(Boolean);
    for (var i = 0; i < m.length; i++) {
      var p = m[i].split('=');
      if (decodeURIComponent(p[0]) === name) return decodeURIComponent((p[1] || '').replace(/\+/g, ' '));
    }
    return '';
  }
  function showErr(msg) {
    var errEl = byId('sp-error');
    if (errEl) { errEl.textContent = msg || ''; errEl.style.display = msg ? 'block' : 'none'; }
  }
  function formatDate(s) {
    if (!s || s === 'Not specified') return s;
    try {
      var d = new Date(s);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (_) { return s; }
  }
  ready(function () {
    var form = byId('secure-portal-form');
    var wrap = byId('secure-portal-form-wrap');
    var result = byId('secure-portal-result');
    var errEl = byId('sp-error');
    var titleEl = byId('sp-result-title');
    var embedEl = byId('sp-embed');
    var downloadWrap = byId('sp-download-btn-wrap');
    var backLink = byId('sp-back');
    if (!form || !result) return;
    function showFile(data) {
      if (wrap) {
        var formElement = wrap.querySelector('.tekup-service-details-wrap');
        if (formElement) formElement.style.display = 'none';
      }
      if (result) {
        result.classList.remove('d-none');
        result.style.display = 'block';
      }
      var formSidebar = byId('sp-form-sidebar');
      if (formSidebar) formSidebar.classList.add('d-none');
      var sidebarInfo = byId('sp-file-info-sidebar');
      if (sidebarInfo) {
        sidebarInfo.classList.remove('d-none');
        sidebarInfo.style.display = 'block';
      }
      // Also show the file info sidebar in the result area
      var resultSidebarInfo = result ? result.querySelector('#sp-file-info-sidebar') : null;
      if (resultSidebarInfo) {
        resultSidebarInfo.classList.remove('d-none');
        resultSidebarInfo.style.display = 'block';
      }
      // Title is shown in breadcrumb, not needed here
      if (byId('sp-file-name')) byId('sp-file-name').textContent = data.fileName || (data.path ? data.path.split('/').pop() : 'N/A');
      if (byId('sp-file-size')) byId('sp-file-size').textContent = data.fileSize || 'Unknown';
      if (byId('sp-access-count')) byId('sp-access-count').textContent = (data.accessCount || 0) + (data.limitViews ? ' / ' + data.limitViews : '');
      if (byId('sp-download-allowed')) byId('sp-download-allowed').textContent = data.prohibitDownload ? 'No' : 'Yes';
      if (byId('sp-expires')) byId('sp-expires').textContent = data.expireAt ? formatDate(data.expireAt) : 'Never';
      var path = data.path || '';
      var ft = (data.fileType || '').toLowerCase();
      if (embedEl) {
        // Ensure path is relative to root
        var filePath = path.startsWith('/') ? path : '/' + path;
        if (ft === 'pdf' || /\.pdf$/i.test(path)) {
          embedEl.innerHTML = '<iframe src="' + filePath + '#toolbar=1" width="100%" height="calc(100vh - 50px)" style="border:1px solid #ddd; border-radius:4px; min-height: calc(100vh - 50px);" title="' + (data.name || '') + '"></iframe>';
        } else if (ft === 'image' || /\.(png|jpe?g|gif|webp)$/i.test(path)) {
          embedEl.innerHTML = '<img src="' + filePath + '" alt="' + (data.name || '') + '" class="img-fluid" style="max-width:100%; object-fit: contain; border-radius: 8px;">';
        } else {
          embedEl.innerHTML = '<iframe src="' + filePath + '" width="100%" height="120vh" style="border:1px solid #ddd; border-radius:4px; min-height: 900px;" title="' + (data.name || '') + '"></iframe>';
        }
      }
      if (downloadWrap) {
        downloadWrap.innerHTML = '';
        if (!data.prohibitDownload) {
          var btn = document.createElement('button');
          btn.className = 'tekup-default-btn';
          btn.textContent = 'Download';
          btn.onclick = function () {
            var a = document.createElement('a');
            a.href = filePath;
            a.download = (data.fileName || data.name || 'file').replace(/\s+/g, '_') + '.' + (path.split('.').pop() || '');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          };
          downloadWrap.appendChild(btn);
        }
      }
      if (backLink) backLink.href = 'secure-portal.html';
    }
    function doAccess(fileId, password) {
      if (!fileId || !password) { showErr('File ID and Password required'); return; }
      showErr('');
      fetch('/api/secure-portal/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: fileId.trim(), password: password })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.ok) {
            showFile(data);
          } else {
            showErr((data && data.error) || 'Access denied.');
          }
        })
        .catch(function () { showErr('Network error. Run the local server.'); });
    }
    var urlFileId = qs('file_id') || qs('fileId');
    var urlPassword = qs('password');
    if (urlFileId && urlPassword) {
      if (byId('sp-file-id')) byId('sp-file-id').value = urlFileId;
      if (byId('sp-password')) byId('sp-password').value = urlPassword;
      doAccess(urlFileId, urlPassword);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fileId = (byId('sp-file-id') || {}).value;
      var password = (byId('sp-password') || {}).value;
      doAccess(fileId, password);
    });
  });
})();
