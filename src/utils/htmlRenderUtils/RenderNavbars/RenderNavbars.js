import { renderElementToHtml } from "../../htmlRender";
import { defaultNavbarStyles } from "../../../Elements/Sections/Navbars/DefaultNavbarStyles";

function renderCustomTemplateNavbar(navbarElement, collectedStyles) {
    const { id, children = [], styles = {} } = navbarElement;
  
    // Gather child HTML in arrays
    let logoHtml = '';
    let brandHtml = '';
    let linkHtmls = [];
    let buttonHtmls = [];
  
    children.forEach((child) => {
      const childHtml = renderElementToHtml(child, collectedStyles);
      if (child.type === 'image') {
        logoHtml += childHtml;
      } else if (child.type === 'span' && child.content === '3S.Template') {
        brandHtml += childHtml;
      } else if (child.type === 'span') {
        linkHtmls.push(childHtml);
      } else if (child.type === 'button' || child.type === 'connectWalletButton') {
        buttonHtmls.push(childHtml);
      }
    });
  
    const className = `element-${id}`;
    collectedStyles.push({ className, styles });
  
    return `
  <nav class="${className}">
    <div class="logoContainer">
      ${logoHtml}
      ${brandHtml}
    </div>
    <div class="standardMenuContainer">
      ${linkHtmls.join('\n')}
    </div>
    <div class="buttonContainer">
      ${buttonHtmls.join('\n')}
    </div>
  </nav>`.trim();
  }


 function renderTwoColumnNavbar(navbarElement, collectedStyles) {
  const { id, children = [], styles = {} } = navbarElement;

  // 1) Separate out the child HTML
  let logoHtml = '';
  let linkHtmls = [];
  let buttonHtmls = [];

  children.forEach((child) => {
    const childHtml = renderElementToHtml(child, collectedStyles);
    if (child.type === 'image') {
      logoHtml += childHtml;
    } else if (child.type === 'span') {
      linkHtmls.push(childHtml);
    } else if (child.type === 'button' || child.type === 'connectWalletButton') {
      buttonHtmls.push(childHtml);
    }
  });

  // 2) Build a single merged style object for the <nav> and sub-elements
  //    so that flattenStyles() can produce nested CSS rules like:
  //    .element-123 { display: flex; ... }
  //    .element-123 .logoContainer { ... }
  //    .element-123 .twoColumnRight { ... }
  //    etc.
  const className = `element-${id}`;

  // -- a) Start with user’s top-level nav styles (styles)
  // -- b) Merge in defaultNavbarStyles.nav at the top level
  // -- c) Add sub-rules for .logoContainer, .twoColumnRight, .navList, .buttonContainer
  //       using the defaultNavbarStyles.* plus anything else you want.
  const mergedStyles = {
    // Merge top-level <nav> style:
    ...defaultNavbarStyles.nav,
    ...styles,

    // Then define nested styles under the same object:
    '.logoContainer': {
      ...defaultNavbarStyles.logoContainer,
    },
    '.twoColumnRight': {
      // not explicitly in defaultNavbarStyles, so define your own or reuse partial
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '16px',
      flexGrow: 1,
    },
    '.navList': {
      ...defaultNavbarStyles.navList,
    },
    '.buttonContainer': {
      ...defaultNavbarStyles.buttonContainer,
    },

    // If you want to handle compact menu styles, you can also do:
    '.compactMenuIcon': {
      ...defaultNavbarStyles.compactMenuIcon,
    },
    '.compactMenu': {
      ...defaultNavbarStyles.compactMenu,
    },
  };

  // 3) Push merged styles for this <nav> into collectedStyles
  collectedStyles.push({
    className,
    styles: mergedStyles,
  });

  // 4) Return final HTML with two columns
  return `
<nav class="${className}">
  <!-- Left side: Logo only -->
  <div class="logoContainer">
    ${logoHtml}
  </div>

  <!-- Right side: Nav links + Buttons -->
  <div class="twoColumnRight">
    <ul class="navList">
      ${linkHtmls.join('\n')}
    </ul>
    <div class="buttonContainer">
      ${buttonHtmls.join('\n')}
    </div>
  </div>
</nav>
`.trim();
}

  
function renderThreeColumnNavbar(navbarElement, collectedStyles) {
  const { id, children = [], styles = {} } = navbarElement;

  let logoHtml = '';
  let linkHtmls = [];
  let buttonHtmls = [];

  // 1) Separate out the children
  children.forEach((child) => {
    const childHtml = renderElementToHtml(child, collectedStyles);
    if (child.type === 'image') {
      // Left column
      logoHtml += childHtml;
    } else if (child.type === 'span') {
      // Middle column
      linkHtmls.push(childHtml);
    } else if (child.type === 'button' || child.type === 'connectWalletButton') {
      // Right column
      buttonHtmls.push(childHtml);
    }
  });

  // 2) Merge the default navbar styles with the user’s inline styles.
  //    Then define sub-rules for .logoContainer, .threeColumnCenter, .buttonContainer, etc.
  const className = `element-${id}`;

  const mergedStyles = {
    // Top-level nav
    ...defaultNavbarStyles.nav,
    ...styles,

    // Sub-rules
    '.logoContainer': {
      ...defaultNavbarStyles.logoContainer,
    },
    '.standardMenuContainer': {
        ...defaultNavbarStyles.threeColumnCenter,
    },
    '.buttonContainer': {
      ...defaultNavbarStyles.buttonContainer,
    },
    '.compactMenuIcon': {
      ...defaultNavbarStyles.compactMenuIcon,
    },
    '.compactMenu': {
      ...defaultNavbarStyles.compactMenu,
    },
  };

  // 3) Push it into collectedStyles for flattenStyles()
  collectedStyles.push({ className, styles: mergedStyles });

  // 4) Return final HTML structure
  return `
<nav class="${className}">
  <!-- Left column: Logo -->
  <div class="logoContainer">
    ${logoHtml}
  </div>

  <!-- Middle column: Links (spans) -->
  <ul class="threeColumnCenter">
    ${linkHtmls.join('\n')}
  </ul>

  <!-- Right column: Buttons -->
  <div class="buttonContainer">
    ${buttonHtmls.join('\n')}
  </div>
</nav>
`.trim();
}

export {renderCustomTemplateNavbar, renderThreeColumnNavbar, renderTwoColumnNavbar };