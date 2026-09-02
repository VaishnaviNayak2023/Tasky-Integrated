<template>
  <div ref="chartContainer" class="productivity-trend-chart">
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
  assigned: number;
  completed: number;
  delayed: number;
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
    .scaleBand()
    .domain(props.data.map((d) => d.period))
    .range([0, innerWidth])
    .padding(0.3);

  const maxY = d3.max(props.data, (d) => Math.max(d.assigned, d.completed, d.delayed)) || 0;
  const yScale = d3.scaleLinear().domain([0, maxY * 1.1]).range([innerHeight, 0]);

  // Create color scale
  const colorScale = d3
    .scaleOrdinal()
    .domain(['assigned', 'completed', 'delayed'])
    .range(['#E0E0E0', '#7C4DFF', '#FF5252']);

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

  // Stack the data
  const stack = d3
    .stack()
    .keys(['assigned', 'completed', 'delayed'])
    .offset(d3.stackOffsetDiverging);

  const stackedData = stack(props.data as any);

  // Create groups for each key
  const groups = g
    .selectAll('.group')
    .data(stackedData)
    .enter()
    .append('g')
    .attr('class', 'group')
    .attr('fill', (d) => colorScale(d.key as string) as string);

  // Create bars
  groups
    .selectAll('rect')
    .data((d) => d)
    .enter()
    .append('rect')
    .attr('x', (d) => (xScale(d.data.period) || 0) as any)
    .attr('y', (d) => yScale(d[1]))
    .attr('height', (d) => Math.abs(yScale(d[0]) - yScale(d[1])))
    .attr('width', xScale.bandwidth())
    .attr('rx', 4)
    .attr('ry', 4)
    .on('mouseover', function (_event, _d) {
      d3.select(this).attr('opacity', 0.8);
    })
    .on('mouseout', function () {
      d3.select(this).attr('opacity', 1);
    });

  // Add legend
  const legend = svg
    .append('g')
    .attr('transform', `translate(${width - 150}, 20)`);

  const legendItems = legend
    .selectAll('.legend-item')
    .data(['assigned', 'completed', 'delayed'])
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
        // This would require reactive props or emit
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
.productivity-trend-chart {
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
