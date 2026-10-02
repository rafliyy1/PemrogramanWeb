document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initActiveNav();
  initStickyHeader();
  initStatCounters();
  initProjectJump();
  initCareerApplyButtons();
  initReveal();
  initGatedForm("career-form", "career-form-status", "career-submit",
    "Lamaran Anda telah terkirim. Tim rekrutmen kami akan menghubungi Anda dalam 7 hari kerja.",
    { pdfFieldId: "cv", modalTitle: "Lamaran terkirim" });
  initGatedForm("contact-form", "contact-form-status", "contact-submit",
    "Pesan Anda telah terkirim. Tim kami akan membalas dalam 1 sampai 2 hari kerja.",
    { modalTitle: "Pesan terkirim" });
});

function headerOffset() {
  var headerEl = document.querySelector("header");
  return headerEl ? headerEl.offsetHeight + 16 : 96;
}

function scrollToEl(el) {
  var top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset();
  window.scrollTo({ top: top, behavior: "smooth" });
}

// ---------------------------------------------------------------- menu di mobile
function initMobileMenu() {
  var toggle = document.getElementById("menu-toggle");
  var menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  var iconOpen = document.getElementById("icon-open");
  var iconClose = document.getElementById("icon-close");
  var isOpen = false;

  toggle.addEventListener("click", function () {
    isOpen = !isOpen;
    toggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      menu.style.maxHeight = menu.scrollHeight + "px";
      menu.classList.remove("opacity-0");
      menu.classList.add("opacity-100");
      iconOpen.classList.add("hidden");
      iconClose.classList.remove("hidden");
    } else {
      menu.style.maxHeight = "0px";
      menu.classList.add("opacity-0");
      menu.classList.remove("opacity-100");
      iconOpen.classList.remove("hidden");
      iconClose.classList.add("hidden");
    }
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      isOpen = false;
      menu.style.maxHeight = "0px";
      menu.classList.add("opacity-0");
    });
  });
}

// ---------------------------------------------------------------- penanda menu yang sedang dibuka
function initActiveNav() {
  var current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === current) {
      link.classList.add("active");
      link.classList.remove("text-slate2");
    }
  });
}

// ---------------------------------------------------------------- bayangan di bagian atas saat halaman di scroll
function initStickyHeader() {
  var header = document.querySelector("header");
  if (!header) return;
  function onScroll() {
    if (window.scrollY > 8) {
      header.classList.add("shadow-md", "shadow-black/5");
    } else {
      header.classList.remove("shadow-md", "shadow-black/5");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ---------------------------------------------------------------- animasi angka
function initStatCounters() {
  var counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animate(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var useIdFormat = el.getAttribute("data-format") === "id";

    function format(n) {
      return (useIdFormat ? n.toLocaleString("id-ID") : n.toString()) + suffix;
    }

    if (reduceMotion) {
      el.textContent = format(target);
      return;
    }
    var duration = 1200;
    var start = null;
    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(Math.round(eased * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = format(target);
      }
    }
    window.requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    counters.forEach(animate);
  }
}

// ---------------------------------------------------------------- klik tombol kategori, halaman otomatis turun ke kategori itu (halaman proyek)
function initProjectJump() {
  var filterBar = document.getElementById("project-filters");
  if (!filterBar) return;

  var buttons = filterBar.querySelectorAll(".filter-btn");

  filterBar.addEventListener("click", function (e) {
    var btn = e.target.closest(".filter-btn");
    if (!btn) return;

    buttons.forEach(function (b) {
      b.classList.remove("active", "border-navy-900");
      b.classList.add("border-line");
    });
    btn.classList.add("active", "border-navy-900");
    btn.classList.remove("border-line");

    var targetId = btn.getAttribute("data-target");
    var targetEl =
      targetId === "cat-semua"
        ? document.getElementById("cat-semua-top") || document.getElementById("project-list")
        : document.getElementById(targetId);
    if (!targetEl) return;

    scrollToEl(targetEl);

    if (targetEl.classList.contains("category-section")) {
      targetEl.classList.add("highlight");
      window.setTimeout(function () {
        targetEl.classList.remove("highlight");
      }, 1400);
    }
  });
}

// ---------------------------------------------------------------- tampilkan formulir saat tombol "Lamar posisi ini" diklik (halaman karier)
function initCareerApplyButtons() {
  var buttons = document.querySelectorAll(".apply-btn");
  var formSection = document.getElementById("form-lamaran");
  var posSelect = document.getElementById("posisi");
  if (!buttons.length || !formSection) return;

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      formSection.classList.remove("hidden");
      if (posSelect) {
        posSelect.value = btn.getAttribute("data-position");
        posSelect.dispatchEvent(new Event("change"));
      }
      scrollToEl(formSection);
    });
  });
}

