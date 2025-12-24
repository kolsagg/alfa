# Ürün Bağlamı (Product Context) - SubTracker

## Neden Bu Proje Var?

Günümüzde abonelik modelleri (SaaS, eğlence, hizmetler) hayatımızın her yerinde. Kullanıcılar neye, ne kadar ve ne zaman ödeme yaptıklarını takip etmekte zorlanıyorlar. SubTracker, bu karmaşayı sadeleştirmek ve finansal farkındalığı artırmak için var.

## Çözülen Problemler

- **Unutulan Ödemeler:** Kullanılmayan ama ödenmeye devam eden aboneliklerin fark edilmesi.
- **Bütçe Takibi:** Aylık ve yıllık toplam abonelik maliyetinin anlık görünümü.
- **Dağınık Bilgi:** Farklı platformlardaki aboneliklerin tek bir merkezi arayüzde toplanması.
- **Kaçırılan Bildirimler:** Uygulama kapalıyken bile (PWA sayesinde) veya tekrar açıldığında (Missed Recovery) önemli uyarıların iletilmesi.

## Kullanıcı Deneyimi (UX) Hedefleri

- **Hız:** Tek tıkla abonelik ekleme (Quick-Add).
- **Görsellik:** Modern OKLCH renk paleti ve dinamik animasyonlarla (CountdownHero) etkileyici bir Dashboard.
- **Güvenlik/Gizlilik:** Verilerin yerel olarak saklanması ve şeffaf yönetim.
- **Erişilebilirlik:** ARIA etiketleri ve ekran okuyucu desteğiyle kapsayıcı bir deneyim.

## Temel Senaryolar

1. **Yeni Abonelik Ekleme:** Hızlı listelerden veya özel formdan saniyeler içinde giriş.
2. **Dashboard Takibi:** En yakın ödemeye ne kadar kaldığını CountdownHero'dan görme.
3. **Bildirim Alma:** Ödeme gününden önce tarayıcı üzerinden uyarı alma.
4. **Kaçırılanları Kurtarma:** Uygulama açıldığında geçmişte kalan ama bildirilmemiş ödemeleri görme.
