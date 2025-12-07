<script setup lang="ts">
import { Operation, Menu, Document, Switch } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../stores/login'

const userStore = useUserStore()

// 路由配置
const router = useRouter()
const route = useRoute()

// 计算当前活动菜单
const nowActive = computed(() => route.name || 'home')

const turnTo = async (name: string): Promise<void> => {
  try {
    // chat 路由跳转到第一条对话
    if (name === 'chat') {
      router.push({
        name,
        params: {
          chatName: '新对话',
        },
      })
    } else {
      router.push({
        name,
      })
    }
  } catch (error: unknown) {
    console.error(error)
  }
}

</script>

<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="top-navbar">
      <div class="logo-container">
        <img src="@/assets/companyLogo.jpg" alt="兴发集团Logo" class="logo">
        <span class="system-name">风光水储多能互补协同优化决策支撑平台</span>
      </div>

      <div class="nav-right">
        <span class="user-info">
          <el-avatar :size="40">
            <img src="@/assets/头像.jpg" alt="User Avatar">
          </el-avatar>
          <span class="username">{{ userStore.username || '未登录' }}</span>
        </span>
      </div>
    </header>

    <div class="main-content">
      <!-- 侧边栏菜单 -->
      <aside class="sidebar">
        <el-menu active-text-color="#36CFC9" background-color="transparent" :default-active="nowActive"
          text-color="#fff" @select="turnTo" unique-opened class="sidebar-menu">
          <el-menu-item index="home">
            <el-icon>
              <Document />
            </el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-menu-item index="urbanVitality">
            <el-icon>
              <Menu />
            </el-icon>
            <span>城市活力</span>
          </el-menu-item>

          <!-- 资源监测 -->
          <el-sub-menu index="resourceMonitoring" class="main-sub-menu">
            <template #title>
              <el-icon>
                <Operation />
              </el-icon>
              <span @click.stop="turnTo('resourceMonitoring')">资源监测</span>
            </template>
            <el-menu-item index="waterResource">水资源</el-menu-item>
            <el-menu-item index="windResource">风资源</el-menu-item>
            <el-menu-item index="lightResource">光资源</el-menu-item>
            <el-menu-item index="energyStorage">储能资源</el-menu-item>
          </el-sub-menu>

          <!-- 融合预报 -->
          <el-sub-menu index="fusionForecasting" class="main-sub-menu">
            <template #title>
              <el-icon>
                <Document />
              </el-icon>
              <span @click.stop="turnTo('fusionForecasting')">融合预报</span>
            </template>
            <el-menu-item index="waterForecasting">水电预报</el-menu-item>
            <el-menu-item index="windForecasting">风电预报</el-menu-item>
            <el-menu-item index="lightForecasting">光电预报</el-menu-item>
            <el-menu-item index="energyForecasting">储能预报</el-menu-item>
          </el-sub-menu>

          <!-- 调度方案 -->
          <el-sub-menu index="dispatchPlan" class="main-sub-menu">
            <template #title>
              <el-icon>
                <Switch />
              </el-icon>
              <span @click.stop="turnTo('dispatchPlan')">调度方案</span>
            </template>
            <el-menu-item index="complementaryAnalysis">互补分析</el-menu-item>
            <el-menu-item index="complementaryScheduling">互补调度</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </aside>

      <!-- 主内容区域 -->
      <main class="content-wrapper">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* 整体布局 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* 顶部导航栏 */
.top-navbar {
  height: 70px;
  background: linear-gradient(135deg, #16213e, #0D1136);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  border-bottom: 2px solid #36CFC9;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo {
  height: 50px;
  width: auto;
  border-radius: 4px;
}

.system-name {
  font-size: 20px;
  font-weight: bold;
  color: #36CFC9;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 用户信息显示 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: default;
}

/* 移除悬停效果，防止误认为可点击 */
.user-info:hover {
  background-color: transparent;
  transition: none;
}

.username {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #16213e, #0D1136);
  overflow-y: auto;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.3);
  border-right: 1px solid rgba(54, 207, 201, 0.2);
}

.sidebar-menu {
  height: 100%;
  border-right: none;
  --el-menu-bg-color: transparent;
  --el-menu-text-color: #fff;
  --el-menu-hover-text-color: #36CFC9;
  --el-menu-active-text-color: #36CFC9;
  --el-menu-hover-bg-color: rgba(54, 207, 201, 0.1);
  --el-menu-active-bg-color: rgba(54, 207, 201, 0.2);
}

.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title {
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  border-radius: 0;
  transition: all 0.3s ease;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-sub-menu__title:hover {
  background-color: rgba(54, 207, 201, 0.1);
  color: #36CFC9;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: rgba(54, 207, 201, 0.2);
  color: #36CFC9;
  border-left: 3px solid #36CFC9;
  font-weight: 500;
}

/* 主菜单项样式 */
.main-menu-item {
  font-weight: 500;
  font-size: 15px;
  position: relative;
}

/* 主菜单子菜单容器样式 */
.main-sub-menu {
  font-weight: 500;
  font-size: 15px;
}

.main-sub-menu .el-sub-menu__title {
  cursor: pointer;
  position: relative;
}

.main-sub-menu .el-sub-menu__title span {
  cursor: pointer;
}

.main-sub-menu .el-menu-item {
  font-size: 13px;
  padding-left: 30px !important;
  margin-left: 20px;
  padding-left: 10px !important;
  border-left: 1px dashed rgba(54, 207, 201, 0.3);
}

/* 子菜单标题样式 */
.sub-menu-container .el-sub-menu__title {
  padding-left: 10px !important;
}

/* 子菜单项样式 */
.sub-menu-container .el-menu-item {
  font-size: 13px;
  padding-left: 30px !important;
}

/* 确保子菜单展开/收起箭头样式 */
.sub-menu-container .el-sub-menu__icon-arrow {
  right: 15px;
}

/* 内容包装器 */
.content-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background-image: url('@/assets/mainbg2.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 0;
}

/* 确保路由视图内容正确显示 */
.content-wrapper> :deep(div) {
  height: 100%;
  width: 100%;
}
</style>

<style>
/* 通用样式 */
.title {
  font-size: 1.6vh;
  margin-left: 1em;
  margin-top: 1em;
}

/* 重置一些默认样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
