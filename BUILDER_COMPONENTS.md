# dAppzy-Builder Component Reference

> Auto-generated documentation for all 52 element components in `src/Elements/`.
> Last updated: 2026-02-28 (Round 11)

---

## Basic Components (7)

| Component | File | Key Props | Description |
|---|---|---|---|
| Button | `src/Elements/Basic/Button.js` | id, content, styles | Editable button with contentEditable and blur-to-save |
| Div | `src/Elements/Basic/Div.js` | id, parentId, styles, children, onDropItem | Container div with drop zone and flex layout |
| LinkBlock | `src/Elements/Basic/LinkBlock.js` | id, content, styles, label, href | Anchor element with optional label and inline editing |
| Line | `src/Elements/Basic/Line.js` | id, styles | Horizontal rule with customizable border styling |
| Anchor | `src/Elements/Basic/Anchor.js` | id, content, styles, href | Inline anchor link with editable text |
| List | `src/Elements/Basic/List.js` | id, listType, listStyleType | Ordered/unordered list with editable items |
| HorizotalRule | `src/Elements/Basic/HorizotalRule.js` | id | Simple horizontal rule with default styling |

---

## Typography Components (4)

| Component | File | Key Props | Description |
|---|---|---|---|
| Heading | `src/Elements/Typography/Heading.js` | id, content, styles, level | Dynamic heading (h1-h6) with editable content |
| Paragraph | `src/Elements/Typography/Paragraph.js` | id, content, styles | Editable paragraph with word-wrap support |
| Span | `src/Elements/Typography/Span.js` | id, content, styles, label | Inline span with optional label wrapper |
| Blockquote | `src/Elements/Typography/Blockquote.js` | id, content | Blockquote with left border and italic styling |

---

## Media Components (4)

| Component | File | Key Props | Description |
|---|---|---|---|
| Image | `src/Elements/Media/Image.js` | id, styles, handleOpenMediaPanel | Image with drag-drop media replacement |
| Video | `src/Elements/Media/Video.js` | id, styles | HTML5 video player with drop-zone support |
| YoutubeVideo | `src/Elements/Media/YoutubeVideo.js` | id, content, styles | YouTube embed with modal URL editor |
| Icon | `src/Elements/Media/Icon.js` | id, styles, handleOpenMediaPanel | Icon image (max 40x40px) with drag-drop replacement |

---

## Form Components (5)

| Component | File | Key Props | Description |
|---|---|---|---|
| Input | `src/Elements/Forms/Input.js` | id, content, styles | Text input with placeholder and onChange handling |
| Textarea | `src/Elements/Forms/Textarea.js` | id, content | Multi-line textarea with vertical resize |
| Select | `src/Elements/Forms/Select.js` | id, options, selected | Dropdown select with configurable options |
| Form | `src/Elements/Forms/Form.js` | id, children, styles | Form container with auto-populated fields on drop |
| Label | `src/Elements/Forms/Label.js` | id, content | Form label with editable text content |

---

## Structure Components (6)

| Component | File | Key Props | Description |
|---|---|---|---|
| Container | `src/Elements/Structure/Container.js` | id, styles, children | Full-width container with flex layout and drag-drop |
| Section | `src/Elements/Structure/Section.js` | id, styles, children, handleOpenMediaPanel | Semantic section with background image/video support |
| Grid | `src/Elements/Structure/Grid.js` | id, styles, children | CSS Grid with preset configurations (2x2 to 4x1) |
| HFlex | `src/Elements/Structure/HFlex.js` | id, styles, children | Horizontal flexbox layout (row direction) |
| VFlex | `src/Elements/Structure/VFlex.js` | id, styles, children | Vertical flexbox layout (column direction) |
| Table | `src/Elements/Structure/Table.js` | id, children | HTML table with editable cell content |

---

## Advanced Components (2)

| Component | File | Key Props | Description |
|---|---|---|---|
| Code | `src/Elements/Advanced/Code.js` | id, content | Code snippet with monospace font display |
| BGVideo | `src/Elements/Advanced/BGVideo.js` | id, styles, children, handleOpenMediaPanel | Container with background video and overlaid children |

---

## Web3 Components (1)

| Component | File | Key Props | Description |
|---|---|---|---|
| ConnectWalletButton | `src/Elements/Web3Block/ConnectWalletButton.js` | id, content, styles, settings | Multi-chain wallet connect button with test mode |

---

## Section Components — Heroes (3)

| Component | File | Key Props | Description |
|---|---|---|---|
| HeroOne | `src/Elements/Sections/Heros/HeroOne.js` | uniqueId, handleSelect, children, handleOpenMediaPanel | Two-column hero with left content, right image |
| HeroTwo | `src/Elements/Sections/Heros/HeroTwo.js` | uniqueId, handleSelect, handleOpenMediaPanel | Centered full-width hero with dark background |
| HeroThree | `src/Elements/Sections/Heros/HeroThree.js` | uniqueId, handleSelect, children, handleOpenMediaPanel | Two-column custom template hero, asymmetric layout |

---

## Section Components — Navbars (4)

