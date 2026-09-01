<template>
  <q-card
    flat
    class="rounded-borders q-pa-sm shadow-1 flex column"
    style="border-radius: 8px; height: 100%"
  >
    <div class="text-caption text-weight-bold q-mb-xs q-px-xs" style="flex: 0 0 auto">
      Task Status
    </div>

    <div class="row items-center" style="flex: 1 1 0; min-height: 0">
      <div class="col-5 relative-position" style="height: 100%; padding-top: 8px">
        <div
          class="row items-end justify-around q-px-xs q-ml-sm"
          style="
            height: 100%;
            border-left: 1px solid #e0e0e0;
            border-bottom: 1px solid #e0e0e0;
            position: relative;
          "
        >
          <div class="absolute text-grey-6" style="left: -14px; bottom: -8px; font-size: 10px">
            0
          </div>
          <div class="absolute text-grey-6" style="left: -14px; bottom: 50%; font-size: 10px">
            4
          </div>
          <div class="absolute text-grey-6" style="left: -14px; top: -8px; font-size: 10px">8</div>

          <div
            class="bg-grey-7"
            style="width: 16%; height: 62.5%; border-radius: 4px 4px 0 0"
          ></div>
          <div class="bg-blue" style="width: 16%; height: 75%; border-radius: 4px 4px 0 0"></div>
          <div class="bg-green" style="width: 16%; height: 50%; border-radius: 4px 4px 0 0"></div>
          <div class="bg-red" style="width: 16%; height: 5%; border-radius: 4px 4px 0 0"></div>
        </div>
      </div>

      <div class="col-7 q-pl-md flex column justify-center" style="height: 100%">
        <div
          class="row justify-between text-weight-medium"
          style="font-size: 12px; margin-bottom: 4px"
        >
          <span class="flex items-center"
            ><q-icon name="square" color="grey-7" size="10px" class="q-mr-xs" />Not Started</span
          >
          <b>5</b>
        </div>
        <div
          class="row justify-between text-weight-medium"
          style="font-size: 12px; margin-bottom: 4px"
        >
          <span class="flex items-center"
            ><q-icon name="square" color="blue" size="10px" class="q-mr-xs" />In Progress</span
          >
          <b>6</b>
        </div>
        <div
          class="row justify-between text-weight-medium"
          style="font-size: 12px; margin-bottom: 4px"
        >
          <span class="flex items-center"
            ><q-icon name="square" color="green" size="10px" class="q-mr-xs" />Completed</span
          >
          <b>4</b>
        </div>
        <div class="row justify-between text-weight-medium" style="font-size: 12px">
          <span class="flex items-center"
            ><q-icon name="square" color="red" size="10px" class="q-mr-xs" />Blocked</span
          >
          <b>0</b>
        </div>
      </div>
    </div>
  </q-card>
</template>
