<template>
  <q-card
    flat
    class="rounded-borders q-pa-sm shadow-1 flex column"
    style="border-radius: 8px; height: 100%"
  >
    <div class="text-caption text-weight-bold q-mb-xs q-px-xs" style="flex: 0 0 auto">
      Tasks by Priority
    </div>

    <div class="row items-center" style="flex: 1 1 0; min-height: 0">
      <div class="col-5 flex flex-center relative-position" style="height: 100%">
        <div
          class="donut-chart"
          style="
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: conic-gradient(
              #f44336 0% 22%,
              #ff9800 22% 60%,
              #2196f3 60% 85%,
              #4caf50 85% 100%
            );
          "
        ></div>
        <div
          class="absolute-center bg-white flex flex-center column"
          style="width: 44px; height: 44px; border-radius: 50%"
        >
          <div class="text-weight-bold" style="line-height: 1; font-size: 14px">31</div>
        </div>
      </div>
      <div class="col-7 q-pl-sm flex column justify-center" style="height: 100%">
        <div
          class="row justify-between text-weight-medium"
          style="font-size: 12px; margin-bottom: 4px"
        >
          <span class="flex items-center"
            ><q-icon name="circle" color="red" size="10px" class="q-mr-xs" />Critical</span
          >
          <b>7</b>
        </div>
        <div
          class="row justify-between text-weight-medium"
          style="font-size: 12px; margin-bottom: 4px"
        >
          <span class="flex items-center"
            ><q-icon name="circle" color="orange" size="10px" class="q-mr-xs" />High</span
          >
          <b>12</b>
        </div>
        <div
          class="row justify-between text-weight-medium"
          style="font-size: 12px; margin-bottom: 4px"
        >
          <span class="flex items-center"
            ><q-icon name="circle" color="blue" size="10px" class="q-mr-xs" />Medium</span
          >
          <b>8</b>
        </div>
        <div class="row justify-between text-weight-medium" style="font-size: 12px">
          <span class="flex items-center"
            ><q-icon name="circle" color="green" size="10px" class="q-mr-xs" />Low</span
          >
          <b>4</b>
        </div>
      </div>
    </div>
  </q-card>
</template>
