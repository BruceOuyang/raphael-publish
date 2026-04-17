import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'default' });

// Returns updated innerHTML after rendering, or null if no mermaid blocks found.
export async function renderMermaidBlocks(container: HTMLElement): Promise<string | null> {
    const blocks = container.querySelectorAll<HTMLElement>('.mermaid-pending');
    if (blocks.length === 0) return null;
    for (const block of Array.from(blocks)) {
        const source = decodeURIComponent(block.getAttribute('data-mermaid') || '');
        if (!source) continue;
        try {
            const id = `mermaid-${Math.random().toString(36).slice(2)}`;
            const { svg } = await mermaid.render(id, source);
            const wrapper = document.createElement('div');
            wrapper.className = 'mermaid-rendered';
            wrapper.setAttribute('style', 'text-align: center; margin: 24px auto;');
            wrapper.innerHTML = svg;
            block.replaceWith(wrapper);
        } catch (e) {
            const errDiv = document.createElement('div');
            errDiv.setAttribute('style', 'color: #c0392b; background: #fdf3f2; border: 1px solid #e74c3c; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 13px; margin: 16px 0;');
            errDiv.textContent = `[Mermaid 渲染错误: ${e}]`;
            block.replaceWith(errDiv);
        }
    }
    return container.innerHTML;
}
