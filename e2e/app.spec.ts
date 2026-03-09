import { expect, test } from '@playwright/test';

function buildLongMarkdown() {
    return Array.from({ length: 120 }, (_, index) => `## Section ${index + 1}\n\n这是第 ${index + 1} 段内容，用来验证编辑器和预览区的滚动同步是否稳定。\n\n`).join('');
}

async function waitForScrollRatiosToAlign(page: import('@playwright/test').Page, sourceTestId: string, targetTestId: string) {
    await page.waitForFunction(
        ([sourceId, targetId]) => {
            const source = document.querySelector(`[data-testid="${sourceId}"]`) as HTMLElement | null;
            const target = document.querySelector(`[data-testid="${targetId}"]`) as HTMLElement | null;
            if (!source || !target) return false;

            const sourceMax = source.scrollHeight - source.clientHeight;
            const targetMax = target.scrollHeight - target.clientHeight;
            if (sourceMax <= 0 || targetMax <= 0) return false;

            const sourceRatio = source.scrollTop / sourceMax;
            const targetRatio = target.scrollTop / targetMax;

            return target.scrollTop > 0 && Math.abs(sourceRatio - targetRatio) < 0.12;
        },
        [sourceTestId, targetTestId]
    );
}

test('keeps the copy button visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.getByTestId('tab-preview').click();
    const copyButton = page.locator('[data-testid="copy-button"]:visible');

    await expect(copyButton).toBeVisible();

    const box = await copyButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});

test('renders bold text with punctuation without leaking markdown markers', async ({ page }) => {
    await page.goto('/');

    const editor = page.getByTestId('editor-input');
    await editor.fill('2025年初，伦敦黄金市场的一个月拆借利率一度升至**5%**。');

    const preview = page.getByTestId('preview-content');
    await expect(preview.locator('strong')).toHaveText('5%');
    await expect(preview).not.toContainText('**5%**');
    await expect(preview).toContainText('2025年初，伦敦黄金市场的一个月拆借利率一度升至5%。');
});

for (const device of [
    { testId: 'device-mobile', label: 'mobile' },
    { testId: 'device-tablet', label: 'tablet' }
] as const) {
    test(`syncs editor and ${device.label} preview scrolling in both directions`, async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('/');

        const editor = page.getByTestId('editor-input');
        await editor.fill(buildLongMarkdown());
        await page.locator(`[data-testid="${device.testId}"]:visible`).click();

        await page.evaluate(() => {
            const textarea = document.querySelector('[data-testid="editor-input"]') as HTMLTextAreaElement | null;
            if (!textarea) return;
            const max = textarea.scrollHeight - textarea.clientHeight;
            textarea.scrollTop = max * 0.72;
            textarea.dispatchEvent(new Event('scroll'));
        });

        await waitForScrollRatiosToAlign(page, 'editor-input', 'preview-inner-scroll');

        await page.evaluate(() => {
            const preview = document.querySelector('[data-testid="preview-inner-scroll"]') as HTMLDivElement | null;
            if (!preview) return;
            const max = preview.scrollHeight - preview.clientHeight;
            preview.scrollTop = max * 0.28;
            preview.dispatchEvent(new Event('scroll'));
        });

        await waitForScrollRatiosToAlign(page, 'preview-inner-scroll', 'editor-input');
    });
}
