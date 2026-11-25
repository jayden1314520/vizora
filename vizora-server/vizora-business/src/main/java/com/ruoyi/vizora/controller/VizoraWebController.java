package com.ruoyi.vizora.controller;

import java.util.HashMap;
import java.util.Map;
import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.vizora.mapper.VizoraMapper;
import com.ruoyi.vizora.service.QiniuStorageService;
import com.ruoyi.vizora.service.VizoraService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api")
public class VizoraWebController extends BaseController
{
    private final VizoraService service;
    private final QiniuStorageService storageService;
    private final VizoraMapper mapper;

    public VizoraWebController(VizoraService service, QiniuStorageService storageService, VizoraMapper mapper)
    {
        this.service = service;
        this.storageService = storageService;
        this.mapper = mapper;
    }

    @Anonymous
    @GetMapping("/templates")
    public AjaxResult templates(@RequestParam(required = false) String category,
                                @RequestParam(required = false) String keyword)
    {
        Map<String, Object> query = new HashMap<>();
        query.put("category", category);
        query.put("keyword", keyword);
        query.put("status", "PUBLISHED");
        return success(service.templates(query));
    }

    @Anonymous
    @GetMapping("/templates/{id}")
    public AjaxResult template(@PathVariable Long id)
    {
        return success(service.template(id));
    }

    @PostMapping("/files/upload-token")
    public AjaxResult uploadToken(@Valid @RequestBody UploadTokenRequest request)
    {
        return success(storageService.createUploadToken(getUserId(), request.originalName(), request.mimeType(),
                request.fileSize(), request.usage(), request.publicAsset()));
    }

    @Anonymous
    @PostMapping("/files/qiniu/callback")
    public AjaxResult qiniuCallback(HttpServletRequest request, @RequestBody String body)
    {
        String callbackUrl = request.getRequestURL().toString();
        String contentType = request.getContentType() == null ? "application/json" : request.getContentType();
        return success(storageService.confirmCallback(request.getHeader("Authorization"), callbackUrl, contentType, body));
    }

    @GetMapping("/files/{fileId}")
    public AjaxResult file(@PathVariable Long fileId,
                           @RequestParam(defaultValue = "1800") long expiresSeconds)
    {
        Map<String, Object> file = mapper.selectFileById(fileId, getUserId());
        if (file == null)
        {
            return error("文件不存在");
        }
        file.put("url", storageService.buildAccessUrl(file, expiresSeconds));
        return success(file);
    }

    @DeleteMapping("/files/{fileId}")
    public AjaxResult deleteFile(@PathVariable Long fileId)
    {
        return toAjax(mapper.deleteFile(fileId, getUserId()));
    }

    @GetMapping("/works")
    public AjaxResult works(@RequestParam(required = false) String status)
    {
        return success(service.works(getUserId(), status));
    }

    @GetMapping("/works/{workId}")
    public AjaxResult work(@PathVariable Long workId)
    {
        Map<String, Object> work = service.work(getUserId(), workId);
        return work == null ? error("作品不存在") : success(work);
    }

    @DeleteMapping("/works/{workId}")
    public AjaxResult deleteWork(@PathVariable Long workId)
    {
        return toAjax(service.deleteWork(getUserId(), workId));
    }

    @PostMapping("/creation/tasks")
    public AjaxResult createTask(@Valid @RequestBody CreationTaskRequest request)
    {
        return success(service.createTask(getUserId(), request.type(), request.prompt(),
                request.inputFileIds(), request.optionsJson()));
    }

    @GetMapping("/creation/tasks")
    public AjaxResult tasks()
    {
        return success(service.tasks(getUserId()));
    }

    @GetMapping("/creation/tasks/{taskId}")
    public AjaxResult task(@PathVariable Long taskId)
    {
        Map<String, Object> task = service.task(getUserId(), taskId);
        return task == null ? error("任务不存在") : success(task);
    }

    @PostMapping("/creation/tasks/{taskId}/cancel")
    public AjaxResult cancelTask(@PathVariable Long taskId)
    {
        return toAjax(service.cancelTask(getUserId(), taskId));
    }

    @GetMapping("/credits/account")
    public AjaxResult creditAccount()
    {
        return success(service.creditAccount(getUserId()));
    }

    @GetMapping("/credits/records")
    public AjaxResult creditRecords(@RequestParam(required = false) String type)
    {
        return success(service.creditRecords(getUserId(), type));
    }

    @GetMapping("/notifications")
    public AjaxResult notifications(@RequestParam(required = false) String type)
    {
        return success(service.notifications(getUserId(), type));
    }

    @PostMapping("/notifications/{notificationId}/read")
    public AjaxResult readNotification(@PathVariable Long notificationId)
    {
        return toAjax(service.readNotification(getUserId(), notificationId));
    }

    @PostMapping("/notifications/read-all")
    public AjaxResult readAllNotifications()
    {
        service.readAllNotifications(getUserId());
        return success();
    }

    public record UploadTokenRequest(
            @NotBlank @Size(max = 255) String originalName,
            @NotBlank @Size(max = 100) String mimeType,
            @Positive long fileSize,
            @Size(max = 30) String usage,
            boolean publicAsset) { }

    public record CreationTaskRequest(
            @NotBlank @Size(max = 30) String type,
            @NotBlank @Size(max = 2000) String prompt,
            @Size(max = 1000) String inputFileIds,
            @Size(max = 5000) String optionsJson) { }
}
