import { NavbarConfigurations } from "./navbar/NavbarConfigurations";
import { HeroConfiguration } from "./heros/HeroConfigurations";
import { CtaConfigurations } from "./ctasections/CtaConfigurations";
import { FooterConfigurations } from "./footers/FooterConfigurations";
import { Web3Configs } from "./Web3/Web3Configs";

export const structureConfigurations = {
  customTemplate: NavbarConfigurations.customTemplate,
  twoColumn: NavbarConfigurations.twoColumn,
  threeColumn: NavbarConfigurations.threeColumn,


  heroOne: HeroConfiguration.heroOne,
  heroTwo: HeroConfiguration.heroTwo,
  heroThree: HeroConfiguration.heroThree,


  ctaOne: CtaConfigurations.ctaOne,

  ctaTwo: CtaConfigurations.ctaTwo,


  simple: FooterConfigurations.simple,
  detailed: FooterConfigurations.detailed,
  template: FooterConfigurations.template,


  mintingSection: Web3Configs.mintingSection,
  connectWalletButton: Web3Configs.connectWalletButton,
};

