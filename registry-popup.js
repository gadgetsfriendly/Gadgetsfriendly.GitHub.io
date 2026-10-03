(function () {
  'use strict';

  function initRegistryPopup() {
    const registry = document.getElementById('registry');

    if (!registry || document.getElementById('gfRegistrySearchModal')) return;

    const style = document.createElement('style');

    style.textContent = `
      #registry .gf-registry-search-card {
        display: none !important;
      }

      .gf-registry-launch {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin: 0 0 18px;
        padding: 16px 18px;
        border: 1px solid #394049;
        border-radius: 14px;
        background: linear-gradient(145deg,#151a20,#0d1014);
        color: #fff;
        font-weight: 700;
        font-size: 17px;
        cursor: pointer;
      }

      .gf-registry-launch:hover {
        border-color: #ff2638;
      }

      .gf-registry-modal {
        position: fixed;
        inset: 0;
        z-index: 99990;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(0,0,0,.78);
        backdrop-filter: blur(8px);
      }

      .gf-registry-modal.open {
        display: flex;
      }

      .gf-registry-panel {
        width: min(680px,100%);
        max-height: 90vh;
        overflow: auto;
        background: linear-gradient(145deg,#11151a,#090c0f);
        border: 1px solid #343b44;
        border-radius: 20px;
        padding: 22px;
        box-shadow: 0 25px 90px rgba(0,0,0,.55);
      }

      .gf-registry-head {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 18px;
      }

      .gf-registry-head h2 {
        margin: 0 0 7px;
        font-size: 25px;
      }

      .gf-registry-head p {
        margin: 0;
        color: #9da3ab;
        line-height: 1.5;
      }

      .gf-registry-x {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 1px solid #394049;
        background: #171c22;
        color: #fff;
        font-size: 25px;
        cursor: pointer;
      }

      .gf-registry-input {
        width: 100%;
        padding: 15px 16px;
        border-radius: 12px;
        border: 1px solid #394049;
        background: #07090b;
        color: #fff;
        outline: none;
        font-size: 16px;
      }

      .gf-registry-input:focus {
        border-color: #ff2638;
        box-shadow: 0 0 0 3px rgba(255,38,56,.12);
      }

      .gf-registry-actions {
        display: flex;
        gap: 10px;
        margin-top: 12px;
      }

      .gf-registry-actions button {
        flex: 1;
        padding: 13px 15px;
        border-radius: 11px;
        border: 1px solid #394049;
        background: #11151a;
        color: #fff;
        cursor: pointer;
      }

      .gf-registry-actions .primary {
        background: #ff2638;
        border-color: #ff2638;
      }

      .gf-registry-note {
        margin-top: 14px;
        color: #9da3ab;
        font-size: 13px;
        text-align: center;
      }

      @media(max-width:600px) {
        .gf-registry-modal {
          padding: 8px;
          align-items: flex-end;
        }

        .gf-registry-panel {
          max-height: 92vh;
          border-radius: 20px 20px 0 0;
          padding: 18px;
        }

        .gf-registry-head h2 {
          font-size: 22px;
        }

        .gf-registry-actions {
          flex-direction: column;
        }
      }
    `;

    document.head.appendChild(style);

    const oldCard = registry.querySelector('.card');

    if (oldCard) {
      oldCard.classList.add('gf-registry-search-card');
    }

    const launch = document.createElement('button');

    launch.type = 'button';
    launch.className = 'gf-registry-launch';
    launch.innerHTML = '⌕ <span>Search Device & Receipt Registry</span>';

    const heading = registry.querySelector('h1');

    if (heading) {
      heading.insertAdjacentElement('afterend', launch);
    }

    const modal = document.createElement('div');

    modal.id = 'gfRegistrySearchModal';
    modal.className = 'gf-registry-modal';

    modal.innerHTML = `
      <div class="gf-registry-panel">

        <div class="gf-registry-head">

          <div>
            <h2>Search Registry</h2>

            <p>
              Find a customer, order, Paystack reference,
              product, Serial number or IMEI.
            </p>
          </div>

          <button
            type="button"
            class="gf-registry-x"
            aria-label="Close search">
            ×
          </button>

        </div>

        <input
          id="gfRegistryInput"
          class="gf-registry-input"
          autocomplete="off"
          placeholder="Customer, order, reference, serial or IMEI…">

        <div class="gf-registry-actions">

          <button
            type="button"
            class="primary"
            id="gfRegistrySearchBtn">
            Search
          </button>

          <button
            type="button"
            id="gfRegistryClearBtn">
            Clear
          </button>

        </div>

        <div class="gf-registry-note">
          Search results remain on the Registry page.
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    const input = modal.querySelector('#gfRegistryInput');

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    function performSearch() {
      const target = document.getElementById('registryQ');

      if (!target) return;

      target.value = input.value.trim();

      if (typeof window.renderRegistry === 'function') {
        window.renderRegistry();
      }

      closeModal();
    }

    launch.addEventListener('click', function () {
      const target = document.getElementById('registryQ');

      input.value = target ? target.value : '';

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';

      setTimeout(function () {
        input.focus();
      }, 50);
    });

    modal.querySelector('.gf-registry-x')
      .addEventListener('click', closeModal);

    modal.querySelector('#gfRegistrySearchBtn')
      .addEventListener('click', performSearch);

    modal.querySelector('#gfRegistryClearBtn')
      .addEventListener('click', function () {

        input.value = '';

        const target = document.getElementById('registryQ');

        if (target) {
          target.value = '';
        }

        if (typeof window.renderRegistry === 'function') {
          window.renderRegistry();
        }

        input.focus();
      });

    input.addEventListener('keydown', function (event) {

      if (event.key === 'Enter') {
        performSearch();
      }

      if (event.key === 'Escape') {
        closeModal();
      }

    });

    modal.addEventListener('click', function (event) {

      if (event.target === modal) {
        closeModal();
      }

    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRegistryPopup);
  } else {
    initRegistryPopup();
  }

})();
