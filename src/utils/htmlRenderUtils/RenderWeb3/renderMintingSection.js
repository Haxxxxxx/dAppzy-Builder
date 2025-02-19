import { mintingSectionStyles } from '../../../Elements/Sections/Web3Related/DefaultWeb3Styles';

// or wherever your `mintingSectionStyles` are located

/**
 * Convert a MintingSection element into final HTML + push merged CSS rules to `collectedStyles`.
 */
export function renderMintingSection(mintingElement, collectedStyles) {
  // 1) Destructure from the element data
  //    `configuration` is optional if you allow different configs; otherwise, skip.
  const {
    id,
    children = [],
    styles = {}, // user overrides at the top level
  } = mintingElement;

  // 2) Identify specific children (logo, timer, etc.), just like in your React code
  const findChild = (type) => children.find((c) => c.type === type);
  const findChildren = (type) => children.filter((c) => c.type === type);

  // Left column items
  const logo = findChild('image');
  const timer = findChild('timer');
  const remaining = findChild('remaining');
  const value = findChild('value');
  const currency = findChild('currency');
  const quantity = findChild('quantity');
  const totalPrice = findChild('price');
  const mintButton = findChild('button');

  // Right column items
  const title = findChild('title');
  const description = findChild('description');
  const rareItemsTitle = findChild('rareItemsTitle');
  const docItemsTitle = findChild('docItemsTitle');
  const rareItems = findChildren('rare-item');
  const documentItems = findChildren('document-item');

  // 3) Build partial HTML for each piece
  // Left side
  const logoHtml = logo
    ? `<img class="logo" src="${logo.content || ''}" alt="Logo" />`
    : '';
  const timerHtml = timer
    ? `<div class="timer">${timer.content || ''}</div>`
    : '';
  const remainingHtml = remaining
    ? `<span class="remaining">${remaining.content || ''}</span>`
    : '';
  let valueCurrencyHtml = '';
  if (value && currency) {
    // e.g. "1.23 ETH"
    valueCurrencyHtml = `<span class="price">${value.content || ''} ${currency.content || ''}</span>`;
  }
  let quantityPriceHtml = '';
  if (quantity && totalPrice) {
    // e.g. "Qty: 5 (Total Price: 0.55 ETH)"
    quantityPriceHtml = `<span class="quantity">${quantity.content || ''} (${totalPrice.label || ''}: ${totalPrice.content || ''})</span>`;
  }
  const mintButtonHtml = mintButton
    ? `<button class="mintButton">${mintButton.content || 'MINT'}</button>`
    : '';

  // Right side
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

  // Rare & Document items are images
  const rareItemsHtml = rareItems
    .map(
      (item) =>
        `<img class="itemImage" src="${item.content || ''}" alt="Rare item" />`
    )
    .join('\n');
  const docItemsHtml = documentItems
    .map(
      (item) =>
        `<img class="itemImage" src="${item.content || ''}" alt="Document item" />`
    )
    .join('\n');

  // 4) Merge top-level styles + user overrides + define sub-rules
  //    So we produce a single style object with ".leftSection", ".logo", ".timer", etc.
  const mergedStyles = {
    // Parent container
    ...mintingSectionStyles.section,
    ...styles,

    // Sub-rules:
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

  // 5) Push the final merged styles into `collectedStyles`
  //    We'll give it a unique CSS class named `minting-<id>`
  const className = `minting-${id}`;
  collectedStyles.push({
    className,
    styles: mergedStyles,
  });

  // 6) Construct final HTML referencing these classes
  return `
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
    </section>
  `.trim();
}
