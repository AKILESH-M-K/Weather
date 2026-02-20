/* =====================================================
   WearCast v2 — Full Interactive Script
   ===================================================== */

const API_KEY = 'be4bae67b0cb00edba8fd405fc02d8ba';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// ─── State ───────────────────────────────────────────
let currentCity = '';
let currentWeatherData = null;
let currentForecastData = null;
let checklistState = {};
let favourites = JSON.parse(localStorage.getItem('wc_favs') || '[]');
let selectedOutfitPieces = {};

// ─── Data: Outfit Categories ──────────────────────────
const OUTFIT_DATA = {
  sunny_hot: {
    vibe: "It's scorching out there — go ultra-light, stay hydrated, and embrace the kurta life.",
    top: [
      { id:'kurta',   icon:'👘', name:'Cotton Kurta',    desc:'Breathable & traditional', default: true },
      { id:'polo',    icon:'👕', name:'Polo Shirt',      desc:'Smart casual option' },
      { id:'linen',   icon:'🎽', name:'Linen Shirt',     desc:'Cool & airy' }
    ],
    bottom: [
      { id:'shorts',  icon:'🩳', name:'Shorts',          desc:'Maximum airflow', default: true },
      { id:'chinos',  icon:'👖', name:'Light Chinos',    desc:'Polished look' },
      { id:'joggers', icon:'🩱', name:'Joggers',         desc:'Comfort first' }
    ],
    shoes: [
      { id:'sandals', icon:'🩴', name:'Sandals',         desc:'Feet stay cool', default: true },
      { id:'canvas',  icon:'👟', name:'Canvas Shoes',    desc:'Classic & breezy' },
    ],
    acc: [
      { id:'cap',     icon:'🧢', name:'Cap/Hat',         desc:'Sun protection', default: true },
      { id:'shades',  icon:'🕶️', name:'Sunglasses',     desc:'Eye protection' },
      { id:'bottle',  icon:'🧴', name:'Sunscreen',       desc:'SPF 50+' }
    ]
  },
  sunny_warm: {
    vibe: "Beautiful campus weather today — cotton, colours, and comfort is your recipe.",
    top: [
      { id:'tshirt',  icon:'👕', name:'Cotton T-Shirt',  desc:'Classic choice', default: true },
      { id:'shirt',   icon:'🎽', name:'Casual Shirt',    desc:'Slightly dressier' },
      { id:'tank',    icon:'🩱', name:'Tank Top',        desc:'For the bold ones' }
    ],
    bottom: [
      { id:'jeans',   icon:'👖', name:'Jeans',           desc:'Always works', default: true },
      { id:'shorts',  icon:'🩳', name:'Shorts',          desc:'Chill vibes' },
      { id:'chinos',  icon:'👔', name:'Chinos',          desc:'Sharp & easy' }
    ],
    shoes: [
      { id:'snkr',    icon:'👟', name:'Sneakers',        desc:'All-day comfort', default: true },
      { id:'loafer',  icon:'🥿', name:'Loafers',         desc:'Low-effort chic' }
    ],
    acc: [
      { id:'bag',     icon:'🎒', name:'Backpack',        desc:'Campus essential', default: true },
      { id:'shades',  icon:'🕶️', name:'Sunglasses',     desc:'Cool factor' }
    ]
  },
  cloudy_mild: {
    vibe: "Cloudy skies mean cozy vibes — layer up smartly, a jacket you can remove is your best friend.",
    top: [
      { id:'hoodie',  icon:'🧥', name:'Hoodie',          desc:'Cosy & campus-ready', default: true },
      { id:'sweat',   icon:'👕', name:'Sweatshirt',      desc:'Relaxed look' },
      { id:'lshirt',  icon:'🎽', name:'Full-sleeve Tee', desc:'Light layering' }
    ],
    bottom: [
      { id:'jeans',   icon:'👖', name:'Jeans',           desc:'Classic go-to', default: true },
      { id:'joggers', icon:'🩱', name:'Track Pants',     desc:'Soft & comfy' }
    ],
    shoes: [
      { id:'snkr',    icon:'👟', name:'Sneakers',        desc:'Reliable', default: true },
      { id:'boots',   icon:'🥾', name:'Boots',           desc:'A little mood' }
    ],
    acc: [
      { id:'bag',     icon:'🎒', name:'Backpack',        desc:'Campus essential', default: true },
      { id:'stole',   icon:'🧣', name:'Light Stole',     desc:'For AC classrooms' }
    ]
  },
  rainy: {
    vibe: "Rain is coming — make waterproof your aesthetic. Puddles are not your friend today.",
    top: [
      { id:'raincoat',icon:'🧥', name:'Raincoat',        desc:'Full waterproof cover', default: true },
      { id:'jacket',  icon:'🫧', name:'Hooded Jacket',   desc:'Casual but covered' }
    ],
    bottom: [
      { id:'jeans',   icon:'👖', name:'Dark Jeans',      desc:'Hide the splashes', default: true },
      { id:'track',   icon:'🩱', name:'Track Pants',     desc:'Quick-dry fabric' }
    ],
    shoes: [
      { id:'wboots',  icon:'🥾', name:'Waterproof Boots',desc:'Rain armour', default: true },
      { id:'flipflop',icon:'🩴', name:'Flip-Flops',      desc:'Embrace it', }
    ],
    acc: [
      { id:'umbrella',icon:'☂️', name:'Umbrella',        desc:'Absolute must', default: true },
      { id:'bag',     icon:'🎒', name:'Sealed Backpack', desc:'Keep books dry' }
    ]
  },
  cold: {
    vibe: "Chilly campus morning — layer up, the AC classrooms will feel positively arctic.",
    top: [
      { id:'jacket',  icon:'🧥', name:'Light Jacket',    desc:'Warm & stylish', default: true },
      { id:'sweater', icon:'🧶', name:'Sweater',         desc:'Classic warmth' },
      { id:'hoodie',  icon:'👕', name:'Thick Hoodie',    desc:'Cosy layer' }
    ],
    bottom: [
      { id:'jeans',   icon:'👖', name:'Jeans',           desc:'Warmth & style', default: true },
      { id:'cords',   icon:'👔', name:'Corduroys',       desc:'Extra insulation' }
    ],
    shoes: [
      { id:'snkr',    icon:'👟', name:'Closed Sneakers', desc:'Keep toes warm', default: true },
      { id:'boots',   icon:'🥾', name:'Boots',           desc:'Maximum warmth' }
    ],
    acc: [
      { id:'stole',   icon:'🧣', name:'Scarf/Stole',     desc:'AC proof', default: true },
      { id:'bag',     icon:'🎒', name:'Backpack',        desc:'Campus essential' }
    ]
  }
};

