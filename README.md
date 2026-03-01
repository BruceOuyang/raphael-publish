# Raphael Publish - 公众号排版大师

专为**微信公众号**与**内容创作者**打造的现代 Markdown 排版引擎。

## 功能特性

### 魔法粘贴

从飞书、Notion、Word 甚至任意网页复制富文本，粘贴瞬间自动净化为纯净 Markdown。无需手写 Markdown 语法，粘贴即用。

### 10 套高定样式

告别同质化白底模板，提供 10 套精心打磨的视觉主题：

- **极简与经典**：Mac 纯净白、微信公众号原生、Medium 博客风
- **深度阅读**：Claude 燕麦色、NYT 纽约时报、Retro 复古羊皮纸
- **极客与商务**：Stripe 硅谷风、飞书效率蓝、Linear 暗夜模式、Bloomberg 终端机

每套主题在背景色、字体、标题、代码块、引用、表格等元素上都有独立设计，切换即可感受完全不同的排版风格。

### 一键复制到公众号

点击「复制到公众号」按钮，直接粘贴到公众号后台：

- 所有外链图片自动转 Base64，不会出现"此图片来自第三方"的报错
- 背景色、圆角、间距等样式精准还原
- 列表和表格经过底层 DOM 重塑，在微信中不会塌陷

### 多图排版

支持多图并排网格布局，通过 `wechatCompat` 引擎确保在微信公众号中完美呈现，不会被折断。

### 多端预览

编辑时实时预览，支持手机 (480px)、平板 (768px)、桌面 (PC) 三种视图切换，所见即所得。

### 导出

支持导出为 PDF 和 HTML 文件，适合存档、邮件发送或网页发布。

## 技术栈

- **React 18** + **TypeScript**
- **Vite 5** 构建
- **Tailwind CSS 3** 样式
- **markdown-it** Markdown 解析
- **highlight.js** 代码高亮
- **turndown** 富文本转 Markdown（魔法粘贴）
- **html2pdf.js** PDF 导出
- **framer-motion** 动画

## 本地开发

```bash
pnpm install
pnpm dev
```

## 构建部署

```bash
pnpm build
```

构建产物输出到 `dist/` 目录，可部署到 GitHub Pages 或任意静态托管服务。
