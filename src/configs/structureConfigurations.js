import { NavbarConfigurations } from "./navbar/NavbarConfigurations";
import { HeroConfiguration } from "./heros/HeroConfigurations";
import { CtaConfigurations } from "./ctasections/CtaConfigurations";
import { FooterConfigurations } from "./footers/FooterConfigurations";
import { Web3Configs } from "./Web3/Web3Configs";
import { SectionConfiguration } from "./contentSections/SectionConfiguration";

export const structureConfigurations = {
  // Navbar configs
  customTemplateNavbar: NavbarConfigurations.customTemplate,
  twoColumn: NavbarConfigurations.twoColumn,
  threeColumn: NavbarConfigurations.threeColumn,
  defiNavbar: NavbarConfigurations.defiNavbar,

  // Hero configs
  heroOne: HeroConfiguration.heroOne,
  heroTwo: HeroConfiguration.heroTwo,
  heroThree: HeroConfiguration.heroThree,
  videoHero: HeroConfiguration.videoHero,

  // CTA configs
  ctaOne: CtaConfigurations.ctaOne,
  ctaTwo: CtaConfigurations.ctaTwo,
  ctaThree: CtaConfigurations.ctaThree,

  // Footer configs
  simpleFooter: FooterConfigurations.simpleFooter,
  detailedFooter: FooterConfigurations.detailedFooter,
  advancedFooter: FooterConfigurations.advancedFooter,
  defiFooter: FooterConfigurations.defiFooter,

  // Web3 configs — children are stripped so buildSectionTree creates a bare
  // section shell.  DraggableDeFi / DraggableMinting drag.end handlers read
  // from Web3Configs directly and build the content-container → modules
  // structure (with moduleType, generated IDs, etc.).
  mintingSection: { ...Web3Configs.mintingSection, children: [] },
  defiSection: { ...Web3Configs.defiSection, children: [] },
  connectWalletButton: Web3Configs.connectWalletButton,

  // Section configs
  sectionOne: SectionConfiguration.sectionOne,
  sectionTwo: SectionConfiguration.sectionTwo,
  sectionThree: SectionConfiguration.sectionThree,
  sectionFour: SectionConfiguration.sectionFour,
  sectionFive: SectionConfiguration.sectionFive,
  sectionSix: SectionConfiguration.sectionSix,
  sectionSeven: SectionConfiguration.sectionSeven,
  sectionEight: SectionConfiguration.sectionEight,
  sectionNine: SectionConfiguration.sectionNine,
  sectionTen: SectionConfiguration.sectionTen,
  sectionEleven: SectionConfiguration.sectionEleven,
  sectionTwelve: SectionConfiguration.sectionTwelve,
};