| Component | File | Key Props | Description |
|---|---|---|---|
| TwoColumnNavbar | `src/Elements/Sections/Navbars/TwoColumnNavbar.js` | id, children, handleSelect, contentListWidth, handleOpenMediaPanel | Logo + right-aligned menu navbar |
| ThreeColumnNavbar | `src/Elements/Sections/Navbars/ThreeColumnNavbar.js` | uniqueId, handleSelect, children, contentListWidth, handleOpenMediaPanel | Three-column navbar with centered nav items |
| CustomTemplateNavbar | `src/Elements/Sections/Navbars/CustomTemplateNavbar.js` | uniqueId, handleSelect, children, contentListWidth, handleOpenMediaPanel | Flexible navbar with logo, title, custom menu |
| DeFiNavbar | `src/Elements/Sections/Navbars/DeFiNavbar.js` | uniqueId, handleSelect, children, contentListWidth, handleOpenMediaPanel | DeFi-themed navbar with purple accent styling |

---

## Section Components — Footers (4)

| Component | File | Key Props | Description |
|---|---|---|---|
| SimpleFooter | `src/Elements/Sections/Footers/SimpleFooter.js` | uniqueId, handleSelect | Minimal footer with text columns and links |
| DetailedFooter | `src/Elements/Sections/Footers/DetailedFooter.js` | uniqueId, handleSelect, handleOpenMediaPanel | Multi-column footer with icons and link blocks |
| TemplateFooter | `src/Elements/Sections/Footers/TemplateFooter.js` | uniqueId, handleSelect | Advanced footer template with multiple content types |
| DeFiFooter | `src/Elements/Sections/Footers/DeFiFooter.js` | uniqueId, handleSelect | DeFi-styled footer with crypto formatting |

---

## Section Components — CTAs (2)

| Component | File | Key Props | Description |
|---|---|---|---|
| CTAOne | `src/Elements/Sections/CTAs/CTAOne.js` | uniqueId, handleSelect, children, handleOpenMediaPanel | CTA with text, buttons, and image containers |
| CTATwo | `src/Elements/Sections/CTAs/CTATwo.js` | uniqueId, handleSelect, children, contentListWidth, handleOpenMediaPanel | Vertical CTA layout with responsive buttons |

---

## Section Components — Content Sections (4)

| Component | File | Key Props | Description |
|---|---|---|---|
| SectionOne | `src/Elements/Sections/ContentSections/SectionOne.js` | uniqueId, handleSelect, children, handleOpenMediaPanel | Three-container section: content, buttons, image |
| SectionTwo | `src/Elements/Sections/ContentSections/SectionTwo.js` | uniqueId, handleSelect, children, handleOpenMediaPanel | Complex section with label, content, buttons, image, cards |
| SectionThree | `src/Elements/Sections/ContentSections/SectionThree.js` | uniqueId, handleSelect, handleOpenMediaPanel | Two-column section with testimonial cards grid |
| SectionFour | `src/Elements/Sections/ContentSections/SectionFour.js` | uniqueId, handleSelect, handleOpenMediaPanel | Pricing/feature section with grid items |

---

## Section Components — Web3 Sections (4)

| Component | File | Key Props | Description |
|---|---|---|---|
| DeFiSection | `src/Elements/Sections/Web3Related/DeFiSection.js` | id, contentListWidth, handleSelect, handleOpenMediaPanel | DeFi dashboard section with multiple module types |
| DeFiModule | `src/Elements/Sections/Web3Related/DeFiModule.js` | id, content, styles, moduleType, settings | Individual DeFi module (aggregator, simulation, bridge) |
| MintingSection | `src/Elements/Sections/Web3Related/MintingSection.js` | id, handleSelect, handleOpenMediaPanel | NFT minting section with module support |
| MintingModule | `src/Elements/Sections/Web3Related/MintingModule.js` | id, content, styles, configuration, isConnected | NFT minting module with quantity controls |

---

## Utility Components (2)

| Component | File | Key Props | Description |
|---|---|---|---|
| DraggableElement | `src/Elements/DraggableElements/DraggableElement.js` | type, label, description, icon, configuration, styles | Draggable left-bar element with icon and label |
| SelectableElements | `src/Elements/SelectableElements/index.js` | _(re-export barrel)_ | Central export file for all 46+ element components |

---

## Architecture Notes

- All components are **functional React components** using hooks
- Most components consume `EditableContext` for canvas interaction (selection, updates, deletion)
- Section components receive `handleSelect` and `handleOpenMediaPanel` callbacks from the builder
- Elements support inline editing via `contentEditable` with blur-to-save pattern
- Drag-and-drop is powered by `react-dnd` (HTML5 backend)
- Style objects follow React camelCase convention, converted to kebab-case on export

## Style Files

| File | Description |
|---|---|
| `src/Elements/Sections/CTAs/defaultCtaStyles.js` | Default styles for CTA sections |
| `src/Elements/Sections/Footers/defaultFooterStyles.js` | Default styles for footer variants |
| `src/Elements/Sections/Heros/defaultHeroStyles.js` | Default styles for hero variants |
| `src/Elements/Sections/Navbars/DefaultNavbarStyles.js` | Default styles for navbar variants |
| `src/Elements/Sections/ContentSections/defaultSectionStyles.js` | Default styles for content sections |
| `src/Elements/Sections/Web3Related/defaultDeFiStyles.js` | Default styles for DeFi sections |
| `src/Elements/Sections/Web3Related/defaultMintingStyles.js` | Default styles for minting sections |
| `src/Elements/Sections/Web3Related/DeFiSectionStyles.js` | DeFi section styling |
| `src/Elements/Sections/Web3Related/DefaultWeb3Styles.js` | General Web3 element styles |
| `src/Elements/DefaultStyles/DropdownStyles.js` | Dropdown menu styling |
