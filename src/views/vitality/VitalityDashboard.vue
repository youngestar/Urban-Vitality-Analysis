<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import * as echarts from 'echarts/core'
import {
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  LegendComponent,
  GridComponent,
  RadarComponent,
} from 'echarts/components'
import { MapChart, RadarChart, LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { useVitalityStore } from '@/stores/vitality'
import sichuanGeo from '@/assets/sichuan-cities.json'

type MapInputLike = Parameters<typeof echarts.registerMap>[1]

const sichuanGeoData = sichuanGeo as MapInputLike

const vitalityStore = useVitalityStore()
const {
  areas,
  loading,
  selectedArea,
  ranking,
  summary,
  cityTrend,
  activeMetric,
  metricExtent,
  selectedAreaId,
  lastUpdatedAt,
} = storeToRefs(vitalityStore)

const mapRef = ref<HTMLDivElement | null>(null)
const radarRef = ref<HTMLDivElement | null>(null)
const trendRef = ref<HTMLDivElement | null>(null)

let mapChart: echarts.ECharts | null = null
let radarChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null
let mapRegistered = false

const metricOptions = [
  { label: '综合指数', value: 'overall' },
  { label: '经济动能', value: 'economy' },
  { label: '商业活跃度', value: 'commerce' },
  { label: '交通便利度', value: 'traffic' },
  { label: '夜间灯光', value: 'nightlight' },
] as const

const tooltipMetricConfig = [
  { key: 'overall', label: '综合指数' },
  { key: 'commerce', label: '商业活跃度' },
  { key: 'traffic', label: '交通便利度' },
  { key: 'nightlight', label: '夜间灯光' },
] as const

echarts.use([
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  LegendComponent,
  GridComponent,
  RadarComponent,
  MapChart,
  RadarChart,
  LineChart,
  CanvasRenderer,
])

const initCharts = () => {
  if (mapRef.value && !mapChart) {
    mapChart = echarts.init(mapRef.value)
    if (!mapRegistered) {
      echarts.registerMap('sichuanCities', sichuanGeoData)
      mapRegistered = true
    }
    mapChart.on('click', (params) => {
      const area = areas.value.find((item) => item.mapName === params.name)
      if (area) {
        vitalityStore.selectArea(area.id)
      }
    })
  }

  if (radarRef.value && !radarChart) {
    radarChart = echarts.init(radarRef.value)
  }

  if (trendRef.value && !trendChart) {
    trendChart = echarts.init(trendRef.value)
  }

  renderMap()
  renderRadar()
  renderTrend()
}

const renderMap = () => {
  if (!mapChart) return
  if (!areas.value.length) {
    mapChart.clear()
    return
  }

  const seriesData = areas.value.map((area) => ({
    name: area.mapName,
    value: area.metrics[activeMetric.value],
    areaId: area.id,
    tooltipMetrics: area.metrics,
    label: area.name,
  }))

  mapChart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(5, 18, 40, 0.9)',
      formatter: (params: { name: string; data?: (typeof seriesData)[number] }) => {
        if (!params.data) return `${params.name}: 暂无数据`
        const metrics = params.data.tooltipMetrics
        const metricHtml = tooltipMetricConfig
          .map((item) => `<div>${item.label}：${metrics[item.key] ?? '--'}</div>`)
          .join('')
        return `
          <div class="tooltip">
            <div class="tooltip-title">${params.data.label}</div>
            ${metricHtml}
          </div>
        `
      },
    },
    visualMap: {
      min: metricExtent.value.min,
      max: metricExtent.value.max,
      right: 20,
      bottom: 30,
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: ['#1d2b64', '#1b998b', '#2dd4bf', '#f9f871'],
      },
      textStyle: {
        color: '#d1e9ff',
      },
    },
    series: [
      {
        name: '区域活力',
        type: 'map',
        map: 'sichuanCities',
        selectedMode: 'single',
        roam: true,
        layoutCenter: ['50%', '55%'],
        layoutSize: '100%',
        emphasis: {
          label: { show: true, color: '#fff' },
          itemStyle: { areaColor: '#2dd4bf' },
        },
        select: {
          label: { color: '#fff' },
          itemStyle: {
            borderColor: '#f9f871',
            borderWidth: 2,
            areaColor: '#2dd4bf',
          },
        },
        data: seriesData,
      },
    ],
  })

  if (selectedArea.value) {
    mapChart.dispatchAction({
      type: 'select',
      seriesIndex: 0,
      name: selectedArea.value.mapName,
    })
  }
}

