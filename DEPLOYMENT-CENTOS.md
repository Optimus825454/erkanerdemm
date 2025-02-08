# CentOS Hosting Deployment Rehberi

## 1. Sunucu Hazırlığı

```bash
# Nginx kurulumu
sudo yum install nginx

# Node.js kurulumu
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs

# PM2 kurulumu (Process Manager)
sudo npm install -g pm2
```

## 2. Proje Deploymentı

```bash
# Proje dizinine git
cd /var/www/
sudo mkdir erkanerdem.net
sudo chown -R $USER:$USER erkanerdem.net

# Projeyi yükle (ya git clone ya da sftp ile)
git clone https://github.com/yourusername/ErkanERDEM.net.git erkanerdem.net
cd erkanerdem.net

# Bağımlılıkları yükle
npm install

# Production build
npm run build
```

## 3. Nginx Konfigürasyonu

```nginx
# /etc/nginx/conf.d/erkanerdem.net.conf
server {
    listen 80;
    server_name erkanerdem.net www.erkanerdem.net;
    root /var/www/erkanerdem.net/dist;
    index index.html;

    # Gzip sıkıştırma
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache ayarları
    location ~* \.(js|css|png|jpg|jpeg|gif|webp|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # SPA için tüm route'ları index.html'e yönlendir
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Güvenlik başlıkları
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}
```

## 4. SSL Kurulumu (Let's Encrypt)

```bash
# Certbot kurulumu
sudo yum install epel-release
sudo yum install certbot python3-certbot-nginx

# SSL sertifikası alma
sudo certbot --nginx -d erkanerdem.net -d www.erkanerdem.net
```

## 5. Firewall Ayarları

```bash
# Firewall'u etkinleştir
sudo systemctl start firewalld
sudo systemctl enable firewalld

# HTTP ve HTTPS portlarını aç
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 6. Servis Başlatma

```bash
# Nginx'i yeniden başlat
sudo systemctl restart nginx

# Nginx'i otomatik başlatma
sudo systemctl enable nginx
```

## 7. Bakım ve İzleme

```bash
# Log dosyalarını izle
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Disk kullanımını kontrol et
df -h

# Sistem kaynaklarını izle
htop
```

## Otomatik Deployment Script

```bash
#!/bin/bash
# /var/www/erkanerdem.net/deploy.sh

cd /var/www/erkanerdem.net
git pull
npm install
npm run build
sudo systemctl restart nginx
```

## Periyodik Bakım Kontrol Listesi

- [ ] Log dosyalarının rotasyonu
- [ ] SSL sertifikası yenileme durumu
- [ ] Disk alanı kontrolü
- [ ] Yedekleme kontrolü
- [ ] Güvenlik güncellemeleri

## Yedekleme Stratejisi

```bash
# Otomatik yedekleme script'i
#!/bin/bash
backup_date=$(date +%Y%m%d)
backup_dir="/backup/erkanerdem.net"

# Proje dosyalarını yedekle
tar -czf $backup_dir/site_$backup_date.tar.gz /var/www/erkanerdem.net

# Eski yedekleri temizle (30 günden eski)
find $backup_dir -type f -mtime +30 -delete
```

## Sorun Giderme

1. Nginx hata kontrolü:
```bash
sudo nginx -t
```

2. SELinux ayarları:
```bash
# Eğer SELinux etkinse
sudo semanage fcontext -a -t httpd_sys_content_t "/var/www/erkanerdem.net/dist(/.*)?"
sudo restorecon -Rv /var/www/erkanerdem.net/dist
```

3. Dosya izinleri:
```bash
sudo chown -R nginx:nginx /var/www/erkanerdem.net/dist
sudo chmod -R 755 /var/www/erkanerdem.net/dist
```
