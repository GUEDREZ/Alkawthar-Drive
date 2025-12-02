/* ============================================================
   PREMIUM VTC IDF – SCRIPT FINAL ✅ 2025 (CORRIGÉ & OPTIMISÉ)
============================================================ */

// ✅ URL BACKEND (LOCAL POUR TEST, REMPLACER PAR URL PROD SI BESOIN)
// ✅ URL BACKEND (IMPORTANT : REMPLACER PAR L'URL DE RENDER EN PRODUCTION)
// Exemple : const BACKEND_URL = "https://votre-app-sur-render.com";
const BACKEND_URL = "https://alkawthar-drive.onrender.com"; // ✅ URL PRODUCTION RENDER

// ===================== VARIABLES GLOBALES =====================
let map, directionsService, directionsRenderer, iti;
let mapLoaded = false;
let paymentMethod = "Non défini";

// ===================== RÉFÉRENCES DOM =====================
const dom = {
  start: document.getElementById("start"),
  end: document.getElementById("end"),
  telephone: document.getElementById("telephone"),
  country: document.getElementById("country"),
  calculate: document.getElementById("calculate"),
  distance: document.getElementById("distance"),
  duree: document.getElementById("duree"),
  prixAffiche: document.getElementById("prix-affiche"),
  reserver: document.getElementById("reserver"),
  nom: document.getElementById("nom"),
  email: document.getElementById("email"),
  date: document.getElementById("date"),
  map: document.getElementById("map")
};

// ✅ TAUX DE CHANGE FIXE (1 EUR = 220 DZD)
const EXCHANGE_RATE = 220;

function convertDZDtoEUR(amountDZD) {
  return (amountDZD / EXCHANGE_RATE).toFixed(2);
}

// ===================== PAYS → CENTRAGE MAP =====================
const countryCenters = {
  // AFRIQUE
  dz: { lat: 28.0339, lng: 1.6596, zoom: 5 }, // Algérie
  tn: { lat: 33.8869, lng: 9.5375, zoom: 6 }, // Tunisie
  ma: { lat: 31.7917, lng: -7.0926, zoom: 5 }, // Maroc
  eg: { lat: 26.8206, lng: 30.8025, zoom: 5 }, // Égypte
  ly: { lat: 26.3351, lng: 17.2283, zoom: 5 }, // Libye
  sn: { lat: 14.4974, lng: -14.4524, zoom: 6 }, // Sénégal
  ci: { lat: 7.54, lng: -5.5471, zoom: 6 }, // Côte d'Ivoire
  za: { lat: -30.5595, lng: 22.9375, zoom: 5 }, // Afrique du Sud

  // MOYEN-ORIENT
  sa: { lat: 23.8859, lng: 45.0792, zoom: 5 }, // Arabie Saoudite
  ae: { lat: 23.4241, lng: 53.8478, zoom: 6 }, // Émirats
  qa: { lat: 25.3548, lng: 51.1839, zoom: 8 }, // Qatar
  kw: { lat: 29.3117, lng: 47.4818, zoom: 7 }, // Koweït
  jo: { lat: 30.5852, lng: 36.2384, zoom: 7 }, // Jordanie

  // EUROPE
  fr: { lat: 46.6033, lng: 1.8883, zoom: 5 }, // France
  de: { lat: 51.1657, lng: 10.4515, zoom: 5 }, // Allemagne
  es: { lat: 40.4637, lng: -3.7492, zoom: 5 }, // Espagne
  it: { lat: 41.8719, lng: 12.5674, zoom: 5 }, // Italie
  uk: { lat: 55.3781, lng: -3.4360, zoom: 5 }, // Royaume-Uni

  // ASIE
  tr: { lat: 38.9637, lng: 35.2433, zoom: 5 }, // Turquie
  my: { lat: 4.2105, lng: 101.9758, zoom: 5 }, // Malaisie
  id: { lat: -0.7893, lng: 113.9213, zoom: 4 } // Indonésie
};

