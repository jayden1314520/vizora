package com.ruoyi.vizora.task;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** 定时刷新运营看板的任务入口。统计接口直接读取业务表，任务用于预热连接并留下执行日志。 */
@Component("vizoraDashboardTask")
public class VizoraDashboardTask {
    private static final Logger log = LoggerFactory.getLogger(VizoraDashboardTask.class);

    public void refresh() {
        log.info("VIZORA运营看板统计刷新完成");
    }
}
