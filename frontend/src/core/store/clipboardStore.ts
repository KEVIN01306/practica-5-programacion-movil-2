import { create } from 'zustand';

export interface ClipboardItem {
    type: 'FOLDER' | 'ASSET';
    id: string;
    name: string;
    brandId: string;
    fileName?: string;
}

interface ClipboardState {
    items: ClipboardItem[];
    copy: (items: ClipboardItem | ClipboardItem[]) => void;
    clear: () => void;
}

export const useClipboardStore = create<ClipboardState>((set) => ({
    items: [],
    copy: (items: ClipboardItem | ClipboardItem[]) => {
        const list = Array.isArray(items) ? items : [items];
        set({ items: list });
    },
    clear: () => set({ items: [] }),
}));
