# header (save to .\prompt-header.md)
@"
You are a professional React documentation assistant.
Below is a list of source files in this chunk. For each file:
1. Give a one-sentence overview of its purpose.
2. List its props/parameters (with types) or state hooks.
3. Provide a Markdown usage example.
4. Note any external dependencies (hooks, utils, context).
---
"@ | Out-File .\prompt-header.md -Encoding utf8

# footer (save to .\prompt-footer.md)
@"
---
Please format your answer as valid Markdown, with H3 headings for each file and bullet lists for props/dependencies.
"@ | Out-File .\prompt-footer.md -Encoding utf8
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Footers\TemplateFooter.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Heros\defaultHeroStyles.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Heros\HeroOne.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Heros\HeroThree.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Heros\HeroTwo.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Navbars\CustomTemplateNavbar.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Navbars\DefaultNavbarStyles.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Navbars\ThreeColumnNavbar.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Navbars\TwoColumnNavbar.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Web3Related\CircularProgressCustomImage.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Web3Related\CircularProgressSVG.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Web3Related\DefaultWeb3Styles.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Web3Related\DeFiModule.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Web3Related\DeFiSection.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Web3Related\DeFiSectionStyles.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Web3Related\MintingSection.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Structure\Container.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Structure\Grid.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Structure\HFlex.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Structure\Section.js

<!-- Now paste the contents of each file (in order) here -->

@"
---
Please format your answer as valid Markdown, with H3 headings for each file and bullet lists for props/dependencies.
"@ | Out-File .\prompt-footer.md -Encoding utf8
