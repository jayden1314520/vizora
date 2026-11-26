<template>
  <div class="app-container">
    <el-form ref="queryRef" :model="queryParams" :inline="true" v-show="showSearch">
      <el-form-item label="作品名称" prop="keyword"><el-input v-model="queryParams.keyword" clearable placeholder="搜索作品名称" @keyup.enter="handleQuery" /></el-form-item>
      <el-form-item label="用户联系方式" prop="keyword"><el-input v-model="queryParams.keyword" clearable placeholder="作品名、手机号或邮箱" /></el-form-item>
      <el-form-item label="审核状态" prop="status">
        <el-select v-model="queryParams.status" clearable placeholder="全部状态" style="width: 150px">
          <el-option label="待审核" value="PENDING" /><el-option label="已通过" value="APPROVED" /><el-option label="已拒绝" value="REJECTED" />
        </el-select>
      </el-form-item>
      <el-form-item><el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button><el-button icon="Refresh" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-row class="mb8"><right-toolbar v-model:showSearch="showSearch" @queryTable="getList" /></el-row>
    <el-table v-loading="loading" :data="rows">
      <el-table-column label="作品ID" prop="workId" width="90" align="center" />
      <el-table-column label="作品名称" prop="title" min-width="180" show-overflow-tooltip />
      <el-table-column label="用户" min-width="150"><template #default="scope"><div>{{ scope.row.userName || '用户' }} <span class="muted">#{{ scope.row.userId }}</span></div></template></el-table-column>
      <el-table-column label="类型" prop="workType" width="120" />
      <el-table-column label="提示词" prop="prompt" min-width="260" show-overflow-tooltip />
      <el-table-column label="审核状态" prop="auditStatus" width="110" align="center"><template #default="scope"><el-tag :type="statusType(scope.row.auditStatus)">{{ statusLabel(scope.row.auditStatus) }}</el-tag></template></el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="170" />
      <el-table-column label="操作" width="170" fixed="right" align="center">
        <template #default="scope">
          <el-button link type="success" icon="CircleCheck" @click="openAudit(scope.row, 'APPROVED')" v-hasPermi="['vizora:work:audit']">通过</el-button>
          <el-button link type="danger" icon="CircleClose" @click="openAudit(scope.row, 'REJECTED')" v-hasPermi="['vizora:work:audit']">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog v-model="auditOpen" :title="auditForm.status === 'APPROVED' ? '通过作品' : '拒绝作品'" width="520px" append-to-body>
      <el-alert :title="auditForm.title" type="info" :closable="false" show-icon class="mb20" />
      <el-form label-width="80px"><el-form-item label="审核备注"><el-input v-model="auditForm.reason" type="textarea" :rows="4" maxlength="500" show-word-limit :placeholder="auditForm.status === 'REJECTED' ? '请填写拒绝原因' : '可填写审核备注'" /></el-form-item></el-form>
      <template #footer><el-button @click="auditOpen = false">取消</el-button><el-button :type="auditForm.status === 'APPROVED' ? 'success' : 'danger'" @click="submitAudit">确认{{ auditForm.status === 'APPROVED' ? '通过' : '拒绝' }}</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup name="VizoraWork">
import { listWork, moderateWork } from '@/api/vizora/work'
const { proxy } = getCurrentInstance()
const rows = ref([])
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const auditOpen = ref(false)
const auditForm = reactive({ workId: undefined, title: '', status: 'APPROVED', reason: '' })
const queryParams = reactive({ pageNum: 1, pageSize: 10, keyword: undefined, userId: undefined, status: 'PENDING' })
const statusLabel = value => ({ PENDING: '待审核', APPROVED: '已通过', REJECTED: '已拒绝' }[value] || value)
const statusType = value => ({ PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' }[value] || 'info')

async function getList() { loading.value = true; try { const res = await listWork(queryParams); rows.value = res.rows; total.value = res.total } finally { loading.value = false } }
function handleQuery() { queryParams.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); queryParams.status = 'PENDING'; handleQuery() }
function openAudit(row, status) { Object.assign(auditForm, { workId: row.workId, title: row.title, status, reason: '' }); auditOpen.value = true }
async function submitAudit() { if (auditForm.status === 'REJECTED' && !auditForm.reason.trim()) return proxy.$modal.msgWarning('请填写拒绝原因'); await moderateWork(auditForm.workId, { status: auditForm.status, reason: auditForm.reason }); proxy.$modal.msgSuccess('审核结果已保存'); auditOpen.value = false; getList() }

getList()
</script>

<style scoped>.muted{color:var(--el-text-color-secondary);font-size:12px}.mb20{margin-bottom:20px}</style>
