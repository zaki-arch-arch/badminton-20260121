// ★ ここを 'v3', 'v4' と変えることでアプリがアップデートされるんや！
const CACHE_NAME = 'badminton-cache-v3'; // ついでにv3にしといたで！

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
    }).then(function() {
      // ★ワイからの追加分：更新後、すぐに新しいService Workerに画面のコントロールを握らせるプロの技や！
      return self.clients.claim();
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

// ★ワイからの追加分：画面からの「すぐ更新せえ！」という合図を受け取る耳や！
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('強制アップデートの指令を受け取ったで！');
    self.skipWaiting();
  }
});
