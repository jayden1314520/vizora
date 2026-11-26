<template><div class="app-container"><el-form :inline="true" :model="query"><el-form-item label="用户"><el-input v-model="query.keyword" clearable placeholder="邮箱、手机号或用户名" @keyup.enter="load"/></el-form-item><el-button type="primary" @click="load">搜索</el-button></el-form><el-table v-loading="loading" :data="rows" class="mt16"><el-table-column prop="userId" label="用户ID" width="90"/><el-table-column prop="userName" label="用户名"/><el-table-column prop="nickName" label="昵称"/><el-table-column prop="email" label="邮箱"/><el-table-column prop="phonenumber" label="手机号"/><el-table-column prop="status" label="状态"><template #default="s"><el-tag :type="s.row.status === '0' ? 'success' : 'danger'">{{ s.row.status === '0' ? '正常' : '停用' }}</el-tag></template></el-table-column><el-table-column prop="createTime" label="注册时间"/></el-table></div></template>
<script setup name="VizoraWebUser">
import { listUser } from '@/api/system/user'
const rows = ref([]), loading = ref(false), query = reactive({ userName: undefined, phonenumber: undefined, email: undefined, keyword: undefined })
async function load() { loading.value = true; try { const res = await listUser({ userName: query.keyword, phonenumber: query.keyword, email: query.keyword }); rows.value = res.rows || [] } finally { loading.value = false } }
load()
</script>
