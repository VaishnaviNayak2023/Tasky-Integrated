<template>
  <q-card
    flat
    class="rounded-borders q-pa-sm shadow-1 flex column"
    style="border-radius: 8px; height: 100%"
  >
    <div class="row justify-between items-center q-mb-xs q-px-xs" style="flex: 0 0 auto">
      <div class="text-subtitle2 text-weight-bold" style="line-height: 1">Upcoming Deadlines</div>
      <q-btn
        flat
        no-caps
        dense
        label="View All"
        color="grey-8"
        class="bg-grey-2 q-px-xs"
        style="border-radius: 4px; font-size: 8px; min-height: unset; padding: 2px 4px"
      />
    </div>

    <div style="flex: 1 1 0; min-height: 0; position: relative">
      <q-list
        class="absolute-full flex column justify-around"
        style="overflow-y: auto; overflow-x: hidden"
      >
        <q-item class="q-pa-none">
          <q-item-section avatar top style="min-width: 32px; padding-right: 8px">
            <q-avatar size="28px" color="red-1" text-color="red" icon="warning" />
          </q-item-section>
          <q-item-section>
            <q-item-label
              class="text-weight-bold ellipsis"
              style="font-size: 13px; line-height: 1.2"
              >Chart Components</q-item-label
            >
            <q-item-label
              caption
              class="text-grey-7 ellipsis"
              style="font-size: 11px; line-height: 1.2"
              >Analytics Dash • 3d</q-item-label
            >
          </q-item-section>
          <q-item-section side top>
            <q-badge
              color="red"
              label="High"
              class="rounded-borders text-weight-bold"
              style="font-size: 11px; padding: 4px 6px"
            />
          </q-item-section>
        </q-item>

        <q-item class="q-pa-none">
          <q-item-section avatar top style="min-width: 32px; padding-right: 8px">
            <q-avatar size="28px" color="red-1" text-color="red" icon="warning" />
          </q-item-section>
          <q-item-section>
            <q-item-label
              class="text-weight-bold ellipsis"
              style="font-size: 13px; line-height: 1.2"
              >User Auth</q-item-label
            >
            <q-item-label
              caption
              class="text-grey-7 ellipsis"
              style="font-size: 11px; line-height: 1.2"
              >Banking App • 4d</q-item-label
            >
          </q-item-section>
          <q-item-section side top>
            <q-badge
              color="red"
              label="High"
              class="rounded-borders text-weight-bold"
              style="font-size: 11px; padding: 4px 6px"
            />
          </q-item-section>
        </q-item>

        <q-item class="q-pa-none">
          <q-item-section avatar top style="min-width: 32px; padding-right: 8px">
            <q-avatar size="28px" color="blue-1" text-color="blue" icon="info" />
          </q-item-section>
          <q-item-section>
            <q-item-label
              class="text-weight-bold ellipsis"
              style="font-size: 13px; line-height: 1.2"
              >Product Catalog</q-item-label
            >
            <q-item-label
              caption
              class="text-grey-7 ellipsis"
              style="font-size: 11px; line-height: 1.2"
              >E-Commerce • 12d</q-item-label
            >
          </q-item-section>
          <q-item-section side top>
            <q-badge
              color="blue"
              label="Med"
              class="rounded-borders text-weight-bold"
              style="font-size: 11px; padding: 4px 6px"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-card>
</template>