// ─── Data: Pack Checklists ─────────────────────────────
const PACK_LISTS = {
  sunny_hot: [
    { id:'bottle', emoji:'💧', label:'Water Bottle' },
    { id:'sunscreen', emoji:'🧴', label:'Sunscreen' },
    { id:'cap', emoji:'🧢', label:'Cap / Hat' },
    { id:'shades', emoji:'🕶️', label:'Sunglasses' },
    { id:'earphones', emoji:'🎧', label:'Earphones' },
    { id:'books', emoji:'📚', label:'Textbooks' },
    { id:'phone', emoji:'📱', label:'Phone Charger' },
    { id:'towel', emoji:'🧻', label:'Handkerchief' }
  ],
  rainy: [
    { id:'umbrella', emoji:'☂️', label:'Umbrella' },
    { id:'extra', emoji:'👕', label:'Extra Clothes' },
    { id:'bag_cover', emoji:'🎒', label:'Bag Cover' },
    { id:'sandals', emoji:'🩴', label:'Extra Footwear' },
    { id:'books', emoji:'📚', label:'Textbooks' },
    { id:'phone', emoji:'📱', label:'Phone Charger' },
    { id:'hand', emoji:'🧻', label:'Handkerchief' },
    { id:'polybag', emoji:'🛍️', label:'Poly Bag (for books)' }
  ],
  default: [
    { id:'bottle', emoji:'💧', label:'Water Bottle' },
    { id:'books', emoji:'📚', label:'Textbooks' },
    { id:'phone', emoji:'📱', label:'Phone Charger' },
    { id:'stole', emoji:'🧣', label:'Stole (for AC)' },
    { id:'earphones', emoji:'🎧', label:'Earphones' },
    { id:'wallet', emoji:'👛', label:'Wallet / Card' },
    { id:'snack', emoji:'🍌', label:'Snack' },
    { id:'id', emoji:'🪪', label:'College ID' }
  ]
};

