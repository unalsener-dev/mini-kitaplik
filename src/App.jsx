// 1. İÇE AKTARMALAR (IMPORTS)
// React'in temel fonksiyonlarını ve state/effect hook'larını içe aktarıyoruz.
import React, { useState, useEffect } from 'react'; 
// Bileşenlere özel stilleri uygulamak için CSS dosyasını içe aktarıyoruz.
import './App.css'; 

// --- VERİ (DATA) ---
// Uygulamanın ana veri kaynağı. Normalde bir API'den gelir,
// burada sabit bir dizi olarak tanımlanmıştır.
const initialBooks = [
  { id: 1, baslik: "React'e Giriş", yazar: "D. Usta", kategori: "Web" },
  { id: 2, baslik: "İleri JavaScript", yazar: "S. Kılıç", kategori: "Web" },
  { id: 3, baslik: "Veri Yapıları", yazar: "A. Demir", kategori: "CS" },
  { id: 4, baslik: "Algoritmalar", yazar: "E. Kaya", kategori: "CS" },
  { id: 5, baslik: "UI/UX Temelleri", yazar: "N. Akın", kategori: "Tasarım" },
  { id: 6, baslik: "Python Programlama", yazar: "B. Yılmaz", kategori: "CS" },
];

// --- SABİT KATEGORİ LİSTESİ ---
// `initialBooks` dizisini kullanarak benzersiz (Set) bir kategori listesi oluşturuyoruz.
// 'Tümü' seçeneğini listenin başına ekliyoruz.
// Bu veri değişmeyeceği için component dışında tanımlanması performansı artırır.
const kategoriler = ['Tümü', ...new Set(initialBooks.map((book) => book.kategori))];


