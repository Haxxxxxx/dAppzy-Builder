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
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Advanced\BGVideo.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Advanced\Code.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Basic\Anchor.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Basic\Button.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Basic\Div.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Basic\HorizotalRule.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Basic\Line.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Basic\LinkBlock.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Basic\List.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\DefaultStyles\DropdownStyles.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\DraggableElements\DraggableElement.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\DraggableLayout\DraggableConnectWalletButton.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\DraggableLayout\DraggableContentSections.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\DraggableLayout\DraggableCTA.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\DraggableLayout\DraggableDeFi.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\DraggableLayout\DraggableDeFiSection.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\DraggableLayout\DraggableFooter.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\DraggableLayout\DraggableHero.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\DraggableLayout\DraggableMinting.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\DraggableLayout\DraggableNavbar.js

<!-- Now paste the contents of each file (in order) here -->

@"
---
Please format your answer as valid Markdown, with H3 headings for each file and bullet lists for props/dependencies.
"@ | Out-File .\prompt-footer.md -Encoding utf8
