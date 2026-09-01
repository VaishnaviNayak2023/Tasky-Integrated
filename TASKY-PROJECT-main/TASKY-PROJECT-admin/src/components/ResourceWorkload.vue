<template>
  <q-card
    flat
    class="rounded-borders q-pa-sm shadow-1 flex column"
    style="border-radius: 8px; height: 100%"
  >
    <div class="row justify-between items-center q-mb-xs" style="flex: 0 0 auto">
      <div class="text-subtitle2 text-weight-bold" style="line-height: 1">Resource Workload</div>
      <q-btn
        flat
        no-caps
        dense
        label="View All"
        color="grey-8"
        class="bg-grey-2 q-px-sm"
        style="border-radius: 4px; font-size: 9px; min-height: unset; padding: 2px 6px"
      />
    </div>

    <div style="flex: 1 1 0; min-height: 0; position: relative">
      <q-markup-table
        flat
        dense
        class="no-shadow absolute-full stretch-table"
        style="background: transparent"
      >
        <thead>
          <tr class="text-left text-grey-8">
            <th style="font-size: 12px; font-weight: 600">Resource</th>
            <th style="font-size: 12px; font-weight: 600">Workload</th>
            <th style="font-size: 12px; font-weight: 600; text-align: center">Status</th>
            <th style="font-size: 12px; font-weight: 600; text-align: center">Tasks</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="row items-center">
                <q-avatar size="24px" class="q-mr-sm"
                  ><img src="https://cdn.quasar.dev/img/avatar1.jpg"
                /></q-avatar>
                <span class="text-weight-bold" style="font-size: 13px">Sarah Johnson</span>
              </div>
            </td>
            <td style="width: 140px">
              <div class="text-grey-8" style="font-size: 11px; margin-bottom: 2px">
                124.5h / 130h
              </div>
              <q-linear-progress :value="124.5 / 130" color="red" size="6px" rounded />
            </td>
            <td class="text-center">
              <q-badge
                color="red"
                label="Overloaded"
                class="q-px-sm q-py-xs rounded-borders text-weight-bold"
                style="font-size: 11px"
              />
            </td>
            <td class="text-center text-weight-bold" style="font-size: 13px">5</td>
          </tr>
          <tr>
            <td>
              <div class="row items-center">
                <q-avatar size="24px" class="q-mr-sm"
                  ><img src="https://cdn.quasar.dev/img/avatar2.jpg"
                /></q-avatar>
                <span class="text-weight-bold" style="font-size: 13px">Michael Chen</span>
              </div>
            </td>
            <td>
              <div class="text-grey-8" style="font-size: 11px; margin-bottom: 2px">
                120.5h / 130h
              </div>
              <q-linear-progress :value="120.5 / 130" color="red" size="6px" rounded />
            </td>
            <td class="text-center">
              <q-badge
                color="red"
                label="Overloaded"
                class="q-px-sm q-py-xs rounded-borders text-weight-bold"
                style="font-size: 11px"
              />
            </td>
            <td class="text-center text-weight-bold" style="font-size: 13px">6</td>
          </tr>
          <tr>
            <td>
              <div class="row items-center">
                <q-avatar size="24px" class="q-mr-sm"
                  ><img src="https://cdn.quasar.dev/img/avatar3.jpg"
                /></q-avatar>
                <span class="text-weight-bold" style="font-size: 13px">Emily Davis</span>
              </div>
            </td>
            <td>
              <div class="text-grey-8" style="font-size: 11px; margin-bottom: 2px">90h / 130h</div>
              <q-linear-progress :value="90 / 130" color="green" size="6px" rounded />
            </td>
            <td class="text-center">
              <q-badge
                color="green"
                label="Available"
                class="q-px-sm q-py-xs rounded-borders text-weight-bold"
                style="font-size: 11px"
              />
            </td>
            <td class="text-center text-weight-bold" style="font-size: 13px">3</td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </q-card>
</template>

<style scoped>
/* Ensure tables don't have border on top of cells */
.q-table th {
  font-weight: 600;
  border-bottom-width: 1px;
}
.q-table td {
  border-bottom-width: 1px;
}

/* Deep target to stretch the native table inside q-markup-table */
:deep(.stretch-table table) {
  height: 100%;
}
:deep(.stretch-table tbody tr td) {
  vertical-align: middle;
}
:deep(.stretch-table .q-table__middle) {
  overflow: hidden !important;
}
</style>
