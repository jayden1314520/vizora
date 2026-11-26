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
CREATE TABLE IF NOT EXISTS viz_model_config (config_id BIGINT NOT NULL AUTO_INCREMENT, config_name VARCHAR(100) NOT NULL, provider VARCHAR(40) NOT NULL, model_name VARCHAR(100) NOT NULL, endpoint VARCHAR(500), api_key VARCHAR(500), task_types VARCHAR(200), enabled TINYINT NOT NULL DEFAULT 1, sort_order INT NOT NULL DEFAULT 0, remark VARCHAR(500), create_by VARCHAR(64), create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, update_by VARCHAR(64), update_time DATETIME, PRIMARY KEY (config_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS viz_credit_package (package_id BIGINT NOT NULL AUTO_INCREMENT, package_name VARCHAR(100) NOT NULL, credits BIGINT NOT NULL, price DECIMAL(10,2) NOT NULL, original_price DECIMAL(10,2), bonus_credits BIGINT NOT NULL DEFAULT 0, enabled TINYINT NOT NULL DEFAULT 1, sort_order INT NOT NULL DEFAULT 0, description VARCHAR(500), create_by VARCHAR(64), create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, update_by VARCHAR(64), update_time DATETIME, PRIMARY KEY (package_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT INTO viz_credit_package (package_name, credits, price, original_price, bonus_credits, sort_order, description) SELECT '基础算力包',1000,9.90,12.90,0,10,'适合首次体验' WHERE NOT EXISTS (SELECT 1 FROM viz_credit_package);
INSERT INTO viz_credit_package (package_name, credits, price, original_price, bonus_credits, sort_order, description) SELECT '专业算力包',5000,39.90,59.90,500,20,'高频创作者推荐' WHERE (SELECT COUNT(*) FROM viz_credit_package)=1;
INSERT INTO viz_credit_package (package_name, credits, price, original_price, bonus_credits, sort_order, description) SELECT '旗舰算力包',20000,129.00,199.00,3000,30,'团队与商业创作' WHERE (SELECT COUNT(*) FROM viz_credit_package)=2;
