"use strict";
// Entire demo state lives in memory. No network, accounts, storage, or payment SDKs.
const categories = [
  { id: "all", name: "Tudo", icon: "grid" },
  { id: "food", name: "Alimentos", icon: "leaf" },
  { id: "clothes", name: "Roupas", icon: "shirt" },
  { id: "education", name: "Educação", icon: "book" },
  { id: "home", name: "Casa", icon: "home" },
  { id: "toys", name: "Brinquedos", icon: "star" },
];
const cities = ["São Paulo", "Campinas", "Curitiba"];
const seed = [
  {
    id: "livros",
    title: "Histórias para um novo leitor",
    category: "education",
    city: "São Paulo",
    condition: "Muito bom",
    quantity: 8,
    unit: "livros",
    art: "books",
    desc: "Uma seleção de livros de literatura e aventura, pronta para ganhar novas mãos. Todos estão completos, com páginas bem cuidadas e muitas histórias pela frente.",
    short: "Livros de literatura e aventura para compartilhar o prazer de ler.",
    donor: "Estante Compartilhada",
    initials: "EC",
    pickup: "Retirada em ponto comunitário fictício",
    date: 6,
  },
  {
    id: "roupas",
    title: "Um abraço em forma de roupa",
    category: "clothes",
    city: "Campinas",
    condition: "Muito bom",
    quantity: 5,
    unit: "peças",
    art: "clothes",
    desc: "Casacos e malhas adultos, tamanhos M e G. Peças limpas, sem rasgos, organizadas em um kit para dias mais frescos.",
    short: "Casacos e malhas em bom estado, tamanhos M e G.",
    donor: "Rede Acolher",
    initials: "RA",
    pickup: "Retirada em ponto comunitário fictício",
    date: 5,
  },
  {
    id: "alimentos",
    title: "Uma cesta de cuidado",
    category: "food",
    city: "São Paulo",
    condition: "Novo",
    quantity: 3,
    unit: "cestas",
    art: "food",
    desc: "Cestas ilustrativas com arroz, feijão, macarrão e outros alimentos não perecíveis. Nesta demonstração, todos os itens têm validade fictícia adequada.",
    short: "Cestas com alimentos não perecíveis para o dia a dia.",
    donor: "Cozinha do Bem",
    initials: "CB",
    pickup: "Retirada em ponto comunitário fictício",
    date: 4,
  },
  {
    id: "cadeira",
    title: "Mais um lugar à mesa",
    category: "home",
    city: "Curitiba",
    condition: "Bom",
    quantity: 2,
    unit: "cadeiras",
    art: "chair",
    desc: "Duas cadeiras de madeira com estrutura firme. Apresentam pequenas marcas de uso e estão prontas para fazer parte de um novo lar.",
    short: "Cadeiras de madeira resistentes, com pequenas marcas de uso.",
    donor: "Casa Circular",
    initials: "CC",
    pickup: "Retirada em ponto comunitário fictício",
    date: 3,
  },
  {
    id: "brinquedos",
    title: "Brincar é um novo começo",
    category: "toys",
    city: "Campinas",
    condition: "Muito bom",
    quantity: 4,
    unit: "brinquedos",
    art: "toys",
    desc: "Um kit de brinquedos educativos, indicado para crianças a partir de 4 anos. As peças estão completas e higienizadas. Um convite para imaginar e descobrir.",
    short: "Um kit de brinquedos educativos para imaginar e descobrir.",
    donor: "Coletivo Sementes",
    initials: "CS",
    pickup: "Retirada em ponto comunitário fictício",
    date: 2,
  },
  {
    id: "plantas",
    title: "Um pouco de verde para casa",
    category: "home",
    city: "São Paulo",
    condition: "Bom",
    quantity: 3,
    unit: "vasos",
    art: "plant",
    desc: "Vasos de plantas de fácil cuidado, com instruções ilustrativas de rega. Ideais para levar um pouco de natureza a uma nova casa.",
    short: "Vasos com plantas de fácil cuidado para alegrar um novo lar.",
    donor: "Jardim Compartilhado",
    initials: "JC",
    pickup: "Retirada em ponto comunitário fictício",
    date: 1,
  },
];
let items = seed.map((item) => ({ ...item }));
let favorites = new Set();
let requests = new Set();
let donated = [];
let activityTab = "offers";
let draft = null;
let nextId = 1;
let lastExplore = "#/explorar";
let toastTimer;
let ignoreBackdropUntil = 0;
const main = document.querySelector("main");
const modal = document.querySelector("#modal");
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const norm = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const categoryName = (id) =>
  categories.find((c) => c.id === id)?.name || "Casa";
