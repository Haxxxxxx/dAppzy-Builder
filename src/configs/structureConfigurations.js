import { NavbarConfigurations } from "./navbar/NavbarConfigurations";
import { HeroConfiguration } from "./heros/HeroConfigurations";
import { CtaConfigurations } from "./ctasections/CtaConfigurations";
import { FooterConfigurations } from "./footers/FooterConfigurations";
import { Web3Configs } from "./Web3/Web3Configs";
import { SectionConfiguration } from "./contentSections/SectionConfiguration"; // <-- New import

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

  // CTA configs
  ctaOne: CtaConfigurations.ctaOne,
  ctaTwo: CtaConfigurations.ctaTwo,

  // Footer configs
  customTemplateFooter: FooterConfigurations.customTemplate,
  detailedFooter: FooterConfigurations.detailedFooter,
  templateFooter: FooterConfigurations.templateFooter,
  defiFooter: FooterConfigurations.defiFooter,

  // Web3 configs
  mintingSection: Web3Configs.mintingSection,
  defiSection: Web3Configs.defiSection,
  connectWalletButton: Web3Configs.connectWalletButton,

  // Section configs
  sectionOne: SectionConfiguration.sectionOne,
  sectionTwo: SectionConfiguration.sectionTwo,
  sectionThree: SectionConfiguration.sectionThree,
  sectionFour: SectionConfiguration.sectionFour,
};
