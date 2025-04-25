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
- D:\GitHub\FolderTestCode\libraryelements\src\utils\htmlRenderUtils\RenderCtas\renderCta.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\htmlRenderUtils\RenderFooters\renderFooter.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\htmlRenderUtils\RenderHeros\renderHero.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\htmlRenderUtils\RenderNavbars\renderNavbar.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\htmlRenderUtils\RenderSection\renderSection.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\htmlRenderUtils\RenderWeb3\renderMintingSection.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\htmlRenderUtils\containerHelpers.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\LeftBarUtils\elementUtils.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\LeftBarUtils\RenderUtils.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\LeftBarUtils\storageUtils.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\SectionQuickAdd\FormStructureModal.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\configPinata.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\DropZone.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\htmlRender.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\useElementDrop.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\useReorderDrop.js
- D:\GitHub\FolderTestCode\libraryelements\src\utils\withSelectable.js

<!-- Now paste the contents of each file (in order) here -->

@"
---
Please format your answer as valid Markdown, with H3 headings for each file and bullet lists for props/dependencies.
"@ | Out-File .\prompt-footer.md -Encoding utf8