// ─── Data: Tips ───────────────────────────────────────
const TIPS_POOL = [
  { emoji:'❄️', title:'AC Classrooms', text:'Can feel like 18°C inside — always carry a light stole or shawl.', cond: () => true },
  { emoji:'🏃', title:'Peak Heat Paths', text:'Use covered corridors between buildings during 12–3 PM heat.', cond: (t) => t > 30 },
  { emoji:'🌆', title:'Evening Drop', text:'Temperature drops 5–7°C after 5 PM — carry something if you\'re staying late.', cond: () => true },
  { emoji:'🧪', title:'Lab Floors', text:'Basement labs run 5–7°C cooler than outdoors — plan accordingly.', cond: () => true },
  { emoji:'👟', title:'Wet Campus', text:'Rain + red soil = muddy shoes — avoid light-coloured footwear today.', cond: (_,r) => r },
  { emoji:'💧', title:'Humidity Alert', text:'Above 80% humidity means your clothes won\'t dry if you sweat. Carry a spare shirt.', cond: (_,_r,h) => h > 80 },
  { emoji:'⛱', title:'Amphitheatre', text:'Open-air amphitheatre gets direct sun — bring shade if attending outdoor events.', cond: (t) => t > 28 },
  { emoji:'🔋', title:'Phone Heat', text:'Extreme heat drains phone batteries faster. Keep it out of direct sun.', cond: (t) => t > 35 },
];

// ─── Data: Vibes by condition ─────────────────────────
const VIBES = {
  sunny_hot: [ "It's an oven out there. Kurta, water bottle, and shades — be the cool one.", "Sun's blazing. Dress like you're in a Bollywood summer song.", "Peak heat mode activated. Cotton is your best friend today." ],
  sunny_warm: [ "Perfect campus day! Go colourful, go cotton, go conquer.", "Goldilocks weather — not too hot, not too cold. Dress your best.", "The weather is in a good mood. Maybe you will be too." ],
  cloudy_mild: [ "Clouds are giving cozy energy. Layer up, look cute.", "Perfect hoodie weather. The kind you romanticise on Instagram.", "Overcast skies = aesthetic campus photos incoming." ],
  rainy: [ "Rain incoming. Channel your inner storm-chaser — waterproof everything.", "Monsoon mood activated. Embrace the raincoat, skip the regret.", "Even on rainy days, you can be the best-dressed person on campus." ],
  cold: [ "Wrap yourself up like a campus chai in the cold.", "Cold weather means big sweater energy. Own it.", "Layers are fashion. Today you're a very stylish onion." ]
};

// ─── Weather Particles ────────────────────────────────
let particles = [];
let animFrame;
function initCanvas() {
  const canvas = document.getElementById('weatherCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
  return { canvas, ctx };
}

function startParticles(type) {
  cancelAnimationFrame(animFrame);
  particles = [];
  const { canvas, ctx } = initCanvas();
  if (type === 'rain') {
    for (let i = 0; i < 120; i++) particles.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      len: Math.random() * 18 + 8, speed: Math.random() * 5 + 6,
      opacity: Math.random() * 0.3 + 0.1
    });
    function drawRain() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 2, p.y + p.len);
        ctx.strokeStyle = `rgba(150,200,255,${p.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        p.y += p.speed; p.x -= 1;
        if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
      });
      animFrame = requestAnimationFrame(drawRain);
    }
    drawRain();
  } else if (type === 'snow') {
    for (let i = 0; i < 60; i++) particles.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 3 + 1, speed: Math.random() * 1.5 + .5,
      drift: Math.random() * 2 - 1, opacity: Math.random() * 0.4 + 0.1
    });
    function drawSnow() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
        p.y += p.speed; p.x += p.drift;
        if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
      });
      animFrame = requestAnimationFrame(drawSnow);
    }
    drawSnow();
  } else if (type === 'sunny') {
    for (let i = 0; i < 20; i++) particles.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + .5, speed: Math.random() * .5 + .2,
      opacity: Math.random() * 0.15 + 0.05, phase: Math.random() * Math.PI * 2
    });
    let t = 0;
    function drawSunny() {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.opacity = (Math.sin(t + p.phase) * 0.07 + 0.1);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,199,79,${p.opacity})`;
        ctx.fill();
        p.y -= p.speed;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      });
      animFrame = requestAnimationFrame(drawSunny);
    }
    drawSunny();
  } else {
    const { ctx } = initCanvas();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

// ─── Quick Search ────────────────────────────────────
function quickSearch(city) {
  document.getElementById('cityInput').value = city;
  getWeather();
}

// ─── Main Fetch ──────────────────────────────────────
async function getWeather() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) { showError('Please enter your campus or city name'); return; }
  currentCity = city;
  showLoading(true);
  hideError();
  cycleLoadingText();
  try {
    localStorage.setItem('wc_lastCity', city);
    const [cRes, fRes] = await Promise.all([
      fetch(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`),
      fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`)
    ]);
    if (!cRes.ok) throw new Error('City not found. Please check the spelling.');
    if (!fRes.ok) throw new Error('Forecast data unavailable.');
    const [cData, fData] = await Promise.all([cRes.json(), fRes.json()]);
    if (!cData.weather?.[0] || !cData.main) throw new Error('Incomplete weather data.');
    currentWeatherData = cData;
    currentForecastData = fData;
    checklistState = {};
    selectedOutfitPieces = {};
    displayAll(cData, fData);
    updateFavUI();
    setLastUpdated();
  } catch (err) {
    showError(err.message || 'Failed to fetch weather. Please try again.');
  } finally {
    showLoading(false);
  }
}

