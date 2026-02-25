const CACHE_NAME = 'badminton-cache-v1';
// キャッシュしたいファイルのリスト（自分の環境に合わせてCSSやJSのファイル名を追加してや）
const urlsToCache = [
  './',
  './index.html',
  // './style.css',  // CSSファイルがあればコメントアウト外して追加
  // './main.js',    // JSファイルがあればコメントアウト外して追加
  './icon-192.jpg',
  './icon-512.jpg'
];

// インストール時にファイルをキャッシュにぶち込む
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// ネットワークリクエストを横取りしてキャッシュを返す
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // キャッシュがあったらそれを返す、無ければネットワークへ取りに行く
        return response || fetch(event.request);
      })
  );
});
