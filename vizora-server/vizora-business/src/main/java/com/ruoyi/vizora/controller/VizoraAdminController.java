package com.ruoyi.vizora.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.vizora.service.VizoraService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vizora")
public class VizoraAdminController extends BaseController
{
    private final VizoraService service;

    public VizoraAdminController(VizoraService service)
    {
        this.service = service;
    }

    @PreAuthorize("@ss.hasPermi('vizora:template:list')")
    @GetMapping("/template/list")
    public TableDataInfo templateList(@RequestParam(required = false) String category,
                                      @RequestParam(required = false) String status,
                                      @RequestParam(required = false) String keyword)
    {
        startPage();
        Map<String, Object> query = new HashMap<>();
        query.put("category", category);
        query.put("status", status);
        query.put("keyword", keyword);
        return getDataTable(service.templates(query));
    }

    @PreAuthorize("@ss.hasPermi('vizora:template:query')")
    @GetMapping("/template/{id}")
    public AjaxResult template(@PathVariable Long id) { return success(service.template(id)); }

    @PreAuthorize("@ss.hasPermi('vizora:template:add')")
    @Log(title = "灵感模板", businessType = BusinessType.INSERT)
    @PostMapping("/template")
    public AjaxResult addTemplate(@RequestBody Map<String, Object> template)
    {
        template.put("createBy", getUsername());
        return toAjax(service.insertTemplate(template));
    }

    @PreAuthorize("@ss.hasPermi('vizora:template:edit')")
    @Log(title = "灵感模板", businessType = BusinessType.UPDATE)
    @PutMapping("/template")
    public AjaxResult updateTemplate(@RequestBody Map<String, Object> template)
    {
        template.put("updateBy", getUsername());
        return toAjax(service.updateTemplate(template));
    }

    @PreAuthorize("@ss.hasPermi('vizora:template:remove')")
    @Log(title = "灵感模板", businessType = BusinessType.DELETE)
    @DeleteMapping("/template/{ids}")
    public AjaxResult deleteTemplates(@PathVariable Long[] ids) { return toAjax(service.deleteTemplates(ids)); }

    @PreAuthorize("@ss.hasPermi('vizora:work:list')")
    @GetMapping("/work/list")
    public TableDataInfo workList(@RequestParam(required = false) String status,
                                  @RequestParam(required = false) String keyword,
                                  @RequestParam(required = false) Long userId)
    {
        startPage();
        Map<String, Object> query = new HashMap<>();
        query.put("status", status);
        query.put("keyword", keyword);
        query.put("userId", userId);
        List<Map<String, Object>> list = service.adminWorks(query);
        return getDataTable(list);
    }

    @PreAuthorize("@ss.hasPermi('vizora:work:audit')")
    @Log(title = "作品审核", businessType = BusinessType.UPDATE)
    @PutMapping("/work/{workId}/status")
    public AjaxResult moderateWork(@PathVariable Long workId, @RequestBody Map<String, String> body)
    {
        return toAjax(service.moderateWork(workId, body.get("status"), body.get("reason")));
    }

    @PreAuthorize("@ss.hasPermi('vizora:task:list')") @GetMapping("/task/list")
    public TableDataInfo taskList(@RequestParam(required = false) String status, @RequestParam(required = false) String keyword) { startPage(); Map<String,Object> q=new HashMap<>(); q.put("status", status); q.put("keyword", keyword); return getDataTable(service.adminTasks(q)); }
    @PreAuthorize("@ss.hasPermi('vizora:model:list')") @GetMapping("/model/list")
    public TableDataInfo modelList(@RequestParam(required = false) String keyword) { startPage(); Map<String,Object> q=new HashMap<>(); q.put("keyword", keyword); return getDataTable(service.modelConfigs(q)); }
    @PreAuthorize("@ss.hasPermi('vizora:model:add')") @PostMapping("/model")
    public AjaxResult addModel(@RequestBody Map<String,Object> body) { body.put("createBy", getUsername()); return toAjax(service.insertModelConfig(body)); }
    @PreAuthorize("@ss.hasPermi('vizora:model:edit')") @PutMapping("/model")
    public AjaxResult editModel(@RequestBody Map<String,Object> body) { body.put("updateBy", getUsername()); return toAjax(service.updateModelConfig(body)); }
    @PreAuthorize("@ss.hasPermi('vizora:model:remove')") @DeleteMapping("/model/{ids}")
    public AjaxResult removeModel(@PathVariable Long[] ids) { return toAjax(service.deleteModelConfigs(ids)); }
    @PreAuthorize("@ss.hasPermi('vizora:package:list')") @GetMapping("/package/list")
    public TableDataInfo packageList() { startPage(); return getDataTable(service.creditPackages(new HashMap<>())); }
    @PreAuthorize("@ss.hasPermi('vizora:package:add')") @PostMapping("/package")
    public AjaxResult addPackage(@RequestBody Map<String,Object> body) { body.put("createBy", getUsername()); return toAjax(service.insertCreditPackage(body)); }
    @PreAuthorize("@ss.hasPermi('vizora:package:edit')") @PutMapping("/package")
    public AjaxResult editPackage(@RequestBody Map<String,Object> body) { body.put("updateBy", getUsername()); return toAjax(service.updateCreditPackage(body)); }
    @PreAuthorize("@ss.hasPermi('vizora:package:remove')") @DeleteMapping("/package/{ids}")
    public AjaxResult removePackage(@PathVariable Long[] ids) { return toAjax(service.deleteCreditPackages(ids)); }
}
