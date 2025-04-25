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
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\VideoSettings\PlaybackSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\VideoSettings\VideoSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\BackgroundSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\CandyMachineSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\DeFiModuleSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\DeFiSectionSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\FormSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\ImageSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\LinkSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\ListSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\TextualSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\VideoSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SettingsPanels\WalletSettings.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\EditorPanel.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\MediaItem.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\MediaPanel.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\NewElementPanel.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\StructurePanel.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\SupportPopup.js
- D:\GitHub\FolderTestCode\libraryelements\src\components\LeftbarPanels\WebsiteSettingsPanel.js

<!-- Now paste the contents of each file (in order) here -->

@"
---
Please format your answer as valid Markdown, with H3 headings for each file and bullet lists for props/dependencies.
"@ | Out-File .\prompt-footer.md -Encoding utf8
