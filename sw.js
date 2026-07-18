const CACHE_NAME = "jetskiblanes-v2";
const ASSETS = ["/", "/index.html"];

// Instalación — cachea los archivos principales
self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))

  );

  self.skipWaiting();

});

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys =>

      Promise.all(

        keys

          .filter(key => key !== CACHE_NAME)

          .map(key => caches.delete(key))

      )

    )

  );

  self.clients.claim();

});

self.addEventListener("fetch", event => {

  event.respondWith(

    fetch(event.request)

      .then(response => {

        const copy = response.clone();

        caches.open(CACHE_NAME).then(cache => {

          cache.put(event.request, copy);

        });

        return response;

      })

      .catch(() => caches.match(event.request))

  );

});

// Push — recibe la notificación y la muestra
self.addEventListener("push", event => {
  let data = { title: "JetSki Blanes", body: "Aviso de moto", icon: "/logo192.png" };
  try { data = event.data.json(); } catch(e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: "/logo192.png",
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,   // la notificación no desaparece sola
      tag: "jetski-alert",        // evita duplicados
    })
  );
});

// Click en la notificación — abre o enfoca la web
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes("azurestaticapps.net") && "focus" in c);
      if (existing) return existing.focus();
      return clients.openWindow("https://red-glacier-06f6fd710.7.azurestaticapps.net");
    })
  );
});
