(() => {
  const STORAGE_KEY = "dossierFormData";

  const form = document.getElementById("cv-form");
  const formView = document.getElementById("form-view");
  const resultView = document.getElementById("result-view");
  const cvDoc = document.getElementById("cv-doc");
  const letterDoc = document.getElementById("letter-doc");
  const exampleBanner = document.getElementById("example-banner");
  const step1 = document.getElementById("step-1");
  const step2 = document.getElementById("step-2");

  const lists = {
    formation: document.getElementById("formations-list"),
    experience: document.getElementById("experiences-list"),
    langue: document.getElementById("langues-list"),
  };
  const templates = {
    formation: document.getElementById("formation-row-template"),
    experience: document.getElementById("experience-row-template"),
    langue: document.getElementById("langue-row-template"),
  };

  const exampleData = {
    personal: {
      prenom: "Awa", nom: "Diallo", email: "awa.diallo@example.com",
      telephone: "06 12 34 56 78", ville: "Lyon", poste: "Développeuse Full-Stack",
      profil: "Développeuse full-stack de 3 ans d'expérience, spécialisée en JavaScript et Python. J'aime transformer des besoins métier complexes en produits simples à utiliser.",
      competences: "JavaScript, React, Node.js, Python, PostgreSQL, Docker",
      interets: "Escalade, photographie argentique, open-source",
      lettreEntreprise: "Nova Digital", lettreCivilite: "Madame, Monsieur",
      lettrePointsForts: "Je suis autonome, curieuse et j'aime particulièrement les projets où le code a un impact direct sur les utilisateurs.",
    },
    formations: [
      { diplome: "Master Informatique", ecole: "Université Lyon 1", debut: "2019", fin: "2021" },
    ],
    experiences: [
      { poste: "Développeuse Full-Stack", entreprise: "Nimbus Tech", periode: "2021 - Aujourd'hui",
        description: "Conception d'une API REST utilisée par 50k utilisateurs\nMigration du frontend vers React\nMise en place de tests automatisés (couverture 85%)" },
    ],
    langues: [{ langue: "Français", niveau: "Langue maternelle" }, { langue: "Anglais", niveau: "Courant" }],
  };

  let isExample = false;

  function addRow(type, values) {
    const row = templates[type].content.firstElementChild.cloneNode(true);
    if (values) {
      row.querySelectorAll("[data-field]").forEach((el) => {
        const key = el.dataset.field;
        if (values[key] !== undefined) el.value = values[key];
      });
    }
    lists[type].appendChild(row);
  }

  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addRow(btn.dataset.add));
  });
  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-remove]")) e.target.closest(".repeat-row").remove();
  });

  function rowsData(type) {
    return Array.from(lists[type].querySelectorAll(".repeat-row")).map((row) => {
      const data = {};
      row.querySelectorAll("[data-field]").forEach((el) => { data[el.dataset.field] = el.value.trim(); });
      return data;
    });
  }

  function getFormData() {
    const fd = new FormData(form);
    const personal = {};
    ["prenom","nom","email","telephone","ville","poste","profil","competences","interets","lettreEntreprise","lettreCivilite","lettrePointsForts"]
      .forEach((key) => (personal[key] = (fd.get(key) || "").toString().trim()));
    return { personal, formations: rowsData("formation"), experiences: rowsData("experience"), langues: rowsData("langue") };
  }

  function setFormData(data) {
    if (!data) return;
    Object.entries(data.personal || {}).forEach(([key, value]) => {
      const el = form.elements.namedItem(key);
      if (el) el.value = value;
    });
    ["formation","experience","langue"].forEach((type) => {
      lists[type].innerHTML = "";
      (data[type + "s"] || []).forEach((values) => addRow(type, values));
    });
  }

  function saveToStorage() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(getFormData())); } catch (e) {}
  }
  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { setFormData(JSON.parse(raw)); return true; }
    } catch (e) {}
    return false;
  }

  function escapeHtml(str) {
    return (str || "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }
  function tagList(csv) { return (csv || "").split(",").map((s) => s.trim()).filter(Boolean); }

  function renderCv(data) {
    const p = data.personal;
    const skills = tagList(p.competences);
    const interests = tagList(p.interets);

    const formationsHtml = data.formations.map((f) => `
      <div class="cv-item">
        <div class="cv-item-title"><span>${escapeHtml(f.diplome)}</span><span>${escapeHtml(f.debut)}${f.fin ? " – " + escapeHtml(f.fin) : ""}</span></div>
        <div class="cv-item-sub">${escapeHtml(f.ecole)}</div>
      </div>`).join("");

    const experiencesHtml = data.experiences.map((exp) => {
      const missions = (exp.description || "").split("\n").map((m) => m.trim()).filter(Boolean).map((m) => `<li>${escapeHtml(m)}</li>`).join("");
      return `
      <div class="cv-item">
        <div class="cv-item-title"><span>${escapeHtml(exp.poste)}${exp.entreprise ? " – " + escapeHtml(exp.entreprise) : ""}</span><span>${escapeHtml(exp.periode)}</span></div>
        ${missions ? `<ul>${missions}</ul>` : ""}
      </div>`;
    }).join("");

    const languesHtml = data.langues.map((l) => `<div class="cv-item-title"><span>${escapeHtml(l.langue)}</span><span>${escapeHtml(l.niveau)}</span></div>`).join("");

    cvDoc.innerHTML = `
      <div class="cv-header">
        <h2>${escapeHtml(p.prenom)} ${escapeHtml(p.nom)}</h2>
        <p class="cv-poste">${escapeHtml(p.poste)}</p>
        <div class="cv-contact">
          ${p.email ? `<span>${escapeHtml(p.email)}</span>` : ""}
          ${p.telephone ? `<span>${escapeHtml(p.telephone)}</span>` : ""}
          ${p.ville ? `<span>${escapeHtml(p.ville)}</span>` : ""}
        </div>
      </div>
      ${p.profil ? `<div class="cv-section"><h3>Profil</h3><p>${escapeHtml(p.profil)}</p></div>` : ""}
      ${data.experiences.length ? `<div class="cv-section"><h3>Expérience professionnelle</h3>${experiencesHtml}</div>` : ""}
      ${data.formations.length ? `<div class="cv-section"><h3>Formation</h3>${formationsHtml}</div>` : ""}
      ${skills.length ? `<div class="cv-section"><h3>Compétences</h3><div class="tag-list">${skills.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("")}</div></div>` : ""}
      ${data.langues.length ? `<div class="cv-section"><h3>Langues</h3>${languesHtml}</div>` : ""}
      ${interests.length ? `<div class="cv-section"><h3>Centres d'intérêt</h3><div class="tag-list">${interests.map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join("")}</div></div>` : ""}
    `;
  }

  function todayFr() {
    return new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  function renderLetter(data) {
    const p = data.personal;
    const posteLettre = p.poste || "ce poste";
    const entreprise = p.lettreEntreprise || "votre entreprise";
    const civilite = p.lettreCivilite || "Madame, Monsieur";
    const skills = tagList(p.competences).slice(0, 5).join(", ");
    const latestExp = data.experiences[0];
    const latestFormation = data.formations[0];

    let expPara = "";
    if (latestExp) {
      expPara = `Fort(e) de mon expérience en tant que ${escapeHtml(latestExp.poste)}${latestExp.entreprise ? " au sein de " + escapeHtml(latestExp.entreprise) : ""}, j'ai pu développer des compétences solides ${skills ? "en " + escapeHtml(skills) : "directement applicables à ce poste"}.`;
    }
    let formationPara = "";
    if (latestFormation) {
      formationPara = `Titulaire de ${escapeHtml(latestFormation.diplome)}${latestFormation.ecole ? " (" + escapeHtml(latestFormation.ecole) + ")" : ""}, je dispose des bases théoriques et pratiques nécessaires pour réussir dans ce rôle.`;
    }

    letterDoc.innerHTML = `
      <div class="letter-meta">
        <div>${escapeHtml(p.prenom)} ${escapeHtml(p.nom)}<br>${escapeHtml(p.email)}${p.telephone ? "<br>" + escapeHtml(p.telephone) : ""}</div>
        <div>${escapeHtml(p.ville)}, le ${todayFr()}</div>
      </div>
      <div class="letter-object">Objet : Candidature au poste de ${escapeHtml(posteLettre)}</div>
      <div class="letter-body">
        <p>${escapeHtml(civilite)},</p>
        <p>Actuellement à la recherche de nouvelles opportunités professionnelles, je me permets de vous adresser ma candidature pour le poste de ${escapeHtml(posteLettre)} au sein de ${escapeHtml(entreprise)}.</p>
        ${expPara ? `<p>${expPara}</p>` : ""}
        ${formationPara ? `<p>${formationPara}</p>` : ""}
        ${p.lettrePointsForts ? `<p>${escapeHtml(p.lettrePointsForts)}</p>` : ""}
        <p>Je me tiens à votre disposition pour un entretien au cours duquel je pourrai vous exposer plus en détail mes motivations et compétences.</p>
        <p>Dans l'attente de votre retour, je vous prie d'agréer, ${escapeHtml(civilite)}, l'expression de mes salutations distinguées.</p>
      </div>
      <div class="letter-signature">${escapeHtml(p.prenom)} ${escapeHtml(p.nom)}</div>
    `;
  }

  function showForm() {
    resultView.hidden = true; formView.hidden = false;
    step1.classList.add("active"); step2.classList.remove("active");
    window.scrollTo(0, 0);
  }
  function showResults(data) {
    renderCv(data); renderLetter(data);
    formView.hidden = true; resultView.hidden = false;
    step1.classList.remove("active"); step2.classList.add("active");
    exampleBanner.hidden = !isExample;
    window.scrollTo(0, 0);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    isExample = false;
    const data = getFormData();
    saveToStorage();
    showResults(data);
  });

  document.getElementById("btn-edit").addEventListener("click", showForm);

  document.getElementById("btn-use-mine").addEventListener("click", () => {
    isExample = false;
    form.reset();
    Object.values(lists).forEach((list) => (list.innerHTML = ""));
    addRow("formation"); addRow("experience"); addRow("langue");
    showForm();
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    if (!confirm("Effacer toutes les informations saisies ?")) return;
    form.reset();
    Object.values(lists).forEach((list) => (list.innerHTML = ""));
    localStorage.removeItem(STORAGE_KEY);
    addRow("formation"); addRow("experience"); addRow("langue");
  });

  document.querySelectorAll("[data-print]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.body.setAttribute("data-printing", btn.dataset.print);
      window.print();
    });
  });
  window.addEventListener("afterprint", () => document.body.removeAttribute("data-printing"));

  form.addEventListener("input", () => { isExample = false; saveToStorage(); });

  const hadSavedData = loadFromStorage();
  if (!lists.formation.children.length) addRow("formation");
  if (!lists.experience.children.length) addRow("experience");
  if (!lists.langue.children.length) addRow("langue");

  if (hadSavedData) {
    showResults(getFormData());
  } else {
    isExample = true;
    setFormData(exampleData);
    showResults(exampleData);
  }
})();
