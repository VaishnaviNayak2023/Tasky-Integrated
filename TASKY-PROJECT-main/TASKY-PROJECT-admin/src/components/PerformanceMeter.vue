<template>
  <div class="meter-container">
    <div ref="meterChart" :style="{ width: width, height: height }"></div>
    <div class="meter-label">
      <div class="label-text">{{ label }}</div>
      <div class="label-value" :style="{ color: labelColor }">{{ animatedValue }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';

const props = defineProps<{
  value: number;
  label?: string;
  width?: string;
  height?: string;
}>();

const meterChart = ref<HTMLElement>();
const animatedValue = ref(0);

const labelColor = computed(() => {
  if (props.value >= 80) return '#4caf50';
  if (props.value >= 60) return '#2196f3';
  if (props.value >= 40) return '#ff9800';
  return '#f44336';
});

function renderMeter() {
  if (!meterChart.value) return;

  const container = meterChart.value;
  container.innerHTML = '';

  const width = parseInt(props.width || '200');
  const height = parseInt(props.height || '120');
  const value = props.value;

  // Create SVG using vanilla JS
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width.toString());
  svg.setAttribute('height', height.toString());
  container.appendChild(svg);

  const centerX = width / 2;
  const centerY = height - 20;
  const innerRadius = 40;
  const outerRadius = 55;

  // Background arc (gray)
  const bgArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const bgPath = createArcPath(
    centerX,
    centerY,
    innerRadius,
    outerRadius,
    -Math.PI / 2,
    Math.PI / 2,
  );
  bgArc.setAttribute('d', bgPath);
  bgArc.setAttribute('fill', '#e0e0e0');
  svg.appendChild(bgArc);

  // Value arc (colored)
  const valueArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const color = labelColor.value;
  valueArc.setAttribute('fill', color);
  svg.appendChild(valueArc);

  // Animate the arc
  const duration = 1000;
  const startTime = performance.now();
  const startAngle = -Math.PI / 2;
  const endAngle = -Math.PI / 2 + Math.PI * (value / 100);

  function animate(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentAngle = startAngle + (endAngle - startAngle) * easeOutQuart;

    const path = createArcPath(
      centerX,
      centerY,
      innerRadius,
      outerRadius,
      startAngle,
      currentAngle,
    );
    valueArc.setAttribute('d', path);

    // Animate the number
    animatedValue.value = Math.round(value * easeOutQuart);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

function createArcPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const startInnerX = cx + innerR * Math.cos(startAngle);
  const startInnerY = cy + innerR * Math.sin(startAngle);
  const startOuterX = cx + outerR * Math.cos(startAngle);
  const startOuterY = cy + outerR * Math.sin(startAngle);
  const endInnerX = cx + innerR * Math.cos(endAngle);
  const endInnerY = cy + innerR * Math.sin(endAngle);
  const endOuterX = cx + outerR * Math.cos(endAngle);
  const endOuterY = cy + outerR * Math.sin(endAngle);

  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${startOuterX} ${startOuterY}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}`,
    `L ${endInnerX} ${endInnerY}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY}`,
    'Z',
  ].join(' ');
}

watch(
  () => props.value,
  async () => {
    await nextTick();
    renderMeter();
  },
  { immediate: true },
);
</script>

<style scoped>
.meter-container {
  position: relative;
  display: inline-block;
}
.meter-label {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}
.label-text {
  font-size: 11px;
  color: #666;
}
.label-value {
  font-size: 24px;
  font-weight: bold;
  transition: color 0.3s ease;
}
</style>