async function refreshWeather() {
  const btn = document.getElementById('refreshBtn');
  btn.classList.add('spinning');
  await getWeather();
  setTimeout(() => btn.classList.remove('spinning'), 800);
}

// ─── Master Display ──────────────────────────────────
function displayAll(c, f) {
  document.getElementById('weatherContainer').classList.remove('hidden');
  const cond = c.weather[0].main.toLowerCase();
  const temp = c.main.temp;
  const key = getOutfitKey(temp, cond);
  const isRain = cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunder');

  // Theme + particles
  setTheme(cond, temp);
  if (isRain) startParticles('rain');
  else if (cond.includes('snow')) startParticles('snow');
  else if (cond.includes('clear') && temp > 25) startParticles('sunny');
  else startParticles('none');

  // Rain alert
  const rainAlert = document.getElementById('rainAlert');
  if (isRain) rainAlert.classList.remove('hidden');
  else rainAlert.classList.add('hidden');

  // Fill all sections
  displayCurrentWeather(c);
  displayVibe(key);
  displayComfortMeter(temp, c.main.humidity, c.wind.speed || 0);
  displayOutfitBuilder(key);
  displayPackingChecklist(isRain ? 'rainy' : key === 'sunny_hot' ? 'sunny_hot' : 'default');
  displaySunTracker(c.sys.sunrise, c.sys.sunset, c.timezone);
  displayUVIndex(temp, cond);
  displayWindInfo(c.wind);
  displayTimeline(f, c.timezone);
  displayCampusTips(cond, temp, c.main.humidity);
  displayLayeringGuide(c.main.temp, f);
  updateCheckProgress();
  document.getElementById('tipCityBadge').textContent = c.name;

  // Staggered card reveal
  document.querySelectorAll('.card').forEach((card, i) => {
    card.classList.remove('visible');
    setTimeout(() => card.classList.add('visible'), 60 + i * 60);
  });
}

// ─── Current Weather ─────────────────────────────────
function displayCurrentWeather(d) {
  const w = d.weather[0], m = d.main, wind = d.wind || {};
  const city = d.name + (d.sys?.country ? `, ${d.sys.country}` : '');
  document.getElementById('currentWeather').innerHTML = `
    <div class="hero-weather-top">
      <div>
        <div class="city-name">${d.name}</div>
        <div class="city-country">${d.sys?.country || ''} · ${w.description}</div>
      </div>
      <span class="weather-emoji-big">${getEmoji(w.icon)}</span>
    </div>
    <div class="temp-hero">${Math.round(m.temp)}°C</div>
    <div class="weather-desc-hero">Feels like ${Math.round(m.feels_like)}°C · ${w.description}</div>
    <div class="hero-stats">
      <div class="hstat"><i class="fas fa-droplet"></i> ${m.humidity}% humidity</div>
      <div class="hstat"><i class="fas fa-temperature-arrow-up"></i> High ${Math.round(m.temp_max ?? m.temp)}°</div>
      <div class="hstat"><i class="fas fa-temperature-arrow-down"></i> Low ${Math.round(m.temp_min ?? m.temp)}°</div>
      ${wind.speed ? `<div class="hstat"><i class="fas fa-wind"></i> ${Math.round(wind.speed)} m/s</div>` : ''}
    </div>`;
}

// ─── Vibe ─────────────────────────────────────────────
function displayVibe(key) {
  const vibeArr = VIBES[key] || VIBES['sunny_warm'];
  const vibe = vibeArr[Math.floor(Math.random() * vibeArr.length)];
  document.getElementById('dailyVibe').textContent = `"${vibe}"`;
}

