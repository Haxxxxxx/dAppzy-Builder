// src/utils/htmlRenderUtils/RenderWeb3/renderMintingSection.js
import { mintingSectionStyles } from '../../../Elements/Sections/Web3Related/DefaultWeb3Styles';
// Firestore imports – adjust the import path as needed.
import { db, doc, setDoc } from '../../../firebase';

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

  // Build HTML parts.
  const logoHtml = logo
    ? `<img class="logo" src="${logo.content || ''}" alt="Logo" />`
    : '';

  let timerHtml = '';
  if (timer) {
    const dateObj = new Date(timer.content || '');
    const isValidDate = !isNaN(dateObj.getTime());
    const localDateString = isValidDate
      ? dateObj.toLocaleString()
      : (timer.content || '');
    timerHtml = `
      <div class="timer" id="mint-timer-${id}">
        <p>Minting ends on:</p>
        <div>${localDateString}</div>
      </div>
    `;
  }

  const remainingHtml = remaining
    ? `<span class="remaining">${remaining.content || ''}</span>`
    : '';

  let valueCurrencyHtml = '';
  if (value && currency) {
    valueCurrencyHtml = `<span class="price">${value.content || ''} ${currency.content || ''}</span>`;
  }

  let quantityPriceHtml = '';
  if (quantity && totalPrice) {
    quantityPriceHtml = `
      <span class="quantity">
        ${quantity.content || ''} (${totalPrice.label || ''}: ${totalPrice.content || ''})
      </span>
    `;
  }

  const mintButtonHtml = mintButton
    ? `<button class="mintButton" id="mint-btn-${id}" onclick="mintNFT()" disabled>${mintButton.content || 'MINT'}</button>`
    : '';

  const titleHtml = title
    ? `<span class="title">${title.content || ''}</span>`
    : '';
  const descriptionHtml = description
    ? `<span class="description">${description.content || ''}</span>`
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

  // Return the final production HTML with an embedded script.
  return `
    <!-- Include these scripts before this code:
         <script src="https://unpkg.com/@solana/web3.js@1.73.2/lib/index.iife.js"></script>
         <script src="https://unpkg.com/@metaplex-foundation/js/dist/index.umd.js"></script>
    -->
    <section class="${className}">
      <!-- Left Section -->
      <div class="leftSection">
        ${logoHtml}
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

      <!-- Production Minting Script -->
      <script>
        (function(){
          console.log('[DEBUG] Candy Machine ID:', '${candyMachineId}');
          const mintButton = document.getElementById("mint-btn-${id}");
          const timerElement = document.getElementById("mint-timer-${id}");
          console.log('[DEBUG] mintButton:', mintButton);
          console.log('[DEBUG] timerElement:', timerElement);

          console.log('[DEBUG] solanaWeb3:', typeof solanaWeb3);
          console.log('[DEBUG] Metaplex:', typeof window.Metaplex);

          const mintStartTime = new Date('${timer ? timer.content : ""}').getTime();
          function updateCountdown() {
            const now = Date.now();
            const distance = mintStartTime - now;
            if (distance > 0) {
              const days = Math.floor(distance / (1000 * 60 * 60 * 24));
              const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((distance % (1000 * 60)) / 1000);

              if (timerElement) {
                timerElement.innerHTML = \`
                  <div>Mint starts in: \${days}d \${hours}h \${minutes}m \${seconds}s</div>
                \`;
              }
              if (mintButton) mintButton.disabled = true;
            } else {
              if (timerElement) {
                timerElement.innerHTML = "<div>Minting is live!</div>";
              }
              if (mintButton) mintButton.disabled = false;
            }
          }
          if (timerElement) {
            updateCountdown();
            setInterval(updateCountdown, 1000);
          }

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

          window.mintNFT = async function() {
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
              const metaplex = window.Metaplex.Metaplex.make(connection)
                .use(window.Metaplex.keypairIdentity(wallet.publicKey));
              console.log('[DEBUG] Metaplex instance created.');

              const candyMachineId = '${candyMachineId}';
              console.log('[DEBUG] CandyMachineID in mintNFT:', candyMachineId);

              if (!candyMachineId) {
                alert('Candy Machine ID is not set.');
                return;
              }
              const candyMachineAddress = new solanaWeb3.PublicKey(candyMachineId);

              const nftPriceSOL = parseFloat('${nftPrice}');
              console.log('[DEBUG] nftPriceSOL parsed:', nftPriceSOL);
              if (isNaN(nftPriceSOL) || nftPriceSOL <= 0) {
                alert('Invalid NFT price.');
                return;
              }
              const lamports = nftPriceSOL * 1e9;
              console.log('[DEBUG] About to send payment of lamports:', lamports);
              await sendPayment(lamports);

              console.log('[DEBUG] Payment done, now minting...');
              const { nft } = await metaplex.candyMachines().mint({ candyMachine: candyMachineAddress });
              alert('Mint successful! NFT address: ' + nft.address.toString());
              console.log('[DEBUG] Mint success, NFT address:', nft.address.toString());
            } catch (error) {
              console.error('[DEBUG] Minting failed:', error);
              alert('Mint failed. See console for details.');
            }
          }
        })();
      </script>
    </section>
  `.trim();
}
