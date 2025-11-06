# 🚢 Global Freight Transport & Management System

Muğla, Türkiye merkezli küresel nakliye ve lojistik yönetim sistemi. Bu proje, özellikle taze yaban mersini ve diğer ürünlerin dünya çapında taşınması için gelişmiş bir web tabanlı lojistik çözümüdür.

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Proje Yapısı](#proje-yapısı)
- [Sistem Özellikleri](#sistem-özellikleri)
- [Ekran Görüntüleri](#ekran-görüntüleri)

## ✨ Özellikler

### 🎯 Temel Özellikler
- **Akıllı Konteyner Optimizasyonu**: Gelişmiş algoritmalar ile maksimum konteyner kullanımı
- **Gerçek Zamanlı Takip**: Sipariş durumu anlık takip sistemi
- **Şeffaf Fiyatlandırma**: Mesafe ve konteyner tipine göre otomatik fiyat hesaplama
- **Envanter Yönetimi**: Taze, dondurulmuş ve organik ürünler için stok takibi
- **Filo Yönetimi**: 3 gemi ve 4 kamyon ile etkin araç yönetimi
- **Yönetici Paneli**: Kapsamlı işletme yönetim araçları

### 🚛 Konteyner Tipleri
- **Küçük Konteyner**: 2.000 kg kapasiteli, ₺5/km
- **Orta Konteyner**: 5.000 kg kapasiteli, ₺8/km (En popüler)
- **Büyük Konteyner**: 10.000 kg kapasiteli, ₺12/km

### 🌍 Destinasyonlar
Sistem, 18 farklı ülkeye otomatik mesafe hesaplama özelliği ile sevkiyat yapabilmektedir:
- Avrupa: Yunanistan, Sırbistan, Almanya, Fransa, İspanya, İngiltere
- Orta Doğu: Mısır, Azerbaycan
- Asya: Hindistan, Bangladeş, Çin, Güney Kore, Japonya, Filipinler, Endonezya
- Amerika: ABD, Meksika

## 🛠️ Teknolojiler

- **HTML5**: Yapısal içerik
- **CSS3**: Modern ve responsive tasarım
- **JavaScript (ES6+)**: İstemci tarafı programlama
- **LocalStorage**: Veri depolama
- **Responsive Design**: Mobil uyumlu tasarım

## 📦 Kurulum

1. **Projeyi klonlayın veya indirin:**
```bash
git clone https://github.com/ozaykkaya/ozaykaya220709055.git
```

2. **Proje dizinine gidin:**
```bash
cd ozaykaya220709055
```

3. **Tarayıcıda açın:**
   - `index.html` dosyasını herhangi bir modern web tarayıcısında açın
   - Ya da bir yerel sunucu kullanın:
   ```bash
   # Python ile
   python -m http.server 8000
   
   # Node.js ile (http-server)
   npx http-server
   ```

## 🚀 Kullanım

### Müşteri İşlemleri

#### 1. Sevkiyat Oluşturma
- `Create Shipment` sayfasına gidin
- Müşteri bilgilerini girin (isim, e-posta, telefon)
- Ürün kategorisini seçin (Taze, Dondurulmuş, Organik)
- Ürün ağırlığını kg cinsinden girin
- Hedef şehir ve ülkeyi seçin
- Konteyner tipini seçin
- Sistem otomatik olarak:
  - Mesafe hesaplar
  - Fiyat hesaplar
  - Stok kontrolü yapar
  - Tahmini teslimat süresini hesaplar

#### 2. Sipariş Takibi
- `Track Order` sayfasına gidin
- Sipariş numaranızı girin (örn: SHP-1730000000000)
- Aşağıdaki bilgileri görüntüleyin:
  - Sipariş detayları
  - Mevcut durum
  - Tahmini teslimat tarihi
  - Sevkiyat zaman çizelgesi

### Yönetici İşlemleri

#### Yönetici Paneli Girişi
- `Admin Portal` bağlantısına tıklayın
- Varsayılan kullanıcı adı: `admin`
- Varsayılan şifre: `admin123`

#### Yönetici Özellikleri
1. **Kontrol Paneli**: Tüm istatistikleri görüntüleme
2. **Sevkiyat Yönetimi**: Tüm siparişleri görüntüleme ve yönetme
3. **Konteyner Optimizasyonu**: Akıllı konteyner paketleme
4. **Envanter Yönetimi**: Stok takibi ve yenileme
5. **Filo Yönetimi**: Gemi ve kamyon durumu
6. **Finansal Rapor**: Gelir-gider analizi

## 📁 Proje Yapısı

```
ozaykaya220709055/
│
├── index.html              # Ana sayfa
├── create-shipment.html    # Sevkiyat oluşturma sayfası
├── tracking.html           # Sipariş takip sayfası
├── result.html            # Sipariş sonuç sayfası
├── admin-login.html       # Yönetici giriş sayfası
├── admin-dashboard.html   # Yönetici kontrol paneli
├── README.md              # Proje dokümantasyonu
│
├── css/
│   └── styles.css         # Tüm stil tanımlamaları
│
└── js/
    ├── main.js            # Ana JavaScript fonksiyonları
    ├── data.js            # Veri yönetimi ve yapılandırma
    ├── shipment.js        # Sevkiyat oluşturma mantığı
    ├── tracking.js        # Sipariş takip mantığı
    ├── result.js          # Sonuç sayfası mantığı
    ├── login.js           # Giriş doğrulama
    └── admin.js           # Yönetici panel fonksiyonları
```

## 🔧 Sistem Özellikleri

### Konteyner Optimizasyon Algoritması
Sistem, **First-Fit Decreasing (FFD)** algoritması kullanarak konteyner optimizasyonu yapar:
1. Bekleyen sevkiyatlar ağırlığa göre sıralanır (büyükten küçüğe)
2. Her sevkiyat mevcut konteynerlere yerleştirilmeye çalışılır
3. Uygun konteyner yoksa yeni konteyner oluşturulur
4. Konteyner %80 doluluk oranına ulaştığında "Taşımaya Hazır" durumuna geçer

### Mesafe Hesaplama
- Muğla'dan 18 farklı dünya kentine önceden tanımlanmış mesafeler
- Bilinmeyen şehirler için varsayılan 2000 km mesafe

### Fiyat Hesaplama
```
Toplam Fiyat = Mesafe (km) × Konteyner Oranı (₺/km)
```

### Teslimat Süresi
```
Teslimat Süresi = Mesafe ÷ 500 km/gün (yukarı yuvarlama)
```

### Envanter Sistemi
- **Taze**: 4.500 kg başlangıç, 2.000 kg minimum stok
- **Dondurulmuş**: 1.200 kg başlangıç, 1.000 kg minimum stok
- **Organik**: 8.000 kg başlangıç, 2.500 kg minimum stok

### Filo Bilgileri

**Gemiler:**
- BlueSea: 100.000 kg kapasiteli
- OceanStar: 120.000 kg kapasiteli
- AegeanWind: 90.000 kg kapasiteli

**Kamyonlar:**
- RoadKing: 10.000 kg kapasiteli
- FastMove: 12.000 kg kapasiteli
- CargoPro: 9.000 kg kapasiteli
- HeavyLoad: 15.000 kg kapasiteli

## 💾 Veri Depolama

Sistem `localStorage` kullanarak aşağıdaki verileri saklar:
- `globalfreight_shipments`: Tüm sevkiyat kayıtları
- `globalfreight_containers`: Konteyner bilgileri
- `globalfreight_inventory`: Envanter durumu
- `globalfreight_fleet`: Filo durumu

## 🎨 Tasarım Özellikleri

- Modern ve kullanıcı dostu arayüz
- Responsive tasarım (mobil, tablet, desktop)
- Renk paleti: Mavi tonları (#2c3e50, #3498db)
- Tipografi: System font stack
- Smooth scrolling ve animasyonlar

## 🔐 Güvenlik

**Not**: Bu proje eğitim amaçlıdır. Gerçek bir üretim ortamında kullanmak için:
- Şifreleri hash'lemek için backend implementasyonu gereklidir
- SSL/TLS sertifikası kullanılmalıdır
- API güvenliği sağlanmalıdır
- XSS ve CSRF koruması eklenmelidir

## 📊 Finansal Sistem

Yönetici paneli otomatik olarak şunları hesaplar:
- Toplam gelir (tamamlanan sevkiyatlardan)
- Filo giderleri (yakıt, mürettebat, bakım)
- Diğer giderler
- Net gelir
- Vergi (%20)
- Vergi sonrası kar

## 🌟 Gelecek Geliştirmeler

- [ ] Backend API entegrasyonu
- [ ] Gerçek zamanlı GPS takibi
- [ ] E-posta bildirimleri
- [ ] PDF rapor oluşturma
- [ ] Çoklu dil desteği
- [ ] Ödeme entegrasyonu
- [ ] Mobil uygulama

## 👨‍💻 Geliştirici

**Öğrenci Numarası**: 220709055  
**Proje**: Global Freight Transport & Management System  
**Tarih**: 2025

## 📝 Lisans

Bu proje eğitim amaçlıdır ve öğrenci projesi olarak geliştirilmiştir.

## 📞 İletişim

📍 Merkez Ofis: Muğla, Turkey  
📧 E-posta: info@globalfreight.com  
📞 Telefon: +90 252 XXX XXXX

---

**© 2025 Global Freight Transport & Management System. Tüm hakları saklıdır.**


