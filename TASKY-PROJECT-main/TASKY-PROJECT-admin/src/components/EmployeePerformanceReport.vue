<template>
  <q-dialog v-model="isOpen" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="bg-grey-1 column" v-if="employee">
      <!-- Header -->
      <q-card-section
        class="bg-white row items-center justify-between q-pa-md shadow-2 z-top"
        style="flex: 0 0 auto"
      >
        <div class="row items-center">
          <q-btn flat round dense icon="arrow_back" v-close-popup class="q-mr-sm" />
          <q-avatar size="40px" class="q-mr-md">
            <img :src="employee.avatar_url || `https://i.pravatar.cc/150?img=${employee.id}`" />
          </q-avatar>
          <div class="column">
            <div class="text-h6 text-weight-bold">
              {{ employee.first_name }} {{ employee.last_name }}
            </div>
            <div class="text-caption text-grey-7">
              {{ employee.role_name }} • {{ employee.employee_code }}
            </div>
          </div>
        </div>
        <q-btn
          unelevated
          color="primary"
          label="Refresh"
          icon="refresh"
          @click="loadPerformanceData"
          :loading="loading"
        />
      </q-card-section>

      <!-- Main Content -->
      <div class="row q-col-gutter-md q-pa-md" style="flex: 1 1 0; overflow-y: auto">
        <!-- Left Column: Stats & Charts -->
        <div class="col-8 column q-gutter-y-md">
          <!-- Overall Performance Meter -->
          <q-card flat bordered class="bg-white">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">Overall Performance</div>
              <div class="row items-center justify-center">
                <div ref="meterChart" style="width: 300px; height: 200px"></div>
                <div class="column q-ml-xl">
                  <div class="text-caption text-grey-7">Performance Score</div>
                  <div class="text-h4 text-weight-bold" :class="`text-${performanceColor}`">
                    {{ performanceData.overallScore || 0 }}%
                  </div>
                  <div class="text-caption text-grey-6 q-mt-sm">
                    Based on task completion, timeliness, and quality
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Task Status Distribution -->
          <q-card flat bordered class="bg-white">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">Task Status Distribution</div>
              <div class="row items-center">
                <div ref="pieChart" style="width: 250px; height: 250px"></div>
                <div class="column q-ml-md flex-1">
                  <div
                    v-for="(item, index) in taskStatusData"
                    :key="index"
                    class="row items-center q-mb-sm"
                  >
                    <div
                      class="legend-dot q-mr-sm"
                      :style="`background-color: ${item.color};`"
                    ></div>
                    <div class="text-body2">{{ item.label }}</div>
                    <q-space />
                    <div class="text-weight-bold">{{ item.count }} ({{ item.percent }}%)</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Weekly Progress Chart -->
          <q-card flat bordered class="bg-white">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">
                Weekly Progress (Last 8 Weeks)
              </div>
              <div ref="barChart" style="width: 100%; height: 250px"></div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Right Column: Details -->
        <div class="col-4 column q-gutter-y-md">
          <!-- Summary Stats -->
          <q-card flat bordered class="bg-white">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">Summary</div>
              <q-list dense>
                <q-item class="q-px-none">
                  <q-item-section avatar
                    ><q-icon name="assignment" color="blue" size="xs"
                  /></q-item-section>
                  <q-item-section class="text-grey-7">Total Tasks</q-item-section>
                  <q-item-section side class="text-weight-bold">{{
                    performanceData.totalTasks || 0
                  }}</q-item-section>
                </q-item>
                <q-item class="q-px-none">
                  <q-item-section avatar
                    ><q-icon name="check_circle" color="green" size="xs"
                  /></q-item-section>
                  <q-item-section class="text-grey-7">Completed</q-item-section>
                  <q-item-section side class="text-weight-bold text-green">{{
                    performanceData.completedTasks || 0
                  }}</q-item-section>
                </q-item>
                <q-item class="q-px-none">
                  <q-item-section avatar
                    ><q-icon name="schedule" color="orange" size="xs"
                  /></q-item-section>
                  <q-item-section class="text-grey-7">Overdue</q-item-section>
                  <q-item-section side class="text-weight-bold text-orange">{{
                    performanceData.overdueTasks || 0
                  }}</q-item-section>
                </q-item>
                <q-item class="q-px-none">
                  <q-item-section avatar
                    ><q-icon name="access_time" color="purple" size="xs"
                  /></q-item-section>
                  <q-item-section class="text-grey-7">Hours Logged</q-item-section>
                  <q-item-section side class="text-weight-bold"
                    >{{ performanceData.hoursLogged || 0 }}h</q-item-section
                  >
                </q-item>
                <q-item class="q-px-none">
                  <q-item-section avatar
                    ><q-icon name="trending_up" color="indigo" size="xs"
                  /></q-item-section>
                  <q-item-section class="text-grey-7">Utilization</q-item-section>
                  <q-item-section side class="text-weight-bold"
                    >{{ performanceData.utilization || 0 }}%</q-item-section
                  >
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Recent Tasks -->
          <q-card flat bordered class="bg-white">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-sm">Recent Tasks</div>
              <q-list
                v-if="performanceData.recentTasks && performanceData.recentTasks.length > 0"
                separator
                dense
              >
                <q-item
                  v-for="task in performanceData.recentTasks.slice(0, 5)"
                  :key="task.id"
                  class="q-py-sm"
                >
                  <q-item-section>
                    <q-item-label class="text-weight-medium" style="font-size: 12px">{{
                      task.title
                    }}</q-item-label>
                    <q-item-label caption>{{ task.project_name }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge
                      :color="
                        task.status === 'completed'
                          ? 'green'
                          : task.status === 'in-progress'
                            ? 'blue'
                            : 'grey'
                      "
                      :label="task.status"
                      style="font-size: 9px"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="text-caption text-grey-6 q-pa-md text-center">No recent tasks</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card>

    <!-- Loading State -->
    <q-card v-else class="bg-grey-1 flex flex-center">
      <q-spinner-dots size="40px" color="primary" />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import * as d3 from 'd3';

const props = defineProps<{
  modelValue: boolean;
  employee?: any;
}>();

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(props.modelValue);
const loading = ref(false);
const performanceData = ref<any>({});

const meterChart = ref<HTMLElement>();
const pieChart = ref<HTMLElement>();
const barChart = ref<HTMLElement>();

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val;
    if (val && props.employee) {
      loadPerformanceData();
    }
  },
);