// ─── Comfort Meter ────────────────────────────────────
function displayComfortMeter(temp, humidity, wind) {
  // Heat index approximation
  let score = 100;
  if (temp > 38) score -= 40;
  else if (temp > 35) score -= 25;
  else if (temp > 32) score -= 15;
  else if (temp < 15) score -= 30;
  else if (temp < 20) score -= 10;
  if (humidity > 85) score -= 20;
  else if (humidity > 75) score -= 10;
  if (wind > 10) score += 8;
  score = Math.max(10, Math.min(100, score));

  let label, desc, color;
  if (score >= 80) { label = 'Great'; desc = 'Perfect weather for a full day on campus.'; color = '#43e8c8'; }
  else if (score >= 60) { label = 'Good'; desc = 'Comfortable with minor adjustments.'; color = '#f9c74f'; }
  else if (score >= 40) { label = 'Okay'; desc = 'Stay hydrated and dress smart.'; color = '#f3722c'; }
  else { label = 'Tough'; desc = 'Challenging conditions — prep well!'; color = '#ff6b8a'; }

  const circ = 2 * Math.PI * 26;
  const offset = circ - (score / 100) * circ;
  document.getElementById('comfortMeter').innerHTML = `
    <div class="comfort-gauge-wrap">
      <div class="comfort-gauge">
        <svg class="gauge-svg" viewBox="0 0 60 60">
          <circle class="gauge-bg" cx="30" cy="30" r="26"/>
          <circle class="gauge-fill" cx="30" cy="30" r="26"
            stroke="${color}"
            stroke-dasharray="${circ}"
            stroke-dashoffset="${circ}"
            id="gaugeFill"/>
        </svg>
        <div class="gauge-text">
          <span class="gauge-val" style="color:${color}">${score}</span>
          <span class="gauge-unit">/ 100</span>
        </div>
      </div>
      <div class="comfort-info">
        <div class="comfort-label" style="color:${color}">${label}</div>
        <div class="comfort-desc">${desc}</div>
      </div>
    </div>`;
  // Animate
  setTimeout(() => {
    const el = document.getElementById('gaugeFill');
    if (el) el.style.strokeDashoffset = offset;
  }, 400);
}

// ─── Outfit Builder ───────────────────────────────────
function displayOutfitBuilder(key) {
  const data = OUTFIT_DATA[key] || OUTFIT_DATA['sunny_warm'];
  const categories = { top: 'Top', bottom: 'Bottom', shoes: 'Shoes', acc: 'Accessories' };
  let html = '<div class="outfit-grid">';
  Object.entries(categories).forEach(([cat, catLabel]) => {
    if (!data[cat]) return;
    data[cat].forEach(piece => {
      const isDefault = piece.default;
      if (isDefault && !selectedOutfitPieces[cat]) selectedOutfitPieces[cat] = piece.id;
      const isSelected = selectedOutfitPieces[cat] === piece.id || (isDefault && !selectedOutfitPieces[cat]);
      html += `
        <div class="outfit-piece ${isSelected ? 'selected' : ''}" onclick="selectOutfitPiece('${cat}','${piece.id}','${key}')" data-cat="${cat}" data-id="${piece.id}">
          <span class="piece-icon">${piece.icon}</span>
          <div class="piece-name">${piece.name}</div>
          <div class="piece-desc">${piece.desc}</div>
          <div class="piece-tap-hint">${catLabel}</div>
        </div>`;
    });
  });
  html += '</div>';
  html += `<div class="outfit-note"><i class="fas fa-circle-info"></i><span>Tap any item to swap it with an alternative. Mix and match your perfect campus look!</span></div>`;
  document.getElementById('outfitBuilder').innerHTML = html;
}

function selectOutfitPiece(cat, id, key) {
  selectedOutfitPieces[cat] = id;
  // Toggle selected state
  document.querySelectorAll(`.outfit-piece[data-cat="${cat}"]`).forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
}

// ─── Packing Checklist ────────────────────────────────
function displayPackingChecklist(listKey) {
  const list = PACK_LISTS[listKey] || PACK_LISTS.default;
  const html = '<div class="checklist-grid">' + list.map(item => `
    <div class="check-item ${checklistState[item.id] ? 'checked' : ''}" onclick="toggleCheck('${item.id}')" id="ci_${item.id}">
      <span class="check-item-emoji">${item.emoji}</span>
      <div class="check-box">${checklistState[item.id] ? '<i class="fas fa-check"></i>' : ''}</div>
      <span class="check-item-label">${item.label}</span>
    </div>`).join('') + '</div>';
  document.getElementById('packingChecklist').innerHTML = html;
}

function toggleCheck(id) {
  checklistState[id] = !checklistState[id];
  const el = document.getElementById(`ci_${id}`);
  if (!el) return;
  el.classList.toggle('checked', checklistState[id]);
  el.querySelector('.check-box').innerHTML = checklistState[id] ? '<i class="fas fa-check"></i>' : '';
  el.querySelector('.check-item-label').style.textDecoration = checklistState[id] ? 'line-through' : '';
  updateCheckProgress();
}

function updateCheckProgress() {
  const total = Object.keys(checklistState).length ? Object.keys(checklistState).length : document.querySelectorAll('.check-item').length;
  const checked = Object.values(checklistState).filter(Boolean).length;
  const el = document.getElementById('checkProgress');
  if (el) el.textContent = `${checked}/${total} packed`;
}

