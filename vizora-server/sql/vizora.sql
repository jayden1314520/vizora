-- VIZORA AI 创作平台业务表（MySQL 8）
-- 请先执行若依自带 sql/ry_*.sql，再执行本文件。

CREATE TABLE IF NOT EXISTS viz_file (
  file_id          BIGINT NOT NULL AUTO_INCREMENT COMMENT '文件ID',
  user_id          BIGINT NOT NULL COMMENT '所属用户',
  bucket           VARCHAR(100) NOT NULL COMMENT '七牛空间',
  object_key       VARCHAR(500) NOT NULL COMMENT '对象Key',
  original_name    VARCHAR(255) NOT NULL COMMENT '原文件名',
  mime_type        VARCHAR(100) NOT NULL COMMENT 'MIME类型',
  file_size        BIGINT NOT NULL DEFAULT 0 COMMENT '字节数',
  file_hash        VARCHAR(100) DEFAULT NULL COMMENT '七牛etag',
  file_usage       VARCHAR(30) NOT NULL DEFAULT 'material' COMMENT '用途',
  is_public        TINYINT NOT NULL DEFAULT 0 COMMENT '是否公开',
  status           VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/READY/FAILED',
  deleted          TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
  create_time      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time      DATETIME DEFAULT NULL,
  PRIMARY KEY (file_id),
  UNIQUE KEY uk_viz_file_key (object_key),
  KEY idx_viz_file_user (user_id, status, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='七牛云文件';

CREATE TABLE IF NOT EXISTS viz_template (
  template_id      BIGINT NOT NULL AUTO_INCREMENT,
  title            VARCHAR(100) NOT NULL,
  category         VARCHAR(30) NOT NULL COMMENT 'text-image/image-image/text-video/image-video/shop',
  description      VARCHAR(500) DEFAULT NULL,
  prompt           TEXT NOT NULL,
  cover_file_id    BIGINT DEFAULT NULL,
  sort_order       INT NOT NULL DEFAULT 0,
  use_count        BIGINT NOT NULL DEFAULT 0,
  status           VARCHAR(20) NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT/PUBLISHED/OFFLINE',
  deleted          TINYINT NOT NULL DEFAULT 0,
  create_by        VARCHAR(64) DEFAULT NULL,
  create_time      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_by        VARCHAR(64) DEFAULT NULL,
  update_time      DATETIME DEFAULT NULL,
  PRIMARY KEY (template_id),
  KEY idx_viz_template_status (status, category, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='灵感模板';

CREATE TABLE IF NOT EXISTS viz_creation_task (
  task_id          BIGINT NOT NULL AUTO_INCREMENT,
  user_id          BIGINT NOT NULL,
  task_type        VARCHAR(30) NOT NULL,
  prompt           TEXT NOT NULL,
  input_file_ids   VARCHAR(1000) DEFAULT NULL,
  options_json     JSON DEFAULT NULL,
  credit_cost      BIGINT NOT NULL DEFAULT 0,
  status           VARCHAR(20) NOT NULL DEFAULT 'QUEUED' COMMENT 'QUEUED/PROCESSING/SUCCEEDED/FAILED/CANCELLED',
  progress         INT NOT NULL DEFAULT 0,
  provider_task_id VARCHAR(200) DEFAULT NULL,
  work_id          BIGINT DEFAULT NULL,
  failure_reason   VARCHAR(500) DEFAULT NULL,
  create_time      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time      DATETIME DEFAULT NULL,
  PRIMARY KEY (task_id),
  KEY idx_viz_task_user (user_id, status, task_id),
  KEY idx_viz_task_provider (provider_task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI创作任务';

CREATE TABLE IF NOT EXISTS viz_work (
  work_id          BIGINT NOT NULL AUTO_INCREMENT,
  user_id          BIGINT NOT NULL,
  task_id          BIGINT DEFAULT NULL,
  title            VARCHAR(120) NOT NULL,
  work_type        VARCHAR(30) NOT NULL,
  output_file_id   BIGINT DEFAULT NULL,
  cover_file_id    BIGINT DEFAULT NULL,
  prompt           TEXT DEFAULT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'READY',
  audit_status     VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/APPROVED/REJECTED',
  audit_reason     VARCHAR(500) DEFAULT NULL,
  deleted          TINYINT NOT NULL DEFAULT 0,
  create_time      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time      DATETIME DEFAULT NULL,
  PRIMARY KEY (work_id),
  KEY idx_viz_work_user (user_id, deleted, work_id),
  KEY idx_viz_work_audit (audit_status, deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户作品';

CREATE TABLE IF NOT EXISTS viz_credit_account (
  user_id          BIGINT NOT NULL,
  balance          BIGINT NOT NULL DEFAULT 0,
  total_granted    BIGINT NOT NULL DEFAULT 0,
  total_consumed   BIGINT NOT NULL DEFAULT 0,
  create_time      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time      DATETIME DEFAULT NULL,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='算力账户';

CREATE TABLE IF NOT EXISTS viz_credit_record (
  record_id        BIGINT NOT NULL AUTO_INCREMENT,
  user_id          BIGINT NOT NULL,
  record_type      VARCHAR(20) NOT NULL COMMENT 'GRANT/CONSUME/REFUND',
  amount           BIGINT NOT NULL,
  biz_type         VARCHAR(30) DEFAULT NULL,
  biz_id           BIGINT DEFAULT NULL,
  title            VARCHAR(100) NOT NULL,
  detail           VARCHAR(500) DEFAULT NULL,
  create_time      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (record_id),
  KEY idx_viz_credit_user (user_id, record_id),
  KEY idx_viz_credit_biz (biz_type, biz_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='算力流水';

CREATE TABLE IF NOT EXISTS viz_notification (
  notification_id   BIGINT NOT NULL AUTO_INCREMENT,
  user_id           BIGINT DEFAULT NULL COMMENT '为空表示全员',
  notification_type VARCHAR(30) NOT NULL,
  title             VARCHAR(120) NOT NULL,
  content           VARCHAR(1000) NOT NULL,
  biz_type          VARCHAR(30) DEFAULT NULL,
  biz_id            BIGINT DEFAULT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
  create_time       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  KEY idx_viz_notice_user (user_id, status, notification_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户通知';

CREATE TABLE IF NOT EXISTS viz_notification_read (
  notification_id  BIGINT NOT NULL,
  user_id           BIGINT NOT NULL,
  read_time         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知已读记录';

CREATE TABLE IF NOT EXISTS viz_invitation (
  invitation_id    BIGINT NOT NULL AUTO_INCREMENT,
  inviter_user_id  BIGINT NOT NULL,
  invitee_user_id  BIGINT DEFAULT NULL,
  invite_code      VARCHAR(32) NOT NULL,
  reward_amount    BIGINT NOT NULL DEFAULT 200,
  status           VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  completed_time   DATETIME DEFAULT NULL,
  create_time      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (invitation_id),
  UNIQUE KEY uk_viz_invite_code (invite_code),
  KEY idx_viz_inviter (inviter_user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邀请奖励';

INSERT INTO viz_template (title, category, description, prompt, sort_order, status) VALUES
('流光下的未来城市', 'text-video', '电影感未来都市短片', '雨夜的未来都市，霓虹灯在潮湿街道上形成流光倒影，电影感运镜', 10, 'PUBLISHED'),
('春日花园人像', 'text-image', '柔和逆光花园人像', '清晨的秘密花园，柔和逆光，人物置身繁盛绿植之间，杂志大片质感', 20, 'PUBLISHED'),
('山野咖啡馆', 'shop', '自然松弛的探店短片', '跟随镜头走进山野咖啡馆，从门头推镜至手冲咖啡特写，自然松弛氛围', 30, 'PUBLISHED'),
('玻璃质感产品', 'image-image', '商业产品摄影风格', '透明玻璃与水面倒影，护肤产品悬浮于纯净空间，商业广告摄影', 40, 'PUBLISHED');

INSERT INTO viz_notification (notification_type, title, content, status) VALUES
('SYSTEM', '欢迎使用 VIZORA', '登录后即可领取 200 算力，开始你的第一次 AI 创作。', 'PUBLISHED'),
('ACTIVITY', '邀请好友奖励', '每邀请一位好友完成注册，双方都可获得 200 算力。', 'PUBLISHED');

-- 若依后台菜单与权限
INSERT INTO sys_menu VALUES (3000, 'VIZORA运营', 0, 6, 'vizora', NULL, '', '', 1, 0, 'M', '0', '0', '', 'dashboard', 'admin', NOW(), '', NULL, 'AI创作平台运营');
INSERT INTO sys_menu VALUES (3001, '灵感模板', 3000, 1, 'template', 'vizora/template/index', '', '', 1, 0, 'C', '0', '0', 'vizora:template:list', 'picture', 'admin', NOW(), '', NULL, '模板管理');
INSERT INTO sys_menu VALUES (3002, '作品审核', 3000, 2, 'work', 'vizora/work/index', '', '', 1, 0, 'C', '0', '0', 'vizora:work:list', 'example', 'admin', NOW(), '', NULL, '作品审核');
INSERT INTO sys_menu VALUES (3011, '模板查询', 3001, 1, '', '', '', '', 1, 0, 'F', '0', '0', 'vizora:template:query', '#', 'admin', NOW(), '', NULL, '');
INSERT INTO sys_menu VALUES (3012, '模板新增', 3001, 2, '', '', '', '', 1, 0, 'F', '0', '0', 'vizora:template:add', '#', 'admin', NOW(), '', NULL, '');
INSERT INTO sys_menu VALUES (3013, '模板修改', 3001, 3, '', '', '', '', 1, 0, 'F', '0', '0', 'vizora:template:edit', '#', 'admin', NOW(), '', NULL, '');
INSERT INTO sys_menu VALUES (3014, '模板删除', 3001, 4, '', '', '', '', 1, 0, 'F', '0', '0', 'vizora:template:remove', '#', 'admin', NOW(), '', NULL, '');
INSERT INTO sys_menu VALUES (3021, '作品审核', 3002, 1, '', '', '', '', 1, 0, 'F', '0', '0', 'vizora:work:audit', '#', 'admin', NOW(), '', NULL, '');
INSERT INTO sys_role_menu (role_id, menu_id) VALUES
(1, 3000), (1, 3001), (1, 3002), (1, 3011), (1, 3012), (1, 3013), (1, 3014), (1, 3021);