watch(isOpen, (val) => {
  emit('update:modelValue', val);
});

const performanceColor = computed(() => {
  const score = performanceData.value.overallScore || 0;
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'orange';
  return 'red';
});

const taskStatusData = computed(() => {
  const stats = performanceData.value.taskStats || {};
  const values = Object.values(stats) as number[];
  const total = values.reduce((a: number, b: number) => a + b, 0);

  const colors: Record<string, string> = {
    completed: '#4caf50',
    'in-progress': '#2196f3',
    'in-review': '#9c27b0',
    'not-started': '#9e9e9e',
    blocked: '#f44336',
  };

  return Object.entries(stats)
    .map(([status, count]) => ({
      label: status
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      count: count as number,
      percent: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
      color: colors[status] || '#757575',
    }))
    .sort((a, b) => b.count - a.count);
});

async function loadPerformanceData() {
  if (!props.employee) return;

  loading.value = true;
  try {
    const response = await fetch(
      `http://localhost:3001/api/pm/employee-performance/${props.employee.id}`,
    );
    const data = await response.json();
    if (data.success) {
      performanceData.value = data.performance;
      await nextTick();
      renderCharts();
    }
  } catch (error) {
    console.error('Error loading performance data:', error);
  } finally {
    loading.value = false;
  }
}

function renderCharts() {
  renderMeterChart();
  renderPieChart();
  renderBarChart();
}

function renderMeterChart() {
  if (!meterChart.value) return;

  const container = meterChart.value;
  container.innerHTML = '';

  const width = 300;
  const height = 200;
  const score = performanceData.value.overallScore || 0;

  const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);

  // Meter background
  const arc = d3
    .arc()
    .innerRadius(60)
    .outerRadius(80)
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2);

  svg
    .append('path')
    .attr('d', arc as any)
    .attr('fill', '#e0e0e0')
    .attr('transform', `translate(${width / 2}, ${height - 20})`);

  // Meter value
  const valueArc = d3
    .arc()
    .innerRadius(60)
    .outerRadius(80)
    .startAngle(-Math.PI / 2)
    .endAngle(-Math.PI / 2 + Math.PI * (score / 100));

  const color =
    score >= 80 ? '#4caf50' : score >= 60 ? '#2196f3' : score >= 40 ? '#ff9800' : '#f44336';

  svg
    .append('path')
    .attr('d', valueArc as any)
    .attr('fill', color)
    .attr('transform', `translate(${width / 2}, ${height - 20})`)
    .transition()
    .duration(1000)
    .attrTween('d', function () {
      const interpolate = d3.interpolate(0, score / 100);
      return function (t: any) {
        const valueArcTween = d3
          .arc()
          .innerRadius(60)
          .outerRadius(80)
          .startAngle(-Math.PI / 2)
          .endAngle(-Math.PI / 2 + Math.PI * interpolate(t));
        return valueArcTween as any;
      };
    });
}

function renderPieChart() {
  if (!pieChart.value) return;

  const container = pieChart.value;
  container.innerHTML = '';

  const width = 250;
  const height = 250;
  const radius = Math.min(width, height) / 2;

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

  const data = taskStatusData.value;
  const pie = d3.pie<any>().value((d: any) => d.count);
  const arc = d3.arc<any>().innerRadius(0).outerRadius(radius);

  const arcs = svg.selectAll('arc').data(pie(data)).enter().append('g').attr('class', 'arc');

  arcs
    .append('path')
    .attr('d', arc as any)
    .attr('fill', (d: any) => d.data.color)
    .attr('stroke', 'white')
    .attr('stroke-width', 2);
}

function renderBarChart() {
  if (!barChart.value) return;

  const container = barChart.value;
  container.innerHTML = '';

  const width = container.clientWidth;
  const height = 250;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };

  const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);

  const weeklyData = performanceData.value.weeklyProgress || [];
  const maxHours = d3.max(weeklyData, (d: any) => d.hours) || 40;

  const x = d3
    .scaleBand()
    .domain(weeklyData.map((d: any) => d.week))
    .range([margin.left, width - margin.right])
    .padding(0.3);

  const y = d3
    .scaleLinear()
    .domain([0, maxHours as number])
    .range([height - margin.bottom, margin.top]);

  svg
    .append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x) as any)
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

  svg
    .append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y) as any);

  svg
    .selectAll('rect')
    .data(weeklyData)
    .enter()
    .append('rect')
    .attr('x', (d: any) => x(d.week) || 0)
    .attr('y', height - margin.bottom)
    .attr('width', x.bandwidth())
    .attr('height', 0)
    .attr('fill', '#2196f3')
    .transition()
    .duration(1000)
    .attr('y', (d: any) => y(d.hours))
    .attr('height', (d: any) => height - margin.bottom - y(d.hours));
}
</script>

<style scoped>
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
</style>