// ===================== INIT MAP =====================
window.initMap = function () {
  if (!dom.map) return;

  // Si déjà chargée, on ne refait pas tout mais on resize
  if (mapLoaded && map) {
    google.maps.event.trigger(map, "resize");
    return;
  }

  const defaultCountry = dom.country?.value || "dz";
  const centerData = countryCenters[defaultCountry] || countryCenters['dz'];

  try {
    map = new google.maps.Map(dom.map, {
      center: { lat: centerData.lat, lng: centerData.lng },
      zoom: centerData.zoom,
      mapTypeId: "roadmap",
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    setAutocomplete(defaultCountry);
    mapLoaded = true;

    // Force un resize après un court délai pour éviter le gris
    setTimeout(() => {
      google.maps.event.trigger(map, "resize");
      map.setCenter({ lat: centerData.lat, lng: centerData.lng });
    }, 500);

  } catch (e) {
    console.error("Erreur initMap:", e);
  }
};

// ===================== AUTOCOMPLETE =====================
function setAutocomplete(countryCode) {
  if (!window.google || !window.google.maps || !window.google.maps.places) return;

  const options = { componentRestrictions: { country: countryCode } };

  // Nettoyer les anciens listeners si besoin (optionnel, ici on recrée)
  if (dom.start) new google.maps.places.Autocomplete(dom.start, options);
  if (dom.end) new google.maps.places.Autocomplete(dom.end, options);
}

// ===================== CHARGEMENT & EVENTS =====================
window.addEventListener("load", () => {
  // 1. Init Téléphone
  if (dom.telephone) {
    iti = window.intlTelInput(dom.telephone, {
      initialCountry: dom.country?.value || "dz",
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.1.1/js/utils.js"
    });
  }

  // 2. Init Map (si Google Maps est chargé)
  if (window.google && window.google.maps) {
    initMap();
  } else {
    // Retry if script is slow
    let attempts = 0;
    const checkGoogle = setInterval(() => {
      attempts++;
      if (window.google && window.google.maps) {
        initMap();
        clearInterval(checkGoogle);
      }
      if (attempts > 20) clearInterval(checkGoogle); // Stop après 10s
    }, 500);
  }

  // 3. Changement de pays
  if (dom.country) {
    dom.country.addEventListener("change", () => {
      const c = dom.country.value;

      // Update Map
      if (countryCenters[c] && map) {
        map.setCenter(countryCenters[c]);
        map.setZoom(countryCenters[c].zoom);
      }

      // Update Phone
      if (iti) iti.setCountry(c);

      // Update Autocomplete
      setAutocomplete(c);
    });
  }
});

// ===================== CALCUL PRIX =====================
function computePrice(km) {
  const PRIX_PAR_KM = 50; // Ajustez selon devise
  const MIN = 500;
  return Math.max(km * PRIX_PAR_KM, MIN).toFixed(0);
}

dom.calculate?.addEventListener("click", () => {
  if (!dom.start.value || !dom.end.value) return alert("Veuillez entrer le départ et l'arrivée / يرجى إدخال نقطتي الانطلاق والوصول");

  if (!directionsService) return alert("Erreur: Google Maps non chargé");

  directionsService.route(
    { origin: dom.start.value, destination: dom.end.value, travelMode: "DRIVING" },
    (res, status) => {
      if (status !== "OK") return alert("Intinéraire introuvable / لم يتم العثور على المسار");

      directionsRenderer.setDirections(res);

      const km = res.routes[0].legs[0].distance.value / 1000;
      const time = res.routes[0].legs[0].duration.text;
      const prix = computePrice(km);

      dom.distance.textContent = km.toFixed(1) + " km";
      dom.duree.textContent = time;
      dom.prixAffiche.textContent = prix + " DA"; // Ou devise dynamique

      // Notification Backend
      fetch(`${BACKEND_URL}/api/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depart: dom.start.value, arrivee: dom.end.value, prix: prix + " DA" })
      }).catch(err => console.error("Erreur backend:", err));
    }
  );
});

// ===================== RÉSERVATION =====================
dom.reserver?.addEventListener("click", () => {
  if (dom.prixAffiche.textContent === "—") return alert("Veuillez calculer le prix d'abord / احسب السعر أولاً");

  if (paymentMethod === "PayPal") {
    return alert("Veuillez utiliser le bouton PayPal ci-dessous pour payer / يرجى استخدام زر PayPal أدناه للدفع");
  }

  processReservation();
});

function processReservation() {
  const data = {
    nom: dom.nom.value,
    email: dom.email.value,
    telephone: dom.telephone.value,
    depart: dom.start.value,
    arrivee: dom.end.value,
    prix: dom.prixAffiche.textContent,
    payment: paymentMethod,
    date: dom.date.value || "Non spécifiée",
    passagers: document.getElementById("passagers").value
  };

  fetch(`${BACKEND_URL}/api/reservation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        alert("✅ Réservation envoyée avec succès / تم إرسال الحجز بنجاح");
        if (res.pdfUrl) {
          // Create a temporary link to download the PDF
          const link = document.createElement('a');
          link.href = `${BACKEND_URL}${res.pdfUrl}`;
          link.download = 'Reservation.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        alert("⚠️ Erreur lors de l'envoi / خطأ في الإرسال");
      }
    })
    .catch(err => {
      console.error(err);
      alert("❌ Erreur de connexion au serveur");
    });
}

// ===================== GESTION PAIEMENT =====================
const paymentButtons = document.querySelectorAll(".btn-payment");
const paypalSection = document.getElementById("paypal-section");

paymentButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // Reset styles
    paymentButtons.forEach(b => b.style.border = "none");
    btn.style.border = "2px solid #fff";

    if (btn.id === "payer-paypal") {
      paymentMethod = "PayPal";
      paypalSection.style.display = "block";
      renderPayPalButtons();
    } else if (btn.id === "payer-stripe") {
      paymentMethod = "Carte Edahabia / CIB";
      paypalSection.style.display = "none";
    } else {
      paymentMethod = "Espèces";
      paypalSection.style.display = "none";
    }
  });
});