const renderRadar = () => {
  if (!radarChart) return
  const current = selectedArea.value
  const indicators = [
    { text: '经济活力', key: 'economy' },
    { text: '社会活力', key: 'social' },
    { text: '环境活力', key: 'environment' },
    { text: '商业活跃度', key: 'commerce' },
    { text: '交通便利度', key: 'traffic' },
    { text: '夜间灯光', key: 'nightlight' },
  ]

  radarChart.setOption({
    tooltip: { trigger: 'item' },
    radar: {
      indicator: indicators.map((item) => ({ text: item.text, max: 100 })),
      splitNumber: 4,
      radius: '65%',
    },
    series: [
      {
        type: 'radar',
        areaStyle: { color: 'rgba(45, 212, 191, 0.35)' },
        lineStyle: { color: '#2dd4bf' },
        data: [
          {
            value: indicators.map((item) => current?.metrics[item.key as keyof typeof current.metrics] ?? 0),
            name: current?.name ?? '暂未选中区域',
          },
        ],
      },
    ],
  })
}

const renderTrend = () => {
  if (!trendChart) return
  const selectedTrend = selectedArea.value?.trend ?? []
  const months = cityTrend.value.map((item) => item.period)
  const padSelectedTrend = months.map((month) => {
    const record = selectedTrend.find((item) => item.period === month)
    return record ? record.value : null
  })

  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['城市平均', selectedArea.value?.name ?? '所选区域'],
      textStyle: { color: '#d1e9ff' },
    },
    grid: {
      left: '5%',
      right: '4%',
      bottom: '8%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: months,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { color: '#94a3b8' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#475569' } },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.2)' } },
      axisLabel: { color: '#94a3b8' },
    },
    series: [
      {
        name: '城市平均',
        type: 'line',
        data: cityTrend.value.map((item) => item.value),
        smooth: true,
        lineStyle: { color: '#60a5fa' },
      },
      {
        name: selectedArea.value?.name ?? '所选区域',
        type: 'line',
        data: padSelectedTrend,
        smooth: true,
        lineStyle: { color: '#2dd4bf' },
        areaStyle: { color: 'rgba(45, 212, 191, 0.2)' },
      },
    ],
  })
}

const handleResize = () => {
  mapChart?.resize()
  radarChart?.resize()
  trendChart?.resize()
}

watch([areas, activeMetric], () => {
  renderMap()
}, { deep: true })

watch(selectedArea, () => {
  renderMap()
  renderRadar()
  renderTrend()
})

watch(cityTrend, () => {
  renderTrend()
}, { deep: true })

onMounted(async () => {
  await nextTick()
  initCharts()
  vitalityStore.fetchVitalityData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  mapChart?.dispose()
  radarChart?.dispose()
  trendChart?.dispose()
  window.removeEventListener('resize', handleResize)
})

const handleMetricChange = (metric: typeof metricOptions[number]['value']) => {
  if (activeMetric.value !== metric) {
    vitalityStore.setActiveMetric(metric)
  }
}
</script>

