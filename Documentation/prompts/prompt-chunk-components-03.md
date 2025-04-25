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
- D:\GitHub\FolderTestCode\libraryelements\src\components\SectionsPanels\ContentSectionsPanel.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\SectionsPanels\CTAPanel.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\SectionsPanels\FooterPanel.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\SectionsPanels\HeroPanel.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\SectionsPanels\NavbarPanel.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\SectionsPanels\Web3ElementPanel.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\SectionsPanels\Web3SectionPanel.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\TopbarComponents\Deployements\CustomDomainInput.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\TopbarComponents\Deployements\ScanDomains.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\TopbarComponents\ExportSection.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\TopbarComponents\ResizeControls.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\TopbarComponents\Visibility.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\TopbarComponents\WebsiteInfo.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\ContentList.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftBar.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\SideBar.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\TopBar.js

<!-- Now paste the contents of each file (in order) here -->

@"
---
Please format your answer as valid Markdown, with H3 headings for each file and bullet lists for props/dependencies.
"@ | Out-File .\prompt-footer.md -Encoding utf8