// ---------------------------------------------------------------- semua kolom wajib diisi, tombol kirim mati sampai semua isian benar
function initGatedForm(formId, statusId, submitId, successMessage, opts) {
  opts = opts || {};
  var form = document.getElementById(formId);
  var status = document.getElementById(statusId);
  var submitBtn = document.getElementById(submitId);
  if (!form || !status || !submitBtn) return;

  var fields = Array.prototype.slice.call(form.querySelectorAll("[required]"));

  var DISABLED_CLASSES = ["bg-navy-900/10", "text-navy-900/40", "cursor-not-allowed"];
  var ENABLED_CLASSES = ["bg-amber-400", "text-navy-900", "hover:bg-amber-300", "cursor-pointer"];

  function setError(field, message) {
    var errorEl = field.closest("div").querySelector(".field-error");
    field.classList.add("border-red-500");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove("hidden");
    }
  }

  function clearError(field) {
    var errorEl = field.closest("div").querySelector(".field-error");
    field.classList.remove("border-red-500");
    if (errorEl) errorEl.classList.add("hidden");
  }

  function validateField(field, showError) {
    if (field.type === "file") {
      if (field.files.length === 0) {
        if (showError) setError(field, "Kolom ini wajib diisi");
        return false;
      }
      if (field.id === opts.pdfFieldId) {
        var file = field.files[0];
        var isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
        if (!isPdf) {
          if (showError) setError(field, "Format file tidak didukung. Harap unggah file berformat PDF.");
          return false;
        }
      }
      if (showError) clearError(field);
      return true;
    }

    var value = field.value.trim();
    if (value === "") {
      if (showError) setError(field, "Kolom ini wajib diisi");
      return false;
    }
    if (field.type === "email" && !isValidEmail(value)) {
      if (showError) setError(field, "Masukkan alamat email yang valid");
      return false;
    }
    if (showError) clearError(field);
    return true;
  }

  function updateSubmitState(showErrors) {
    var allValid = fields.every(function (field) {
      return validateField(field, showErrors);
    });

    submitBtn.disabled = !allValid;
    if (allValid) {
      submitBtn.classList.remove.apply(submitBtn.classList, DISABLED_CLASSES);
      submitBtn.classList.add.apply(submitBtn.classList, ENABLED_CLASSES);
    } else {
      submitBtn.classList.remove.apply(submitBtn.classList, ENABLED_CLASSES);
      submitBtn.classList.add.apply(submitBtn.classList, DISABLED_CLASSES);
    }
    return allValid;
  }

  fields.forEach(function (field) {
    var evt = field.type === "file" || field.tagName === "SELECT" ? "change" : "input";
    field.addEventListener(evt, function () {
      updateSubmitState(false);
      validateField(field, true);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";
    status.className = "text-sm";

    var allValid = updateSubmitState(true);
    if (!allValid) {
      status.textContent = "Mohon lengkapi seluruh kolom dengan benar sebelum mengirim.";
      status.classList.add("text-red-600");
      return;
    }

    form.reset();
    updateSubmitState(false);
    showSuccessModal(opts.modalTitle || "Berhasil terkirim", successMessage);
  });

  updateSubmitState(false);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ---------------------------------------------------------------- bagian halaman muncul pelan-pelan saat di-scroll dan kartu terangkat saat disentuh mouse
function initReveal() {
  var style = document.createElement("style");
  style.textContent =
    ".reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}" +
    ".reveal.visible{opacity:1;transform:none}" +
    ".card-hover{transition:transform .25s ease,box-shadow .25s ease}" +
    ".card-hover:hover{transform:translateY(-4px);box-shadow:0 12px 24px -12px rgba(15,58,90,.25)}";
  document.head.appendChild(style);

  document.querySelectorAll("main div.border.border-line.rounded-sm").forEach(function (el) {
    el.classList.add("card-hover");
  });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  var sections = document.querySelectorAll("main > section:not(:first-child)");
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(function (s) {
    s.classList.add("reveal");
    observer.observe(s);
  });
}

// ---------------------------------------------------------------- pop-up notif berhasil terkirim
function showSuccessModal(title, message) {
  var previousFocus = document.activeElement;

  var overlay = document.createElement("div");
  overlay.className = "fixed inset-0 z-[100] flex items-center justify-center bg-navy-900/60 px-6";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "modal-title");
  overlay.innerHTML =
    '<div class="w-full max-w-md rounded-sm bg-white p-8 text-center shadow-xl">' +
      '<div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green2-500/10">' +
        '<svg class="h-7 w-7 text-green2-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' +
      '</div>' +
      '<h2 id="modal-title" class="font-display text-2xl mt-5">' + title + '</h2>' +
      '<p class="mt-3 text-sm text-slate2 leading-relaxed">' + message + '</p>' +
      '<button type="button" class="modal-close mt-7 inline-flex items-center rounded-sm bg-amber-400 px-7 py-3 text-sm font-medium text-navy-900 hover:bg-amber-300 transition-colors">Tutup</button>' +
    '</div>';

  function close() {
    document.removeEventListener("keydown", onKey);
    overlay.remove();
    document.body.style.overflow = "";
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  }
  function onKey(e) {
    if (e.key === "Escape") close();
  }

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
  });
  overlay.querySelector(".modal-close").addEventListener("click", close);
  document.addEventListener("keydown", onKey);

  document.body.style.overflow = "hidden";
  document.body.appendChild(overlay);
  overlay.querySelector(".modal-close").focus();
}