<template>
  <div class="vitality-page">
    <section class="page-header">
      <div>
        <p class="page-kicker">四川省 · 城市活力治理实验室</p>
        <h1>城市活力感知驾驶舱</h1>
        <p>聚焦成渝地区双城经济圈，洞察川内重点城市经济 / 社会 / 环境态势</p>
      </div>
      <div class="metric-toggle">
        <button v-for="metric in metricOptions" :key="metric.value"
          :class="['toggle-btn', { active: activeMetric === metric.value }]" @click="handleMetricChange(metric.value)">
          {{ metric.label }}
        </button>
      </div>
    </section>

    <section class="summary-grid">
      <div class="summary-card">
        <p>平均综合指数</p>
        <strong>{{ summary.avgOverall }}</strong>
        <span>覆盖 {{ areas.length }} 个地市样本</span>
      </div>
      <div class="summary-card">
        <p>高活力区域数</p>
        <strong>{{ summary.hotspotCount }}</strong>
        <span>阈值：指数 ≥ 85</span>
      </div>
      <div class="summary-card">
        <p>生态韧性指数</p>
        <strong>{{ summary.ecoBalance }}</strong>
        <span>夜间灯光 · 河湖绿量协同</span>
      </div>
      <div class="summary-card">
        <p>最近更新</p>
        <strong>{{ lastUpdatedAt || '同步中' }}</strong>
        <span>数据来自多源专题库</span>
      </div>
    </section>

    <section class="main-grid">
      <div class="panel map-panel">
        <header>
          <h2>一张图 · 空间活力分布</h2>
          <span v-if="loading" class="status">同步源数据...</span>
        </header>
        <div ref="mapRef" class="map-chart"></div>
      </div>

      <div class="side-panels">
        <div class="panel detail-panel" v-if="selectedArea">
          <header>
            <h3>{{ selectedArea.name }}</h3>
            <span class="rank">城区排名第 {{ selectedArea.ranking.cityRank }}</span>
          </header>
          <div class="tag-list">
            <span class="tag" v-for="tag in selectedArea.tags" :key="tag">{{ tag }}</span>
          </div>
          <ul class="metrics">
            <li>
              <span>综合指数</span>
              <strong>{{ selectedArea.metrics.overall }}</strong>
            </li>
            <li>
              <span>经济动能</span>
              <strong>{{ selectedArea.metrics.economy }}</strong>
            </li>
            <li>
              <span>商业活跃度</span>
              <strong>{{ selectedArea.metrics.commerce }}</strong>
            </li>
            <li>
              <span>交通便利度</span>
              <strong>{{ selectedArea.metrics.traffic }}</strong>
            </li>
            <li>
              <span>夜间灯光</span>
              <strong>{{ selectedArea.metrics.nightlight }}</strong>
            </li>
            <li>
              <span>POI 密度</span>
              <strong>{{ selectedArea.metrics.poiDensity }}</strong>
            </li>
          </ul>
        </div>

        <div class="panel ranking-panel">
          <header>
            <h3>区域综合排名</h3>
          </header>
          <ul>
            <li v-for="area in ranking" :key="area.id" :class="{ active: selectedAreaId === area.id }"
              @click="vitalityStore.selectArea(area.id)">
              <span class="position">#{{ area.ranking.cityRank }}</span>
              <span class="name">{{ area.name }}</span>
              <strong>{{ area.metrics.overall }}</strong>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="charts-grid">
      <div class="panel">
        <header>
          <h3>多维指标雷达</h3>
        </header>
        <div ref="radarRef" class="chart"></div>
      </div>
      <div class="panel">
        <header>
          <h3>活力走势联动</h3>
        </header>
        <div ref="trendRef" class="chart"></div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.vitality-page {
  padding: 24px;
  color: #e2e8f0;
  background: radial-gradient(circle at top, rgba(45, 212, 191, 0.15), transparent 45%),
    #020617;
  min-height: 100vh;
}

.page-kicker {
  font-size: 14px;
  letter-spacing: 0.2em;
  color: #38bdf8;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  margin-bottom: 6px;
}

.metric-toggle {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.toggle-btn {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.4);
  color: #f8fafc;
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  border-color: #2dd4bf;
  color: #0f172a;
  background: linear-gradient(120deg, #2dd4bf, #f9f871);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(45, 212, 191, 0.25);
  border-radius: 16px;
  padding: 16px;
}

.summary-card strong {
  font-size: 26px;
  display: block;
  margin: 8px 0;
  color: #f9f871;
}

.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.panel {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 18px;
  padding: 18px;
  position: relative;
}

.panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.map-panel {
  min-height: 500px;
}

.map-chart {
  width: 100%;
  height: 460px;
  border-radius: 12px;
}

.status {
  color: #fbbf24;
  font-size: 14px;
}

.side-panels {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.tag {
  background: rgba(45, 212, 191, 0.15);
  border: 1px solid rgba(45, 212, 191, 0.4);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #8bf2dc;
}

.metrics {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.metrics li {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(45, 212, 191, 0.2);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metrics strong {
  font-size: 20px;
  color: #f9f871;
}

.ranking-panel ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-panel li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: border 0.2s ease;
  border: 1px solid transparent;
}

.ranking-panel li.active {
  border-color: #2dd4bf;
}

.position {
  font-weight: 600;
  color: #94a3b8;
}

.name {
  flex: 1;
  margin: 0 8px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.chart {
  width: 100%;
  height: 320px;
}

@media (max-width: 1200px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .metric-toggle {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>
