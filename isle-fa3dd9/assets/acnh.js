/* Island UI kit behaviours, shared by every island page. */
(() => {
  window.ISLE = true;

  const root = document.documentElement;
  const zh = (root.lang || "").toLowerCase().startsWith("zh");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasIO = "IntersectionObserver" in window;
  const SPRITE = root.dataset.sprite || "assets/icons.svg";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  };
  const fmt = (n) => n.toLocaleString(zh ? "zh-CN" : "en-US");
  const icon = (name) => `<svg class="ico" aria-hidden="true"><use href="${SPRITE}#i-${name}"/></svg>`;
  const art = (id, vb = "0 0 40 40") => `<svg viewBox="${vb}" aria-hidden="true"><use href="#${id}"/></svg>`;

  const T = zh ? {
    months: null,
    week: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    tod: { auto: "跟随现实时间", morning: "清晨", day: "白天", evening: "傍晚", night: "夜晚" },
    bells: (n) => `获得了 ${fmt(n)} 铃钱！`,
    fruit: root.dataset.fruit ? `捡到了一个${root.dataset.fruit}！` : "捡到了水果！",
    copied: "已经复制到口袋里啦～",
    soundOn: "声音开启：岛民会叽里咕噜说话～",
    soundOff: "声音已关闭",
    timeTravel: (l) => `时间旅行：${l}`,
  } : {
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    week: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    tod: { auto: "Real time", morning: "Morning", day: "Daytime", evening: "Evening", night: "Night" },
    bells: (n) => `You got ${fmt(n)} Bells!`,
    fruit: root.dataset.fruit ? `You got a ${root.dataset.fruit}! Yum~` : "You got some fruit!",
    copied: "Copied to your pockets!",
    soundOn: "Sound on — villagers will chatter!",
    soundOff: "Sound off",
    timeTravel: (l) => `Time travel: ${l}`,
  };

  /* ---------- season + time of day (mirrors the inline bootstrap in <head>) ---------- */
  const TODS = ["auto", "morning", "day", "evening", "night"];
  const seasonOf = (m) => (m === 11 || m <= 1 ? "winter" : m <= 4 ? "spring" : m <= 7 ? "summer" : "autumn");
  const todOf = (h) => (h >= 5 && h < 9 ? "morning" : h >= 9 && h < 17 ? "day" : h >= 17 && h < 19 ? "evening" : "night");
  let todPref = store.get("isle-tod", "auto");
  if (!TODS.includes(todPref)) todPref = "auto";

  function applyWorld() {
    const now = new Date();
    root.dataset.season = seasonOf(now.getMonth());
    root.dataset.tod = todPref === "auto" ? todOf(now.getHours()) : todPref;
  }

  /* ---------- HUD clock ---------- */
  function tickHud() {
    const hud = $(".hud");
    if (!hud) return;
    const now = new Date();
    const h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, "0");
    $(".hud-md", hud).textContent = zh ? `${now.getMonth() + 1}月${now.getDate()}日` : `${T.months[now.getMonth()]} ${now.getDate()}`;
    $(".hud-wd", hud).textContent = T.week[now.getDay()];
    $(".hud-hm", hud).textContent = zh ? `${h}:${m}` : `${h % 12 || 12}:${m}`;
    $(".hud-ap", hud).textContent = zh ? "" : h < 12 ? "AM" : "PM";
    const wx = $(".hud-wx use", hud);
    if (wx) wx.setAttribute("href", `${SPRITE}#i-${root.dataset.tod === "night" ? "moon" : "sun"}`);
    $$("[data-clock]").forEach((el) => { el.textContent = zh ? `${h}:${m}` : `${h % 12 || 12}:${m} ${h < 12 ? "AM" : "PM"}`; });
  }

  /* ---------- tiny synth for villager chatter + sfx ---------- */
  const voice = {
    on: store.get("isle-sound", false),
    ctx: null,
    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    },
    tone(freq, dur = 0.07, type = "triangle", vol = 0.07, when = 0) {
      const ac = this.ensure();
      if (!ac) return;
      const t = ac.currentTime + when;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(ac.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    },
    blip(ch, n) {
      if (!this.on || (!zh && n % 2)) return;
      const c = ch.codePointAt(0);
      this.tone(330 + ((c * 47) % 320), 0.055, "triangle", 0.055);
    },
    sfx(kind) {
      if (!this.on) return;
      if (kind === "pop") { this.tone(560, 0.07, "sine", 0.07); this.tone(840, 0.09, "sine", 0.06, 0.05); }
      if (kind === "bell") [988, 1319, 1568].forEach((f, k) => this.tone(f, 0.22, "sine", 0.06, k * 0.07));
      if (kind === "shake") for (let k = 0; k < 5; k++) this.tone(180 + Math.random() * 140, 0.05, "square", 0.02, k * 0.06);
    },
  };

  function syncSoundButtons() {
    $$("[data-action='sound']").forEach((b) => {
      b.setAttribute("aria-pressed", String(voice.on));
      const use = $("use", b);
      if (use) use.setAttribute("href", `${SPRITE}#i-${voice.on ? "volume-high" : "volume-xmark"}`);
    });
  }

  /* ---------- toast ---------- */
  let toastTimer = 0;
  function toast(msg, iconHtml) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.innerHTML = `<span class="t-ico">${iconHtml || art("art-leaf", "0 0 64 64")}</span><span class="t-msg"></span>`;
    $(".t-msg", el).textContent = msg;
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  /* ---------- bells ---------- */
  let bells = store.get("isle-bells", 0);
  const syncBells = () => $$("[data-bells]").forEach((el) => { el.textContent = fmt(bells); });
  function addBells(n) { bells += n; store.set("isle-bells", bells); syncBells(); }

  /* ---------- dialogue ---------- */
  function Dialog(talk) {
    const bubble = $(".bubble", talk);
    const ghost = $(".ghost", talk);
    const typed = $(".typed", talk);
    const choices = $(".choices", talk);
    const keepChoices = talk.classList.contains("static");
    const script = $$(".lines li", talk).map((li) => li.textContent.trim());
    let queue = [];
    let i = 0;
    let pos = 0;
    let timer = 0;
    let typing = false;
    let onEnd = null;

    const showChoices = () => {
      if (!choices || keepChoices) return;
      choices.hidden = false;
      choices.classList.remove("show");
      void choices.offsetWidth;
      choices.classList.add("show");
    };
    const hideChoices = () => { if (choices && !keepChoices) choices.hidden = true; };

    function play(lines, end) {
      if (!lines.length) return;
      clearTimeout(timer);
      queue = lines;
      i = 0;
      onEnd = end || null;
      hideChoices();
      show();
    }
    function show() {
      const text = queue[i];
      ghost.textContent = text;
      typed.textContent = "";
      bubble.classList.remove("done", "ended");
      if (reduceMotion) { finish(); return; }
      typing = true;
      talk.classList.add("typing");
      pos = 0;
      step();
    }
    function step() {
      const text = queue[i];
      if (pos >= text.length) { finish(); return; }
      const ch = text[pos++];
      typed.textContent = text.slice(0, pos);
      if (/\S/.test(ch)) voice.blip(ch, pos);
      const pause = /[,.!?;:~，。！？；：～…]/.test(ch) && text[pos] !== undefined && !/[,.!?~，。！？～…]/.test(text[pos]) ? 190 : zh ? 50 : 24;
      timer = setTimeout(step, pause);
    }
    function finish() {
      clearTimeout(timer);
      typing = false;
      talk.classList.remove("typing");
      typed.textContent = queue[i];
      bubble.classList.add("done");
      if (i === queue.length - 1) {
        bubble.classList.add("ended");
        if (onEnd) onEnd();
      }
    }
    function advance() {
      if (typing) { finish(); return; }
      if (i < queue.length - 1) { i++; show(); return; }
      if (!choices || choices.hidden || keepChoices) {
        if (script.length) play(script, showChoices);
      }
    }

    if (bubble && !bubble.classList.contains("static")) {
      bubble.addEventListener("click", advance);
      bubble.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); advance(); }
      });
    }
    if (choices) {
      choices.addEventListener("click", (e) => {
        const c = e.target.closest(".choice");
        if (!c) return;
        voice.sfx("pop");
        if (c.dataset.reply) { e.preventDefault(); play([c.dataset.reply]); }
      });
    }
    return { play, script, showChoices };
  }

  /* ---------- NookPhone ---------- */
  function setupPhone() {
    const fab = $(".phone-fab");
    const wrap = $("#nookphone");
    if (!fab || !wrap) return;
    const phone = $(".phone", wrap);
    let last = null;
    if (store.get("isle-phone-seen", false)) fab.classList.add("seen");

    const open = () => {
      last = document.activeElement;
      wrap.hidden = false;
      requestAnimationFrame(() => wrap.classList.add("open"));
      fab.setAttribute("aria-expanded", "true");
      fab.classList.add("seen");
      store.set("isle-phone-seen", true);
      tickHud();
      syncBells();
      voice.sfx("pop");
      setTimeout(() => { const first = $(".app", wrap); if (first) first.focus({ preventScroll: true }); }, 80);
    };
    const close = (restore = true) => {
      wrap.classList.remove("open");
      fab.setAttribute("aria-expanded", "false");
      setTimeout(() => { wrap.hidden = true; }, 260);
      if (restore && last && last.focus) last.focus({ preventScroll: true });
    };

    fab.addEventListener("click", open);
    wrap.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) { close(); return; }
      const app = e.target.closest(".app");
      if (!app) return;
      const href = app.getAttribute("href") || "";
      if (href.startsWith("#")) close(false);
    });
    document.addEventListener("keydown", (e) => {
      if (wrap.hidden) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") {
        const items = $$("a[href], button:not([disabled])", phone);
        const first = items[0];
        const lastItem = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastItem.focus(); }
        else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- falling leaves / petals / snow ---------- */
  function particles() {
    const box = $(".particles");
    if (!box || reduceMotion) return;
    box.innerHTML = "";
    if (root.dataset.season === "summer") return;
    const n = window.innerWidth < 640 ? 7 : 13;
    for (let k = 0; k < n; k++) {
      const p = document.createElement("i");
      const dur = 12 + Math.random() * 12;
      p.style.cssText = [
        `--x:${(Math.random() * 100).toFixed(1)}vw`,
        `--s:${(0.7 + Math.random() * 0.7).toFixed(2)}`,
        `--dur:${dur.toFixed(1)}s`,
        `--delay:${(-Math.random() * dur).toFixed(1)}s`,
        `--wind:${Math.round(40 + Math.random() * 120)}px`,
        `--spin:${Math.round(180 + Math.random() * 360)}deg`,
      ].join(";");
      box.appendChild(p);
    }
  }

  /* ---------- init ---------- */
  function init() {
    applyWorld();
    tickHud();
    setInterval(() => { applyWorld(); tickHud(); }, 30000);
    syncBells();
    syncSoundButtons();
    particles();
    setupPhone();

    // bouncy logo letters
    $$("[data-split]").forEach((el) => {
      const label = el.textContent.trim();
      let k = 0;
      Array.from(el.childNodes).forEach((node) => {
        if (node.nodeType !== 3) return;
        const frag = document.createDocumentFragment();
        Array.from(node.textContent).forEach((ch) => {
          if (!ch.trim()) {
            if (k) { const g = document.createElement("span"); g.className = "gap"; frag.appendChild(g); }
            return;
          }
          const s = document.createElement("span");
          s.className = "ch";
          s.textContent = ch;
          s.style.setProperty("--i", k++);
          frag.appendChild(s);
        });
        node.replaceWith(frag);
      });
      el.setAttribute("aria-hidden", "true");
      const sr = document.createElement("span");
      sr.className = "sr-only";
      sr.textContent = label;
      el.after(sr);
    });

    // conversations
    const dialogs = new Map();
    $$(".talk").forEach((talk) => dialogs.set(talk, Dialog(talk)));
    const heroTalk = $(".hero .talk");
    const hero = heroTalk && dialogs.get(heroTalk);
    if (hero && hero.script.length) setTimeout(() => hero.play(hero.script, hero.showChoices), reduceMotion ? 0 : 700);

    const villager = $(".villager");
    if (villager && hero) {
      villager.addEventListener("click", () => {
        voice.sfx("pop");
        const pokes = (villager.dataset.poke || "").split("|").filter(Boolean);
        hero.play(pokes.length ? [pokes[Math.floor(Math.random() * pokes.length)]] : hero.script, hero.showChoices);
      });
    }

    $$("[data-talk-open]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const talk = document.getElementById(btn.dataset.talkOpen);
        if (!talk) return;
        const d = dialogs.get(talk);
        talk.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        voice.sfx("pop");
        if (d) d.play(d.script);
      });
    });

    // sound + time travel
    document.addEventListener("click", (e) => {
      const act = e.target.closest("[data-action]");
      if (!act) return;
      if (act.dataset.action === "sound") {
        voice.on = !voice.on;
        store.set("isle-sound", voice.on);
        if (voice.on) { voice.ensure(); voice.sfx("pop"); }
        syncSoundButtons();
        toast(voice.on ? T.soundOn : T.soundOff, icon(voice.on ? "volume-high" : "volume-xmark"));
      }
      if (act.dataset.action === "time") {
        todPref = TODS[(TODS.indexOf(todPref) + 1) % TODS.length];
        store.set("isle-tod", todPref);
        applyWorld();
        tickHud();
        toast(T.timeTravel(T.tod[todPref]), icon("clock-rotate-left"));
      }
    });

    // shake a tree
    $$(".tree").forEach((tree) => {
      tree.addEventListener("click", () => {
        tree.classList.remove("shaking");
        void tree.offsetWidth;
        tree.classList.add("shaking");
        voice.sfx("shake");
        const drop = document.createElement("span");
        drop.className = "drop";
        drop.style.setProperty("--dx", `${Math.round((Math.random() - 0.5) * 90)}px`);
        drop.style.setProperty("--dy", `${Math.round(tree.offsetHeight * 0.52)}px`);
        const r = Math.random();
        const mode = tree.dataset.drop || "mixed";
        if (mode === "bells" || (mode === "fruit" ? r < 0.3 : r < 0.6)) {
          const amount = r < 0.07 ? 1000 : 100;
          drop.innerHTML = art("art-bellbag");
          addBells(amount);
          setTimeout(() => { voice.sfx("bell"); toast(T.bells(amount), art("art-bellbag")); }, 450);
        } else {
          drop.innerHTML = art("art-fruit");
          setTimeout(() => toast(T.fruit, art("art-fruit")), 450);
        }
        tree.appendChild(drop);
        setTimeout(() => drop.remove(), 1600);
      });
    });

    // pockets
    $$(".pockets").forEach((p) => {
      const label = $(".pocket-label", p);
      const hint = label.innerHTML;
      const slots = $$(".slot", p);
      const show = (slot) => {
        slots.forEach((s) => s.classList.toggle("on", s === slot));
        label.innerHTML = "";
        const s = document.createElement("span");
        s.textContent = slot.dataset.name;
        label.appendChild(s);
      };
      slots.forEach((slot) => {
        slot.addEventListener("mouseenter", () => show(slot));
        slot.addEventListener("focus", () => show(slot));
        slot.addEventListener("click", () => { show(slot); voice.sfx("pop"); });
      });
      p.addEventListener("mouseleave", () => {
        if (p.contains(document.activeElement)) return;
        slots.forEach((s) => s.classList.remove("on"));
        label.innerHTML = hint;
      });
    });

    // single-key tab filters: <div class="tabs" data-filter-target="#list"> + items with data-tags
    $$("[data-filter-target]").forEach((bar) => {
      const list = $(bar.dataset.filterTarget);
      if (!list) return;
      const items = $$("[data-tags]", list);
      const has = (it, f) => f === "all" || it.dataset.tags.split(/\s+/).includes(f);
      $$(".tab", bar).forEach((t) => { const n = $(".n", t); if (n) n.textContent = items.filter((it) => has(it, t.dataset.filter)).length; });
      bar.addEventListener("click", (e) => {
        const tab = e.target.closest(".tab");
        if (!tab) return;
        $$(".tab", bar).forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
        items.forEach((it) => it.classList.toggle("is-hidden", !has(it, tab.dataset.filter)));
        voice.sfx("pop");
      });
    });

    // jumping to a card hidden by a filter resets that filter
    const revealTarget = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const el = id && document.getElementById(id);
      if (!el || !el.closest(".is-hidden")) return;
      $$("[data-filter-target] .tab[data-filter='all']").forEach((t) => t.click());
      requestAnimationFrame(() => el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }));
    };
    window.addEventListener("hashchange", revealTarget);

    // copy buttons
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-copy]");
      if (!btn) return;
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      toast(T.copied, icon("copy"));
    });

    // staggered reveal
    $$("[data-stagger]").forEach((g) => Array.from(g.children).forEach((c, k) => c.style.setProperty("--d", `${(k % 6) * 70}ms`)));
    const pops = $$(".pop");
    if (reduceMotion || !hasIO) {
      pops.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          io.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
      pops.forEach((el) => io.observe(el));
    }

    // count-up numbers
    $$("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      if (reduceMotion || !hasIO) { el.textContent = fmt(target); return; }
      el.textContent = "0";
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const run = (t) => {
          const k = Math.min(1, (t - t0) / 1400);
          el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
      });
      io.observe(el);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.Isle = { toast, voice, store, icon, art, zh };
})();
