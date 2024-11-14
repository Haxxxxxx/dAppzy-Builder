import JSZip from 'jszip';

export function exportFiles(elements) {
    if (!Array.isArray(elements) || elements.length === 0) {
        console.error('No elements to export. Elements:', elements);
        return;
    }

    const generateHTML = () => {
        const traverseElements = (elementsList) => {
            return elementsList
                .filter((element) => element.type !== 'dropzone')
                .map((element) => {
                    let childrenHTML = '';
                    if (element.children && element.children.length > 0) {
                        const childElements = element.children
                            .map((childId) => elements.find((el) => el.id === childId))
                            .filter(Boolean);
                        childrenHTML = traverseElements(childElements);
                    }

                    const content = element.content || '';

                    switch (element.type) {
                        case 'navbar':
                            return `<nav id="${element.id}" style="${generateStyleString(element.styles)}">${childrenHTML}${content}</nav>`;
                        case 'section':
                            return `<section id="${element.id}" style="${generateStyleString(element.styles)}">${childrenHTML}${content}</section>`;
                        case 'div':
                            return `<div id="${element.id}" style="${generateStyleString(element.styles)}">${childrenHTML}${content}</div>`;
                        case 'heading':
                            return `<h${element.level || 1} id="${element.id}" style="${generateStyleString(element.styles)}">${content}</h${element.level || 1}>`;
                        case 'paragraph':
                            return `<p id="${element.id}" style="${generateStyleString(element.styles)}">${content}</p>`;
                        case 'button':
                            return `<button id="${element.id}" style="${generateStyleString(element.styles)}">${content || 'Button'}</button>`;
                        case 'image':
                            return `<img id="${element.id}" src="${element.src || 'https://via.placeholder.com/150'}" alt="${element.alt || ''}" style="${generateStyleString(element.styles)}" />`;
                        case 'span':
                            return `<span id="${element.id}" style="${generateStyleString(element.styles)}">${content}</span>`;
                        default:
                            return '';
                    }
                })
                .join('');
        };

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="styles.css">
  <title>Exported Content</title>
</head>
<body>
  ${traverseElements(elements.filter((el) => !el.parentId))}
</body>
</html>`;
    };

    const generateCSS = () => {
        const cssContent = elements
            .filter((element) => element.type !== 'dropzone')
            .map((element) => {
                const css = generateStyleString(element.styles);
                return css ? `#${element.id} { ${css} }` : '';
            })
            .filter(Boolean)
            .join('\n');
        return cssContent;
    };

    const generateStyleString = (styles = {}) => {
        return Object.entries(styles)
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ');
    };

    const htmlContent = generateHTML();
    const cssContent = generateCSS();

    const zip = new JSZip();
    zip.file('index.html', htmlContent);
    zip.file('styles.css', cssContent);

    zip.generateAsync({ type: 'blob' }).then((content) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'exported_content.zip';
        link.click();
    }).catch((error) => {
        console.error('Error generating ZIP file:', error);
    });
}
