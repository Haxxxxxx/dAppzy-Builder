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
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Structure\Table.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Structure\VFlex.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Typography\Blockquote.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Typography\Heading.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Typography\Paragraph.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Typography\Span.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Unused(Yet)\Audio.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Unused(Yet)\Caption.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Unused(Yet)\DateComponent.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Unused(Yet)\FieldSet.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Unused(Yet)\Iframe.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Unused(Yet)\Legend.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Unused(Yet)\Meter.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Unused(Yet)\Pre.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Unused(Yet)\Progress.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Web3Block\ConnectWalletButton.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\SelectableElements.js

<!-- Now paste the contents of each file (in order) here -->

@"
---
Please format your answer as valid Markdown, with H3 headings for each file and bullet lists for props/dependencies.
"@ | Out-File .\prompt-footer.md -Encoding utf8
