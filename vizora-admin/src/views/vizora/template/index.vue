<template>
  <div class="app-container">
    <el-form ref="queryRef" :model="queryParams" :inline="true" v-show="showSearch">
      <el-form-item label="模板名称" prop="keyword">
        <el-input v-model="queryParams.keyword" placeholder="搜索名称或描述" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="创作类型" prop="category">
        <el-select v-model="queryParams.category" placeholder="全部类型" clearable style="width: 180px">
          <el-option v-for="item in categories" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 140px">
          <el-option label="草稿" value="DRAFT" /><el-option label="已发布" value="PUBLISHED" /><el-option label="已下线" value="OFFLINE" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"><el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['vizora:template:add']">新增模板</el-button></el-col>
      <el-col :span="1.5"><el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['vizora:template:edit']">修改</el-button></el-col>
      <el-col :span="1.5"><el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['vizora:template:remove']">删除</el-button></el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="rows" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="templateId" width="80" align="center" />
      <el-table-column label="模板名称" prop="title" min-width="180" show-overflow-tooltip />
      <el-table-column label="创作类型" prop="category" width="130">
        <template #default="scope"><el-tag effect="plain">{{ categoryLabel(scope.row.category) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="描述" prop="description" min-width="240" show-overflow-tooltip />
      <el-table-column label="使用次数" prop="useCount" width="100" align="center" />
      <el-table-column label="排序" prop="sortOrder" width="80" align="center" />
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template #default="scope"><el-tag :type="statusType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right" align="center">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['vizora:template:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['vizora:template:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog v-model="open" :title="title" width="680px" append-to-body>
      <el-form ref="templateRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="模板名称" prop="title"><el-input v-model="form.title" maxlength="100" show-word-limit /></el-form-item>
        <el-row :gutter="18">
          <el-col :span="12"><el-form-item label="创作类型" prop="category"><el-select v-model="form.category" style="width: 100%"><el-option v-for="item in categories" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="发布状态" prop="status"><el-select v-model="form.status" style="width: 100%"><el-option label="草稿" value="DRAFT" /><el-option label="已发布" value="PUBLISHED" /><el-option label="已下线" value="OFFLINE" /></el-select></el-form-item></el-col>
        </el-row>
        <el-form-item label="模板描述" prop="description"><el-input v-model="form.description" type="textarea" :rows="2" maxlength="500" show-word-limit /></el-form-item>
        <el-form-item label="提示词" prop="prompt"><el-input v-model="form.prompt" type="textarea" :rows="6" maxlength="2000" show-word-limit /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" :max="9999" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="open = false">取消</el-button><el-button type="primary" @click="submitForm">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup name="VizoraTemplate">
import { addTemplate, delTemplate, getTemplate, listTemplate, updateTemplate } from '@/api/vizora/template'

const { proxy } = getCurrentInstance()
const rows = ref([])
const loading = ref(false)
const showSearch = ref(true)
const open = ref(false)
const title = ref('')
const total = ref(0)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const categories = [
  { label: 'AI 探店', value: 'shop' }, { label: '文生图', value: 'text-image' },
  { label: '图生图', value: 'image-image' }, { label: '文生视频', value: 'text-video' },
  { label: '图生视频', value: 'image-video' }
]
const data = reactive({
  queryParams: { pageNum: 1, pageSize: 10, keyword: undefined, category: undefined, status: undefined },
  form: {},
  rules: {
    title: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
    category: [{ required: true, message: '请选择创作类型', trigger: 'change' }],
    status: [{ required: true, message: '请选择发布状态', trigger: 'change' }],
    prompt: [{ required: true, message: '请输入提示词', trigger: 'blur' }]
  }
})
const { queryParams, form, rules } = toRefs(data)

const categoryLabel = value => categories.find(item => item.value === value)?.label || value
const statusLabel = value => ({ DRAFT: '草稿', PUBLISHED: '已发布', OFFLINE: '已下线' }[value] || value)
const statusType = value => ({ DRAFT: 'info', PUBLISHED: 'success', OFFLINE: 'warning' }[value] || 'info')

async function getList() { loading.value = true; try { const res = await listTemplate(queryParams.value); rows.value = res.rows; total.value = res.total } finally { loading.value = false } }
function handleQuery() { queryParams.value.pageNum = 1; getList() }
function resetQuery() { proxy.resetForm('queryRef'); handleQuery() }
function reset() { form.value = { templateId: undefined, title: '', category: 'text-image', description: '', prompt: '', sortOrder: 0, status: 'DRAFT' }; proxy.resetForm('templateRef') }
function handleAdd() { reset(); title.value = '新增灵感模板'; open.value = true }
async function handleUpdate(row) { reset(); const id = row?.templateId || ids.value[0]; const res = await getTemplate(id); form.value = res.data; title.value = '修改灵感模板'; open.value = true }
function handleSelectionChange(selection) { ids.value = selection.map(item => item.templateId); single.value = selection.length !== 1; multiple.value = !selection.length }
function submitForm() { proxy.$refs.templateRef.validate(async valid => { if (!valid) return; form.value.templateId ? await updateTemplate(form.value) : await addTemplate(form.value); proxy.$modal.msgSuccess('保存成功'); open.value = false; getList() }) }
async function handleDelete(row) { const target = row?.templateId || ids.value; await proxy.$modal.confirm(`确认删除模板 ${target} 吗？`); await delTemplate(target); proxy.$modal.msgSuccess('删除成功'); getList() }

getList()
</script>
