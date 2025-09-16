import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { AppStorage } from '../lib/utils'

interface User {
  userName: string
  password: string
}

// 初始化AppStorage（在应用启动时调用）
async function initializeAppStorage() {
  try {
    await AppStorage.init();
    console.log('AppStorage 初始化成功');
  } catch (error) {
    console.error('AppStorage 初始化失败:', error);
  }
}

// 异步初始化AppStorage（应用启动时）
initializeAppStorage();

// 创建基于AppStorage的同步存储适配器
// 注意：这是一个同步适配器，适合Pinia persist使用
const createAppStorageAdapter = (namespace: string): Storage => {
  // 内存缓存，用于同步操作
  const memoryCache: Record<string, string> = {};
  
  // 初始化时尝试从文件加载数据到内存缓存
  const loadFromFile = async () => {
    try {
      const savedData = await AppStorage.getItem(namespace);
      if (savedData && typeof savedData === 'object') {
        Object.assign(memoryCache, savedData);
      }
    } catch (error) {
      console.error(`加载${namespace}数据失败:`, error);
    }
  };
  
  // 异步保存内存缓存到文件
  const saveToFile = async () => {
    try {
      await AppStorage.setItem(namespace, { ...memoryCache });
    } catch (error) {
      console.error(`保存${namespace}数据失败:`, error);
    }
  };
  
  // 启动时异步加载数据
  loadFromFile();
  
  return {
    getItem: (key: string): string | null => {
      return memoryCache[key] || null;
    },
    
    setItem: (key: string, value: string): void => {
      memoryCache[key] = value;
      // 异步保存到文件（不阻塞主线程）
      saveToFile();
    },
    
    removeItem: (key: string): void => {
      delete memoryCache[key];
      // 异步保存到文件（不阻塞主线程）
      saveToFile();
    },
    
    clear: (): void => {
      Object.keys(memoryCache).forEach(key => delete memoryCache[key]);
      // 异步保存到文件（不阻塞主线程）
      saveToFile();
    },
    
    key: (index: number): string | null => {
      const keys = Object.keys(memoryCache);
      return keys[index] || null;
    },
    
    get length(): number {
      return Object.keys(memoryCache).length;
    }
  };
};

// 创建持久化存储适配器（替代localStorage）
const persistentStorage = createAppStorageAdapter('user-store-persistent');

// 创建会话存储适配器（替代sessionStorage）
const sessionStorageAdapter = createAppStorageAdapter('user-store-session');

export const useUserStore = defineStore(
  'user',
  () => {
    // 使用布尔值类型的 rememberMe，逻辑上更符合需求
    const rememberMe = ref<boolean>(false)

    // token 是字符串类型或 null，已经正确声明
    const token: Ref<string | null> = ref(null)

    // 当前用户名
    const username: Ref<string | null> = ref('未登录')

    // 将 userList 作为响应式数据，使用 Ref 包裹
    const userList: Ref<User[]> = ref([
      {
        userName: '未登录',
        password: '123456',
      },
    ])

    // 添加新用户到 userList 中
    const addUser = (userName: string, password: string) => {
      userList.value.push({
        userName,
        password,
      })
    }

    // 模拟获取 token 并设置当前用户名
    const getToken = (userName?: string) => {
      token.value = 'token'
      if (userName) {
        username.value = userName
      }
    }

    // 登出方法
    const logout = () => {
      token.value = null
    }

    return { userList, addUser, token, rememberMe, getToken, logout, username }
  },
  {
    persist: [
      {
        key: 'user-store-persistent', // 显式设置存储键名
        pick: ['userList', 'rememberMe'],
        storage: persistentStorage,
      },
      {
        key: 'user-store-session', // 显式设置存储键名
        pick: ['token'],
        storage: sessionStorageAdapter,
      },
    ],
  },
)
