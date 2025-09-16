import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Ref } from 'vue'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T extends ((prev: any) => any) | any>(updaterOrValue: T, ref: Ref) {
  ref.value
    = typeof updaterOrValue === 'function'
      ? updaterOrValue(ref.value)
      : updaterOrValue
}

// 封装本地存储工具（替代 localStorage）
export const AppStorage = {
  // 存储文件路径（Neutralino 应用的用户数据目录）
  storagePath: '',

  // 初始化存储路径
  async initStoragePath() {
    if (!this.storagePath) {
      const osInfo = await window.Neutralino?.os.getInfo?.();
      const homeDir = osInfo?.homeDirectory;
      // 根据操作系统设置不同的存储路径
      if (osInfo?.name === 'Windows') {
        this.storagePath = `${homeDir}\.intelligent-monitoring\data.json`;
      } else {
        this.storagePath = `${homeDir}/.intelligent-monitoring/data.json`;
      }
    }
  },

  // 初始化存储目录和文件
  async init() {
    await this.initStoragePath();
    
    // 检查存储目录是否存在，不存在则创建
    try {
      const dirPath = this.storagePath.substring(0, this.storagePath.lastIndexOf('\\') + 1);
      
      if (!(await window.Neutralino?.fs.exists?.(dirPath))) {
        await window.Neutralino?.fs.createDirectory?.(dirPath, true);
      }
      
      // 检查存储文件是否存在，不存在则创建空文件
      if (!(await window.Neutralino?.fs.exists?.(this.storagePath))) {
        await window.Neutralino?.fs.writeFile?.(this.storagePath, '{}');
      }
    } catch (error) {
      console.error('存储初始化失败:', error);
    }
  },

  // 写入数据（类似 localStorage.setItem）
  async setItem(key: string, value: any) {
    try {
      await this.init();
      const data = JSON.parse(await window.Neutralino?.fs.readFile?.(this.storagePath) || '{}');
      data[key] = value;
      await window.Neutralino?.fs.writeFile?.(this.storagePath, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('写入数据失败:', error);
      return false;
    }
  },

  // 读取数据（类似 localStorage.getItem）
  async getItem(key: string) {
    try {
      await this.init();
      const data = JSON.parse(await window.Neutralino?.fs.readFile?.(this.storagePath) || '{}');
      return data[key] || null;
    } catch (error) {
      console.error('读取数据失败:', error);
      return null;
    }
  },

  // 删除数据（类似 localStorage.removeItem）
  async removeItem(key: string) {
    try {
      await this.init();
      const data = JSON.parse(await window.Neutralino?.fs.readFile?.(this.storagePath) || '{}');
      delete data[key];
      await window.Neutralino?.fs.writeFile?.(this.storagePath, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('删除数据失败:', error);
      return false;
    }
  },

  // 清空数据（类似 localStorage.clear）
  async clear() {
    try {
      await this.init();
      await window.Neutralino?.fs.writeFile?.(this.storagePath, '{}');
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      return false;
    }
  }
};
