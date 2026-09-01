<template>
  <div ref="chartContainer" class="priority-distribution-chart">
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
  priority: string;
  totalTasks: number;
  completedTasks: number;
  delayedTasks: number;
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
  width: 400,
  height: 400,
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
  const margin = { top: 20, right: 20, bottom: 60, left: 20 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create main group
  const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

  // Calculate radius
  const radius = Math.min(innerWidth, innerHeight) / 2;

  // Create color scale
  const colorScale = d3
    .scaleOrdinal()
    .domain(props.data.map((d) => d.priority))
    .range(['#FF5252', '#FF9800', '#2196F3', '#4CAF50']);

  // Create pie generator
  const pie = d3
    .pie<any>()
    .value((d) => d.totalTasks)
    .sort(null);

  // Create arc generator
  const arc = d3
    .arc()
    .innerRadius(radius * 0.5)
    .outerRadius(radius);

  const arcHover = d3
    .arc()
    .innerRadius(radius * 0.5)
    .outerRadius(radius * 1.05);

  // Create arcs
  const arcs = g
    .selectAll('.arc')
    .data(pie(props.data as any))
    .enter()
    .append('g')
    .attr('class', 'arc');

  arcs
    .append('path')
    .attr('d', arc as any)
    .attr('fill', (d) => colorScale(d.data.priority))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .on('mouseover', function (event, d) {
      d3.select(this).transition().duration(200).attr('d', arcHover as any);
    })
    .on('mouseout', function (event, d) {
      d3.select(this).transition().duration(200).attr('d', arc as any);
    });

  // Add labels
  arcs
    .append('text')
    .attr('transform', (d) => `translate(${arc.centroid(d as any)})`)
    .attr('text-anchor', 'middle')
    .attr('font-size', '11px')
    .attr('fill', '#fff')
    .text((d) => d.data.priority.charAt(0).toUpperCase());

  // Add center text
  const totalTasks = props.data.reduce((sum, d) => sum + d.totalTasks, 0);
  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.5em')
    .attr('font-size', '24px')
    .attr('font-weight', 'bold')
    .text(totalTasks);

  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1em')
    .attr('font-size', '14px')
    .attr('fill', '#666')
    .text('Tasks');

  // Add legend
  const legend = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${height - margin.bottom + 10})`);

  const legendItems = legend
    .selectAll('.legend-item')
    .data(props.data)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(${i * 100}, 0)`);

  legendItems
    .append('rect')
    .attr('width', 12)
    .attr('height', 12)
    .attr('fill', (d) => colorScale(d.priority))
    .attr('rx', 2);

  legendItems
    .append('text')
    .attr('x', 18)
    .attr('y', 10)
    .text((d) => d.priority.charAt(0).toUpperCase() + d.priority.slice(1))
    .style('font-size', '11px')
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
.priority-distribution-chart {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

svg {
  width: 100%;
  height: 100%;
}
</style>
