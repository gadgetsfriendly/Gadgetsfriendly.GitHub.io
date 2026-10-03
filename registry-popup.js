(function () {
  'use strict';

  function initRegistryPopup() {
    const registry = document.getElementById('registry');
    const registryInput = document.getElementById('registryQ');
    const registryResults = document.getElementById('registryResults');

    if (!registry || !registryInput || !registryResults) return;

    const searchCard = registryInput.closest('.card');
    const resultsCard = registryResults.closest('.card');

    /* Hide the original search card */
    if (searchCard) {
      searchCard.style.display = 'none';
    }

    /* Popup + launcher styles */
    if (!document.getElementById('gf-registry-popup-style')) {
      const style = document.createElement('style');
      style.id = 'gf-registry-popup-style';

      style.textContent = `
        .gf-registry-launch {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 18px 0 20px;
          padding: 18px 20px;
          border: 1px solid #30363e;
          border-radius: 15px;
          background: linear-gradient(145deg,#171c22,#101419);
          color: #fff;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          box-sizing: border-box;
        }

        .gf-registry-results-hidden {
          display: none !important;
        }

        .gf-registry-overlay {
          position: fixed;
          inset: 0;
          z-index: 100001;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(0,0,0,.78);
          box-sizing: border-box;
        }

        .gf-registry-overlay.open {
          display: flex;
        }

        .gf-registry-modal {
          width: min(620px,100%);
          max-height: calc(100vh - 36px);
          overflow: auto;
          padding: 22px;
          border: 1px solid #30363e;
          border-radius: 18px;
          background: linear-gradient(145deg,#151a20,#0b0e12);
          box-shadow: 0 24px 80px rgba(0,0,0,.55);
          box-sizing: border-box;
        }

        .gf-registry-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        .gf-registry-modal h2 {
          margin: 0;
          font-size: 24px;
        }

        .gf-registry-close {
          width: 42px;
          height: 42px;
          border: 1px solid #30363e;
          border-radius: 50%;
          background: #171c22;
          color: #fff;
          font-size: 25px;
          line-height: 1;
          cursor: pointer;
        }

        .gf-registry-modal p {
          margin: 0 0 16px;
          color: #a8afb8;
          line-height: 1.5;
        }

        .gf-registry-modal input {
          width: 100%;
          box-sizing: border-box;
          padding: 16px;
          border: 1px solid #30363e;
          border-radius: 12px;
          outline: none;
          background: #080a0d;
          color: #fff;
          font-size: 16px;
        }

        .gf-registry-modal input:focus {
          border-color: #ff2438;
          box-shadow: 0 0 0 2px rgba(255,36,56,.12);
        }

        .gf-registry-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 14px;
        }

        .gf-registry-actions button {
          min-height: 48px;
          border: 1px solid #30363e;
          border-radius: 11px;
          background: #151a20;
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }

        .gf-registry-actions .primary {
          border-color: #ff2438;
          background: #ff2438;
        }

        @media (max-width: 520px) {
          .gf-registry-modal {
            padding: 18px;
          }

          .gf-registry-modal h2 {
            font-size: 21px;
          }

          .gf-registry-actions {
            grid-template-columns: 1fr;
          }
        }
      `;

      document.head.appendChild(style);
    }

    /* Show/hide Registry Records */
    function showResults(show) {
      if (!resultsCard) return;

      resultsCard.classList.toggle(
        'gf-registry-results-hidden',
        !show
      );
    }

    /* Search using the existing Registry system */
    function runSearch(query) {
      registryInput.value = query;

      if (typeof window.renderRegistry === 'function') {
        window.renderRegistry();
      }

      showResults(!!query);
    }

    /* Clear search and hide records */
    function clearSearch() {
      registryInput.value = '';

      if (typeof window.renderRegistry === 'function') {
        window.renderRegistry();
      }

      showResults(false);
    }

    /* Hide records when page first opens */
    showResults(false);

    /* Search launcher */
    let launcher = document.getElementById(
      'gfRegistrySearchLaunch'
    );

    if (!launcher) {
      launcher = document.createElement('button');

      launcher.type = 'button';
      launcher.id = 'gfRegistrySearchLaunch';
      launcher.className = 'gf-registry-launch';

      launcher.innerHTML =
        '<span aria-hidden="true">⌕</span>' +
        '<span>Search Device &amp; Receipt Registry</span>';

      const grid = registry.querySelector('.registry-grid');

      if (grid) {
        grid.parentNode.insertBefore(launcher, grid);
      } else {
        registry.appendChild(launcher);
      }
    }

    /* Create popup */
    let overlay = document.getElementById(
      'gfRegistrySearchOverlay'
    );

    if (!overlay) {
      overlay = document.createElement('div');

      overlay.id = 'gfRegistrySearchOverlay';
      overlay.className = 'gf-registry-overlay';

      overlay.innerHTML = `
        <div class="gf-registry-modal"
             role="dialog"
             aria-modal="true">

          <div class="gf-registry-modal-head">
            <h2>Search Registry</h2>

            <button
              type="button"
              class="gf-registry-close"
              id="gfRegistryClose"
              aria-label="Close">
              ×
            </button>
          </div>

          <p>
            Search customer, email, phone, order ID,
            Paystack reference, product, Serial number or IMEI.
          </p>

          <input
            id="gfRegistryPopupInput"
            type="search"
            autocomplete="off"
            placeholder="Search customer, order, reference, serial or IMEI…">

          <div class="gf-registry-actions">

            <button
              type="button"
              class="primary"
              id="gfRegistryDoSearch">
              Search
            </button>

            <button
              type="button"
              id="gfRegistryClear">
              Clear
            </button>

          </div>

        </div>
      `;

      document.body.appendChild(overlay);
    }

    const popupInput =
      document.getElementById('gfRegistryPopupInput');

    const closeButton =
      document.getElementById('gfRegistryClose');

    const searchButton =
      document.getElementById('gfRegistryDoSearch');

    const clearButton =
      document.getElementById('gfRegistryClear');

    function openPopup() {
      overlay.classList.add('open');

      popupInput.value =
        registryInput.value || '';

      setTimeout(function () {
        popupInput.focus();
      }, 50);
    }

    function closePopup() {
      overlay.classList.remove('open');
    }

    launcher.onclick = openPopup;

    closeButton.onclick = closePopup;

    searchButton.onclick = function () {
      const query =
        popupInput.value.trim();

      runSearch(query);

      closePopup();

      if (query) {
        setTimeout(function () {
          const results =
            document.getElementById(
              'registryResults'
            );

          if (results) {
            results.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 80);
      }
    };

    clearButton.onclick = function () {
      popupInput.value = '';

      clearSearch();

      closePopup();
    };

    /* Press Enter to search */
    popupInput.addEventListener(
      'keydown',
      function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();

          searchButton.click();
        }
      }
    );

    /* Tap outside popup to close */
    overlay.addEventListener(
      'click',
      function (event) {
        if (event.target === overlay) {
          closePopup();
        }
      }
    );

    /* Escape closes popup */
    document.addEventListener(
      'keydown',
      function (event) {
        if (
          event.key === 'Escape' &&
          overlay.classList.contains('open')
        ) {
          closePopup();
        }
      }
    );

    /* Keep existing Clear Registry function working */
    if (!window.__gfRegistryClearWrapped) {

      const originalClear =
        window.clearRegistrySearch;

      window.clearRegistrySearch =
        function () {

          if (
            typeof originalClear ===
            'function'
          ) {
            originalClear();
          } else {
            clearSearch();
          }

          showResults(false);
        };

      window.__gfRegistryClearWrapped =
        true;
    }
  }

  /* Start */
  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      initRegistryPopup
    );
  } else {
    initRegistryPopup();
  }

})();