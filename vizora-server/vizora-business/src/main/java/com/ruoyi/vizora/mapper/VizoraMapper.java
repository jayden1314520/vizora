package com.ruoyi.vizora.mapper;

import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Param;

public interface VizoraMapper
{
    int insertPendingFile(Map<String, Object> file);
    Map<String, Object> selectFileById(@Param("fileId") Long fileId, @Param("userId") Long userId);
    Map<String, Object> selectFileByKey(@Param("objectKey") String objectKey);
    int confirmFile(Map<String, Object> file);
    int deleteFile(@Param("fileId") Long fileId, @Param("userId") Long userId);

    List<Map<String, Object>> selectTemplateList(Map<String, Object> query);
    Map<String, Object> selectTemplateById(Long templateId);
    int insertTemplate(Map<String, Object> template);
    int updateTemplate(Map<String, Object> template);
    int deleteTemplates(Long[] templateIds);
    List<Map<String, Object>> selectModelConfigs(Map<String, Object> query);
    int insertModelConfig(Map<String, Object> config);
    int updateModelConfig(Map<String, Object> config);
    int deleteModelConfigs(Long[] configIds);
    List<Map<String, Object>> selectCreditPackages(Map<String, Object> query);
    int insertCreditPackage(Map<String, Object> packageInfo);
    int updateCreditPackage(Map<String, Object> packageInfo);
    int deleteCreditPackages(Long[] packageIds);
    List<Map<String, Object>> selectTaskAdminList(Map<String, Object> query);

    List<Map<String, Object>> selectWorkList(@Param("userId") Long userId, @Param("status") String status);
    List<Map<String, Object>> selectAdminWorkList(Map<String, Object> query);
    Map<String, Object> selectWorkById(@Param("workId") Long workId, @Param("userId") Long userId);
    int insertWork(Map<String, Object> work);
    int updateWorkStatus(@Param("workId") Long workId, @Param("status") String status,
                         @Param("outputFileId") Long outputFileId, @Param("failureReason") String failureReason);
    int updateWorkAuditStatus(@Param("workId") Long workId, @Param("auditStatus") String auditStatus,
                              @Param("auditReason") String auditReason);
    int deleteWork(@Param("workId") Long workId, @Param("userId") Long userId);

    int insertCreationTask(Map<String, Object> task);
    Map<String, Object> selectCreationTask(@Param("taskId") Long taskId, @Param("userId") Long userId);
    List<Map<String, Object>> selectCreationTaskList(@Param("userId") Long userId);
    int updateCreationTaskStatus(@Param("taskId") Long taskId, @Param("status") String status,
                                 @Param("progress") Integer progress, @Param("workId") Long workId,
                                 @Param("failureReason") String failureReason);

    int ensureCreditAccount(Long userId);
    Map<String, Object> selectCreditAccount(Long userId);
    int deductCredits(@Param("userId") Long userId, @Param("amount") Long amount);
    int addCredits(@Param("userId") Long userId, @Param("amount") Long amount);
    int insertCreditRecord(Map<String, Object> record);
    List<Map<String, Object>> selectCreditRecords(@Param("userId") Long userId, @Param("type") String type);

    List<Map<String, Object>> selectNotificationList(@Param("userId") Long userId, @Param("type") String type);
    int markNotificationRead(@Param("userId") Long userId, @Param("notificationId") Long notificationId);
    int markAllNotificationsRead(Long userId);
}
