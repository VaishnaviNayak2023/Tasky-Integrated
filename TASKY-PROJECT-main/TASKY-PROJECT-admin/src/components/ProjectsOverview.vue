<template>
  <q-card
    flat
    class="rounded-borders q-pa-sm shadow-1 flex column"
    style="border-radius: 8px; height: 100%"
  >
    <div class="row justify-between items-center q-mb-xs" style="flex: 0 0 auto">
      <div class="text-subtitle2 text-weight-bold" style="line-height: 1">Projects Overview</div>
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

    <div style="flex: 1; overflow: hidden; position: relative">
      <q-markup-table
        flat
        dense
        class="no-shadow absolute-full stretch-table"
        style="background: transparent"
      >
        <thead>
          <tr class="text-left text-grey-8">
            <th style="font-size: 12px; font-weight: 600">Project Name</th>
            <th style="font-size: 12px; font-weight: 600">Status</th>
            <th style="font-size: 12px; font-weight: 600; width: 120px">Progress</th>
            <th style="font-size: 12px; font-weight: 600; text-align: center">Priority</th>
            <th style="font-size: 12px; font-weight: 600; text-align: right">End Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-weight-bold" style="font-size: 14px">E-Commerce Platform Redesign</td>
            <td>
              <q-badge
                color="green-1"
                text-color="green"
                label="Active"
                class="q-px-sm q-py-xs text-weight-bold"
                style="font-size: 11px"
              />
            </td>
            <td>
              <div class="row items-center">
                <span class="q-mr-sm text-caption" style="font-size: 12px">65%</span>
                <q-linear-progress :value="0.65" color="blue" class="col" size="6px" rounded />
              </div>
            </td>
            <td class="text-center">
              <q-badge
                color="orange"
                label="High"
                class="q-px-sm q-py-xs rounded-borders text-weight-bold"
                style="font-size: 11px"
              />
            </td>
            <td class="text-grey-8 text-right" style="font-size: 13px">2024-06-30</td>
          </tr>
          <tr>
            <td class="text-weight-bold" style="font-size: 14px">Mobile Banking App</td>
            <td>
              <q-badge
                color="green-1"
                text-color="green"
                label="Active"
                class="q-px-sm q-py-xs text-weight-bold"
                style="font-size: 11px"
              />
            </td>
            <td>
              <div class="row items-center">
                <span class="q-mr-sm text-caption" style="font-size: 12px">40%</span>
                <q-linear-progress :value="0.4" color="orange" class="col" size="6px" rounded />
              </div>
            </td>
            <td class="text-center">
              <q-badge
                color="red"
                label="Critical"
                class="q-px-sm q-py-xs rounded-borders text-weight-bold"
                style="font-size: 11px"
              />
            </td>
            <td class="text-grey-8 text-right" style="font-size: 13px">2024-08-15</td>
          </tr>
          <tr>
            <td class="text-weight-bold" style="font-size: 14px">Internal Analytics Dashboard</td>
            <td>
              <q-badge
                color="green-1"
                text-color="green"
                label="Active"
                class="q-px-sm q-py-xs text-weight-bold"
                style="font-size: 11px"
              />
            </td>
            <td>
              <div class="row items-center">
                <span class="q-mr-sm text-caption" style="font-size: 12px">85%</span>
                <q-linear-progress :value="0.85" color="green" class="col" size="6px" rounded />
              </div>
            </td>
            <td class="text-center">
              <q-badge
                color="blue"
                label="Medium"
                class="q-px-sm q-py-xs rounded-borders text-weight-bold"
                style="font-size: 11px"
              />
            </td>
            <td class="text-grey-8 text-right" style="font-size: 13px">2024-05-30</td>
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
