var $ = function (s) { return document.querySelector(s); };
var globe = null, lenis = null, lang = "fr";
document.documentElement.classList.add("js");
function t(fr, en) { return lang === "en" ? en : fr; }

/* Globe Vanta.js */
function initGlobe() {
  try {
    if (globe) globe.destroy();
    var l = document.body.classList.contains("light");
    globe = VANTA.GLOBE({
      el: "#vanta", THREE: window.THREE, mouseControls: true, touchControls: true,
      gyroControls: false, minHeight: 200, minWidth: 200, scale: 1, scaleMobile: 1, size: 1.1,
      color: l ? 0x0055ee : 0x00e5a0, color2: l ? 0x00a6e0 : 0x4dd9ff,
      backgroundColor: l ? 0xf0f4ff : 0x05090c
    });
  } catch (err) { console.warn("Vanta indisponible", err); }
}

/* Thème : soleil en mode sombre, lune en mode clair */
function theme() {
  var light = document.body.classList.toggle("light");
  $("#tt").textContent = light ? "🌙" : "☀️";
  try { localStorage.setItem("theme", light ? "light" : "dark"); } catch (e) {}
  initGlobe();
}
try {
  if (localStorage.getItem("theme") === "light") { document.body.classList.add("light"); $("#tt").textContent = "🌙"; }
} catch (e) {}

/* Langue FR / EN */
function setLang(l) {
  lang = l;
  document.documentElement.lang = l;
  document.querySelectorAll("[data-en]").forEach(function (e) {
    if (!e.dataset.fr) e.dataset.fr = e.innerHTML;
    e.innerHTML = l === "en" ? e.dataset.en : e.dataset.fr;
  });
  $("#lb").textContent = l === "en" ? "FR" : "EN";
  try { localStorage.setItem("lang", l); } catch (e) {}
}
function toggleLang() { setLang(lang === "fr" ? "en" : "fr"); }

/* Défilement fluide Lenis + ancres */
if (window.Lenis) {
  lenis = new Lenis({ duration: 1.2 });
  (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
}
document.addEventListener("click", function (e) {
  var a = e.target.closest("[data-go]");
  if (!a) return;
  e.preventDefault();
  var el = document.getElementById(a.dataset.go);
  if (lenis) lenis.scrollTo(el, { offset: -70 }); else el.scrollIntoView({ behavior: "smooth" });
});

/* Apparition au scroll */
var io = new IntersectionObserver(function (list) {
  list.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".rv").forEach(function (e) { io.observe(e); });

/* Marquee + curseur */
var mq = $("#mqi"); mq.innerHTML += mq.innerHTML;
var ring = $("#ring");
document.addEventListener("mousemove", function (e) {
  ring.style.opacity = 1; ring.style.left = e.clientX + "px"; ring.style.top = e.clientY + "px";
  ring.classList.toggle("h", !!e.target.closest("a,button,summary,.card"));
});

/* Formulaire (EmailJS) */
function loadEmailJS() {
  return new Promise(function (ok, ko) {
    if (window.emailjs) return ok();
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = ok; s.onerror = ko; document.head.appendChild(s);
  });
}
async function sendMail() {
  var v = function (id) { return $("#" + id).value.trim(); };
  var st = $("#st"), btn = $("#send");
  if (!v("n") || !v("e") || !v("m")) { st.textContent = t("Merci de remplir le nom, l'email et le message.", "Please fill in your name, email and message."); return; }
  btn.disabled = true; st.textContent = t("Envoi en cours...", "Sending...");
  try {
    await loadEmailJS();
    await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
      from_name: v("n"), from_email: v("e"),
      phone: v("t") ? v("i") + " " + v("t") : "Non renseigné",
      subject: v("s") || "Contact depuis le portfolio", message: v("m")
    }, { publicKey: "YOUR_PUBLIC_KEY" });
    st.textContent = t("Message envoyé, je vous répondrai vite !", "Message sent, I will reply soon!");
    ["n", "e", "t", "s", "m"].forEach(function (id) { $("#" + id).value = ""; });
  } catch (err) {
    st.textContent = t("Erreur d'envoi. Écrivez-moi : julien.fontainee@hotmail.com", "Sending failed. Write to me: julien.fontainee@hotmail.com");
  }
  btn.disabled = false;
}

try { if (localStorage.getItem("lang") === "en") setLang("en"); } catch (e) {}
initGlobe();
