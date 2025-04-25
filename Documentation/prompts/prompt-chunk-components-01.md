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
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\ElementsMapping\AdvancedElements.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\ElementsMapping\BasicElements.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\ElementsMapping\ContainerElements.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\ElementsMapping\FormElements.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\ElementsMapping\MediaElements.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\ElementsMapping\StructureElements.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\ElementsMapping\TypographyElements.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\ElementsMapping\Web3Elements.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\ElementsMapping\Web3Sections.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\FormSettings\FormAdvancedSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\FormSettings\FormFieldsManager.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\LinkSettings\ActionTypeSelector.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\LinkSettings\CollapsibleSection.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\LinkSettings\DropdownSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\LinkSettings\OpenInNewTabCheckbox.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\LinkSettings\SaveButton.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\LinkSettings\TargetValueField.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\ListSettings\ListAdvancedSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\ListSettings\ListGeneralSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\ListSettings\ListItemsManager.js

<!-- Now paste the contents of each file (in order) here -->

@"
---
Please format your answer as valid Markdown, with H3 headings for each file and bullet lists for props/dependencies.
"@ | Out-File .\prompt-footer.md -Encoding utf8
