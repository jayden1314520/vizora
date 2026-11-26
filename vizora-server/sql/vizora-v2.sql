-- VIZORA 运营扩展迁移，可重复执行
USE vizora;
INSERT IGNORE INTO sys_config (config_name, config_key, config_value, config_type, create_by, remark) VALUES
('七牛 Access Key', 'vizora.qiniu.access-key', '', 'Y', 'admin', '七牛云 Kodo Access Key'),
('七牛 Secret Key', 'vizora.qiniu.secret-key', '', 'Y', 'admin', '七牛云 Kodo Secret Key'),
('七牛公开空间', 'vizora.qiniu.public-bucket', 'vizora-public', 'Y', 'admin', '公开素材空间'),
('七牛私有空间', 'vizora.qiniu.private-bucket', 'vizora-private', 'Y', 'admin', '私有素材空间'),
('七牛公开域名', 'vizora.qiniu.public-domain', '', 'Y', 'admin', '公开访问域名'),
('七牛私有域名', 'vizora.qiniu.private-domain', '', 'Y', 'admin', '私有访问域名'),
('默认大模型', 'vizora.ai.default-model', '', 'Y', 'admin', '默认生成模型');
INSERT IGNORE INTO sys_menu VALUES (3003, '生成记录', 3000, 3, 'task', 'vizora/task/index', '', '', 1, 0, 'C', '0', '0', 'vizora:task:list', 'log', 'admin', NOW(), '', NULL, '全部 AI 生成任务');
INSERT IGNORE INTO sys_menu VALUES (3004, '大模型配置', 3000, 4, 'model', 'vizora/model/index', '', '', 1, 0, 'C', '0', '0', 'vizora:model:list', 'edit', 'admin', NOW(), '', NULL, '模型供应商与路由');
INSERT IGNORE INTO sys_menu VALUES (3005, '购买配置', 3000, 5, 'package', 'vizora/package/index', '', '', 1, 0, 'C', '0', '0', 'vizora:package:list', 'money', 'admin', NOW(), '', NULL, '算力购买套餐');
INSERT IGNORE INTO sys_role_menu (role_id, menu_id) VALUES (1, 3003), (1, 3004), (1, 3005);
INSERT IGNORE INTO sys_menu VALUES (3006, '用户管理', 3000, 6, 'user', 'system/user/index', '', '', 1, 0, 'C', '0', '0', 'system:user:list', 'user', 'admin', NOW(), '', NULL, 'Web 端用户与资产');
INSERT IGNORE INTO sys_role_menu (role_id, menu_id) VALUES (1, 3006);
INSERT IGNORE INTO sys_dict_type (dict_name, dict_type, status, create_by, create_time, remark) VALUES ('AI任务类型', 'vizora_task_type', '0', 'admin', NOW(), '模型支持的生成任务类型');
INSERT IGNORE INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, list_class, is_default, status, create_by, create_time, remark)
SELECT 1, '文生图', 'text-image', 'vizora_task_type', 'primary', 'Y', '0', 'admin', NOW(), '文本生成图片' WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='vizora_task_type' AND dict_value='text-image');
INSERT IGNORE INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, list_class, is_default, status, create_by, create_time, remark)
SELECT 2, '图生图', 'image-image', 'vizora_task_type', 'success', 'N', '0', 'admin', NOW(), '图片生成图片' WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='vizora_task_type' AND dict_value='image-image');
INSERT IGNORE INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, list_class, is_default, status, create_by, create_time, remark)
SELECT 3, '文生视频', 'text-video', 'vizora_task_type', 'warning', 'N', '0', 'admin', NOW(), '文本生成视频' WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='vizora_task_type' AND dict_value='text-video');
INSERT IGNORE INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, list_class, is_default, status, create_by, create_time, remark)
SELECT 4, '图生视频', 'image-video', 'vizora_task_type', 'danger', 'N', '0', 'admin', NOW(), '图片生成视频' WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='vizora_task_type' AND dict_value='image-video');
CREATE TABLE IF NOT EXISTS viz_model_config (config_id BIGINT NOT NULL AUTO_INCREMENT, config_name VARCHAR(100) NOT NULL, provider VARCHAR(40) NOT NULL, model_name VARCHAR(100) NOT NULL, endpoint VARCHAR(500), api_key VARCHAR(500), task_types VARCHAR(200), enabled TINYINT NOT NULL DEFAULT 1, sort_order INT NOT NULL DEFAULT 0, remark VARCHAR(500), create_by VARCHAR(64), create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, update_by VARCHAR(64), update_time DATETIME, PRIMARY KEY (config_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS viz_credit_package (package_id BIGINT NOT NULL AUTO_INCREMENT, package_name VARCHAR(100) NOT NULL, credits BIGINT NOT NULL, price DECIMAL(10,2) NOT NULL, original_price DECIMAL(10,2), bonus_credits BIGINT NOT NULL DEFAULT 0, enabled TINYINT NOT NULL DEFAULT 1, sort_order INT NOT NULL DEFAULT 0, description VARCHAR(500), create_by VARCHAR(64), create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, update_by VARCHAR(64), update_time DATETIME, PRIMARY KEY (package_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO viz_credit_package (package_name, credits, price, original_price, bonus_credits, sort_order, description) SELECT '基础算力包',1000,9.90,12.90,0,10,'适合首次体验' WHERE NOT EXISTS (SELECT 1 FROM viz_credit_package);
INSERT INTO viz_credit_package (package_name, credits, price, original_price, bonus_credits, sort_order, description) SELECT '专业算力包',5000,39.90,59.90,500,20,'高频创作者推荐' WHERE (SELECT COUNT(*) FROM viz_credit_package)=1;
INSERT INTO viz_credit_package (package_name, credits, price, original_price, bonus_credits, sort_order, description) SELECT '旗舰算力包',20000,129.00,199.00,3000,30,'团队与商业创作' WHERE (SELECT COUNT(*) FROM viz_credit_package)=2;