// ─── Sun Tracker ──────────────────────────────────────
function displaySunTracker(sunriseUTC, sunsetUTC, tzOffset) {
  const rise = new Date((sunriseUTC + tzOffset) * 1000);
  const set  = new Date((sunsetUTC  + tzOffset) * 1000);
  const now  = new Date(Date.now() + tzOffset * 1000);
  const riseStr = `${rise.getUTCHours()}:${String(rise.getUTCMinutes()).padStart(2,'0')} AM`;
  const setStr  = `${set.getUTCHours() > 12 ? set.getUTCHours()-12 : set.getUTCHours()}:${String(set.getUTCMinutes()).padStart(2,'0')} PM`;

  const total = sunsetUTC - sunriseUTC;
  const elapsed = Math.max(0, Math.min(total, (now.getTime()/1000) - sunriseUTC - tzOffset));
  const pct = elapsed / total;

  // SVG arc sun tracker
  const W = 200, H = 80, cx = W/2, cy = H + 10, r = H + 10;
  const startAngle = Math.PI;
  const endAngle = 0;
  const angle = startAngle + pct * (endAngle - startAngle) * (-1);
  const sunX = cx + r * Math.cos(Math.PI - pct * Math.PI);
  const sunY = cy - r * Math.sin(pct * Math.PI);
  const pathD = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  document.getElementById('sunTracker').innerHTML = `
    <div class="sun-arc">
      <svg class="sun-arc-svg" viewBox="0 0 200 90" preserveAspectRatio="none">
        <path class="sun-path" d="${pathD}"/>
        <path class="sun-progress-path" d="M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${sunX} ${sunY}" stroke="var(--accent)" stroke-dasharray="1000" stroke-dashoffset="0"/>
      </svg>
      <div class="sun-orb" style="left:${(sunX/200)*100}%;top:${(sunY/90)*100}%"></div>
    </div>
    <div class="sun-times">
      <div class="sun-time-badge"><span class="sun-time-val">${riseStr}</span><span>Sunrise</span></div>
      <div class="sun-time-badge"><span class="sun-time-val">${Math.round(pct*100)}%</span><span>Day elapsed</span></div>
      <div class="sun-time-badge"><span class="sun-time-val">${setStr}</span><span>Sunset</span></div>
    </div>`;
}

// ─── UV Index ─────────────────────────────────────────
function displayUVIndex(temp, cond) {
  // Estimate UV from temp + condition
  let uv;
  if (cond.includes('rain') || cond.includes('thunder')) uv = Math.floor(Math.random() * 2 + 1);
  else if (cond.includes('cloud') || cond.includes('overcast')) uv = Math.floor(temp / 8);
  else uv = Math.floor(temp / 5);
  uv = Math.max(1, Math.min(11, uv));

  let label, color;
  if (uv <= 2)  { label = 'Low';      color = '#43e8c8'; }
  else if (uv <= 5) { label = 'Moderate'; color = '#f9c74f'; }
  else if (uv <= 7) { label = 'High';     color = '#f3722c'; }
  else if (uv <= 10){ label = 'Very High';color = '#ff6b8a'; }
  else              { label = 'Extreme';  color = '#cc0055'; }

  const markerLeft = ((uv - 1) / 10) * 100;
  document.getElementById('uvIndex').innerHTML = `
    <div class="uv-number" style="color:${color}">${uv}</div>
    <div class="uv-label" style="color:${color}">${label}</div>
    <div class="uv-bar"><div class="uv-marker" style="left:${markerLeft}%"></div></div>
    <div class="uv-scale"><span>Low</span><span>Med</span><span>High</span><span>Max</span></div>`;
}

// ─── Wind Info ────────────────────────────────────────
function displayWindInfo(wind) {
  const speed = wind.speed || 0;
  const deg = wind.deg || 0;
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  const dir = dirs[Math.round(deg / 45) % 8];
  let feel = speed < 2 ? 'Calm' : speed < 6 ? 'Light Breeze' : speed < 11 ? 'Moderate' : speed < 17 ? 'Fresh' : 'Strong';
  document.getElementById('windInfo').innerHTML = `
    <div class="wind-compass">
      <div class="compass-arrow" style="transform:rotate(${deg}deg)"></div>
      <div class="compass-labels">
        <span class="compass-n">N</span><span class="compass-s">S</span>
        <span class="compass-e">E</span><span class="compass-w">W</span>
      </div>
    </div>
    <div class="wind-speed">${Math.round(speed)} <span class="wind-unit">m/s</span></div>
    <div class="wind-dir">${dir} · ${feel}</div>`;
}

