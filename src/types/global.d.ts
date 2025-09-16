// 全局类型定义文件
declare global {
  interface Window {
    AMap: any; // 使用any类型避免重复声明冲突
    tempMarker: any;
    removeMarker?: (id: string) => void;
    _AMapSecurityConfig?: {
      securityJsCode: string;
    };
    Neutralino?: {
      os: {
        getInfo: () => Promise<{ homeDirectory: string; name: string; }>;
      };
      fs: {
        exists: (path: string) => Promise<boolean>;
        createDirectory: (path: string, recursive?: boolean) => Promise<void>;
        readFile: (path: string) => Promise<string>;
        writeFile: (path: string, content: string) => Promise<void>;
      };
    };
  }
  
  // 定义AMapInstance类型
  type AMapInstance = any;
}

export {}; // 确保这个文件被视为模块