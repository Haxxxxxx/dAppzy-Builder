/* global solanaWeb3, Metaplex */

import { mintingSectionStyles } from '../../../Elements/Sections/Web3Related/DefaultWeb3Styles';
// Firestore imports – adjust the import path as needed.
import { db, doc, setDoc } from '../../../firebase';

// ------------------ 1) HELPER to compute progress from "remaining" ------------------ //
function calculateProgress(remainingContent) {
  // e.g., remainingContent = "900/1000"
  if (!remainingContent || !remainingContent.includes('/')) return 0;
  const [available, total] = remainingContent.split('/').map((num) => parseInt(num.trim(), 10));
  const minted = total - available;
  return (minted / total) * 100; // 0..100
}

// ------------------ 2) HELPER to build the circular progress + logo HTML -----------
function renderCircularProgressImage(logo, remainingContent) {
  if (!logo) return '';

  // 2A) Calculate the progress percentage
  const progress = calculateProgress(remainingContent);

  // 2B) Outer container sizes
  const containerSize = 150; // or pick any desired dimension
  const marginSize = 10;     // how many px of margin around the ring
  const innerSize = containerSize - marginSize * 2;

  // 2C) Circle geometry for the SVG
  const strokeWidth = 10;
  const center = innerSize / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // For the black dot at arc’s end:
  const dotRadius = strokeWidth / 2;
  const angleDeg = progress * 3.6;
  const angleRad = (Math.PI / 180) * angleDeg;
  const dotX = center + radius * Math.cos(angleRad);
  const dotY = center + radius * Math.sin(angleRad);

  // 2D) Return the HTML snippet (inline <svg> with gradient)
  return `
    <div style="
      position: relative;
      width: ${containerSize}px;
      height: ${containerSize}px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.5); /* optional semi-trans white margin */
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <!-- Inner circle -->
      <div style="
        position: relative;
        width: ${innerSize}px;
        height: ${innerSize}px;
        border-radius: 50%;
        overflow: hidden;
      ">
        <!-- Logo in center -->
        <img 
          src="${logo.content || ''}"
          alt="Logo"
          style="
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
          "
        />
        <!-- Progress overlay -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: ${innerSize}px;
          height: ${innerSize}px;
          pointer-events: none;
        ">
          <svg 
            width="${innerSize}" 
            height="${innerSize}"
            style="
              position: absolute;
              top: 0;
              left: 0;
              transform: rotate(-90deg);
            "
          >
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#EAC050" />
                <stop offset="48.5%" stop-color="#7E1C48" />
                <stop offset="100%" stop-color="#1A587C" />
              </linearGradient>
            </defs>
            <!-- Grey background ring -->
            <circle
              cx="${center}"
              cy="${center}"
              r="${radius}"
              fill="none"
              stroke="#ccc"
              stroke-width="${strokeWidth}"
            />
            <!-- Gradient arc for progress -->
            <circle
              cx="${center}"
              cy="${center}"
              r="${radius}"
              fill="none"
              stroke="url(#progressGradient)"
              stroke-width="${strokeWidth}"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"
              stroke-linecap="round"
            />
            <!-- Black dot at end -->
            <circle
              cx="${dotX}"
              cy="${dotY}"
              r="${dotRadius}"
              fill="black"
            />
          </svg>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the minting section HTML.
 * Updated to include a circular progress bar around the logo.
 */
export function renderMintingSection(mintingElement, collectedStyles) {
  const { id, children = [], styles = {} } = mintingElement;

  // Helper functions to retrieve children.
  const findChild = (type) => children.find((c) => c.type === type);
  const findChildren = (type) => children.filter((c) => c.type === type);

  // Left column items.
  const logo = findChild('image');
  const timer = findChild('timer');
  const remaining = findChild('remaining');
  const value = findChild('value');
  const currency = findChild('currency');
  const quantity = findChild('quantity');
  const totalPrice = findChild('price');
  const mintButton = findChild('button');

  // Right column items.
  const title = findChild('title');
  const description = findChild('description');
  const rareItemsTitle = findChild('rareItemsTitle');
  const docItemsTitle = findChild('docItemsTitle');
  const rareItems = findChildren('rare-item');
  const documentItems = findChildren('document-item');

  // Retrieve candyMachineId and nftPrice.
  let candyMachineId = findChild('candyMachineId') ? findChild('candyMachineId').content : '';
  const nftPrice = totalPrice ? totalPrice.content : '0';

  // Generate a new Candy Machine ID if missing.
  if (!candyMachineId) {
    const generatedId = crypto.randomUUID();
    candyMachineId = generatedId;
    console.log('No Candy Machine ID found. Generated one:', generatedId);

    // Save to Firestore asynchronously.
    setDoc(doc(db, 'candyMachineIds', `element-${id}`), {
      candyMachineId: generatedId,
      createdAt: new Date().toISOString(),
    })
      .then(() => {
        console.log('Generated Candy Machine ID saved to Firestore successfully.');
      })
      .catch(err => {
        console.error('Error saving generated Candy Machine ID to Firestore:', err);
      });
  }

  // ------------------ Replace old "logoHtml" with progress-based version ------------------ //
  const logoHtml = logo
    ? renderCircularProgressImage(logo, remaining ? remaining.content : '')
    : '';

  // The timer container. Its innerHTML will be updated by the init code.
  const timerHtml = timer
    ? `<div class="timer" id="mint-timer-${id}">
         <p>Minting starts in: Loading...</p>
       </div>`
    : '';

  // Example usage in your "renderMintingSection" or similar function:

  // If 'remaining' has { label: 'Remaining', content: '900/1000' }
  const remainingHtml = remaining
    ? `<span class="remaining">
       ${remaining.label ? remaining.label + ': ' : ''}${remaining.content || ''}
     </span>`
    : '';

  let valueCurrencyHtml = '';
  if (value && currency) {
    // If 'value' is { label: 'Price', content: '1.5' } and 'currency' is { content: 'SOL' }
    valueCurrencyHtml = `
    <span class="price">
      ${value.label ? value.label + ': ' : ''}${value.content || ''} ${currency.content || ''}
    </span>
  `;
  }

  let quantityPriceHtml = '';
  if (quantity && totalPrice) {
    // If 'quantity' is { label: 'Quantity', content: '2' }
    // and 'price' is { label: 'Total Price', content: '3 SOL' }
    quantityPriceHtml = `
    <span class="quantity">
      ${quantity.label ? quantity.label + ': ' : ''}${quantity.content || ''} 
      (${totalPrice.label ? totalPrice.label + ': ' : ''}${totalPrice.content || ''})
    </span>
  `;
  }


  const mintButtonHtml = mintButton
    ? `<button class="mintButton" id="mint-btn-${id}" onclick="mintNFT()" disabled>${mintButton.content || 'MINT'}</button>`
    : '';

  const titleHtml = title
    ? `<span class="title">
         ${title.label ? title.label + ': ' : ''}${title.content || ''}
       </span>`
    : '';

  const descriptionHtml = description
    ? `<span class="description">
         ${description.label ? description.label + ': ' : ''}${description.content || ''}
       </span>`
    : '';

  const rareItemsTitleHtml = rareItemsTitle
    ? `<span class="sectionTitle">${rareItemsTitle.content || ''}</span>`
    : '';
  const docItemsTitleHtml = docItemsTitle
    ? `<span class="sectionTitle">${docItemsTitle.content || ''}</span>`
    : '';
  const rareItemsHtml = rareItems
    .map(item => `<img class="itemImage" src="${item.content || ''}" alt="Rare item" />`)
    .join('\n');
  const docItemsHtml = documentItems
    .map(item => `<img class="itemImage" src="${item.content || ''}" alt="Document item" />`)
    .join('\n');

  // Merge default and custom styles.
  const mergedStyles = {
    ...mintingSectionStyles.section,
    ...styles,
    '.leftSection': { ...mintingSectionStyles.leftSection },
    '.rightSection': { ...mintingSectionStyles.rightSection },
    '.rightSectionHeader': { ...mintingSectionStyles.rightSectionHeader },
    '.logo': { ...mintingSectionStyles.logo },
    '.timer': { ...mintingSectionStyles.timer },
    '.details': { ...mintingSectionStyles.details },
    '.remaining': { ...mintingSectionStyles.remaining },
    '.price': { ...mintingSectionStyles.price },
    '.quantity': { ...mintingSectionStyles.quantity },
    '.mintButton': { ...mintingSectionStyles.mintButton },
    '.title': { ...mintingSectionStyles.title },
    '.description': { ...mintingSectionStyles.description },
    '.sectionTitle': { ...mintingSectionStyles.sectionTitle },
    '.itemsContainer': { ...mintingSectionStyles.itemsContainer },
    '.itemImage': { ...mintingSectionStyles.itemImage },
  };

  const className = `minting-${id}`;
  collectedStyles.push({
    className,
    styles: mergedStyles,
  });

  // Return the final HTML with the new circular progress around the logo.
  return `
    <!-- 
      Ensure these external scripts are loaded in your page:
        <script src="https://unpkg.com/@solana/web3.js@1.73.2/lib/index.iife.js"></script>
        <script src="https://unpkg.com/@metaplex-foundation/js/dist/index.umd.js"></script>
    -->
    <section class="${className}"
      data-timer-content="${timer ? timer.content : ''}"
      data-candy-machine-id="${candyMachineId}"
      data-nft-price="${nftPrice}">
      
      <!-- Left Section -->
      <div class="leftSection">
        ${logoHtml}        <!-- <-- Now includes circular progress + logo -->
        ${timerHtml}
        <div class="details">
          ${remainingHtml}
          ${valueCurrencyHtml}
          ${quantityPriceHtml}
        </div>
        ${mintButtonHtml}
      </div>

      <!-- Right Section -->
      <div class="rightSection">
        <div class="rightSectionHeader">
          ${titleHtml}
          ${descriptionHtml}
          ${rareItemsTitleHtml}
        </div>
        <div class="itemsContainer">
          ${rareItemsHtml}
        </div>
        ${docItemsTitleHtml}
        <div class="itemsContainer">
          ${docItemsHtml}
        </div>
      </div>
    </section>
  `.trim();
}

/**
 * Call this function after the rendered HTML has been inserted into the DOM.
 * It sets up the countdown timer and attaches the mintNFT functionality.
 *
 * For example, in a React component you might call this in a useEffect:
 *   useEffect(() => { initMintingSection(uniqueId); }, [uniqueId]);
 */
export function initMintingSection(sectionId) {
  const section = document.querySelector(`.minting-${sectionId}`);
  if (!section) {
    console.error('initMintingSection: Section not found for ID', sectionId);
    return;
  }
  const timerElement = section.querySelector(`#mint-timer-${sectionId}`);
  const timerContent = section.getAttribute('data-timer-content') || '';
  const candyMachineId = section.getAttribute('data-candy-machine-id') || '';
  const nftPrice = section.getAttribute('data-nft-price') || '0';

  // Parse the timer content.
  // Try an absolute date first.
  let mintStartTime = new Date(timerContent).getTime();
  if (isNaN(mintStartTime)) {
    // Assume a relative format like "17d 5h 38m 34s"
    const regex = /^(?:(\d+)d)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?$/;
    const matches = timerContent.trim().match(regex);
    if (matches) {
      const days = parseInt(matches[1] || "0", 10);
      const hours = parseInt(matches[2] || "0", 10);
      const minutes = parseInt(matches[3] || "0", 10);
      const seconds = parseInt(matches[4] || "0", 10);
      mintStartTime = Date.now() + (((days * 24 * 60 * 60) +
        (hours * 60 * 60) +
        (minutes * 60) +
        seconds) * 1000);
    } else {
      mintStartTime = Date.now();
    }
  }

  function updateCountdown() {
    const now = Date.now();
    const distance = mintStartTime - now;
    if (distance > 0) {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      if (timerElement) {
        timerElement.innerHTML = `<div>Mint starts in: ${days}d ${hours}h ${minutes}m ${seconds}s</div>`;
      }
      // Keep the mint button disabled until the countdown is over.
      const mintButton = section.querySelector(`#mint-btn-${sectionId}`);
      if (mintButton) mintButton.disabled = true;
    } else {
      if (timerElement) {
        timerElement.innerHTML = "<div>Minting is live!</div>";
      }
      // Enable the mint button once the countdown is over.
      const mintButton = section.querySelector(`#mint-btn-${sectionId}`);
      if (mintButton) mintButton.disabled = false;
    }
  }
  // Initialize the countdown.
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Attach the mintNFT function to window.
  window.mintNFT = async function () {
    console.log('[DEBUG] mintNFT function triggered.');
    try {
      if (!window.solana || !window.solana.isPhantom) {
        alert('Phantom wallet not found or not connected');
        return;
      }
      const connection = new solanaWeb3.Connection('https://api.mainnet-beta.solana.com');
      console.log('[DEBUG] Connection established.');
      await window.solana.connect();
      console.log('[DEBUG] Phantom wallet connected.');
      const wallet = window.solana;
      const metaplex = Metaplex.Metaplex.make(connection)
        .use(Metaplex.keypairIdentity(wallet.publicKey));
      console.log('[DEBUG] Metaplex instance created.');
      console.log('[DEBUG] CandyMachineID in mintNFT:', candyMachineId);
      if (!candyMachineId) {
        alert('Candy Machine ID is not set.');
        return;
      }
      const candyMachineAddress = new solanaWeb3.PublicKey(candyMachineId);
      const nftPriceSOL = parseFloat(nftPrice);
      console.log('[DEBUG] nftPriceSOL parsed:', nftPriceSOL);
      if (isNaN(nftPriceSOL) || nftPriceSOL <= 0) {
        alert('Invalid NFT price.');
        return;
      }
      const lamports = nftPriceSOL * 1e9;
      console.log('[DEBUG] About to send payment of lamports:', lamports);

      // sendPayment function (as defined below)
      async function sendPayment(lamports) {
        console.log('[DEBUG] sendPayment called with lamports:', lamports);
        const connection = new solanaWeb3.Connection('https://api.mainnet-beta.solana.com');
        const from = window.solana;
        const adminWallet = new solanaWeb3.PublicKey('iahtF9KAwDrSsqPu2eX1UsMPCXRQBJnTx99c5fkAyzm');
        console.log('[DEBUG] Admin wallet:', adminWallet.toString());
        const transaction = new solanaWeb3.Transaction().add(
          solanaWeb3.SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: adminWallet,
            lamports: lamports,
          })
        );
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = from.publicKey;
        console.log('[DEBUG] About to sign transaction...');
        const signedTransaction = await from.signTransaction(transaction);
        console.log('[DEBUG] Transaction signed. Sending...');
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log('[DEBUG] Transaction signature:', signature);
        await connection.confirmTransaction(signature);
        console.log('[DEBUG] Transaction confirmed:', signature);
        return signature;
      }

      await sendPayment(lamports);
      console.log('[DEBUG] Payment done, now minting...');
      const { nft } = await metaplex.candyMachines().mint({ candyMachine: candyMachineAddress });
      alert('Mint successful! NFT address: ' + nft.address.toString());
      console.log('[DEBUG] Mint success, NFT address:', nft.address.toString());
    } catch (error) {
      console.error('[DEBUG] Minting failed:', error);
      alert('Mint failed. See console for details.');
    }
  };
}
