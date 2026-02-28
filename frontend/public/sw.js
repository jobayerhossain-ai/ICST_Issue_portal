self.addEventListener('push', function (event) {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        console.error('Push data parse error:', e);
    }

    const title = data.title || 'আইসিএসটি পোর্টাল 📢';
    const options = {
        body: data.body || 'আপনার জন্য নতুন একটি আপডেট আছে!',
        icon: '/logo.png',
        badge: '/logo.png',
        data: data.url || '/',
        vibrate: [200, 100, 200],
        tag: 'icst-notification'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const urlToOpen = event.notification.data || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