// ─── Timeline (Hourly) ────────────────────────────────
function displayTimeline(fData, tzOffset) {
  const now = new Date();
  // Get next 12 forecast slots
  const items = fData.list.slice(0, 12);
  const html = items.map((item, i) => {
    const localTime = new Date((item.dt + tzOffset) * 1000);
    const h = localTime.getUTCHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const pop = item.pop ? Math.round(item.pop * 100) : 0;
    return `
      <div class="timeline-item ${i === 0 ? 'active' : ''}" onclick="activateTL(this)">
        <div class="tl-time">${h12} ${ampm}</div>
        <span class="tl-emoji">${getEmoji(item.weather[0].icon)}</span>
        <div class="tl-temp">${Math.round(item.main.temp)}°</div>
        ${pop > 20 ? `<div class="tl-pop">💧${pop}%</div>` : ''}
      </div>`;
  }).join('');
  document.getElementById('timelineScroll').innerHTML = html;
}

function activateTL(el) {
  document.querySelectorAll('.timeline-item').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
}

// ─── Campus Tips ──────────────────────────────────────
function displayCampusTips(cond, temp, humidity) {
  const isRain = cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunder');
  const relevant = TIPS_POOL.filter(t => t.cond(temp, isRain, humidity)).slice(0, 4);
  document.getElementById('campusTips').innerHTML = `<div class="tips-grid">` +
    relevant.map(t => `
      <div class="tip-card">
        <span class="tip-emoji">${t.emoji}</span>
        <div class="tip-body">
          <div class="tip-title">${t.title}</div>
          <div class="tip-text">${t.text}</div>
        </div>
      </div>`).join('') + `</div>`;
}

// ─── Layering Guide ───────────────────────────────────
function displayLayeringGuide(currentTemp, fData) {
  const timezone = fData.city.timezone;
  const todaySlots = fData.list.slice(0, 8);
  const morningTemp = todaySlots[0]?.main.temp ?? currentTemp;
  const afternoonTemp = todaySlots[Math.min(3, todaySlots.length-1)]?.main.temp ?? currentTemp;
  const diff = Math.abs(afternoonTemp - morningTemp);
  let icon, title, desc;
  if (diff > 8) {
    icon = '🌡️'; title = 'Big Temperature Swing';
    desc = `Morning starts at ${Math.round(morningTemp)}°C and climbs to ${Math.round(afternoonTemp)}°C in the afternoon. A jacket or hoodie you can remove is essential.`;
  } else if (diff > 4) {
    icon = '🌤'; title = 'Moderate Change';
    desc = `Morning at ${Math.round(morningTemp)}°C warming to ${Math.round(afternoonTemp)}°C by afternoon. A light sweater tied around the waist does the job.`;
  } else {
    icon = '✅'; title = 'Stable Day';
    desc = `Temperature stays consistent around ${Math.round(currentTemp)}°C. Dress for comfort — no heavy layering required.`;
  }
  if (currentTemp > 32) desc += ' Opt for breathable cotton to handle the heat.';
  document.getElementById('layeringGuide').innerHTML = `
    <div class="layering-row">
      <div class="layering-icon-big">${icon}</div>
      <div class="layering-body">
        <div class="layering-title">${title}</div>
        <div class="layering-desc">${desc}</div>
      </div>
    </div>
    <div class="temp-journey">
      <div class="temp-stop">
        <div class="temp-stop-val">${Math.round(morningTemp)}°C</div>
        <div class="temp-stop-lbl">Morning</div>
      </div>
      <span class="temp-arrow"><i class="fas fa-arrow-right"></i></span>
      <div class="temp-stop">
        <div class="temp-stop-val">${Math.round(currentTemp)}°C</div>
        <div class="temp-stop-lbl">Now</div>
      </div>
      <span class="temp-arrow"><i class="fas fa-arrow-right"></i></span>
      <div class="temp-stop">
        <div class="temp-stop-val">${Math.round(afternoonTemp)}°C</div>
        <div class="temp-stop-lbl">Afternoon</div>
      </div>
      <div class="temp-diff-badge">Δ ${Math.round(diff)}°C change</div>
    </div>`;
}

// ─── Share Outfit ────────────────────────────────────
function shareOutfit() {
  if (!currentWeatherData) return;
  const city = currentWeatherData.name;
  const temp = Math.round(currentWeatherData.main.temp);
  const key = getOutfitKey(temp, currentWeatherData.weather[0].main.toLowerCase());
  const data = OUTFIT_DATA[key];
  const parts = Object.values(selectedOutfitPieces).length ?
    Object.entries(selectedOutfitPieces).map(([cat,id]) => {
      const piece = [...(data.top||[]),...(data.bottom||[]),...(data.shoes||[]),...(data.acc||[])].find(p=>p.id===id);
      return piece ? `${piece.icon} ${piece.name}` : null;
    }).filter(Boolean) :
    ['Check WearCast for outfit suggestions!'];
  const text = `🌤 WearCast for ${city} (${temp}°C)\n${parts.join(' · ')}\n#WearCast #CampusLife`;
  navigator.clipboard?.writeText(text).then(() => showShareToast()).catch(() => showShareToast());
}

