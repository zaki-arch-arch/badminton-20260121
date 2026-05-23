// ★ ここを 'v3', 'v4' と変えることでアプリがアップデートされるんや！
const CACHE_NAME = 'badminton-cache-v9'; // index.htmlをネットワーク優先に変更

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

// 【ネットワークリクエスト処理】
self.addEventListener('fetch', function(event) {
  const url = event.request.url;

  // index.htmlはネットワーク優先（常に最新UIを取得。オフライン時はキャッシュで代替）
  if (url.endsWith('/') || url.includes('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then(function(response) {
          // 取得できたらキャッシュにも保存しておく
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(function() {
          // オフラインの場合はキャッシュを返す
          return caches.match(event.request);
        })
    );
    return;
  }

  // 画像・アイコン等はキャッシュ優先（変更頻度が低いため）
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
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
