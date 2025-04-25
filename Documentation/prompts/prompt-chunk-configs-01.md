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
- D:\GitHub\FolderTestCode\libraryelements\src\configs\contentSections\SectionConfiguration.js
- D:\GitHub\FolderTestCode\libraryelements\src\configs\ctasections\CtaConfigurations.js
- D:\GitHub\FolderTestCode\libraryelements\src\configs\footers\FooterConfigurations.js
- D:\GitHub\FolderTestCode\libraryelements\src\configs\heros\HeroConfigurations.js
- D:\GitHub\FolderTestCode\libraryelements\src\configs\navbar\NavbarConfigurations.js
- D:\GitHub\FolderTestCode\libraryelements\src\configs\Web3\Web3Configs.js
- D:\GitHub\FolderTestCode\libraryelements\src\configs\structureConfigurations.js

<!-- Now paste the contents of each file (in order) here -->

@"
---
Please format your answer as valid Markdown, with H3 headings for each file and bullet lists for props/dependencies.
"@ | Out-File .\prompt-footer.md -Encoding utf8
