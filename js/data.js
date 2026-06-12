// ============================================================
//  LANDGASTHOF OSTERMÜNCHEN — data.js
//  Dieses File wird von der Admin-App automatisch aktualisiert.
//  Alle Inhalte der Website werden von hier gesteuert.
// ============================================================

var LG_DATA = {

  // ---- WILLKOMMEN ----
  welcome: "Grüß Gott und herzlich willkommen im Landgasthof Ostermünchen. Wir wünschen Ihnen mit unserer gut-bürgerlichen Küche, mit regionalen Produkten, eine entspannte Zeit und einen guten Appetit!",

  wirtsleute: "Beppo & Margit mit unserem Team",

  // ---- ÖFFNUNGSZEITEN ----
  hours: [
    {
      label: "Do – Sa",
      days: "Donnerstag bis Samstag",
      time: "17:00 – 23:00 Uhr",
      note: "Küche bis 21:00 Uhr"
    },
    {
      label: "Sonntag",
      days: "Sonntag",
      time: "11:30 – 22:00 Uhr",
      note: "Küche 11:30–14:00 & 17:00–20:30 Uhr · Kaffee & Kuchen 14:00–17:00 Uhr"
    },
    {
      label: "Ruhetag",
      days: "Montag – Mittwoch",
      time: "Geschlossen",
      note: "Reservierungen nur telefonisch"
    }
  ],

  // ---- TAGESKARTE ----
  menu: [
    { name: "Bärlauch-Cremesuppe", desc: "klein / groß", price: "4,80 € / 7,80 €" },
    { name: "Gebratenes Zanderfilet", desc: "mit Bärlauch-Risotto", price: "18,80 €" },
    { name: "Schweinefilet im Speckmantel", desc: "mit Bärlauch-Spätzle und Rahmsoße", price: "18,80 €" },
    { name: "Schweinelende in Gorgonzolasoße", desc: "mit Bandnudeln", price: "16,80 €" },
    { name: "Rindertafelspitz", desc: "mit Meerrettichsoße und Salzkartoffeln", price: "17,80 €" }
  ],

  sundaySpecial: {
    active: true,
    name: "Sonntags-Braten",
    desc: "Schweinebraten mit Semmelknödel und Dunkelbiersoße",
    price: "13,80 €"
  },

  // ---- RÄUME ----
  rooms: [
    { name: "Gaststube", seats: "45 Plätze", img: "https://landgasthof-ostermuenchen.de/wp-content/uploads/go-x/u/c26fe07e-03f0-4e42-9fa0-7fb394592a1b/l0,t0,w2000,h1125/image-768x432.jpg" },
    { name: "Poststüberl", seats: "30 Plätze", img: "https://landgasthof-ostermuenchen.de/wp-content/uploads/go-x/u/9cc6e65c-ae5c-4050-b8c3-a3611f8b0a0e/l0,t0,w2000,h1125/image-768x432.jpg" },
    { name: "Wintergarten", seats: "35 Plätze", img: "https://landgasthof-ostermuenchen.de/wp-content/uploads/go-x/u/e72dbc30-ecdb-46b3-bee0-8df8246c5fa7/l0,t0,w2000,h1125/image-768x432.jpg" },
    { name: "Weinstube", seats: "110 Plätze", img: "https://landgasthof-ostermuenchen.de/wp-content/uploads/go-x/u/fbc2d99b-1586-4f70-a0f1-f0ae8051d338/l0,t14,w2000,h1125/image-768x432.jpg" },
    { name: "Saal", seats: "199 Plätze", img: "" }
  ],

  // ---- AKTUELLES ----
  news: [
    {
      date: "Juni 2025",
      title: "Biergarten geöffnet!",
      text: "Der Kastanienbiergarten ist ab sofort täglich bei schönem Wetter geöffnet. Wir freuen uns auf Euch!",
      img: "https://landgasthof-ostermuenchen.de/wp-content/uploads/go-x/u/da01e92e-08b1-4a91-9d43-51b1aa24670b/l0,t0,w1416,h2000/image-768x1085.jpg"
    }
  ],

  // ---- KONTAKT ----
  contact: {
    name: "Landgasthof Ostermünchen",
    address: "Rotter Straße 2, 83104 Tuntenhausen",
    tel: "08067 / 8815600",
    mobile: "0173 3420 688",
    email: "wirt@landgasthof-ostermuenchen.de"
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  if (typeof window.applyContent === 'function') {
    window.applyContent(LG_DATA);
  }
}