// ===================== PAYPAL =====================
let paypalRendered = false;

function renderPayPalButtons() {
  if (paypalRendered) return;

  // Nettoyer le conteneur au cas où
  document.getElementById("paypal-button-container").innerHTML = "";

  paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'gold',
      shape: 'rect',
      label: 'paypal'
    },
    createOrder: function (data, actions) {
      // Extraire le montant numérique (ex: "1500 DA" -> 1500)
      const prixText = dom.prixAffiche.textContent.replace(" DA", "").trim();
      const amountDZD = parseFloat(prixText) || 0;

      // Conversion en EUR
      const amountEUR = convertDZDtoEUR(amountDZD);

      // Fallback si montant invalide (évite erreur PayPal)
      const finalAmount = amountEUR > 0 ? amountEUR : "10.00";

      console.log(`Montant: ${amountDZD} DA -> ${finalAmount} EUR`);

      return actions.order.create({
        purchase_units: [{
          amount: {
            value: finalAmount
          }
        }]
      });
    },
    onApprove: function (data, actions) {
      return actions.order.capture().then(function (details) {
        alert('Transaction complétée par ' + details.payer.name.given_name);
        // Appeler le backend pour enregistrer la réservation
        processReservation();
      });
    },
    onError: function (err) {
      console.error('PayPal Error:', err);
      alert("Erreur PayPal. Veuillez réessayer.");
    }
  }).render('#paypal-button-container');

  paypalRendered = true;
}

// ===================== SWITCH MODE =====================
window.switchMode = function (mode) {
  if (mode === "chauffeur") {
    window.location.href = "chauffeur.html";
  } else {
    window.location.href = "index.html";
  }
};
