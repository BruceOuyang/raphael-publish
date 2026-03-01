import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES } from '../lib/themes';

interface ThemeSelectorProps {
    activeTheme: string;
    onThemeChange: (themeId: string) => void;
}

export default function ThemeSelector({ activeTheme, onThemeChange }: ThemeSelectorProps) {
    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const selectedThemeName = THEMES.find(t => t.id === activeTheme)?.name;

    return (
        <div className="flex items-center flex-wrap gap-2 lg:gap-4 px-4 lg:px-6 py-3 border-r border-transparent md:border-[#00000015] md:dark:border-[#ffffff15] shrink-0">
            <span className="text-[12px] font-semibold text-[#86868b] uppercase tracking-widest hidden xl:block shrink-0">排版风格</span>

            <div className="flex items-center gap-1.5 bg-[#00000008] dark:bg-[#ffffff10] p-1 rounded-full backdrop-blur-md shrink-0">
                {THEMES.slice(0, 4).map(theme => (
                    <button
                        key={theme.id}
                        onClick={() => onThemeChange(theme.id)}
                        className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${activeTheme === theme.id
                            ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-sm'
                            : 'text-[#86868b] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]'
                            }`}
                    >
                        {theme.name.split(' ')[0]}
                    </button>
                ))}
            </div>

            <div className="relative shrink-0">
                <button
                    onClick={() => setIsThemeOpen(!isThemeOpen)}
                    className={`apple-export-btn flex items-center gap-2 !px-4 !py-1.5 !text-[13px] transition-all ${THEMES.slice(4).some(t => t.id === activeTheme) ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] border-[#00000010] dark:border-[#ffffff10] shadow-sm' : 'border-transparent bg-transparent hover:bg-transparent dark:bg-transparent text-[#86868b] dark:text-[#a1a1a6] shadow-none hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'}`}
                >
                    {THEMES.slice(4).some(t => t.id === activeTheme) ? selectedThemeName : '更多'}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isThemeOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isThemeOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                            className="absolute top-12 left-0 w-64 max-h-[60vh] overflow-y-auto no-scrollbar bg-white dark:bg-[#2c2c2e] rounded-2xl shadow-apple-lg border border-[#00000015] dark:border-[#ffffff15] py-2 z-50 overscroll-contain"
                        >
                            {THEMES.slice(4).map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => {
                                        onThemeChange(theme.id);
                                        setIsThemeOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-5 py-2.5 text-[14px] font-medium hover:bg-[#00000008] dark:hover:bg-[#ffffff10] transition-colors text-[#1d1d1f] dark:text-[#f5f5f7]"
                                >
                                    {theme.name}
                                    {activeTheme === theme.id && <Check size={16} className="text-[#0066cc] dark:text-[#0a84ff]" />}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Theme description next to selectors */}
            <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-[#00000015] dark:border-[#ffffff15]">
                <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] font-medium tracking-wide truncate max-w-[300px] xl:max-w-[450px]">
                    <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold mr-1">{THEMES.find(t => t.id === activeTheme)?.name}：</span>
                    {THEMES.find(t => t.id === activeTheme)?.description}
                </p>
            </div>
        </div>
    );
}
