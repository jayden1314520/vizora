package com.ruoyi.vizora.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.vizora.mapper.VizoraMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VizoraService
{
    private final VizoraMapper mapper;

    public VizoraService(VizoraMapper mapper)
    {
        this.mapper = mapper;
    }

    public List<Map<String, Object>> templates(Map<String, Object> query) { return mapper.selectTemplateList(query); }
    public Map<String, Object> template(Long id) { return mapper.selectTemplateById(id); }
    public List<Map<String, Object>> works(Long userId, String status) { return mapper.selectWorkList(userId, status); }
    public Map<String, Object> work(Long userId, Long workId) { return mapper.selectWorkById(workId, userId); }
    public List<Map<String, Object>> tasks(Long userId) { return mapper.selectCreationTaskList(userId); }
    public Map<String, Object> task(Long userId, Long taskId) { return mapper.selectCreationTask(taskId, userId); }
    public List<Map<String, Object>> creditRecords(Long userId, String type) { return mapper.selectCreditRecords(userId, type); }
    public List<Map<String, Object>> notifications(Long userId, String type) { return mapper.selectNotificationList(userId, type); }

    public Map<String, Object> creditAccount(Long userId)
    {
        mapper.ensureCreditAccount(userId);
        return mapper.selectCreditAccount(userId);
    }

    @Transactional
    public Map<String, Object> createTask(Long userId, String type, String prompt,
                                          String inputFileIds, String optionsJson)
    {
        long cost = switch (type) {
            case "shop" -> 120;
            case "text-video", "image-video" -> 60;
            default -> 20;
        };
        mapper.ensureCreditAccount(userId);
        if (mapper.deductCredits(userId, cost) == 0)
        {
            throw new ServiceException("算力不足");
        }
        Map<String, Object> task = new HashMap<>();
        task.put("userId", userId);
        task.put("taskType", type);
        task.put("prompt", prompt);
        task.put("inputFileIds", inputFileIds);
        task.put("optionsJson", optionsJson);
        task.put("creditCost", cost);
        task.put("status", "QUEUED");
        task.put("progress", 0);
        mapper.insertCreationTask(task);

        Map<String, Object> record = new HashMap<>();
        record.put("userId", userId);
        record.put("recordType", "CONSUME");
        record.put("amount", -cost);
        record.put("bizType", "CREATION_TASK");
        record.put("bizId", task.get("taskId"));
        record.put("title", "AI创作任务");
        record.put("detail", type);
        mapper.insertCreditRecord(record);
        return task;
    }

    @Transactional
    public int cancelTask(Long userId, Long taskId)
    {
        Map<String, Object> task = mapper.selectCreationTask(taskId, userId);
        if (task == null || !List.of("QUEUED", "PROCESSING").contains(String.valueOf(task.get("status"))))
        {
            throw new ServiceException("任务不存在或当前状态不可取消");
        }
        int updated = mapper.updateCreationTaskStatus(taskId, "CANCELLED", null, null, "用户取消");
        if (updated > 0)
        {
            long refund = ((Number) task.get("creditCost")).longValue();
            mapper.addCredits(userId, refund);
            Map<String, Object> record = new HashMap<>();
            record.put("userId", userId);
            record.put("recordType", "REFUND");
            record.put("amount", refund);
            record.put("bizType", "CREATION_TASK");
            record.put("bizId", taskId);
            record.put("title", "任务取消退还");
            record.put("detail", task.get("taskType"));
            mapper.insertCreditRecord(record);
        }
        return updated;
    }

    public int deleteWork(Long userId, Long workId) { return mapper.deleteWork(workId, userId); }
    public int readNotification(Long userId, Long id) { return mapper.markNotificationRead(userId, id); }
    public int readAllNotifications(Long userId) { return mapper.markAllNotificationsRead(userId); }

    public List<Map<String, Object>> adminWorks(Map<String, Object> query) { return mapper.selectAdminWorkList(query); }
    public int insertTemplate(Map<String, Object> template) { return mapper.insertTemplate(template); }
    public int updateTemplate(Map<String, Object> template) { return mapper.updateTemplate(template); }
    public int deleteTemplates(Long[] ids) { return mapper.deleteTemplates(ids); }
    public List<Map<String, Object>> modelConfigs(Map<String, Object> query) { return mapper.selectModelConfigs(query); }
    public int insertModelConfig(Map<String, Object> config) { return mapper.insertModelConfig(config); }
    public int updateModelConfig(Map<String, Object> config) { return mapper.updateModelConfig(config); }
    public int deleteModelConfigs(Long[] ids) { return mapper.deleteModelConfigs(ids); }
    public List<Map<String, Object>> creditPackages(Map<String, Object> query) { return mapper.selectCreditPackages(query); }
    public int insertCreditPackage(Map<String, Object> info) { return mapper.insertCreditPackage(info); }
    public int updateCreditPackage(Map<String, Object> info) { return mapper.updateCreditPackage(info); }
    public int deleteCreditPackages(Long[] ids) { return mapper.deleteCreditPackages(ids); }
    public List<Map<String, Object>> adminTasks(Map<String, Object> query) { return mapper.selectTaskAdminList(query); }
    public int moderateWork(Long workId, String status, String reason) { return mapper.updateWorkAuditStatus(workId, status, reason); }
}
