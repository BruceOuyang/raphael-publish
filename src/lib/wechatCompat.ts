import { THEMES } from './themes';

// Helper to convert images to Base64
async function getBase64Image(imgUrl: string): Promise<string> {
    try {
        if (imgUrl.startsWith('data:')) return imgUrl;

        const response = await fetch(imgUrl, { mode: 'cors', cache: 'default' });
        if (!response.ok) return imgUrl;

        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(imgUrl);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        return imgUrl;
    }
}

export async function makeWeChatCompatible(html: string, themeId: string): Promise<string> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    const containerStyle = theme.styles.container || '';

    // 1. WeChat prefers <section> as the root wrapper for overall styling
    // If the root is a div, let's wrap or convert it to a section.
    const rootNodes = Array.from(doc.body.children);

    // Create new wrap section
    const section = doc.createElement('section');
    section.setAttribute('style', containerStyle);

    rootNodes.forEach(node => {
        // If the original html came from applyTheme it already has a root div
        // We strip it regardless of exact style string match to avoid double layers
        if (node.tagName === 'DIV' && rootNodes.length === 1) {
            Array.from(node.childNodes).forEach(child => section.appendChild(child));
        } else {
            section.appendChild(node);
        }
    });

    // 2. WeChat ignores flex, let's fix display:flex wrappers by reverting them to standard inline-blocks or tables.
    // Specially target the flex containers (e.g. gap/images)
    const divs = section.querySelectorAll('div');
    divs.forEach(div => {
        const style = div.getAttribute('style') || '';
        if (style.includes('display: flex') || style.includes('display:flex')) {
            // Replace flex with table-like structure for perfect WeChat side-by-side rendering
            const flexChildren = Array.from(div.children);
            if (flexChildren.every(child => child.tagName === 'IMG' || child.querySelector('img'))) {
                const table = doc.createElement('table');
                table.setAttribute('style', 'width: 100%; border-collapse: collapse; margin: 16px 0; border: none !important;');
                const tbody = doc.createElement('tbody');
                const tr = doc.createElement('tr');
                tr.setAttribute('style', 'border: none !important; background: transparent !important;');

                flexChildren.forEach(child => {
                    const td = doc.createElement('td');
                    td.setAttribute('style', 'padding: 0 4px; vertical-align: top; border: none !important; background: transparent !important;');
                    td.appendChild(child);
                    // Update child width to 100% since it's now bound by TD
                    if (child.tagName === 'IMG') {
                        const currentStyle = child.getAttribute('style') || '';
                        child.setAttribute('style', currentStyle.replace(/width:\s*[^;]+;?/g, '') + ' width: 100% !important; display: block; margin: 0 auto;');
                    }
                    tr.appendChild(td);
                });

                tbody.appendChild(tr);
                table.appendChild(tbody);
                div.parentNode?.replaceChild(table, div);
            } else {
                // Non-image flex items just get stripped of flex
                div.setAttribute('style', style.replace(/display:\s*flex;?/g, 'display: block;'));
            }
        }
    });

    // 3. List Item Flattening
    // WeChat notoriously misrenders heavily nested <li> formatting, flattening the inner structure helps
    const listItems = section.querySelectorAll('li');
    listItems.forEach(li => {
        const hasBlockChildren = Array.from(li.children).some(child =>
            ['P', 'DIV', 'UL', 'OL', 'BLOCKQUOTE'].includes(child.tagName)
        );
        if (hasBlockChildren) {
            // We only want to clean inner tags if it's overly complex, 
            // but flattening everything might kill <strong> or <em>.
            // Let's just strip 'p' inside 'li' by replacing <p> with <span>
            const ps = li.querySelectorAll('p');
            ps.forEach(p => {
                const span = doc.createElement('span');
                span.innerHTML = p.innerHTML;
                const pStyle = p.getAttribute('style');
                if (pStyle) span.setAttribute('style', pStyle);
                p.parentNode?.replaceChild(span, p);
            });
        }
    });

    // 4. Force Inheritance
    // WeChat's editor aggressively overrides inherited fonts on <p>, <li>, etc.
    // So we manually distribute the container's font properties to all individual blocks.
    const fontMatch = containerStyle.match(/font-family:\s*([^;]+);/);
    const sizeMatch = containerStyle.match(/font-size:\s*([^;]+);/);
    const colorMatch = containerStyle.match(/color:\s*([^;]+);/);
    const lineHeightMatch = containerStyle.match(/line-height:\s*([^;]+);/);

    // We only enforce on specific text tags that WeChat likes to hijack
    const textNodes = section.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, blockquote, span');
    textNodes.forEach(node => {
        let currentStyle = node.getAttribute('style') || '';

        if (fontMatch && !currentStyle.includes('font-family:')) {
            currentStyle += ` font-family: ${fontMatch[1]};`;
        }
        if (lineHeightMatch && !currentStyle.includes('line-height:')) {
            currentStyle += ` line-height: ${lineHeightMatch[1]};`;
        }
        // Add font-size if not present (only for standard text nodes so we don't shrink headings)
        if (sizeMatch && !currentStyle.includes('font-size:') && ['P', 'LI', 'BLOCKQUOTE', 'SPAN'].includes(node.tagName)) {
            currentStyle += ` font-size: ${sizeMatch[1]};`;
        }
        if (colorMatch && !currentStyle.includes('color:')) {
            currentStyle += ` color: ${colorMatch[1]};`;
        }

        node.setAttribute('style', currentStyle.trim());
    });

    // 5. Convert all images to Base64 for safe WeChat pasting
    const imgs = Array.from(section.querySelectorAll('img'));
    await Promise.all(imgs.map(async img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('data:')) {
            const base64 = await getBase64Image(src);
            img.setAttribute('src', base64);
        }
    }));

    doc.body.innerHTML = '';
    doc.body.appendChild(section);

    return doc.body.innerHTML;
}
