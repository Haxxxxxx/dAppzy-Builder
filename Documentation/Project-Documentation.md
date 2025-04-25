# Dappzy - No-Code DApp Builder Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [Elements System](#elements-system)
5. [Services](#services)
6. [Context Management](#context-management)
7. [Development Guide](#development-guide)
8. [API Reference](#api-reference)

## Project Overview

Dappzy is a no-code platform for building decentralized applications (DApps) with a focus on Web3 integration. It provides a visual builder interface that allows users to create and customize DApps without writing code.

### Key Features
- Visual DApp Builder
- Web3 Integration
- Smart Contract Templates
- Multi-chain Support
- Drag-and-drop Interface
- Real-time Preview

## Architecture

### Directory Structure
```
src/
├── components/         # UI Components
│   ├── LeftbarPanels/ # Left sidebar panels
│   ├── SectionsPanels/# Section management
│   ├── TopbarComponents/ # Top navigation
│   └── css/          # Component styles
├── Elements/          # Core Elements
│   ├── Advanced/     # Advanced elements
│   ├── Basic/        # Basic elements
│   ├── DraggableLayout/ # Layout elements
│   └── DefaultStyles/   # Default styles
├── context/          # State Management
├── services/         # External Services
├── utils/           # Utility Functions
└── configs/         # Configuration
```

## Core Components

### Layout Components
- `LeftBar.js`: Main sidebar navigation
- `TopBar.js`: Top navigation bar
- `ContentList.js`: Content management
- `SideBar.js`: Additional sidebar functionality

### Panel Components
#### Elements Mapping
- `BasicElements.js`: Basic UI elements
- `AdvancedElements.js`: Advanced components
- `ContainerElements.js`: Container elements
- `FormElements.js`: Form components
- `MediaElements.js`: Media elements
- `StructureElements.js`: Structural elements
- `TypographyElements.js`: Text elements
- `Web3Elements.js`: Web3-specific elements
- `Web3Sections.js`: Web3 section templates

#### Settings Panels
- Form Settings
  - `FormAdvancedSettings.js`
  - `FormFieldsManager.js`
- Link Settings
  - `ActionTypeSelector.js`
  - `DropdownSettings.js`
  - `OpenInNewTabCheckbox.js`
- List Settings
  - `ListAdvancedSettings.js`
  - `ListGeneralSettings.js`
  - `ListItemsManager.js`

## Elements System

### Basic Elements
- `Anchor.js`: Link elements with customizable properties
- `Button.js`: Interactive button components with various styles
- `Div.js`: Container elements for layout and grouping
- `List.js`: List components with customizable items
- `Line.js`: Line elements for visual separation
- `LinkBlock.js`: Block-level link components

### Form Elements
- `Form.js`: Form container with validation
- `Input.js`: Text input fields
- `Label.js`: Form labels
- `Select.js`: Dropdown selection
- `Textarea.js`: Multi-line text input

### Media Elements
- `Icon.js`: Icon components
- `Image.js`: Image display with optimization
- `Video.js`: Video player
- `YoutubeVideo.js`: YouTube video integration
- `BGVideo.js`: Background video elements

### Structure Elements
- `Container.js`: Flexible container
- `Grid.js`: Grid layout system
- `HFlex.js`: Horizontal flex container
- `VFlex.js`: Vertical flex container
- `Section.js`: Section container
- `Table.js`: Table structure

### Typography Elements
- `Blockquote.js`: Quote blocks
- `Heading.js`: Heading elements (h1-h6)
- `Paragraph.js`: Text paragraphs
- `Span.js`: Inline text elements

### Web3 Elements
- `ConnectWalletButton.js`: Wallet connection interface
- `DeFiModule.js`: DeFi functionality components
- `DeFiSection.js`: DeFi section templates
- `MintingSection.js`: NFT minting interface

### Section Templates
#### Hero Sections
- `HeroOne.js`: First hero template
- `HeroTwo.js`: Second hero template
- `HeroThree.js`: Third hero template
- `defaultHeroStyles.js`: Default hero styles

#### Content Sections
- `SectionOne.js` to `SectionFour.js`: Pre-built content sections
- `defaultSectionStyles.js`: Default section styles

#### CTA Sections
- `CTAOne.js`: First CTA template
- `CTATwo.js`: Second CTA template
- `defaultCtaStyles.js`: Default CTA styles

#### Footer Sections
- `DetailedFooter.js`: Complex footer
- `SimpleFooter.js`: Minimal footer
- `TemplateFooter.js`: Template-based footer
- `defaultFooterStyles.js`: Default footer styles

#### Navigation
- `CustomTemplateNavbar.js`: Custom navigation
- `ThreeColumnNavbar.js`: Three-column layout
- `TwoColumnNavbar.js`: Two-column layout
- `DefaultNavbarStyles.js`: Default navigation styles

## Settings System

### Form Settings
- `FormAdvancedSettings.js`: Advanced form configuration
- `FormFieldsManager.js`: Field management
- `FormSettings.js`: General form settings

### Link Settings
- `ActionTypeSelector.js`: Link action types
- `DropdownSettings.js`: Dropdown configuration
- `OpenInNewTabCheckbox.js`: Link behavior
- `TargetValueField.js`: Target URL settings

### List Settings
- `ListAdvancedSettings.js`: Advanced list options
- `ListGeneralSettings.js`: General list settings
- `ListItemsManager.js`: List item management

### Media Settings
- `VideoSettings.js`: Video configuration
- `PlaybackSettings.js`: Playback controls
- `ImageSettings.js`: Image properties
- `BackgroundSettings.js`: Background configuration

### Web3 Settings
- `CandyMachineSettings.js`: NFT minting configuration
- `DeFiModuleSettings.js`: DeFi component settings
- `DeFiSectionSettings.js`: DeFi section configuration
- `WalletSettings.js`: Wallet connection settings

### Text Settings
- `TextualSettings.js`: Text formatting options

## Component System

### Leftbar Panels
- `EditorPanel.js`: Element editor
- `MediaPanel.js`: Media management
- `NewElementPanel.js`: Element creation
- `StructurePanel.js`: Structure management
- `SupportPopup.js`: Support interface
- `WebsiteSettingsPanel.js`: Site configuration

### Section Panels
- `ContentSectionsPanel.js`: Content management
- `CTAPanel.js`: CTA configuration
- `FooterPanel.js`: Footer management
- `HeroPanel.js`: Hero section editor
- `NavbarPanel.js`: Navigation setup
- `Web3ElementPanel.js`: Web3 components
- `Web3SectionPanel.js`: Web3 sections

### Topbar Components
- `CustomDomainInput.js`: Domain configuration
- `ScanDomains.js`: Domain scanning
- `ExportSection.js`: Export functionality
- `ResizeControls.js`: Size adjustment
- `Visibility.js`: Element visibility
- `WebsiteInfo.js`: Site information

## Development Guide

### Prerequisites
- Node.js
- npm/yarn
- Web3 wallet (MetaMask, Phantom)
- Firebase CLI

### Setup
1. Clone repository
2. Install dependencies
3. Configure environment variables
4. Start development server

### Building
```bash
npm run build
```

### Deployment
```bash
npm run deploy
```

### Component Development
1. Create new element in appropriate category
2. Implement required props and styles
3. Add to ElementsMapping
4. Create corresponding settings panel
5. Add to appropriate section panel

### Style Guidelines
- Use CSS modules for component styles
- Follow BEM naming convention
- Maintain consistent spacing
- Use theme variables for colors

### State Management
- Use context for global state
- Implement local state for component-specific data
- Follow React hooks patterns
- Maintain clean state updates

### Testing
- Unit test components
- Test state management
- Verify Web3 interactions
- Check responsive behavior

## API Reference

### Context API

#### EditableContext
```javascript
const {
  elements,          // Array of current elements
  addElement,        // Add new element
  updateElement,     // Update existing element
  removeElement,     // Remove element
  selectedElement,   // Currently selected element
  setSelectedElement // Set selected element
} = useEditable();
```

#### WalletContext
```javascript
const {
  connectWallet,     // Connect wallet
  disconnectWallet,  // Disconnect wallet
  currentAccount,    // Current wallet address
  network,          // Current network
  balance           // Account balance
} = useWallet();
```

### Service API

#### CandyMachine Service
```javascript
const {
  createCandyMachine,    // Create new candy machine
  updateCandyMachine,    // Update existing machine
  mintNFT,              // Mint new NFT
  getCandyMachineState, // Get machine state
  updateConfig          // Update machine config
} = useCandyMachine();
```

## Contributing

### Code Style
- Use functional components
- Follow React hooks patterns
- Maintain consistent naming
- Document components and functions
- Use TypeScript for new components

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request
6. Address review comments

## License
[Add license information]

## Support
- GitHub Issues
- Documentation
- Community Discord 