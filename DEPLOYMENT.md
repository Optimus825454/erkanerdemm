# Proje Deployment Rehberi

## Ön Hazırlık

1. Proje build işlemi:
```bash
npm run build
```
Bu komut `dist` klasörü oluşturacak ve production-ready dosyaları içerecektir.

## Hosting Seçenekleri

### 1. Vercel Deployment (Önerilen)

1. Vercel CLI kurulumu:
```bash
npm install -g vercel
```

2. Vercel'e deploy:
```bash
vercel
```

Ya da GitHub reposunu direkt Vercel'e bağlayarak otomatik deployment sağlayabilirsiniz.

### 2. Netlify Deployment

1. `netlify.toml` dosyası oluşturun:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Netlify CLI ile deploy:
```bash
npm install -g netlify-cli
netlify deploy
```

### 3. GitHub Pages Deployment

1. `vite.config.ts` dosyasını güncelleyin:
```ts
export default defineConfig({
  base: '/ErkanERDEM.net/',
  // ...diğer konfigürasyonlar
})
```

2. `deploy.yml` workflow dosyası oluşturun:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install and Build
        run: |
          npm install
          npm run build
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@4.1.5
        with:
          branch: gh-pages
          folder: dist
```

## Environment Variables

Production ortamı için gerekli environment variable'ları ayarlayın:

```env
VITE_API_URL=https://api.example.com
VITE_GA_ID=UA-XXXXXXXXX-X
```

## SSL ve Domain Ayarları

1. SSL sertifikası (Let's Encrypt önerilen)
2. Domain DNS ayarları:
   - A Record: @ -> Hosting IP
   - CNAME: www -> @
   - CNAME: * -> @

## Performans Optimizasyonu

Deploy öncesi kontrol listesi:

- [ ] Tüm resimlerin optimize edilmesi
- [ ] Lazy loading implementasyonu
- [ ] Code splitting kontrolü
- [ ] Meta tag'lerin düzenlenmesi
- [ ] Favicon setinin hazırlanması

## Monitoring ve Analytics

1. Google Analytics kurulumu
2. Error tracking (Sentry önerilen)
3. Performance monitoring

## Güvenlik Kontrolleri

- [ ] Content Security Policy (CSP) ayarları
- [ ] CORS politikalarının kontrolü
- [ ] Rate limiting implementasyonu
- [ ] Security headers kontrolü

## Cache Stratejisi

```nginx
# Nginx örnek cache configuration
location ~* \.(js|css|png|jpg|jpeg|gif|webp|svg|ico)$ {
    expires 1y;
    add_header Cache-Control "public, no-transform";
}
```

## Deployment Sonrası Kontroller

1. Lighthouse skorlarının kontrolü
2. Cross-browser testing
3. Mobile responsiveness testing
4. 404 sayfası kontrolü
5. Form ve API endpoint'lerinin kontrolü

## Rollback Planı

Acil durumlar için rollback prosedürü:

1. Önceki çalışan versiyonu belirle
2. Hızlı rollback için script hazırla
3. Backup stratejisi oluştur

## Yardımcı Kaynaklar

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/docs/en/v6/getting-started/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
