// ★ ここを 'v2', 'v3' と変えることでアプリがアップデートされるんや！
const CACHE_NAME = 'badminton-cache-v2';

// キャッシュしたいファイルのリスト（君の環境に合わせてるで）
const urlsToCache = [
  './',
  './index.html',
  './icon_192.png',
  './icon_512.png',
  './manifest.json'
];

// 【インストール処理】ファイルをキャッシュにぶち込む
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('新しいキャッシュを保存したで！');
        return cache.addAll(urlsToCache);
      })
  );
});

// 【アクティベート処理】★ココが新機能！古いキャッシュをぶっ壊す！
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // 現在のバージョン(CACHE_NAME)以外の古いキャッシュは全部削除や！
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除したで:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 【ネットワークリクエスト処理】横取りしてキャッシュを返す
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // キャッシュがあったらそれを返す、無ければネットワークへ取りに行く
        return response || fetch(event.request);
      })
  );
});
