// Loading screen logic
document.addEventListener("DOMContentLoaded", function () {
  const loader = document.getElementById("loader");
  const content = document.getElementById("content");

  // Show loader for 3 seconds
  setTimeout(function () {
    loader.style.opacity = "0";
    content.style.opacity = "1";

    // Remove loader after fade out
    setTimeout(function () {
      loader.style.display = "none";
    }, 500);
  }, 3000);

  // Mobile menu toggle
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  menuToggle.addEventListener("click", function () {
    navMenu.classList.toggle("active");
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (event) {
    if (
      !event.target.closest("#navMenu") &&
      !event.target.closest("#menuToggle")
    ) {
      navMenu.classList.remove("active");
    }
  });

  // Personalizzazione cordino
  initCustomization();
});

function initCustomization() {
  // Elementi UI
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const finishBtn = document.getElementById("finishBtn");
  const steps = document.querySelectorAll(".custom-step");
  const progressSteps = document.querySelectorAll(".progress-step");
  const progressLines = document.querySelectorAll(".progress-line");
  const summaryItems = document.getElementById("summaryItems");
  const totalPrice = document.getElementById("totalPrice");
  const charmCount = document.getElementById("charmCount");
  const selectedCharmsList = document.getElementById("selectedCharmsList");

  // Variabili di stato
  let currentStep = 1;
  const maxSteps = steps.length;
  let selectedOptions = {
    cordino: null,
    aggancio: null,
    clip: null,
    charms: []
  };

  // Elementi per l'anteprima
  const previewCordino = document.getElementById("previewCordino");
  const previewAggancioSx = document.getElementById("previewAggancioSx");
  const previewAggancioDx = document.getElementById("previewAggancioDx");
  const previewClipSx = document.getElementById("previewClipSx");
  const previewClipDx = document.getElementById("previewClipDx");
  const previewCharms = document.getElementById("previewCharms");

  // Prezzi (€)
  const prices = {
    cordino: 0,
    aggancio: 0,
    clip: 0,
    charms: 0
  };

  // Inizializza
  updateNavButtons();

  // Eventi click per navigazione
  prevBtn.addEventListener("click", goToPrevStep);
  nextBtn.addEventListener("click", goToNextStep);
  finishBtn.addEventListener("click", finishCustomization);

  // Seleziona opzioni in Step 1, 2, 3
  document
    .querySelectorAll(
      "#step1 .option-item, #step2 .option-item, #step3 .option-item"
    )
    .forEach((item) => {
      item.addEventListener("click", function () {
        // Rimuovi selezione precedente nello stesso step
        const parentStep = this.closest(".custom-step");
        parentStep.querySelectorAll(".option-item").forEach((opt) => {
          opt.classList.remove("selected");
        });

        // Seleziona questa opzione
        this.classList.add("selected");

        // Aggiorna selezioni
        const option = this.getAttribute("data-option");
        const stepId = parentStep.getAttribute("id");
        const optionName = this.querySelector("h4").textContent;
        const optionPrice = parseFloat(
          this.querySelector("p").textContent.replace("€", "")
        );

        if (stepId === "step1") {
          selectedOptions.cordino = {
            id: option,
            name: optionName,
            price: optionPrice
          };
          prices.cordino = optionPrice;

          // Aggiorna l'anteprima del cordino
          previewCordino.style.backgroundImage = `url(img/${option}.png)`;
        } else if (stepId === "step2") {
          selectedOptions.aggancio = {
            id: option,
            name: optionName,
            price: optionPrice
          };
          prices.aggancio = optionPrice;

          // Aggiorna l'anteprima degli agganci
          // Nota: qui usiamo dei placeholder perché non abbiamo le immagini reali degli agganci
          previewAggancioSx.style.backgroundImage = `url(/api/placeholder/80/80)`;
          previewAggancioSx.style.backgroundPosition = "left center";
          previewAggancioDx.style.backgroundImage = `url(/api/placeholder/80/80)`;
          previewAggancioDx.style.backgroundPosition = "right center";
        } else if (stepId === "step3") {
          selectedOptions.clip = {
            id: option,
            name: optionName,
            price: optionPrice
          };
          prices.clip = optionPrice;

          // Aggiorna l'anteprima delle clip
          // Nota: qui usiamo dei placeholder perché non abbiamo le immagini reali delle clip
          previewClipSx.style.backgroundImage = `url(/api/placeholder/50/50)`;
          previewClipSx.style.backgroundPosition = "left center";
          previewClipDx.style.backgroundImage = `url(/api/placeholder/50/50)`;
          previewClipDx.style.backgroundPosition = "right center";
        }

        updateSummary();
      });
    });

  // Gestione charm (Step 4)
  document.querySelectorAll("#step4 .option-item").forEach((item) => {
    item.addEventListener("click", function () {
      const option = this.getAttribute("data-option");
      const optionName = this.querySelector("h4").textContent;
      const optionPrice = parseFloat(
        this.querySelector("p").textContent.replace("€", "")
      );

      // Controlla se è già selezionato
      const isSelected = this.classList.contains("selected");
      const charmIndex = selectedOptions.charms.findIndex(
        (c) => c.id === option
      );

      if (isSelected && charmIndex !== -1) {
        // Rimuovi charm
        this.classList.remove("selected");
        selectedOptions.charms.splice(charmIndex, 1);
        prices.charms -= optionPrice;
      } else if (!isSelected && selectedOptions.charms.length < 5) {
        // Aggiungi charm se non hai raggiunto il limite
        this.classList.add("selected");
        selectedOptions.charms.push({
          id: option,
          name: optionName,
          price: optionPrice
        });
        prices.charms += optionPrice;

        // Aggiorna l'anteprima dei charm
        updateCharmsPreview();
      }

      // Aggiorna contatore e sommario
      charmCount.textContent = selectedOptions.charms.length;
      updateSelectedCharmsList();
      updateSummary();
    });
  });

  // Funzioni di navigazione
  function goToNextStep() {
    // Verifica se è possibile procedere
    if (currentStep === 1 && !selectedOptions.cordino) {
      alert("Seleziona un cordino per continuare.");
      return;
    } else if (currentStep === 2 && !selectedOptions.aggancio) {
      alert("Seleziona un aggancio per continuare.");
      return;
    } else if (currentStep === 3 && !selectedOptions.clip) {
      alert("Seleziona una clip per continuare.");
      return;
    }

    if (currentStep < maxSteps) {
      // Nascondi step corrente
      document.getElementById(`step${currentStep}`).classList.remove("active");

      // Aggiorna stato progress bar
      progressSteps[currentStep - 1].classList.add("completed");
      if (currentStep < maxSteps) {
        progressLines[currentStep - 1].classList.add("active");
      }

      // Vai al prossimo step
      currentStep++;
      document.getElementById(`step${currentStep}`).classList.add("active");
      progressSteps[currentStep - 1].classList.add("active");

      // Aggiorna bottoni
      updateNavButtons();
    }
  }

  function goToPrevStep() {
    if (currentStep > 1) {
      // Nascondi step corrente
      document.getElementById(`step${currentStep}`).classList.remove("active");
      progressSteps[currentStep - 1].classList.remove("active");

      // Aggiorna stato progress bar
      if (currentStep <= maxSteps) {
        progressLines[currentStep - 2].classList.remove("active");
      }

      // Vai allo step precedente
      currentStep--;
      document.getElementById(`step${currentStep}`).classList.add("active");

      // Aggiorna bottoni
      updateNavButtons();
    }
  }

  function updateNavButtons() {
    // Abilita/disabilita bottone "Indietro"
    prevBtn.disabled = currentStep === 1;

    // Mostra/nascondi bottoni "Avanti" e "Aggiungi al Carrello"
    if (currentStep === maxSteps) {
      nextBtn.style.display = "none";
      finishBtn.style.display = "block";
    } else {
      nextBtn.style.display = "block";
      finishBtn.style.display = "none";
    }
  }

  function updateSummary() {
    let summaryHTML = "";
    let total = 0;

    // Aggiungi dettagli per ogni selezione
    if (selectedOptions.cordino) {
      summaryHTML += `<div class="summary-item">
                <span>Cordino: ${selectedOptions.cordino.name}</span>
                <span>€${selectedOptions.cordino.price.toFixed(2)}</span>
            </div>`;
      total += selectedOptions.cordino.price;
    }

    if (selectedOptions.aggancio) {
      summaryHTML += `<div class="summary-item">
                <span>Agganci: ${selectedOptions.aggancio.name}</span>
                <span>€${selectedOptions.aggancio.price.toFixed(2)}</span>
            </div>`;
      total += selectedOptions.aggancio.price;
    }

    if (selectedOptions.clip) {
      summaryHTML += `<div class="summary-item">
                <span>Clip: ${selectedOptions.clip.name}</span>
                <span>€${selectedOptions.clip.price.toFixed(2)}</span>
            </div>`;
      total += selectedOptions.clip.price;
    }

    if (selectedOptions.charms.length > 0) {
      const charmTotal = selectedOptions.charms.reduce(
        (sum, charm) => sum + charm.price,
        0
      );
      summaryHTML += `<div class="summary-item">
                <span>Charm (${selectedOptions.charms.length})</span>
                <span>€${charmTotal.toFixed(2)}</span>
            </div>`;
      total += charmTotal;
    }

    // Se non c'è niente selezionato
    if (!summaryHTML) {
      summaryHTML = "<p>Seleziona un cordino per iniziare</p>";
    }

    // Aggiorna UI
    summaryItems.innerHTML = summaryHTML;
    totalPrice.textContent = `€${total.toFixed(2)}`;
  }

  // Funzione per aggiornare l'anteprima dei charm
  function updateCharmsPreview() {
    // Reset dell'anteprima dei charm
    previewCharms.innerHTML = "";

    // Posiziona i charm lungo il cordino
    if (selectedOptions.charms.length > 0) {
      const charmContainer = document.createElement("div");
      charmContainer.className = "charms-container";

      selectedOptions.charms.forEach((charm, index) => {
        const charmElement = document.createElement("div");
        charmElement.className = "preview-charm";

        // Calcola la posizione del charm lungo il cordino
        const leftPos = 10 + index * 20;
        const topPos = 150 + ((index * 30) % 60);

        charmElement.style.cssText = `
                    position: absolute;
                    left: ${leftPos}%;
                    top: ${topPos}px;
                    width: 30px;
                    height: 30px;
                    background-image: url(/api/placeholder/30/30);
                    background-repeat: no-repeat;
                    background-size: contain;
                    z-index: ${10 + index};
                `;

        previewCharms.appendChild(charmElement);
      });
    }
  }

  function updateSelectedCharmsList() {
    selectedCharmsList.innerHTML = "";

    selectedOptions.charms.forEach((charm) => {
      const charmElement = document.createElement("div");
      charmElement.className = "selected-item";
      charmElement.innerHTML = `
                ${charm.name}
                <span class="remove-item" data-id="${charm.id}">×</span>
            `;
      selectedCharmsList.appendChild(charmElement);
    });

    // Aggiungi event listener per rimuovere charm
    document.querySelectorAll(".remove-item").forEach((item) => {
      item.addEventListener("click", function () {
        const charmId = this.getAttribute("data-id");
        // Trova e rimuovi dal array
        const charmIndex = selectedOptions.charms.findIndex(
          (c) => c.id === charmId
        );
        if (charmIndex !== -1) {
          const removedCharm = selectedOptions.charms[charmIndex];
          selectedOptions.charms.splice(charmIndex, 1);
          prices.charms -= removedCharm.price;

          // Rimuovi selezione visiva
          const optionElement = document.querySelector(
            `#step4 .option-item[data-option="${charmId}"]`
          );
          if (optionElement) {
            optionElement.classList.remove("selected");
          }

          // Aggiorna UI
          charmCount.textContent = selectedOptions.charms.length;
          updateSelectedCharmsList();
          updateCharmsPreview();
          updateSummary();
        }
      });
    });
  }

  function finishCustomization() {
    // Controlla se tutte le selezioni obbligatorie sono state fatte
    if (
      !selectedOptions.cordino ||
      !selectedOptions.aggancio ||
      !selectedOptions.clip
    ) {
      alert("Per favore completa tutte le selezioni obbligatorie.");
      return;
    }

    // Qui potresti aggiungere codice per aggiungere al carrello o procedere all'acquisto
    alert("Il tuo cordino personalizzato è stato aggiunto al carrello!");

    // Puoi reimpostare il configuratore o reindirizzare a un'altra pagina
    // Per ora, solo un messaggio di conferma
  }
}
