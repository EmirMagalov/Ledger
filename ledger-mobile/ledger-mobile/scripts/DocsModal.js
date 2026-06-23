document.addEventListener('DOMContentLoaded', () => {
  const termsModal = document.getElementById('termsModal');
  const policyModal = document.getElementById('policyModal');

  const TERMS_BODY = `
    <p>Welcome to ledger live. these terms of use ("terms") govern your access to and use of our informational interface ("service"). by accessing or using the service, you agree to be bound by these terms.</p>

    <h3>1. description of service</h3>
    <p>ledger live provides an interface for viewing publicly available information from various blockchains. our service acts as an informational aggregator and does not store, control, or manage any cryptocurrency assets. the service is provided for informational purposes only.</p>

    <h3>2. user responsibilities</h3>
    <p>you are solely responsible for your use of the service. you agree not to use the service for any illegal or unauthorized purpose. you understand and agree that the service does not provide custody for your assets. management and security of your private keys and secret recovery phrases are your sole responsibility.</p>

    <h3>3. disclaimer of warranties</h3>
    <p>the service is provided on an "as is" and "as available" basis. ledger live makes no warranties, express or implied, regarding the accuracy, completeness, or reliability of any information obtained through the service. data is sourced from third-party public blockchains, and we are not responsible for any errors or omissions.</p>

    <h3>4. limitation of liability</h3>
    <p>in no event shall ledger live or its affiliates be liable for any direct, indirect, incidental, or consequential damages arising out of your use or inability to use the service, including any financial losses.</p>

    <h3>5. changes to terms</h3>
    <p>we reserve the right to modify these terms at any time. we will provide notice of such changes by updating the "last updated" date.</p>
  `;

  const POLICY_BODY = `
    <p>this privacy policy describes how ledger live ("we," "us," or "our") collects, uses, and discloses your information when you use our service.</p>

    <h3>1. information we collect</h3>
    <ul>
      <li>information you provide: we may collect public wallet addresses that you voluntarily input into the service to view related blockchain data.</li>
      <li>usage data: we may collect anonymous data about your interaction with the service, such as features used and session duration, for the purpose of service improvement.</li>
    </ul>

    <h3>2. information we DO NOT collect</h3>
    <p>we never ask for, collect, receive, or store your private keys, secret recovery phrases, or any form of password. our service is designed to function without access to your sensitive credentials.</p>

    <h3>3. how we use your information</h3>
    <p>we use the information we collect solely to:</p>
    <ul>
      <li>provide, maintain, and improve our service.</li>
      <li>fetch and display public information from the blockchain as requested by you.</li>
      <li>perform internal analytics to understand how our service is used.</li>
    </ul>

    <h3>4. data sharing</h3>
    <p>we do not sell your personal information. we may share anonymized and aggregated usage data with third-party analytics providers (e.g., for performance monitoring) to help us improve the service.</p>

    <h3>5. data security</h3>
    <p>we use reasonable administrative and technical measures to protect the information we collect. however, no security system is impenetrable, and we cannot guarantee the absolute security of your information.</p>

    <h3>6. your rights</h3>
    <p>you have the right to request access to or deletion of the information you have provided. as we only handle public addresses, you can cease using the service at any time to end data processing.</p>
  `;

  function renderDocs(modal, title, body) {
    if (!modal) return;

    modal.innerHTML = `
      <article class="docs-modal">
        <div class="docs-modal__header">
          <img
            class="docs-modal__logo"
            src="./icons/logo-mob.svg"
            alt="ledger Live Logo"
            width="158"
            height="30"
            loading="lazy"
          />
          <button class="docs-modal__close" type="button" aria-label="Close" data-js-close-docs><svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.79328 5.07881L9.84978 2.02199C10.0482 1.79665 10.1533 1.50427 10.1438 1.20429C10.1342 0.904298 10.0106 0.619215 9.79817 0.406983C9.58575 0.194751 9.3004 0.0712996 9.00013 0.0617218C8.69986 0.0521439 8.40722 0.157159 8.18167 0.35542L5.12201 3.40909L2.05683 0.345973C1.94705 0.236286 1.81671 0.149278 1.67326 0.0899155C1.52982 0.0305533 1.37607 1.15574e-09 1.22081 0C1.06554 -1.15574e-09 0.911798 0.0305533 0.768352 0.0899155C0.624906 0.149278 0.494567 0.236286 0.384779 0.345973C0.27499 0.45566 0.187901 0.585878 0.128484 0.729191C0.0690663 0.872504 0.0384846 1.02611 0.0384846 1.18123C0.0384846 1.33635 0.0690663 1.48995 0.128484 1.63326C0.187901 1.77658 0.27499 1.90679 0.384779 2.01648L3.45074 5.07881L0.394234 8.13485C0.274364 8.24191 0.177615 8.37227 0.109909 8.51796C0.0422019 8.66366 0.00496054 8.82162 0.000462626 8.9822C-0.00403529 9.14277 0.0243049 9.30256 0.0837495 9.45181C0.143194 9.60107 0.232493 9.73663 0.346183 9.85022C0.459873 9.9638 0.595564 10.053 0.744953 10.1124C0.894343 10.1718 1.05429 10.2001 1.21501 10.1956C1.37573 10.1911 1.53384 10.1539 1.67967 10.0863C1.8255 10.0186 1.95599 9.92197 2.06314 9.80221L5.12201 6.74853L8.17773 9.80221C8.39946 10.0237 8.70018 10.1482 9.01376 10.1482C9.32733 10.1482 9.62806 10.0237 9.84978 9.80221C10.0715 9.58069 10.1961 9.28024 10.1961 8.96696C10.1961 8.65367 10.0715 8.35322 9.84978 8.1317L6.79328 5.07881Z" fill="black" />
          </svg></button>
        </div>
        <div class="docs-modal__updated">last updated: 15.06.2025</div>
        <h1 class="docs-modal__title">${title}</h1>
        <div class="docs-modal__content">${body}</div>
      </article>
    `;
  }

  renderDocs(termsModal, 'Terms of Use', TERMS_BODY);
  renderDocs(policyModal, 'Privacy Policy', POLICY_BODY);

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-js-open-terms]').forEach((button) => {
    button.addEventListener('click', () => openModal(termsModal));
  });

  document.querySelectorAll('[data-js-open-policy]').forEach((button) => {
    button.addEventListener('click', () => openModal(policyModal));
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-js-close-docs]')) return;
    event.preventDefault();
    closeModal(termsModal);
    closeModal(policyModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal(termsModal);
      closeModal(policyModal);
    }
  });
});


