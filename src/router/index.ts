import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import MenuView from '@/views/home/MenuView.vue'
import LogoView from '../views/home/LogoView.vue'
import HomeView from '../views/tables/HomeView.vue'
import { useUserStore } from '@/stores/login'
import { ElMessage } from 'element-plus'

const routes: RouteRecordRaw[] = [
  {
    path: '/menu',
    name: 'menu',
    component: MenuView,
    children: [
      {
        path: '/home',
        name: 'home',
        component: HomeView,
      },
      {
        path: '/satelliteMap',
        name: 'satelliteMap',
        component: () => import('../views/tables/SatelliteMap.vue'),
      },
      // 融合预测相关路由
      {
        path: '/fusionForecasting',
        name: 'fusionForecasting',
        component: () => import('../views/FusionForecasting/FusionForecasting.vue'),
      },
      {
        path: '/energyForecasting',
        name: 'energyForecasting',
        component: () => import('../views/FusionForecasting/EnergyForecasting.vue'),
      },
      {
        path: '/lightForecasting',
        name: 'lightForecasting',
        component: () => import('../views/FusionForecasting/LightForecasting.vue'),
      },
      {
        path: '/waterForecasting',
        name: 'waterForecasting',
        component: () => import('../views/FusionForecasting/WaterForecasting.vue'),
      },
      {
        path: '/windForecasting',
        name: 'windForecasting',
        component: () => import('../views/FusionForecasting/WindForecasting.vue'),
      },
      // 资源监控相关路由
      {
        path: '/resourceMonitoring',
        name: 'resourceMonitoring',
        component: () => import('../views/ResourceMonitoring/MonitoringIndex.vue'),
      },
      {
        path: '/energyStorage',
        name: 'energyStorage',
        component: () => import('../views/ResourceMonitoring/EnergyStorage.vue'),
      },
      {
        path: '/lightResource',
        name: 'lightResource',
        component: () => import('../views/ResourceMonitoring/LightResource.vue'),
      },
      {
        path: '/waterResource',
        name: 'waterResource',
        component: () => import('../views/ResourceMonitoring/WaterResource.vue'),
      },
      {
        path: '/windResource',
        name: 'windResource',
        component: () => import('../views/ResourceMonitoring/WindResource.vue'),
      },
      // 调度方案相关路由
      {
        path: '/dispatchPlan',
        name: 'dispatchPlan',
        component: () => import('../views/DispatchPlan/DispatchPlan.vue'),
      },
      {
        path: '/complementaryAnalysis',
        name: 'complementaryAnalysis',
        component: () => import('../views/DispatchPlan/ComplementaryAnalysis.vue'),
      },
      {
        path: '/complementaryScheduling',
        name: 'complementaryScheduling',
        component: () => import('../views/DispatchPlan/ComplementaryScheduling.vue'),
      },
      {
        path: '/urbanVitality',
        name: 'urbanVitality',
        component: () => import('../views/vitality/VitalityDashboard.vue'),
      },
    ],
  },
  {
    path: '/logo',
    name: 'logo',
    component: LogoView,
  },
  {
    path: '/',
    name: 'login',
    // 登录路由, 经过路由守卫拦截后强行进入登录
    component: () => import('../views/login/LoginView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由解析守卫
// 注意: index 只能在守卫中使用 pinia
router.beforeEach(async (to) => {
  const userStore = useUserStore()
  if (to.name !== 'login' && to.name !== 'logo' && userStore.token === null) {
    ElMessage({
      message: '未登录, 请先登录',
    })
    return { name: 'logo' }
  }
})

export default router
