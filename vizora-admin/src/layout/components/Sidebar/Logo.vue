<template>
  <div class="sidebar-logo-container" :class="{ 'collapse': collapse }">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <span v-if="logo" class="sidebar-logo-mark"><span /></span>
        <h1 v-else class="sidebar-title">{{ title }}</h1>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <span class="sidebar-logo-mark"><span /></span>
        <h1 class="sidebar-title">VIZORA <small>中台</small></h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup>
const logo = true
import useSettingsStore from '@/store/modules/settings'
import variables from '@/assets/styles/variables.module.scss'

defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
})

const title = import.meta.env.VITE_APP_TITLE
const settingsStore = useSettingsStore()
const sideTheme = computed(() => settingsStore.sideTheme)

// 获取Logo背景色
const getLogoBackground = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-bg)'
  }
  if (settingsStore.navType == 3) {
    return variables.menuLightBg
  }
  return sideTheme.value === 'theme-dark' ? variables.menuBg : variables.menuLightBg
})

// 获取Logo文字颜色
const getLogoTextColor = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-logo-text)'
  }
  if (settingsStore.navType == 3) {
    return variables.menuLightText
  }
  return sideTheme.value === 'theme-dark' ? '#fff' : variables.menuLightText
})
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  height: 50px;
  line-height: 50px;
  background: v-bind(getLogoBackground);
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .sidebar-logo-mark {
      display:inline-block;width:23px;height:23px;border:2px solid #6e8f09;border-radius:8px;position:relative;overflow:hidden;
      vertical-align: middle;
      margin-right: 8px;
      & span{display:block;width:7px;height:7px;border-radius:50%;background:#6e8f09;position:absolute;left:6px;top:6px;box-shadow:0 0 0 3px rgba(110,143,9,.18)}
      &:after{content:'';position:absolute;width:32px;height:2px;background:#6e8f09;left:-6px;top:10px;transform:rotate(-45deg);opacity:.9}
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: v-bind(getLogoTextColor);
      font-weight: 600;
      line-height: 50px;
      font-size: 16px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
      small{font-size:12px;color:#6e8f09;font-weight:500}
    }
  }

  &.collapse {
    .sidebar-logo-mark {
      margin-right: 0px;
    }
  }
}
</style>
