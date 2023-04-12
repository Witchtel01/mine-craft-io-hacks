self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    return;
//    event.respondWith(fetch(event.request));
});