const iconPaths = {
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  book: '<path d="M3 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-3H3V4Zm18 0h-6a3 3 0 0 0-3 3v14a4 4 0 0 1 4-3h5V4Z"/>',
  shirt: '<path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c-1 4-7 4-8 0Z"/>',
  home: '<path d="m3 10 9-7 9 7v11H3V10Zm6 11v-8h6v8"/>',
  leaf: '<path d="M20 3C9 2 3 7 4 14c1 7 13 9 16-11ZM4 20l11-11"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
};
function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || iconPaths.heart}</svg>`;
}
// Original vector illustrations: no remote photos, identifiable people, or third-party image requests.
function art(kind, hero = false) {
  const backgrounds = {
    books: "#e9ede1",
    clothes: "#f4e4d9",
    food: "#f2e5cf",
    chair: "#e5e9e1",
    toys: "#ece7ee",
    plant: "#e4eddf",
  };
  const bg = hero ? "none" : backgrounds[kind] || backgrounds.books;
  let shapes = "";
  if (kind === "books")
    shapes = `<g transform="rotate(-8 170 160)"><path d="M98 184h147v34H98z" fill="#b35937"/><path d="M108 188h137v23H108z" fill="#fbf4e4"/><path d="M105 179h132v27H105z" fill="#e5ab64"/><path d="M117 183h120v16H117z" fill="#fff9eb"/><rect x="116" y="96" width="58" height="89" rx="4" fill="#527562"/><rect x="121" y="101" width="49" height="78" rx="2" fill="#648c72"/><path d="M127 96v89" stroke="#aac0a0" stroke-width="2"/><path d="M140 122h20m-20 6h14" stroke="#e6e8d4" stroke-width="2"/><circle cx="150" cy="153" r="12" fill="#dfba6b"/><path d="m174 107 48-13 23 88-48 13z" fill="#d48965"/><path d="m181 119 35-10m-30 22 28-8" stroke="#fae0bf" stroke-width="3"/><path d="m179 108 22 85" stroke="#a95738" stroke-width="3"/></g><g fill="#62846a"><ellipse cx="254" cy="155" rx="9" ry="20" transform="rotate(35 254 155)"/><ellipse cx="270" cy="167" rx="9" ry="18" transform="rotate(-25 270 167)"/></g><path d="M253 194q0-22 14-39" fill="none" stroke="#62846a" stroke-width="3"/>`;
  if (kind === "clothes")
    shapes = `<path d="m151 75-36 21-23 59 29 12 17-40-5 97h97l-5-97 17 40 29-12-24-59-35-21-15 18h-31z" fill="#bc764f"/><path d="m151 75 15 18 15 6 16-6 15-18 8 49-20-5-19 19-21-19-19 5z" fill="#cf8e66"/><path d="M181 101v123" stroke="#f1c19a" stroke-width="3"/><circle cx="189" cy="148" r="2" fill="#795945"/><circle cx="189" cy="176" r="2" fill="#795945"/><circle cx="189" cy="204" r="2" fill="#795945"/><path d="M139 181h24v19h-24m61-19h24v19h-24" fill="none" stroke="#a56644" stroke-width="3"/><path d="m134 79 19-14 11 13 35-1 10-12 13 13-14 45-12-4-12-13-15 14-12 3z" fill="#5e7760"/><path d="M132 202h113v22H132z" fill="#cfa973"/>`;
  if (kind === "food")
    shapes = `<path d="M116 145h143l-17 78H134z" fill="#ba9569"/><path d="M119 155h137m-133 17h130m-126 18h124m-120 18h116" stroke="#a68155" stroke-width="3"/><path d="m142 150-17 72m43-72-7 73m32-73 2 73m26-73 12 73" stroke="#d6b887" stroke-width="3"/><rect x="140" y="95" width="44" height="57" rx="7" fill="#e6d3a9" transform="rotate(-13 161 124)"/><rect x="143" y="111" width="36" height="23" rx="3" fill="#688768" transform="rotate(-13 161 124)"/><path d="M188 152q-5-79 17-81 27 4 11 80" fill="#c78045"/><path d="m199 83 10 7m-14 8 17 7m-17 8 17 6m-19 7 17 6" stroke="#efbc77" stroke-width="3"/><circle cx="235" cy="128" r="23" fill="#b25c3f"/><path d="M235 105q-1-20 15-23-1 19-15 23" fill="#52735a"/><path d="M123 123q-28-9-16-25 13-6 26 10-12-28 2-28 15 0 9 29 17-23 27-9 5 14-26 26" fill="#6f8c5e"/><path d="m119 119 29 4-13 30z" fill="#e49b56"/><path d="M149 160q29-22 70 0" fill="none" stroke="#6d7f50" stroke-width="5"/>`;
  if (kind === "chair")
    shapes = `<g stroke="#926b46" stroke-width="12" stroke-linecap="round"><path d="m137 134-13 91m97-91 15 91M137 134V65m84 69V65"/></g><rect x="131" y="64" width="96" height="64" rx="8" fill="#b68d5f"/><path d="M143 74h72m-72 15h72m-72 15h72m-72 15h72" stroke="#cba77b" stroke-width="4"/><path d="m129 134 91-9 24 19-107 10z" fill="#c7a77a"/><path d="m136 155 1 17 106-8v-20" fill="#a67e50"/><path d="m132 182 105-11" stroke="#906740" stroke-width="7"/><path d="M266 203v22m-10-11h20" stroke="#899477" stroke-width="2"/>`;
  if (kind === "toys")
    shapes = `<rect x="130" y="161" width="60" height="55" rx="5" fill="#c77e5d" transform="rotate(-8 160 186)"/><rect x="184" y="169" width="51" height="50" rx="5" fill="#e2b366" transform="rotate(10 209 193)"/><path d="m209 183 5 8 10 2-7 7 1 11-9-5-10 4 2-11-7-7 10-1z" fill="#fff2ce"/><path d="M157 176v22m-11-11h22" stroke="#fff0d8" stroke-width="5"/><circle cx="190" cy="100" r="21" fill="#b59973"/><circle cx="164" cy="89" r="10" fill="#b59973"/><circle cx="208" cy="81" r="10" fill="#b59973"/><ellipse cx="190" cy="138" rx="26" ry="32" fill="#b59973"/><ellipse cx="190" cy="141" rx="17" ry="22" fill="#ddc5a0"/><ellipse cx="185" cy="110" rx="12" ry="8" fill="#dfcaaa"/><circle cx="177" cy="99" r="2.5" fill="#473c30"/><circle cx="197" cy="97" r="2.5" fill="#473c30"/><circle cx="185" cy="107" r="3" fill="#645445"/><ellipse cx="159" cy="133" rx="10" ry="21" transform="rotate(25 159 133)" fill="#b59973"/><ellipse cx="220" cy="125" rx="10" ry="21" transform="rotate(-25 220 125)" fill="#b59973"/>`;
  if (kind === "plant")
    shapes = `<path d="M172 175q-17-51-5-95m14 85q-1-44 39-72m-40 83q-37-7-46-48" fill="none" stroke="#5a7651" stroke-width="4"/><ellipse cx="154" cy="98" rx="15" ry="31" transform="rotate(-30 154 98)" fill="#779064"/><ellipse cx="210" cy="102" rx="15" ry="32" transform="rotate(42 210 102)" fill="#547650"/><ellipse cx="137" cy="128" rx="14" ry="29" transform="rotate(-55 137 128)" fill="#8da375"/><ellipse cx="177" cy="123" rx="13" ry="24" transform="rotate(16 177 123)" fill="#8da375"/><path d="M143 170h74l-12 57h-51z" fill="#bd7857"/><rect x="139" y="165" width="82" height="14" rx="4" fill="#cf8d69"/><path d="M156 185h43m-40 9h35" stroke="#d99972" stroke-width="2"/>`;
  return `<svg class="illustration ${kind}" viewBox="0 0 360 280" role="img" aria-label="Ilustração de ${esc({ books: "livros", clothes: "roupas", food: "uma cesta de alimentos", chair: "uma cadeira", toys: "brinquedos", plant: "uma planta" }[kind] || "livros")}"><rect width="360" height="280" fill="${bg}"/>${!hero ? '<circle cx="182" cy="139" r="90" fill="#ffffff30"/>' : ""}<ellipse cx="181" cy="228" rx="92" ry="9" fill="#283c3510"/>${shapes}<path d="m78 99 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#ffffff90"/><circle cx="285" cy="75" r="4" fill="#ffffffa0"/></svg>`;
}
function heroArt() {
  return `<div class="hero-art" aria-label="Ilustração de itens de doação"><span class="float-heart" aria-hidden="true">♡</span>${art("food", true)}<div class="float-note"><strong>Todo gesto conta.</strong>Uma nova história começa aqui.</div></div>`;
}
function toast(message) {
  const node = document.querySelector("#toast");
  node.textContent = message;
  node.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("visible"), 2800);
}
function route() {
  const raw = location.hash.slice(1) || "/explorar";
  const [path, query = ""] = raw.split("?");
  return { path, params: new URLSearchParams(query) };
}
function exploreState() {
  const { params } = route();
  return {
    q: params.get("q") || "",
    category: categories.some((c) => c.id === params.get("categoria"))
      ? params.get("categoria")
      : "all",
    city: cities.includes(params.get("cidade")) ? params.get("cidade") : "",
    sort: params.get("ordem") === "az" ? "az" : "new",
  };
}
function exploreHash(state) {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.category !== "all") params.set("categoria", state.category);
  if (state.city) params.set("cidade", state.city);
  if (state.sort !== "new") params.set("ordem", state.sort);
  return "#/explorar" + (params.size ? "?" + params : "");
}
function setFilters(changes, replace = false) {
  const hash = exploreHash({ ...exploreState(), ...changes });
  if (replace) {
    history.replaceState(null, "", hash);
    lastExplore = hash;
    renderResults();
  } else {
    location.hash = hash;
  }
}
function filtered() {
  const s = exploreState();
  return items
    .filter(
      (item) =>
        (s.category === "all" || item.category === s.category) &&
        (!s.city || item.city === s.city) &&
        (!s.q ||
          norm(
            [
              item.title,
              item.desc,
              item.donor,
              item.city,
              categoryName(item.category),
            ].join(" "),
          ).includes(norm(s.q))),
    )
    .sort((a, b) =>
      s.sort === "az"
        ? a.title.localeCompare(b.title, "pt-BR")
        : b.date - a.date,
    );
}
function favoriteButton(item, extra = "") {
  const saved = favorites.has(item.id);
  return `<button class="${extra || "save-btn"} ${saved ? "saved" : ""}" data-action="favorite" data-id="${esc(item.id)}" aria-label="${saved ? "Remover dos favoritos" : "Salvar nos favoritos"}: ${esc(item.title)}" aria-pressed="${saved}">${icon("heart")}${extra ? ` ${saved ? "Salvo" : "Salvar"}` : ""}</button>`;
}
function card(item) {
  return `<article class="card"><a class="card-art" href="#/doacao/${esc(item.id)}" aria-label="Ver ${esc(item.title)}">${art(item.art)}<span class="tag">${esc(item.condition)}</span></a>${favoriteButton(item)}<div class="card-body"><div class="card-top"><span>${esc(categoryName(item.category))}</span><span>Disponível</span></div><h3 class="wrap"><a href="#/doacao/${esc(item.id)}">${esc(item.title)}</a></h3><p class="wrap">${esc(item.short)}</p><div class="card-info">${icon("pin")} ${esc(item.city)} <span>·</span> ${esc(item.quantity)} ${esc(item.unit)}</div><div class="card-bottom"><span class="wrap">${esc(item.donor)}</span><a href="#/doacao/${esc(item.id)}">Ver doação <span aria-hidden="true">↗</span></a></div></div></article>`;
}
function empty(title, desc, action = "clear", label = "Limpar filtros") {
  return `<div class="empty"><div class="empty-icon" aria-hidden="true">♡</div><h3>${esc(title)}</h3><p>${esc(desc)}</p><button class="btn primary" data-action="${action}">${esc(label)}</button></div>`;
}
function renderResults() {
  const data = filtered();
  const state = exploreState();
  document.querySelector("#results").innerHTML = data.length
    ? data.map(card).join("")
    : empty(
        "Nenhuma doação por aqui ainda",
        "Tente outra categoria, cidade ou palavra. Um novo começo pode estar logo ali.",
      );
  document.querySelector("#count").textContent =
    `${data.length} ${data.length === 1 ? "doação disponível" : "doações disponíveis"}`;
  document.querySelector("#clear-filters").hidden = !(
    state.q ||
    state.category !== "all" ||
    state.city ||
    state.sort !== "new"
  );
  document.querySelectorAll("[data-category]").forEach((b) => {
    b.classList.toggle("active", b.dataset.category === state.category);
    b.setAttribute(
      "aria-pressed",
      String(b.dataset.category === state.category),
    );
  });
}
function renderExplore() {
  const s = exploreState();
  lastExplore = exploreHash(s);
  main.innerHTML = `<div class="container"><section class="hero"><div><div class="eyebrow">CONECTANDO GENEROSIDADE</div><h1>O que você não usa<br>pode mudar <em>um dia.</em></h1><p>Compartilhe o que tem. Encontre o que precisa.<br>Juntos, damos novos começos às coisas — e às pessoas.</p><div class="hero-actions"><button class="btn primary" data-action="create">Quero doar <span aria-hidden="true">↗</span></button><button class="btn ghost" data-action="scroll-explore">Encontrar uma doação <span aria-hidden="true">↓</span></button></div><div class="hero-foot"><span aria-hidden="true">✓</span> Simples, gratuito e feito para conectar.</div></div>${heroArt()}</section><section class="explore" id="explore"><div class="section-head"><div><h2>Encontre um novo começo</h2><p>Coisas em bom estado, prontas para uma nova história.</p></div><span class="mini-tag">GENEROSIDADE EM MOVIMENTO</span></div><div class="filter-box"><div class="search"><span class="search-icon" aria-hidden="true">⌕</span><input id="search" type="search" maxlength="100" aria-label="Buscar doações" placeholder="O que você está procurando?" value=""></div><div class="select-wrap"><span aria-hidden="true">⌖</span><select id="city" aria-label="Filtrar por cidade"><option value="">Todas as cidades</option>${cities.map((city) => `<option>${esc(city)}</option>`).join("")}</select></div></div><div class="categories" aria-label="Categorias">${categories.map((c) => `<button class="chip" data-category="${c.id}" aria-pressed="false">${icon(c.icon)}${c.name}</button>`).join("")}</div><div class="results-meta"><div><span id="count" role="status" aria-live="polite"></span> <button id="clear-filters" class="text-btn" data-action="clear">Limpar filtros</button></div><select id="sort" class="sort-select" aria-label="Ordenar doações"><option value="new">Mais recentes primeiro</option><option value="az">Título: A a Z</option></select></div><div id="results" class="grid"></div><div class="community"><div class="community-copy"><span class="community-icon" aria-hidden="true">♧</span><div><h3>Tem algo parado por aí?</h3><p>Uma doação sua pode ser exatamente o que alguém procura.</p></div></div><button class="btn secondary" data-action="create">Dar um novo destino <span aria-hidden="true">↗</span></button></div></section></div>`;
  // URL values are data: assign DOM properties after the static markup exists.
  document.querySelector("#search").value = s.q;
  document.querySelector("#city").value = s.city;
  document.querySelector("#sort").value = s.sort;
  renderResults();
}
function renderDetail(id) {
  const item = items.find((i) => i.id === id);
  if (!item) {
    renderNotFound();
    return;
  }
  const requested = requests.has(item.id);
  main.innerHTML = `<div class="container page"><a class="back-link" href="#/explorar">← Voltar para explorar</a><div class="detail-layout"><div class="detail-art">${art(item.art)}<span class="mini-tag">ILUSTRAÇÃO · ITEM FICTÍCIO</span></div><section class="detail-copy"><span class="tag green-tag">${esc(categoryName(item.category))} · Disponível na demo</span><h1 class="wrap">${esc(item.title)}</h1><div class="detail-location">${icon("pin")}${esc(item.city)}</div><p class="wrap">${esc(item.desc)}</p><div class="detail-facts"><div><small>Estado do item</small><strong>${esc(item.condition)}</strong></div><div><small>Quantidade</small><strong>${esc(item.quantity)} ${esc(item.unit)}</strong></div><div class="full"><small>Como receber</small><strong>${esc(item.pickup)}</strong></div></div><div class="donor"><span class="avatar">${esc(item.initials)}</span><div><strong>${esc(item.donor)}</strong><small>Perfil fictício · comunidade demonstrativa</small></div></div><div class="detail-actions"><button class="btn primary" data-action="request" data-id="${esc(item.id)}" ${requested ? "disabled" : ""}>${requested ? "✓ Interesse registrado" : "Tenho interesse"} ${requested ? "" : "↗"}</button>${favoriteButton(item, "btn ghost")}</div><p class="detail-note">Simulação: nenhum pedido será enviado. Não há contato ou retirada reais.</p></section></div><div class="detail-bottom"><h3>Um gesto simples,<br>uma nova história.</h3><p>Na experiência completa, doador e interessado combinariam os próximos passos. Nesta demo, você pode registrar o interesse e acompanhar o estado de sucesso em “Minha atividade”, sem compartilhar dados pessoais.</p></div></div>`;
  // The destination always uses our explore route and serialized, validated filters.
  main.querySelector(".back-link").href = lastExplore;
}
function renderActivity() {
  const offers = items.filter((i) => donated.includes(i.id));
  const saved = items.filter((i) => favorites.has(i.id));
  const interested = items.filter((i) => requests.has(i.id));
  const current =
    activityTab === "offers"
      ? offers
      : activityTab === "saved"
        ? saved
        : interested;
  main.innerHTML = `<div class="container page"><div class="section-head"><div><div class="eyebrow">SEUS PEQUENOS GESTOS</div><h1 class="page-title">Minha atividade</h1><p>O que você compartilhou, salvou e encontrou nesta sessão.</p></div><button class="btn primary" data-action="create">＋ Doar um item</button></div><div class="notice">Tudo aqui é simulado e fica apenas na memória desta aba. Recarregar a página reinicia a experiência.</div><div class="activity-tabs" aria-label="Tipo de atividade"><button class="chip ${activityTab === "offers" ? "active" : ""}" data-tab="offers" aria-pressed="${activityTab === "offers"}">Minhas doações (${offers.length})</button><button class="chip ${activityTab === "saved" ? "active" : ""}" data-tab="saved" aria-pressed="${activityTab === "saved"}">Favoritos (${saved.length})</button><button class="chip ${activityTab === "requests" ? "active" : ""}" data-tab="requests" aria-pressed="${activityTab === "requests"}">Interesses (${interested.length})</button></div>${current.length ? (activityTab === "saved" ? `<div class="grid">${current.map(card).join("")}</div>` : current.map((i) => `<article class="activity-row"><div class="row-art">${art(i.art)}</div><div class="row-copy"><span class="tag green-tag">${activityTab === "offers" ? "Cadastrada na demo" : "Interesse registrado"}</span><h3 class="wrap">${esc(i.title)}</h3><p>${esc(i.city)} · ${esc(i.quantity)} ${esc(i.unit)} · Nenhuma ação real</p></div><a class="btn" href="#/doacao/${esc(i.id)}">Ver detalhes ↗</a></article>`).join("")) : empty(activityTab === "offers" ? "Seu primeiro gesto começa aqui" : activityTab === "saved" ? "Guarde boas possibilidades" : "Encontre algo que faça sentido", activityTab === "offers" ? "Cadastre uma doação fictícia e veja como é fácil dar um novo destino a um item." : activityTab === "saved" ? "Toque no coração de uma doação para encontrá-la aqui depois." : "Explore as doações e simule seu interesse em receber um item.", activityTab === "offers" ? "create" : "explore", activityTab === "offers" ? "Cadastrar uma doação" : "Explorar doações")}<div class="reset-bar"><small>Quer apresentar a demo desde o começo?</small><button class="text-btn" data-action="reset">Reiniciar demonstração</button></div></div>`;
}
function renderHow() {
  main.innerHTML = `<div class="container page"><section class="about-hero"><div class="eyebrow">GENEROSIDADE, SEM COMPLICAÇÃO</div><h1>Uma ponte entre<br>quem tem e quem precisa.</h1><p>Auxilium nasce da ideia de que coisas úteis merecem continuar sua história. Uma experiência acolhedora para transformar intenção em pequenos gestos.</p><button class="btn primary" data-action="create">Experimentar uma doação ↗</button></section><div class="steps"><article class="step-card"><div class="step-number">01</div><h3>Encontre uma possibilidade</h3><p>Explore itens e use os filtros de categoria, cidade e busca para encontrar o que faz sentido para você.</p></article><article class="step-card"><div class="step-number">02</div><h3>Crie uma conexão</h3><p>Abra os detalhes, salve um favorito ou registre um interesse simulado. Todo gesto tem um retorno claro.</p></article><article class="step-card"><div class="step-number">03</div><h3>Dê um novo começo</h3><p>Cadastre um item fictício, revise as informações e acompanhe sua doação em Minha atividade.</p></article></div><section class="faq"><h2>Bom saber antes de explorar</h2><details open><summary>Esta plataforma recebe doações reais?</summary><p>Esta versão é uma demo de portfólio. Os itens, organizações, quantidades e ações são fictícios. Não há pagamentos, autenticação ou mensagens enviadas.</p></details><details><summary>Preciso criar uma conta?</summary><p>Não. Você pode navegar livremente e experimentar todos os fluxos desta demo. Nenhum nome, documento, telefone, endereço ou e-mail é solicitado.</p></details><details><summary>O que acontece com o que eu cadastro?</summary><p>O item aparece no catálogo e em Minha atividade somente enquanto esta aba estiver aberta, até você recarregar ou reiniciar a demo. Não insira dados pessoais reais.</p></details><details><summary>De onde vem a identidade do Auxilium?</summary><p>A demo retoma o nome Auxilium, o símbolo original de coração sobre uma caixa, a paleta quente e os fluxos de exploração e oferta de itens do projeto.</p></details></section><div class="community"><div><h3>Pronto para explorar?</h3><p>Uma pequena ação é um ótimo lugar para começar.</p></div><a class="btn secondary" href="#/explorar">Encontrar uma doação ↗</a></div></div>`;
}
function renderNotFound() {
  main.innerHTML = `<div class="container page">${empty("Este caminho ainda não tem uma história", "A doação pode ter sido reiniciada com a demo. Volte ao catálogo para encontrar outra possibilidade.", "explore", "Voltar para explorar")}</div>`;
}
function render(scroll = true) {
  const { path } = route();
  const previousPath = main.dataset.route;
  if (modal.open) closeModal();
  if (
    path === "/explorar" &&
    previousPath === path &&
    document.querySelector("#search")
  ) {
    const s = exploreState();
    lastExplore = exploreHash(s);
    document.querySelector("#search").value = s.q;
    document.querySelector("#city").value = s.city;
    document.querySelector("#sort").value = s.sort;
    renderResults();
  } else if (path === "/explorar" || path === "/") renderExplore();
  else if (path.startsWith("/doacao/")) {
    try {
      renderDetail(decodeURIComponent(path.slice(8)));
    } catch {
      renderNotFound();
    }
  } else if (path === "/atividade") renderActivity();
  else if (path === "/como-funciona") renderHow();
  else renderNotFound();
  main.dataset.route = path;
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const active = path.startsWith("/doacao/")
      ? a.dataset.nav === "explorar"
      : path === "/" + a.dataset.nav;
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  if (scroll && path !== previousPath)
    window.scrollTo({ top: 0, behavior: "instant" });
  document.title = path.startsWith("/doacao/")
    ? `${items.find((i) => i.id === path.slice(8))?.title || "Doação"} · Auxilium`
    : "Auxilium · Doações que conectam";
}
function modalFrame(title, subtitle, body) {
  const replacing = modal.open;
  modal.innerHTML = `<div class="modal-head"><div><h2 id="modal-title">${title}</h2><p>${subtitle}</p></div><button class="close-btn" data-action="close" aria-label="Fechar modal">×</button></div><div class="modal-body">${body}</div>`;
  // Prevent a rapid second click from landing on a different action as the dialog changes size.
  if (replacing) {
    ignoreBackdropUntil = performance.now() + 300;
    const buttons = [...modal.querySelectorAll("button")];
    buttons.forEach((button) => (button.disabled = true));
    modal.focus();
    setTimeout(() => {
      if (!buttons.some((button) => modal.contains(button))) return;
      buttons.forEach((button) => (button.disabled = false));
      if (
        modal.open &&
        (document.activeElement === modal ||
          document.activeElement === document.body)
      )
        modal
          .querySelector(".modal-actions .primary,.success .primary")
          ?.focus();
    }, 220);
  }
}
function openModal() {
  if (!modal.open) modal.showModal();
  document.body.classList.add("modal-open");
}
function closeModal() {
  modal.close();
  document.body.classList.remove("modal-open");
}
function newDraft() {
  draft = {
    title: "",
    category: "education",
    quantity: "1",
    condition: "Muito bom",
    city: "São Paulo",
    desc: "",
    submitted: false,
    id: null,
  };
  renderCreate();
  openModal();
}
function renderCreate() {
  modalFrame(
    "Dê um novo destino",
    "Cadastro de doação · demonstração",
    `<div class="wizard-steps"><span class="active">01 · Seu item</span><span>02 · Revisão</span><span>03 · Pronto</span></div><div class="notice">Use informações fictícias. Não insira dados pessoais reais. Nada será enviado ou salvo fora desta aba.</div><form id="donation-form"><div class="form-grid"><label class="field full">O que você quer doar?<input name="title" required minlength="3" maxlength="70" placeholder="Ex.: Uma coleção de livros" value="${esc(draft.title)}" autocomplete="off"></label><label class="field">Categoria<select name="category">${categories
      .filter((c) => c.id !== "all")
      .map(
        (c) =>
          `<option value="${c.id}" ${c.id === draft.category ? "selected" : ""}>${c.name}</option>`,
      )
      .join(
        "",
      )}</select></label><label class="field">Quantidade<input name="quantity" type="number" required min="1" max="99" step="1" value="${esc(draft.quantity)}"></label><label class="field">Estado do item<select name="condition">${["Novo", "Muito bom", "Bom"].map((c) => `<option ${c === draft.condition ? "selected" : ""}>${c}</option>`).join("")}</select></label><label class="field">Cidade ilustrativa<select name="city">${cities.map((c) => `<option ${c === draft.city ? "selected" : ""}>${c}</option>`).join("")}</select></label><label class="field full">Conte um pouco sobre o item<textarea name="desc" required minlength="10" maxlength="280" placeholder="Descreva o estado e os detalhes do item fictício.">${esc(draft.desc)}</textarea><small>Entre 10 e 280 caracteres. Sem dados de contato.</small></label></div><div class="modal-actions"><button type="button" class="btn ghost" data-action="close">Cancelar</button><button type="submit" class="btn primary">Revisar doação →</button></div></form>`,
  );
}
function renderReview() {
  const kind = {
    education: "books",
    clothes: "clothes",
    food: "food",
    home: "chair",
    toys: "toys",
  }[draft.category];
  modalFrame(
    "Quase um novo começo",
    "Confira seu item antes de concluir",
    `<div class="wizard-steps"><span>01 · Seu item</span><span class="active">02 · Revisão</span><span>03 · Pronto</span></div><div class="review-item">${art(kind)}<div><h3 class="wrap">${esc(draft.title)}</h3><p>${esc(categoryName(draft.category))} · ${esc(draft.city)}</p></div></div><dl class="review-details"><div><dt>Quantidade</dt><dd>${esc(draft.quantity)} unidade(s)</dd></div><div><dt>Estado</dt><dd>${esc(draft.condition)}</dd></div><div class="full"><dt>Retirada</dt><dd>Ponto comunitário fictício</dd></div></dl><p class="review-desc">${esc(draft.desc)}</p><div class="notice">Você está cadastrando um item só nesta demonstração. Nenhuma publicação real acontecerá.</div><div class="modal-actions"><button class="btn ghost" data-action="edit-draft">← Editar</button><button class="btn primary" data-action="submit-draft">Concluir simulação ✓</button></div>`,
  );
}
function submitDraft() {
  if (!draft || draft.submitted) return;
  draft.submitted = true;
  draft.id = "demo-" + nextId++;
  const kind = {
    education: "books",
    clothes: "clothes",
    food: "food",
    home: "chair",
    toys: "toys",
  }[draft.category];
  items.unshift({
    id: draft.id,
    title: draft.title,
    category: draft.category,
    city: draft.city,
    condition: draft.condition,
    quantity: Number(draft.quantity),
    unit: "unidade(s)",
    art: kind,
    desc: draft.desc,
    short: draft.desc.slice(0, 95) + (draft.desc.length > 95 ? "…" : ""),
    donor: "Você · perfil demonstrativo",
    initials: "DE",
    pickup: "Retirada em ponto comunitário fictício",
    date: 100 + nextId,
  });
  donated.push(draft.id);
  if (route().path === "/atividade") renderActivity();
  else if (route().path === "/explorar") renderResults();
  modalFrame(
    "Seu gesto ganhou um novo começo",
    "Simulação concluída",
    `<div class="success"><div class="success-icon" aria-hidden="true">✓</div><h2>Doação cadastrada na demo!</h2><p><strong class="wrap">${esc(draft.title)}</strong> já aparece no catálogo. Sua doação foi registrada somente nesta aba.</p><button class="btn primary" data-action="view-created" data-id="${draft.id}">Ver minha doação ↗</button><button class="btn ghost" data-action="create">Cadastrar outro item</button><small>Nenhum dado foi enviado. Recarregar reinicia a demo.</small></div>`,
  );
}
function request(id) {
  const item = items.find((i) => i.id === id);
  if (!item || requests.has(id)) return;
  modalFrame(
    "Um novo começo para você?",
    "Registre um interesse fictício",
    `<div class="review-item">${art(item.art)}<div><h3 class="wrap">${esc(item.title)}</h3><p>${esc(item.city)} · ${esc(item.quantity)} ${esc(item.unit)}</p></div></div><div class="request-summary">Como seria o próximo passo?<small>O doador combinaria a entrega com você. Aqui, mostramos apenas a confirmação e o acompanhamento.</small></div><div class="notice">Simulação sem contato com pessoas ou organizações. Nenhuma mensagem será enviada.</div><div class="modal-actions"><button class="btn ghost" data-action="close">Agora não</button><button class="btn primary" data-action="confirm-request" data-id="${esc(id)}">Simular interesse ✓</button></div>`,
  );
  openModal();
}
function confirmRequest(id) {
  const item = items.find((i) => i.id === id);
  if (!item || requests.has(id)) return;
  requests.add(id);
  renderDetail(id);
  modalFrame(
    "Interesse registrado",
    "Simulação concluída",
    `<div class="success"><div class="success-icon" aria-hidden="true">✓</div><h2>Uma conexão começou.</h2><p>Seu interesse em <strong class="wrap">${esc(item.title)}</strong> aparece em Minha atividade. Nenhum pedido real foi enviado.</p><button class="btn primary" data-action="activity-requests">Acompanhar meu interesse ↗</button><button class="btn ghost" data-action="close">Continuar explorando</button></div>`,
  );
}
function updateFavorites(id, button) {
  if (!items.some((i) => i.id === id)) return;
  if (favorites.has(id)) {
    favorites.delete(id);
    toast("Doação removida dos favoritos.");
  } else {
    favorites.add(id);
    toast("Doação salva nos favoritos.");
  }
  const saved = favorites.has(id);
  const item = items.find((i) => i.id === id);
  button.classList.toggle("saved", saved);
  button.setAttribute("aria-pressed", String(saved));
  button.setAttribute(
    "aria-label",
    `${saved ? "Remover dos favoritos" : "Salvar nos favoritos"}: ${item.title}`,
  );
  if (button.classList.contains("btn"))
    button.innerHTML = icon("heart") + ` ${saved ? "Salvo" : "Salvar"}`;
  if (route().path === "/atividade") renderActivity();
}
document.addEventListener("click", (event) => {
  const button = event.target.closest(
    "[data-action],[data-category],[data-tab]",
  );
  if (!button) return;
  if (button.dataset.category) {
    setFilters({ category: button.dataset.category });
    return;
  }
  if (button.dataset.tab) {
    activityTab = button.dataset.tab;
    renderActivity();
    return;
  }
  const id = button.dataset.id;
  switch (button.dataset.action) {
    case "create":
      newDraft();
      break;
    case "close":
      closeModal();
      break;
    case "clear":
      setFilters({ q: "", category: "all", city: "", sort: "new" });
      break;
    case "explore":
      location.hash = "#/explorar";
      break;
    case "scroll-explore":
      document
        .querySelector("#explore")
        ?.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
      break;
    case "favorite":
      updateFavorites(id, button);
      break;
    case "request":
      request(id);
      break;
    case "confirm-request":
      button.disabled = true;
      confirmRequest(id);
      break;
    case "edit-draft":
      renderCreate();
      modal.querySelector("input")?.focus();
      break;
    case "submit-draft":
      button.disabled = true;
      submitDraft();
      break;
    case "view-created":
      closeModal();
      location.hash = "#/doacao/" + id;
      break;
    case "activity-requests":
      activityTab = "requests";
      closeModal();
      location.hash = "#/atividade";
      break;
    case "reset":
      modalFrame(
        "Recomeçar a demonstração?",
        "Sua atividade fictícia será reiniciada",
        `<p class="review-desc">Os itens cadastrados, favoritos e interesses desta aba serão apagados. Os seis itens ilustrativos iniciais voltam ao catálogo.</p><div class="modal-actions"><button class="btn ghost" data-action="close">Cancelar</button><button class="btn primary" data-action="confirm-reset">Reiniciar demo</button></div>`,
      );
      openModal();
      break;
    case "confirm-reset":
      items = seed.map((i) => ({ ...i }));
      favorites = new Set();
      requests = new Set();
      donated = [];
      draft = null;
      activityTab = "offers";
      closeModal();
      location.hash = "#/explorar";
      render();
      toast("Demonstração reiniciada. Um novo começo!");
      break;
  }
});
document.addEventListener("input", (event) => {
  if (event.target.id === "search") setFilters({ q: event.target.value }, true);
});
document.addEventListener("change", (event) => {
  if (event.target.id === "city") setFilters({ city: event.target.value });
  if (event.target.id === "sort") setFilters({ sort: event.target.value });
});
document.addEventListener("submit", (event) => {
  if (event.target.id !== "donation-form") return;
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.target));
  const title = values.title.trim();
  const desc = values.desc.trim();
  if (title.length < 3 || desc.length < 10) {
    toast("Preencha um título e uma descrição completos.");
    return;
  }
  draft = { ...draft, ...values, title, desc };
  renderReview();
  modal.querySelector('[data-action="submit-draft"]')?.focus();
});
modal.addEventListener("cancel", () =>
  document.body.classList.remove("modal-open"),
);
modal.addEventListener("close", () =>
  document.body.classList.remove("modal-open"),
);
modal.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const focusable = [
    ...modal.querySelectorAll(
      "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]",
    ),
  ];
  const first = focusable[0],
    last = focusable.at(-1);
  if (!first) {
    event.preventDefault();
    modal.focus();
    return;
  }
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === modal)
  ) {
    event.preventDefault();
    last.focus();
  } else if (
    !event.shiftKey &&
    (document.activeElement === last || document.activeElement === modal)
  ) {
    event.preventDefault();
    first.focus();
  }
});
modal.addEventListener("click", (event) => {
  if (event.target === modal && performance.now() > ignoreBackdropUntil) {
    const box = modal.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      closeModal();
  }
});
window.addEventListener("hashchange", () => render());
document.querySelector(".skip").addEventListener("click", (event) => {
  event.preventDefault();
  main.focus();
  main.scrollIntoView({ behavior: "instant" });
});
if (!location.hash) history.replaceState(null, "", "#/explorar");
render();
