<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          门票自助打印系统
        </q-toolbar-title>

        <q-tabs v-model="currentTab" align="right">
          <q-route-tab
            name="self-print"
            to="/self-print"
            label="自助打印"
            icon="print"
          />
          <q-route-tab
            name="admin-query"
            to="/admin-query"
            label="管理查询"
            icon="search"
          />
        </q-tabs>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const route = useRoute()
    const currentTab = ref('self-print')

    return {
      currentTab
    }
  }
})
</script>

