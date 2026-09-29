import { GlobalSettings, DEFAULT_SETTINGS } from '../types/settings';

const SETTINGS_KEY = 'bd_vat_global_settings_v1';

export const loadGlobalSettings = (): GlobalSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Error loading global settings', e);
  }
  return DEFAULT_SETTINGS;
};

export const saveGlobalSettings = (settings: GlobalSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applyScreenOptimizations(settings);
  } catch (e) {
    console.error('Error saving global settings', e);
  }
};

// Applies screen optimizations to the DOM root
export const applyScreenOptimizations = (settings: GlobalSettings): void => {
  const root = document.documentElement;

  // 1. Density classes
  root.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
  root.classList.add(`density-${settings.screenDensity}`);

  // 2. Font scale classes
  root.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg');
  root.classList.add(`font-scale-${settings.fontScale}`);

  // 3. High Contrast
  if (settings.highContrastMode) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  // 4. Full Width Layout
  if (settings.fullWidthLayout) {
    root.classList.add('layout-fullwidth');
  } else {
    root.classList.remove('layout-fullwidth');
  }
};

// Full System Backup: Export all LocalStorage data as JSON
export const exportFullSystemBackup = (): void => {
  try {
    const backupData: Record<string, any> = {
      exportTimestamp: new Date().toISOString(),
      system: 'প্রতিষ্ঠান-ভিত্তিক মামলা ব্যবস্থাপনা ও রাজস্ব ড্যাশবোর্ড'
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('bd_') || key.startsWith('circle_'))) {
        try {
          backupData[key] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch {
          backupData[key] = localStorage.getItem(key);
        }
      }
    }

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_system_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Failed to export system backup', e);
    alert('সিস্টেম ব্যাকআপ তৈরিতে ত্রুটি দেখা দিয়েছে');
  }
};

// Restore System Backup from JSON
export const restoreFullSystemBackup = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        Object.keys(data).forEach(key => {
          if (key !== 'exportTimestamp' && key !== 'system') {
            const val = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
            localStorage.setItem(key, val);
          }
        });

        resolve(true);
      } catch (err) {
        console.error('Failed to parse backup JSON', err);
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
