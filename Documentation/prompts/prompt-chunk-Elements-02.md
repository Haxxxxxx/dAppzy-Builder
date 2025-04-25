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
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Forms\Form.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Forms\Input.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Forms\Label.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Forms\Select.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Forms\Textarea.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Media\Icon.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Media\Image.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Media\Video.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Media\YoutubeVideo.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\ContentSections\defaultSectionStyles.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\ContentSections\SectionFour.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\ContentSections\SectionOne.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\ContentSections\SectionThree.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\ContentSections\SectionTwo.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\CTAs\CTAOne.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\CTAs\CTATwo.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\CTAs\defaultCtaStyles.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Footers\defaultFooterStyles.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Footers\DetailedFooter.js
- D:\GitHub\FolderTestCode\libraryelements\src\Elements\Sections\Footers\SimpleFooter.js

<!-- Now paste the contents of each file (in order) here -->

@"
---
Please format your answer as valid Markdown, with H3 headings for each file and bullet lists for props/dependencies.
"@ | Out-File .\prompt-footer.md -Encoding utf8
