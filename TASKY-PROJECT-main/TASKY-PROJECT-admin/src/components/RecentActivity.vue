<template>
  <q-card
    flat
    class="rounded-borders q-pa-sm shadow-1 flex column"
    style="border-radius: 8px; height: 100%"
  >
    <div class="row justify-between items-center q-mb-xs" style="flex: 0 0 auto">
      <div class="text-caption text-weight-bold" style="line-height: 1">Recent Activity</div>
      <q-btn
        flat
        no-caps
        dense
        label="All"
        color="grey-8"
        class="bg-grey-2 q-px-xs"
        style="border-radius: 4px; font-size: 8px; min-height: 12px; padding: 2px 4px"
      />
    </div>
    <div style="flex: 1 1 0; min-height: 0; position: relative">
      <q-list dense class="absolute-full flex column justify-around" style="overflow: hidden">
        <q-item class="q-pa-none">
          <q-item-section avatar top style="min-width: 24px; padding-right: 6px">
            <q-avatar size="22px"><img src="https://cdn.quasar.dev/img/avatar1.jpg" /></q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold" style="font-size: 11px; line-height: 1.1"
              >Sarah Johnson</q-item-label
            >
            <q-item-label caption class="text-grey-7" style="font-size: 9px; line-height: 1.1"
              >Completed "Design"</q-item-label
            >
          </q-item-section>
        </q-item>
        <q-item class="q-pa-none">
          <q-item-section avatar top style="min-width: 24px; padding-right: 6px">
            <q-avatar size="22px"><img src="https://cdn.quasar.dev/img/avatar2.jpg" /></q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold" style="font-size: 11px; line-height: 1.1"
              >Michael Chen</q-item-label
            >
            <q-item-label caption class="text-grey-7" style="font-size: 9px; line-height: 1.1"
              >Updated task</q-item-label
            >
          </q-item-section>
        </q-item>
        <q-item class="q-pa-none">
          <q-item-section avatar top style="min-width: 24px; padding-right: 6px">
            <q-avatar size="22px"><img src="https://cdn.quasar.dev/img/avatar3.jpg" /></q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold" style="font-size: 11px; line-height: 1.1"
              >Emily Davis</q-item-label
            >
            <q-item-label caption class="text-grey-7" style="font-size: 9px; line-height: 1.1"
              >Created new task</q-item-label
            >
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-card>
</template>
