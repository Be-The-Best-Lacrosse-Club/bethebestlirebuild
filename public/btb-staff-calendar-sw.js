"use strict";

// Keep this worker network-only. The staff schedule and password-protected API
// must always come from the live store rather than an offline cache.
self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf("/.netlify/functions/") === 0) return;

  event.respondWith(fetch(request));
});