function showShareToast() {
  const t = document.getElementById('shareToast');
  t.classList.remove('hidden');
  t.classList.add('show');
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.classList.add('hidden'), 400); }, 2200);
}

// ─── Favourites ──────────────────────────────────────
function toggleFavourite() {
  if (!currentCity) return;
  const idx = favourites.indexOf(currentCity);
  if (idx > -1) favourites.splice(idx, 1);
  else { favourites.unshift(currentCity); if (favourites.length > 5) favourites.pop(); }
  localStorage.setItem('wc_favs', JSON.stringify(favourites));
  updateFavUI();
}

function updateFavUI() {
  const isFav = favourites.includes(currentCity);
  const btn = document.getElementById('favBtn');
  const icon = document.getElementById('favIcon');
  btn.classList.toggle('active', isFav);
  icon.className = isFav ? 'fas fa-star' : 'far fa-star';
  // Render fav chips
  const fc = document.getElementById('favChips');
  const div = document.getElementById('chipDivider');
  if (!favourites.length) { fc.innerHTML = ''; div.style.display = 'none'; return; }
  div.style.display = '';
  fc.innerHTML = '<span class="chip-label">Saved:</span>' +
    favourites.map(c => `<button class="chip fav-chip" onclick="quickSearch('${c}')">⭐ ${c}</button>`).join('');
}

// ─── Theme ───────────────────────────────────────────
function setTheme(cond, temp) {
  let theme = 'default';
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunder')) theme = 'rainy';
  else if (cond.includes('clear') && temp > 28) theme = 'sunny';
  else if (cond.includes('cloud') || cond.includes('overcast')) theme = 'cloudy';
  document.body.setAttribute('data-theme', theme);
}

// ─── Outfit Key ──────────────────────────────────────
function getOutfitKey(temp, cond) {
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunder')) return 'rainy';
  if (temp < 20) return 'cold';
  if (temp <= 28) return cond.includes('cloud') ? 'cloudy_mild' : 'sunny_warm';
  return 'sunny_hot';
}

// ─── Emoji Map ───────────────────────────────────────
function getEmoji(icon) {
  const m = {'01d':'☀️','01n':'🌙','02d':'⛅','02n':'☁️','03d':'☁️','03n':'☁️','04d':'☁️','04n':'☁️','09d':'🌧️','09n':'🌧️','10d':'🌦️','10n':'🌧️','11d':'⛈️','11n':'⛈️','13d':'❄️','13n':'❄️','50d':'🌫️','50n':'🌫️'};
  return m[icon] || '☀️';
}

// ─── Loading Text Cycle ──────────────────────────────
const loadingTexts = ['Reading the skies...','Checking the vibe...','Asking the clouds...','Calibrating comfort...','Almost ready...'];
let ltIdx = 0, ltTimer;
function cycleLoadingText() {
  ltIdx = 0;
  clearInterval(ltTimer);
  const el = document.getElementById('loadingText');
  ltTimer = setInterval(() => {
    if (!el) return;
    ltIdx = (ltIdx + 1) % loadingTexts.length;
    el.textContent = loadingTexts[ltIdx];
  }, 900);
}

// ─── Dismiss Alert ───────────────────────────────────
function dismissAlert() { document.getElementById('rainAlert').classList.add('hidden'); }

// ─── UI Helpers ──────────────────────────────────────
function showLoading(show) {
  document.getElementById('loadingSpinner').classList.toggle('hidden', !show);
  if (show) document.getElementById('weatherContainer').classList.add('hidden');
  if (!show) clearInterval(ltTimer);
}
function showError(msg) {
  const el = document.getElementById('errorMessage');
  document.getElementById('errorText').textContent = msg;
  el.classList.remove('hidden');
}
function hideError() { document.getElementById('errorMessage').classList.add('hidden'); }
function setLastUpdated() {
  const now = new Date();
  document.getElementById('lastUpdated').textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
}

// ─── Init ────────────────────────────────────────────
document.getElementById('cityInput').addEventListener('keypress', e => { if (e.key === 'Enter') getWeather(); });
document.getElementById('cityInput').addEventListener('input', hideError);
updateFavUI();
window.addEventListener('load', () => {
  const last = localStorage.getItem('wc_lastCity') || 'Coimbatore';
  document.getElementById('cityInput').value = last;
  getWeather();
});