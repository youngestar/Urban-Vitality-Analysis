import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type VitalityMetricKey =
  | 'overall'
  | 'economy'
  | 'social'
  | 'environment'
  | 'commerce'
  | 'traffic'
  | 'nightlight'

export interface VitalityTrendPoint {
  period: string
  value: number
}

export interface VitalityArea {
  id: string
  name: string
  mapName: string
  centroid: [number, number]
  tags: string[]
  metrics: Record<VitalityMetricKey | 'poiDensity', number>
  ranking: {
    cityRank: number
    percentile: number
  }
  trend: VitalityTrendPoint[]
}

const HOTSPOT_THRESHOLD = 85

const sichuanAreas: VitalityArea[] = [
  {
    id: 'chengdu',
    name: '成都市主城区',
    mapName: '成都市',
    centroid: [104.06, 30.67],
    tags: ['枢纽经济', '夜间消费', 'TOD 试点'],
    metrics: {
      overall: 92,
      economy: 95,
      social: 91,
      environment: 78,
      commerce: 96,
      traffic: 94,
      nightlight: 90,
      poiDensity: 428,
    },
    ranking: { cityRank: 1, percentile: 99 },
    trend: [
      { period: '2025-01', value: 88 },
      { period: '2025-02', value: 89 },
      { period: '2025-03', value: 90 },
      { period: '2025-04', value: 91 },
      { period: '2025-05', value: 92 },
      { period: '2025-06', value: 92 },
    ],
  },
  {
    id: 'deyang',
    name: '德阳市先进制造带',
    mapName: '德阳市',
    centroid: [104.4, 31.13],
    tags: ['装备制造', '产城融合'],
    metrics: {
      overall: 83,
      economy: 84,
      social: 80,
      environment: 82,
      commerce: 74,
      traffic: 79,
      nightlight: 68,
      poiDensity: 198,
    },
    ranking: { cityRank: 2, percentile: 87 },
    trend: [
      { period: '2025-01', value: 79 },
      { period: '2025-02', value: 79 },
      { period: '2025-03', value: 80 },
      { period: '2025-04', value: 82 },
      { period: '2025-05', value: 82 },
      { period: '2025-06', value: 83 },
    ],
  },
  {
    id: 'mianyang',
    name: '绵阳市科技新城',
    mapName: '绵阳市',
    centroid: [104.74, 31.47],
    tags: ['军民融合', '科研生态'],
    metrics: {
      overall: 81,
      economy: 82,
      social: 83,
      environment: 80,
      commerce: 70,
      traffic: 77,
      nightlight: 66,
      poiDensity: 176,
    },
    ranking: { cityRank: 3, percentile: 82 },
    trend: [
      { period: '2025-01', value: 77 },
      { period: '2025-02', value: 77 },
      { period: '2025-03', value: 78 },
      { period: '2025-04', value: 79 },
      { period: '2025-05', value: 80 },
      { period: '2025-06', value: 81 },
    ],
  },
  {
    id: 'leshan',
    name: '乐山市文旅圈',
    mapName: '乐山市',
    centroid: [103.77, 29.57],
    tags: ['大佛景区', '文旅夜游'],
    metrics: {
      overall: 75,
      economy: 72,
      social: 78,
      environment: 85,
      commerce: 69,
      traffic: 70,
      nightlight: 60,
      poiDensity: 142,
    },
    ranking: { cityRank: 4, percentile: 68 },
    trend: [
      { period: '2025-01', value: 71 },
      { period: '2025-02', value: 71 },
      { period: '2025-03', value: 73 },
      { period: '2025-04', value: 74 },
      { period: '2025-05', value: 74 },
      { period: '2025-06', value: 75 },
    ],
  },
  {
    id: 'yibin',
    name: '宜宾市长江首城',
    mapName: '宜宾市',
    centroid: [104.64, 28.75],
    tags: ['绿色化工', '三江口'],
    metrics: {
      overall: 73,
      economy: 75,
      social: 71,
      environment: 79,
      commerce: 66,
      traffic: 69,
      nightlight: 58,
      poiDensity: 128,
    },
    ranking: { cityRank: 5, percentile: 61 },
    trend: [
      { period: '2025-01', value: 70 },
      { period: '2025-02', value: 70 },
      { period: '2025-03', value: 71 },
      { period: '2025-04', value: 72 },
      { period: '2025-05', value: 72 },
      { period: '2025-06', value: 73 },
    ],
  },
  {
    id: 'luzhou',
    name: '泸州市临港新区',
    mapName: '泸州市',
    centroid: [105.44, 28.88],
    tags: ['白酒产业', '港口经济'],
    metrics: {
      overall: 71,
      economy: 74,
      social: 69,
      environment: 77,
      commerce: 64,
      traffic: 68,
      nightlight: 56,
      poiDensity: 116,
    },
    ranking: { cityRank: 6, percentile: 56 },
    trend: [
      { period: '2025-01', value: 68 },
      { period: '2025-02', value: 68 },
      { period: '2025-03', value: 69 },
      { period: '2025-04', value: 70 },
      { period: '2025-05', value: 70 },
      { period: '2025-06', value: 71 },
    ],
  },
  {
    id: 'nanchong',
    name: '南充市嘉陵江走廊',
    mapName: '南充市',
    centroid: [106.08, 30.8],
    tags: ['川东北枢纽', '公铁联运'],
    metrics: {
      overall: 70,
      economy: 71,
      social: 72,
      environment: 76,
      commerce: 62,
      traffic: 67,
      nightlight: 55,
      poiDensity: 110,
    },
    ranking: { cityRank: 7, percentile: 52 },
    trend: [
      { period: '2025-01', value: 67 },
      { period: '2025-02', value: 67 },
      { period: '2025-03', value: 68 },
      { period: '2025-04', value: 69 },
      { period: '2025-05', value: 69 },
      { period: '2025-06', value: 70 },
    ],
  },
]

