const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".primary-nav");
const siteHeader = document.querySelector(".site-header");
const revealItems = document.querySelectorAll("[data-reveal]");
const navLinks = document.querySelectorAll(".primary-nav a[data-nav]");
const yearNodes = document.querySelectorAll("[data-year]");
const counterNodes = document.querySelectorAll("[data-counter-target]");

const whatsappNumber = "221776443484";
const defaultWhatsappText =
  "Bonjour CHEFA VOYAGES, je souhaite avoir un devis pour un billet d'avion.";

const setActiveNavigation = () => {
  const currentPage = document.body.dataset.page;

  navLinks.forEach((link) => {
    const isActive = link.dataset.nav === currentPage;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const toggleHeaderState = () => {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
};

const closeMenu = () => {
  if (!menuToggle || !siteNav) {
    return;
  }

  menuToggle.setAttribute("aria-expanded", "false");
  siteNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
};

const setupMenu = () => {
  if (!menuToggle || !siteNav) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open", !expanded);
    document.body.classList.toggle("menu-open", !expanded);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
};

const setDateMinimums = (fields) => {
  const today = new Date().toISOString().split("T")[0];

  fields.forEach((field) => {
    if (field) {
      field.min = today;
    }
  });
};

const createTravelSummary = (details) => {
  const routeLabel = details.tripType === "oneway" ? "aller simple" : "aller-retour";
  const returnLine =
    details.tripType === "roundtrip" && details.returnDate
      ? `Date retour: ${details.returnDate}. `
      : "";

  return (
    `Je souhaite un devis pour un vol ${routeLabel} de ${details.departure} vers ${details.destination}. ` +
    `Date depart: ${details.departDate}. ` +
    returnLine +
    `Nombre de passagers: ${details.passengers}. Classe: ${details.travelClass}.`
  );
};

const fillQuoteForm = (quoteForm, details, focusName) => {
  if (!quoteForm) {
    return;
  }

  const fields = {
    tripType: quoteForm.querySelector('[name="trip_type"]'),
    departure: quoteForm.querySelector('[name="departure"]'),
    destination: quoteForm.querySelector('[name="destination"]'),
    departDate: quoteForm.querySelector('[name="depart_date"]'),
    returnDate: quoteForm.querySelector('[name="return_date"]'),
    passengers: quoteForm.querySelector('[name="passengers"]'),
    travelClass: quoteForm.querySelector('[name="travel_class"]'),
    message: quoteForm.querySelector('[name="message"]'),
    feedback: quoteForm.querySelector("[data-quote-feedback]"),
    name: quoteForm.querySelector('[name="name"]'),
  };

  if (fields.tripType) {
    fields.tripType.value = details.tripType;
  }
  if (fields.departure) {
    fields.departure.value = details.departure;
  }
  if (fields.destination) {
    fields.destination.value = details.destination;
  }
  if (fields.departDate) {
    fields.departDate.value = details.departDate;
  }
  if (fields.returnDate) {
    fields.returnDate.value = details.tripType === "roundtrip" ? details.returnDate : "";
  }
  if (fields.passengers) {
    fields.passengers.value = details.passengers;
  }
  if (fields.travelClass) {
    fields.travelClass.value = details.travelClass;
  }
  const hasCoreTravelDetails =
    details.departure && details.destination && details.departDate;

  if (fields.message && !fields.message.value.trim() && hasCoreTravelDetails) {
    fields.message.value = createTravelSummary(details);
  }
  if (fields.feedback) {
    fields.feedback.textContent =
      "Votre recherche a ete reprise. Ajoutez vos coordonnees puis ouvrez WhatsApp.";
  }

  quoteForm.scrollIntoView({ behavior: "smooth", block: "start" });

  if (focusName && fields.name) {
    window.setTimeout(() => fields.name.focus(), 400);
  }
};

const extractTravelDetails = (form) => {
  const formData = new FormData(form);

  return {
    tripType: form.querySelector('[name="trip_type"]')?.value || "roundtrip",
    departure: String(formData.get("departure") || "").trim(),
    destination: String(formData.get("destination") || "").trim(),
    departDate: String(formData.get("depart_date") || "").trim(),
    returnDate: String(formData.get("return_date") || "").trim(),
    passengers: String(formData.get("passengers") || "1").trim(),
    travelClass: String(formData.get("travel_class") || "Economique").trim(),
  };
};

const setupBookingForms = () => {
  const bookingForms = document.querySelectorAll("[data-booking-form]");

  bookingForms.forEach((form) => {
    const tripButtons = form.querySelectorAll(".trip-option");
    const tripTypeField = form.querySelector('[name="trip_type"]');
    const departDateField = form.querySelector('[name="depart_date"]');
    const returnDateField = form.querySelector('[name="return_date"]');
    const returnField = form.querySelector(".return-field");
    const feedback = form.querySelector("[data-booking-feedback]");

    const updateTripMode = (tripType) => {
      if (tripTypeField) {
        tripTypeField.value = tripType;
      }

      tripButtons.forEach((button) => {
        const isActive = button.dataset.trip === tripType;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      const isRoundtrip = tripType === "roundtrip";
      if (returnField) {
        returnField.classList.toggle("is-hidden", !isRoundtrip);
      }
      if (returnDateField) {
        returnDateField.disabled = !isRoundtrip;
        returnDateField.toggleAttribute("required", isRoundtrip);
        if (!isRoundtrip) {
          returnDateField.value = "";
        }
      }
    };

    setDateMinimums([departDateField, returnDateField]);

    if (departDateField && returnDateField) {
      departDateField.addEventListener("change", () => {
        returnDateField.min = departDateField.value || returnDateField.min;

        if (
          returnDateField.value &&
          departDateField.value &&
          returnDateField.value < departDateField.value
        ) {
          returnDateField.value = departDateField.value;
        }
      });
    }

    tripButtons.forEach((button) => {
      button.addEventListener("click", () => updateTripMode(button.dataset.trip || "roundtrip"));
    });

    updateTripMode(tripTypeField?.value || "roundtrip");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const details = extractTravelDetails(form);
      const submitMode = form.dataset.submitMode || "redirect";

      if (submitMode === "prefill") {
        const targetForm = document.getElementById(form.dataset.targetForm || "");

        fillQuoteForm(targetForm, details, true);

        if (feedback) {
          feedback.textContent =
            "Les champs du devis detaille ont ete prepares ci-dessous.";
        }

        return;
      }

      const targetUrl = form.dataset.targetUrl || "/contact";
      const params = new URLSearchParams({
        trip_type: details.tripType,
        departure: details.departure,
        destination: details.destination,
        depart_date: details.departDate,
        passengers: details.passengers,
        travel_class: details.travelClass,
      });

      if (details.tripType === "roundtrip" && details.returnDate) {
        params.set("return_date", details.returnDate);
      }

      window.location.assign(`${targetUrl}?${params.toString()}`);
    });
  });
};

const prefillQuoteFormsFromQuery = () => {
  const query = new URLSearchParams(window.location.search);
  const hasUsefulQuery = [
    "departure",
    "destination",
    "depart_date",
    "return_date",
    "passengers",
    "travel_class",
    "trip_type",
  ].some((key) => query.has(key));

  if (!hasUsefulQuery) {
    return;
  }

  const details = {
    tripType: query.get("trip_type") || "roundtrip",
    departure: query.get("departure") || "",
    destination: query.get("destination") || "",
    departDate: query.get("depart_date") || "",
    returnDate: query.get("return_date") || "",
    passengers: query.get("passengers") || "1",
    travelClass: query.get("travel_class") || "Economique",
  };

  document.querySelectorAll("[data-quote-form]").forEach((quoteForm) => {
    fillQuoteForm(quoteForm, details, false);
  });
};

const setupQuoteForms = () => {
  const quoteForms = document.querySelectorAll("[data-quote-form]");

  quoteForms.forEach((form) => {
    const departDateField = form.querySelector('[name="depart_date"]');
    const returnDateField = form.querySelector('[name="return_date"]');
    const feedback = form.querySelector("[data-quote-feedback]");

    setDateMinimums([departDateField, returnDateField]);

    if (departDateField && returnDateField) {
      departDateField.addEventListener("change", () => {
        returnDateField.min = departDateField.value || returnDateField.min;

        if (
          returnDateField.value &&
          departDateField.value &&
          returnDateField.value < departDateField.value
        ) {
          returnDateField.value = departDateField.value;
        }
      });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const tripType = form.querySelector('[name="trip_type"]')?.value || "roundtrip";
      const messageParts = [
        defaultWhatsappText,
        `Nom: ${String(formData.get("name") || "").trim()}`,
        `Telephone: ${String(formData.get("phone") || "").trim()}`,
        `Trajet: ${tripType === "oneway" ? "Aller simple" : "Aller-retour"}`,
        `Depart: ${String(formData.get("departure") || "").trim()}`,
        `Destination: ${String(formData.get("destination") || "").trim()}`,
        `Date depart: ${String(formData.get("depart_date") || "").trim()}`,
      ];

      const returnDate = String(formData.get("return_date") || "").trim();
      if (tripType === "roundtrip" && returnDate) {
        messageParts.push(`Date retour: ${returnDate}`);
      }

      messageParts.push(`Passagers: ${String(formData.get("passengers") || "").trim()}`);
      messageParts.push(`Classe: ${String(formData.get("travel_class") || "").trim()}`);

      const freeMessage = String(formData.get("message") || "").trim();
      if (freeMessage) {
        messageParts.push(`Message: ${freeMessage}`);
      }

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        messageParts.join("\n")
      )}`;

      window.open(whatsappUrl, "_blank", "noopener");

      if (feedback) {
        feedback.textContent =
          "La conversation WhatsApp s'ouvre avec votre demande de devis.";
      }
    });
  });
};

const setYears = () => {
  const currentYear = String(new Date().getFullYear());
  yearNodes.forEach((node) => {
    node.textContent = currentYear;
  });
};

const setupRevealAnimations = () => {
  if (revealItems.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
};

const setCounterValue = (node, value) => {
  const suffix = node.dataset.counterSuffix || "";
  const formatter = new Intl.NumberFormat("fr-FR");
  node.textContent = `${formatter.format(value)}${suffix}`;
};

const animateCounter = (node) => {
  const target = Number(node.dataset.counterTarget || "0");
  const duration = Number(node.dataset.counterDuration || "1800");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    setCounterValue(node, target);
    return;
  }

  const startTime = performance.now();

  const updateValue = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(target * easedProgress);

    setCounterValue(node, currentValue);

    if (progress < 1) {
      window.requestAnimationFrame(updateValue);
    }
  };

  window.requestAnimationFrame(updateValue);
};

const setupCounterAnimations = () => {
  if (counterNodes.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const node = entry.target;
        if (!node.dataset.counterAnimated) {
          node.dataset.counterAnimated = "true";
          animateCounter(node);
        }

        observer.unobserve(node);
      });
    },
    { threshold: 0.45 }
  );

  counterNodes.forEach((node) => observer.observe(node));
};

setActiveNavigation();
setupMenu();
toggleHeaderState();
window.addEventListener("scroll", toggleHeaderState);
setYears();
setupBookingForms();
setupQuoteForms();
prefillQuoteFormsFromQuery();
setupRevealAnimations();
setupCounterAnimations();
