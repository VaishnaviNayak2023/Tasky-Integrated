<template>
  <div ref="chartContainer" class="completion-trend-chart">
    <div v-if="loading" class="column items-center justify-center q-pa-xl">
      <q-spinner color="primary" size="40px" />
      <div class="text-body1 text-grey-6 q-mt-md">Loading chart...</div>
    </div>
    <div v-else-if="error" class="column items-center justify-center q-pa-xl">
      <q-icon name="error_outline" size="40px" color="negative" />
      <div class="text-body1 text-negative q-mt-md">Failed to load chart</div>
    </div>
    <svg v-else ref="svgRef" :width="width" :height="height"></svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as d3 from 'd3';

interface DataPoint {
  period: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface Props {
  data: DataPoint[];
  loading?: boolean;
  error?: string | null;
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  width: 600,
  height: 300,
});

const chartContainer = ref<HTMLElement>();
const svgRef = ref<SVGSVGElement>();

let resizeObserver: ResizeObserver | null = null;

function renderChart() {
  if (!svgRef.value || !props.data || props.data.length === 0) return;

  // Clear existing content
  d3.select(svgRef.value).selectAll('*').remove();

  const svg = d3.select(svgRef.value);
  const width = props.width;
  const height = props.height;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create scales
  const xScale = d3
    .scalePoint()
    .domain(props.data.map((d) => d.period))
    .range([0, innerWidth])
    .padding(0.5);

  const maxY = d3.max(props.data, (d) => Math.max(d.critical, d.high, d.medium, d.low)) || 0;
  const yScale = d3.scaleLinear().domain([0, maxY * 1.1]).range([innerHeight, 0]);

  // Create color scale
  const colorScale = d3
    .scaleOrdinal()
    .domain(['critical', 'high', 'medium', 'low'])
    .range(['#FF5252', '#FF9800', '#2196F3', '#4CAF50']);

  // Create main group
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // Add X axis
  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .style('text-anchor', 'middle')
    .style('font-size', '12px');

  // Add Y axis
  g.append('g')
    .call(d3.axisLeft(yScale).ticks(5))
    .selectAll('text')
    .style('font-size', '12px');

  // Add grid lines
  g.append('g')
    .attr('class', 'grid')
    .call(
      d3
        .axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat(null)
    )
    .selectAll('line')
    .attr('stroke', '#e0e0e0')
    .attr('stroke-dasharray', '3,3');

  // Create line generator
  const line = d3
    .line<any>()
    .x((d) => xScale(d.period) || 0)
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);

  // Create lines for each priority
  const priorities = ['critical', 'high', 'medium', 'low'];
  priorities.forEach((priority) => {
    const lineData = props.data.map((d) => ({
      period: d.period,
      value: (d as any)[priority],
    }));

    const path = g
      .append('path')
      .datum(lineData)
      .attr('fill', 'none')
      .attr('stroke', colorScale(priority) as string)
      .attr('stroke-width', 2)
      .attr('d', line as any);

    // Add dots
    g.selectAll(`.dot-${priority}`)
      .data(lineData)
      .enter()
      .append('circle')
      .attr('class', `dot-${priority}`)
      .attr('cx', (d) => xScale(d.period) || 0)
      .attr('cy', (d) => yScale(d.value))
      .attr('r', 4)
      .attr('fill', colorScale(priority) as string)
      .on('mouseover', function (_event, _d) {
        d3.select(this).attr('r', 6);
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 4);
      });
  });

  // Add legend
  const legend = svg
    .append('g')
    .attr('transform', `translate(${width - 150}, 20)`);

  const legendItems = legend
    .selectAll('.legend-item')
    .data(priorities)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 20})`);

  legendItems
    .append('rect')
    .attr('width', 12)
    .attr('height', 12)
    .attr('fill', (d) => colorScale(d) as string)
    .attr('rx', 2);

  legendItems
    .append('text')
    .attr('x', 18)
    .attr('y', 10)
    .text((d) => d.charAt(0).toUpperCase() + d.slice(1))
    .style('font-size', '12px')
    .style('fill', '#666');
}

onMounted(() => {
  renderChart();

  // Set up resize observer
  if (chartContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      if (chartContainer.value) {
        const rect = chartContainer.value.getBoundingClientRect();
        // Update width and height based on container
      }
    });
    resizeObserver.observe(chartContainer.value);
  }
});

watch(
  () => props.data,
  () => {
    renderChart();
  },
  { deep: true }
);

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
.completion-trend-chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

svg {
  width: 100%;
  height: 100%;
}

.grid line {
  stroke: #e0e0e0;
  stroke-dasharray: 3, 3;
}
</style>