const cityTrendMock: VitalityTrendPoint[] = [
  { period: '2025-01', value: 75 },
  { period: '2025-02', value: 75.2 },
  { period: '2025-03', value: 76.1 },
  { period: '2025-04', value: 77 },
  { period: '2025-05', value: 77.4 },
  { period: '2025-06', value: 78 },
]

export const useVitalityStore = defineStore('vitality', () => {
  const areas = ref<VitalityArea[]>([])
  const loading = ref(false)
  const lastUpdatedAt = ref('')
  const selectedAreaId = ref<string | null>(null)
  const activeMetric = ref<VitalityMetricKey>('overall')
  const cityTrend = ref<VitalityTrendPoint[]>(cityTrendMock)

  const selectedArea = computed(
    () => areas.value.find((area) => area.id === selectedAreaId.value) ?? null,
  )

  const ranking = computed(() =>
    [...areas.value].sort((a, b) => b.metrics.overall - a.metrics.overall),
  )

  const summary = computed(() => {
    if (!areas.value.length) {
      return {
        avgOverall: 0,
        hotspotCount: 0,
        ecoBalance: 0,
      }
    }
    const aggregated = areas.value.reduce(
      (acc, area) => {
        acc.overall += area.metrics.overall
        acc.environment += area.metrics.environment
        return acc
      },
      { overall: 0, environment: 0 },
    )
    const count = areas.value.length
    return {
      avgOverall: Number((aggregated.overall / count).toFixed(1)),
      hotspotCount: areas.value.filter((area) => area.metrics.overall >= HOTSPOT_THRESHOLD).length,
      ecoBalance: Number((aggregated.environment / count).toFixed(1)),
    }
  })

  const metricExtent = computed(() => {
    if (!areas.value.length) {
      return { min: 0, max: 100 }
    }
    const values = areas.value.map((area) => area.metrics[activeMetric.value])
    return {
      min: Math.max(Math.min(...values) - 5, 0),
      max: Math.min(Math.max(...values) + 5, 100),
    }
  })

  const fetchVitalityData = async () => {
    loading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      areas.value = sichuanAreas
      if (!selectedAreaId.value && sichuanAreas.length) {
        selectedAreaId.value = sichuanAreas[0].id
      }
      lastUpdatedAt.value = new Date().toLocaleString()
    } finally {
      loading.value = false
    }
  }

  const selectArea = (areaId: string) => {
    if (areas.value.some((area) => area.id === areaId)) {
      selectedAreaId.value = areaId
    }
  }

  const setActiveMetric = (metric: VitalityMetricKey) => {
    activeMetric.value = metric
  }

  return {
    areas,
    loading,
    lastUpdatedAt,
    selectedAreaId,
    selectedArea,
    ranking,
    summary,
    cityTrend,
    activeMetric,
    metricExtent,
    fetchVitalityData,
    selectArea,
    setActiveMetric,
  }
})
