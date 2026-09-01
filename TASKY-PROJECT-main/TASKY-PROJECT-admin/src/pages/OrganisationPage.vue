<template>
  <q-page
    class="q-pa-md text-black"
    style="
      height: 100vh;
      max-height: 100vh;
      min-height: 0 !important;
      display: flex;
      flex-direction: column;
      background-color: #f8f9fa;
    "
  >
    <!-- Header -->
    <div class="row items-start justify-between q-mb-md" style="flex: 0 0 auto">
      <div class="row items-center">
        <q-avatar
          color="indigo-1"
          text-color="indigo"
          icon="domain"
          size="48px"
          class="q-mr-md"
          style="border-radius: 12px"
        />
        <div class="column">
          <div class="text-h5 text-weight-bold">
            {{ orgStore.org?.name || 'Organisation Structure' }}
          </div>
          <div class="text-grey-7 text-caption">Manage your team members and roles</div>
        </div>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn
          unelevated
          color="indigo"
          icon="add"
          label="Invite Member"
          no-caps
          class="rounded-borders"
          @click="showInviteDialog = true"
        />
      </div>
    </div>

    <!-- Main Content -->
    <div
      class="bg-white q-pa-md shadow-1"
      style="border-radius: 12px; flex: 1 1 0; overflow-y: auto"
    >
      <div v-if="orgStore.loading" class="flex flex-center q-pa-xl">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <div v-else-if="orgStore.members.length > 0">
        <!-- Display invite code if active -->
        <div class="col-12" v-if="orgStore.activeInviteCode">
          <q-banner rounded class="bg-indigo-1 text-indigo q-mb-md">
            <template v-slot:avatar>
              <q-icon name="link" />
            </template>
            Active Invite Code:
            <span class="text-weight-bold text-h6">{{ orgStore.activeInviteCode.code }}</span>
            <div class="text-caption">
              Expires in
              {{
                orgStore.activeInviteCode.expires_at
                  ? new Date(orgStore.activeInviteCode.expires_at).toLocaleDateString()
                  : 'N/A'
              }}
            </div>
            <template v-slot:action>
              <q-btn
                flat
                color="indigo"
                label="Deactivate"
                @click="deactivateInvite(orgStore.activeInviteCode.id)"
              />
            </template>
          </q-banner>
        </div>

        <!-- Complete Member Directory Grid -->
        <div class="text-h6 text-weight-bold q-mb-md q-mt-md">Complete Organization Directory</div>
        <div class="row q-col-gutter-md">
          <div
            v-for="member in orgStore.members"
            :key="member.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card
              flat
              bordered
              class="q-pa-sm cursor-pointer hover:bg-grey-1"
              @click="viewMemberDetails(member)"
            >
              <div class="row items-center q-gutter-sm">
                <q-avatar size="48px" color="indigo-1" text-color="indigo">
                  <img v-if="member.avatar_url" :src="member.avatar_url" />
                  <span v-else
                    >{{ member.first_name?.charAt(0) }}{{ member.last_name?.charAt(0) }}</span
                  >
                </q-avatar>
                <div class="column" style="flex: 1">
                  <div class="text-weight-bold text-grey-9">
                    {{ member.first_name }} {{ member.last_name }}
                  </div>
                  <div class="text-caption text-grey-7">{{ member.employee_code }}</div>
                  <div class="text-caption text-grey-6">{{ member.email }}</div>
                </div>
              </div>
              <div class="row items-center justify-between q-mt-sm">
                <q-badge
                  :color="member.role_name === 'Project Manager' ? 'orange-1' : 'blue-1'"
                  :text-color="member.role_name === 'Project Manager' ? 'orange' : 'blue'"
                  :label="member.role_name || 'Employee'"
                  class="q-px-sm"
                />
                <div class="text-caption text-grey-6">
                  {{ member.professional_role || 'No role' }}
                </div>
              </div>
            </q-card>
          </div>
        </div>

        <!-- Role-based Grouping -->
        <div class="text-h6 text-weight-bold q-mb-md q-mt-lg">By Role</div>
        <div class="row q-col-gutter-md">
          <div
            v-for="(members, role) in groupedMembers"
            :key="role"
            class="col-12 col-md-6 col-lg-4"
          >
            <q-card flat bordered class="full-height">
              <q-card-section class="bg-grey-1 row items-center justify-between">
                <div class="text-subtitle1 text-weight-bold text-capitalize">
                  {{ role || 'Unassigned' }}
                </div>
                <q-badge color="primary" :label="`${members.length} members`" />
              </q-card-section>

              <q-card-section>
                <q-list separator dense>
                  <q-item v-for="member in members" :key="member.id" class="q-px-none">
                    <q-item-section avatar>
                      <q-avatar size="32px" color="grey-3" text-color="grey-8">
                        {{ member.first_name?.charAt(0) }}{{ member.last_name?.charAt(0) }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium text-grey-9"
                        >{{ member.first_name }} {{ member.last_name }}</q-item-label
                      >
                      <q-item-label caption class="text-grey-6">{{ member.email }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-badge
                        :color="member.role_name === 'Project Manager' ? 'orange-1' : 'grey-2'"
                        :text-color="member.role_name === 'Project Manager' ? 'orange' : 'grey-7'"
                        :label="member.role_name === 'Project Manager' ? 'Manager' : 'Employee'"
                        class="q-px-sm"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-center full-height text-grey-6 text-subtitle1 column">
        <q-icon name="domain_disabled" size="64px" color="grey-4" class="q-mb-md" />
        No members found. Invite some to get started.
      </div>
    </div>

    <!-- Invite Member Dialog -->
    <q-dialog v-model="showInviteDialog">
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section>
          <div class="text-h6 text-weight-bold">
            <q-icon name="person_add" class="q-mr-sm" color="indigo" />
            Invite Team Member
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="!inviteCodeGenerated">
            <q-input
              v-model="inviteEmail"
              label="Email Address (Optional)"
              outlined
              hint="Leave empty to generate a shareable invite link"
              class="q-mb-md"
            />
            <q-select
              v-model="inviteRole"
              label="Role"
              :options="['Employee', 'Project Manager']"
              outlined
              class="q-mb-md"
            />
            <q-input
              v-model="inviteMaxUses"
              label="Max Uses"
              type="number"
              outlined
              hint="Maximum number of times this invite can be used"
              class="q-mb-md"
            />
          </div>

          <div v-else class="column items-center q-gutter-md">
            <div class="text-subtitle1 text-weight-bold text-indigo">
              <q-icon name="check_circle" class="q-mr-sm" />
              Invite Code Generated!
            </div>
            <q-card flat bordered class="q-pa-md full-width bg-indigo-1">
              <div class="text-h6 text-center text-indigo-9 q-mb-sm">{{ generatedInviteCode }}</div>
              <div class="text-caption text-center text-grey-7">
                Invite Link:
                <a :href="inviteLink" target="_blank" class="text-indigo">{{ inviteLink }}</a>
              </div>
            </q-card>
            <div class="row q-gutter-sm q-mt-md">
              <q-btn
                unelevated
                color="green"
                icon="whatsapp"
                label="Share via WhatsApp"
                @click="shareViaWhatsApp"
                no-caps
              />
              <q-btn
                unelevated
                color="indigo"
                icon="content_copy"
                label="Copy Link"
                @click="copyInviteLink"
                no-caps
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup @click="resetInviteForm" />
          <q-btn
            v-if="!inviteCodeGenerated"
            unelevated
            color="indigo"
            label="Generate Invite"
            @click="generateInviteCode"
            :loading="generatingInvite"
          />
          <q-btn
            v-else
            unelevated
            color="indigo"
            label="Generate Another"
            @click="resetInviteForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useOrgStore } from '../stores/orgStore';

const orgStore = useOrgStore();
const $q = useQuasar();

const showInviteDialog = ref(false);
const inviteEmail = ref('');
const inviteRole = ref('Employee');
const inviteMaxUses = ref(50);
const inviteCodeGenerated = ref(false);
const generatedInviteCode = ref('');
const generatingInvite = ref(false);

const inviteLink = computed(() => {
  if (!generatedInviteCode.value) return '';
  return `http://localhost:9007/auth/register?invite=${generatedInviteCode.value}`;
});

onMounted(async () => {
  await orgStore.fetchOrgDetails();
  await orgStore.fetchMembers();
});

const groupedMembers = computed(() => {
  const groups: Record<string, any[]> = {};
  orgStore.members.forEach((member: any) => {
    let role = member.professional_role || 'Unassigned';

    // Explicitly separate Project Managers from other roles
    if (member.role_name === 'Project Manager') {
      role = 'Project Manager';
    }

    if (!groups[role]) {
      groups[role] = [];
    }
    groups[role]!.push(member);
  });
  return groups;
});

const deactivateInvite = async (id: string) => {
  await orgStore.deactivateInviteCode(id);
};

const viewMemberDetails = (member: any) => {
  console.log('View member details:', member);
  // Could open a dialog or navigate to a detailed view
};

const generateInviteCode = async () => {
  generatingInvite.value = true;
  try {
    const code = await orgStore.generateInviteCode(inviteMaxUses.value, 30);
    generatedInviteCode.value = code.code;
    inviteCodeGenerated.value = true;
    $q.notify({
      type: 'positive',
      message: 'Invite code generated successfully!',
    });
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to generate invite code',
    });
  } finally {
    generatingInvite.value = false;
  }
};

const shareViaWhatsApp = () => {
  const message = `You're invited to join our organization! Use this invite code: ${generatedInviteCode.value}\n\nOr click here to register: ${inviteLink.value}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};

const copyInviteLink = () => {
  navigator.clipboard.writeText(inviteLink.value);
  $q.notify({
    type: 'positive',
    message: 'Invite link copied to clipboard!',
  });
};

const resetInviteForm = () => {
  inviteEmail.value = '';
  inviteRole.value = 'Employee';
  inviteMaxUses.value = 50;
  inviteCodeGenerated.value = false;
  generatedInviteCode.value = '';
};
</script>