// --- YARDIMCI BİLEŞEN: StarIcon ---
// Favori butonu için kullanılacak SVG ikonunu bir React bileşeni olarak tanımlıyoruz.
// `isFilled` prop'una göre içinin dolu veya boş olmasını sağlıyoruz.
const StarIcon = ({ isFilled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={isFilled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// --- ANA BİLEŞEN: App ---
/**
 * App (Ana Bileşen)
 * Tüm uygulama state'ini (durumunu), mantığını ve alt bileşenleri barındırır.
 * "State'i Yukarı Taşıma" (Lifting State Up) prensibi burada uygulanmıştır.
 */
function App() {
  
  // 1. STATE TANIMLAMALARI (useState)
  // State'lerimizi `localStorage`'daki kayıtlı değerlerle başlatıyoruz.
  // Bu, sayfa yenilense bile kullanıcının son seçimlerinin hatırlanmasını sağlar.
  
  // Arama kutusunun metnini tutan state.
  const [aramaMetni, setAramaMetni] = useState(
    localStorage.getItem('aramaMetni') || '' // Kayıtlı değer yoksa boş string kullan.
  );
  
  // Kategori filtresinin o anki seçili değerini tutan state.
  const [kategori, setKategori] = useState(
    localStorage.getItem('kategori') || 'Tümü' // Kayıtlı değer yoksa 'Tümü' kullan.
  );

  // Favori olarak işaretlenen kitapların ID'lerini tutan dizi state'i.
  const [favoriIdler, setFavoriIdler] = useState(() => {
    // localStorage'dan veriyi oku.
    const kayitliFavoriler = localStorage.getItem('favoriIdler');
    // Veri varsa JSON.parse ile diziye çevir, yoksa boş dizi kullan.
    return kayitliFavoriler ? JSON.parse(kayitliFavoriler) : [];
  });

  // 2. VERİ KALICILIĞI (useEffect & localStorage)
  // State'ler her değiştiğinde, bu değişiklikleri localStorage'a kaydetmek
  // için `useEffect` hook'larını kullanıyoruz.
  
  // `aramaMetni` state'i her değiştiğinde çalışır.
  useEffect(() => {
    localStorage.setItem('aramaMetni', aramaMetni);
  }, [aramaMetni]); // Bağımlılık dizisi: Sadece aramaMetni değişince bu effect çalışır.

  // `kategori` state'i her değiştiğinde çalışır.
  useEffect(() => {
    localStorage.setItem('kategori', kategori);
  }, [kategori]); // Bağımlılık dizisi: Sadece kategori değişince bu effect çalışır.

  // `favoriIdler` state'i her değiştiğinde çalışır.
  useEffect(() => {
    // Dizileri/Objeleri localStorage'a kaydederken JSON.stringify kullanmak zorunludur.
    localStorage.setItem('favoriIdler', JSON.stringify(favoriIdler));
  }, [favoriIdler]); // Bağımlılık dizisi: Sadece favoriIdler değişince bu effect çalışır.

  // 3. FİLTRELEME MANTIĞI
  // State'ler (aramaMetni, kategori) değiştikçe, bu mantık her render'da
  // çalışarak `initialBooks` dizisini filtreler ve alt bileşenlere gönderir.
  
  // Hem arama metnine hem de seçili kategoriye göre kitapları filtrele.
  const filtrelenmisKitaplar = initialBooks
    .filter((book) =>
      // Başlığın, arama metnini (küçük harfe duyarsız) içerip içermediğini kontrol et.
      book.baslik.toLowerCase().includes(aramaMetni.toLowerCase())
    )
    .filter((book) =>
      // Kategori 'Tümü' ise bu filtreyi pas geç, değilse kategoriye göre filtrele.
      kategori === 'Tümü' ? true : book.kategori === kategori
    );

  // Sadece favori ID'leri içeren kitapları filtrele.
  const favoriKitaplar = initialBooks.filter((book) => 
    favoriIdler.includes(book.id)
  );

  // 4. CALLBACK FONKSİYONLARI
  // Alt bileşenlerde (input, select, button) bir olay olduğunda
  // `App` bileşenindeki state'leri güncelleyebilmek için bu fonksiyonları
  // `props` olarak alt bileşenlere geçiririz.
  
  // Arama input'u her değiştiğinde tetiklenir.
  const handleSearchChange = (event) => {
    setAramaMetni(event.target.value); // aramaMetni state'ini günceller.
  };

  // Kategori <select> etiketi her değiştiğinde tetiklenir.
  const handleKategoriChange = (event) => {
    setKategori(event.target.value); // kategori state'ini günceller.
  };

  // Favori Ekle/Çıkar butonuna tıklandığında tetiklenir.
  const handleToggleFavori = (bookId) => {
    setFavoriIdler((prevIdler) => {
      // Eğer ID zaten favorilerdeyse...
      if (prevIdler.includes(bookId)) {
        // O ID'yi listeden filtreleyerek çıkar (favoriden kaldır).
        return prevIdler.filter((id) => id !== bookId);
      } else {
        // Değilse, o ID'yi listenin sonuna ekle (favoriye ekle).
        return [...prevIdler, bookId];
      }
    });
  };

  // 5. RENDER (JSX ÇIKTISI)
  // Bileşenin ekranda nasıl görüneceğini tanımlar.
  return (
    <div className="container">
      <h1>Mini Kitaplık</h1>

      {/* Filtreleme araçlarını içeren bölüm */}
      <div className="filtre-cubugu">
        {/* AramaCubugu'na state'i (aramaMetni) ve callback'i (handleSearchChange) prop olarak geçirme */}
        <AramaCubugu
          aramaMetni={aramaMetni}
          onSearchChange={handleSearchChange}
        />
        {/* KategoriFiltre'ye state'i, callback'i ve kategori listesini prop olarak geçirme */}
        <KategoriFiltre
          kategori={kategori}
          onKategoriChange={handleKategoriChange}
          kategoriler={kategoriler}
        />
      </div>

      {/* Ana içerik alanı (Kitap listesi ve Favori paneli) */}
      <div className="icerik-alani">
        {/* Sol Sütun: Kitap Listesi */}
        <div className="kitap-listesi">
          {/* KitapListe'ye filtrelenmiş listeyi ve callback'i prop olarak geçirme */}
          <KitapListe
            kitaplar={filtrelenmisKitaplar}
            onToggleFavori={handleToggleFavori}
            favoriIdler={favoriIdler}
          />
        </div>
        
        {/* Sağ Sütun: Favori Paneli */}
        <div className="favori-paneli">
          <FavoriPaneli
            favoriKitaplar={favoriKitaplar}
            onToggleFavori={handleToggleFavori}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * AramaCubugu Bileşeni
 * Sadece arama input'unu render etmekten sorumludur.
 * State'i App'ten (parent) aldığı için bu bir "Kontrollü Bileşen"dir (Controlled Component).
 * Props'ları "object destructuring" ile alır.
 */
function AramaCubugu({ aramaMetni, onSearchChange }) {
  return (
    <div className="arama-kutusu">
      <input
        type="text" // Input tipini belirtmek her zaman iyidir.
        placeholder="Başlık veya yazar ara..."
        value={aramaMetni} // Input'un değeri daima App'teki state'e bağlıdır.
        onChange={onSearchChange} // Input değiştikçe App'teki state'i güncelleyen fonksiyonu çağırır.
        className="arama-input"
      />
    </div>
  );
}

/**
 * KategoriFiltre Bileşeni
 * Sadece kategori <select> dropdown'unu render eder.
 * Bu da "Kontrollü Bileşen"dir.
 */
function KategoriFiltre({ kategori, onKategoriChange, kategoriler }) {
  return (
    <div className="kategori-kutusu">
      <select
        value={kategori} // Select'in değeri daima App'teki state'e bağlıdır.
        onChange={onKategoriChange} // Seçim değiştikçe App'teki state'i günceller.
        className="kategori-select"
      >
        {/* 'kategoriler' dizisini map ile <option> elementlerine dönüştürür */}
        {kategoriler.map((kat) => (
          <option key={kat} value={kat}>
            {kat}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * KitapListe Bileşeni
 * Filtrelenmiş kitaplar listesini (props) alır ve .map() kullanarak
 * her kitap için bir <KitapKarti> bileşeni oluşturur.
 */
function KitapListe({ kitaplar, onToggleFavori, favoriIdler }) {
  return (
    // React Fragment (<>) kullanarak gereksiz <div> sarmalayıcısından kurtuluyoruz.
    <> 
      {/* Eğer filtrelenmiş kitap listesinde eleman varsa... */}
      {kitaplar.length > 0 ? (
        // Listeyi map ile dön
        kitaplar.map((book) => (
          <KitapKarti
            key={book.id} // Listelerde 'key' prop'u React için zorunludur ve benzersiz olmalıdır.
            kitap={book}
            onToggleFavori={onToggleFavori}
            isFavori={favoriIdler.includes(book.id)} // Bu kitabın favoride olup olmadığını kontrol et
          />
        ))
      ) : (
        // Eğer filtrelenmiş kitap listesi boşsa, "Sonuç yok" mesajı göster.
        <div className="sonuc-yok">
          Arama teriminize veya seçili kategoriye uygun sonuç bulunamadı.
        </div>
      )}
    </>
  );
}

/**
 * KitapKarti Bileşeni
 * Tek bir kitap kartının arayüzünü tanımlar.
 */
function KitapKarti({ kitap, onToggleFavori, isFavori }) {
  // `kitap` objesini "destructuring" ile açarak değişkenlere atıyoruz.
  const { id, baslik, yazar, kategori } = kitap;

  // Buton metnini favori durumuna göre dinamik olarak ayarla.
  const buttonText = isFavori ? 'Favoride' : 'Favori Ekle';

  return (
    <div className="kitap-karti">
      {/* Kitap Bilgileri */}
      <div>
        <h3>{baslik}</h3>
        <p>{yazar} · {kategori}</p>
      </div>
      
      {/* Favori Butonu */}
      <button
        type="button" // Butonun form göndermesini engellemek için tipini belirtiyoruz.
        className={`favori-button ${isFavori ? 'favoride' : 'favori-ekle'}`}
        onClick={() => onToggleFavori(id)} // Tıklandığında App'teki callback'i kitabın ID'si ile çağırır.
      >
        <StarIcon isFilled={isFavori} />
        {buttonText}
      </button>
    </div>
  );
}

/**
 * FavoriPaneli Bileşeni
 * Favori kitapların sayısını ve kısa bir listesini gösterir.
 */
function FavoriPaneli({ favoriKitaplar, onToggleFavori }) {
  return (
    <>
      {/* Favori sayısını dinamik olarak göster */}
      <h2>Favoriler ({favoriKitaplar.length})</h2>
      
      {/* Eğer favori listesi boş değilse listeyi göster */}
      {favoriKitaplar.length > 0 ? (
        <ul>
          {favoriKitaplar.map((book) => (
            <li key={book.id}>
              <p>{book.baslik}</p>
              <button
                type="button" // Butonun form göndermesini engellemek için tipini belirtiyoruz.
                className="kaldir-button"
                onClick={() => onToggleFavori(book.id)} // Tıklandığında favoriden çıkarır.
              >
                Kaldır
              </button>
            </li>
          ))}
        </ul>
      ) : (
        // Eğer favori listesi boşsa, mesaj göster.
        <p className="liste-bos-mesaj">Henüz favori kitabınız yok.</p>
      )}
    </>
  );
}

// `App` bileşenini, `main.jsx` dosyasında kullanılabilmesi için dışa aktarıyoruz.
export default App;