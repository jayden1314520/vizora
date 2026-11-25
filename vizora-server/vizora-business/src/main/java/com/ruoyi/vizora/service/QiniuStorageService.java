package com.ruoyi.vizora.service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.qiniu.util.Auth;
import com.qiniu.util.StringMap;
import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.vizora.config.QiniuProperties;
import com.ruoyi.vizora.mapper.VizoraMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QiniuStorageService
{
    private static final long MAX_FILE_SIZE = 500L * 1024 * 1024;
    private static final Set<String> ALLOWED_PREFIXES = Set.of("image/", "video/", "audio/", "text/");

    private final QiniuProperties properties;
    private final VizoraMapper mapper;

    public QiniuStorageService(QiniuProperties properties, VizoraMapper mapper)
    {
        this.properties = properties;
        this.mapper = mapper;
    }

    @Transactional
    public Map<String, Object> createUploadToken(Long userId, String originalName, String mimeType,
                                                 long fileSize, String usage, boolean publicAsset)
    {
        requireConfigured();
        validateFile(originalName, mimeType, fileSize);
        String bucket = publicAsset ? properties.getPublicBucket() : properties.getPrivateBucket();
        String key = buildObjectKey(userId, originalName, usage);

        Map<String, Object> file = new HashMap<>();
        file.put("userId", userId);
        file.put("bucket", bucket);
        file.put("objectKey", key);
        file.put("originalName", originalName);
        file.put("mimeType", mimeType);
        file.put("fileSize", fileSize);
        file.put("usage", usage);
        file.put("isPublic", publicAsset ? 1 : 0);
        file.put("status", "PENDING");
        mapper.insertPendingFile(file);

        StringMap policy = new StringMap();
        policy.put("returnBody", "{\"key\":\"$(key)\",\"hash\":\"$(etag)\",\"bucket\":\"$(bucket)\",\"size\":$(fsize),\"mimeType\":\"$(mimeType)\"}");
        if (StringUtils.isNotBlank(properties.getCallbackUrl()))
        {
            policy.put("callbackUrl", properties.getCallbackUrl());
            policy.put("callbackBodyType", "application/json");
            policy.put("callbackBody", "{\"key\":\"$(key)\",\"hash\":\"$(etag)\",\"bucket\":\"$(bucket)\",\"size\":$(fsize),\"mimeType\":\"$(mimeType)\"}");
        }
        Auth auth = Auth.create(properties.getAccessKey(), properties.getSecretKey());
        String token = auth.uploadToken(bucket, key, properties.getTokenExpireSeconds(), policy);

        Map<String, Object> result = new HashMap<>();
        result.put("fileId", file.get("fileId"));
        result.put("token", token);
        result.put("key", key);
        result.put("bucket", bucket);
        result.put("uploadHost", "https://upload.qiniup.com");
        result.put("expiresIn", properties.getTokenExpireSeconds());
        return result;
    }

    @Transactional
    public Map<String, Object> confirmCallback(String authorization, String callbackUrl,
                                               String contentType, String body)
    {
        requireConfigured();
        Auth auth = Auth.create(properties.getAccessKey(), properties.getSecretKey());
        String verificationUrl = StringUtils.isNotBlank(properties.getCallbackUrl())
                ? properties.getCallbackUrl() : callbackUrl;
        boolean valid = auth.isValidCallback(authorization, verificationUrl,
                body.getBytes(StandardCharsets.UTF_8), contentType);
        if (!valid)
        {
            throw new ServiceException("七牛回调签名验证失败");
        }
        JSONObject payload = JSON.parseObject(body);
        Map<String, Object> file = new HashMap<>();
        file.put("objectKey", payload.getString("key"));
        file.put("fileHash", payload.getString("hash"));
        file.put("bucket", payload.getString("bucket"));
        file.put("fileSize", payload.getLong("size"));
        file.put("mimeType", payload.getString("mimeType"));
        file.put("status", "READY");
        if (mapper.confirmFile(file) == 0)
        {
            throw new ServiceException("未找到对应的待上传文件");
        }
        return mapper.selectFileByKey(payload.getString("key"));
    }

    public String buildAccessUrl(Map<String, Object> file, long expiresSeconds)
    {
        Object publicValue = file.get("isPublic");
        boolean publicAsset = publicValue instanceof Boolean value ? value
                : publicValue instanceof Number value && value.intValue() == 1;
        String domain = publicAsset ? properties.getPublicDomain() : properties.getPrivateDomain();
        if (StringUtils.isBlank(domain))
        {
            throw new ServiceException("七牛访问域名未配置");
        }
        String baseUrl = domain.replaceAll("/$", "") + "/" + file.get("objectKey");
        if (publicAsset)
        {
            return baseUrl;
        }
        return Auth.create(properties.getAccessKey(), properties.getSecretKey())
                .privateDownloadUrl(baseUrl, Math.max(60, Math.min(expiresSeconds, 86400)));
    }

    private void validateFile(String originalName, String mimeType, long fileSize)
    {
        if (StringUtils.isBlank(originalName) || originalName.length() > 255)
        {
            throw new ServiceException("文件名不合法");
        }
        if (fileSize <= 0 || fileSize > MAX_FILE_SIZE)
        {
            throw new ServiceException("文件大小必须在 500MB 以内");
        }
        if (StringUtils.isBlank(mimeType) || ALLOWED_PREFIXES.stream().noneMatch(mimeType::startsWith))
        {
            throw new ServiceException("不支持该文件类型");
        }
    }

    private String buildObjectKey(Long userId, String originalName, String usage)
    {
        String extension = "";
        int dot = originalName.lastIndexOf('.');
        if (dot >= 0 && dot < originalName.length() - 1)
        {
            extension = originalName.substring(dot).toLowerCase().replaceAll("[^a-z0-9.]", "");
        }
        String safeUsage = StringUtils.isBlank(usage) ? "material" : usage.toLowerCase().replaceAll("[^a-z0-9_-]", "");
        return safeUsage + "/" + userId + "/" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + "/" + UUID.randomUUID().toString().replace("-", "") + extension;
    }

    private void requireConfigured()
    {
        if (StringUtils.isAnyBlank(properties.getAccessKey(), properties.getSecretKey(),
                properties.getPrivateBucket(), properties.getPublicBucket()))
        {
            throw new ServiceException("七牛云未配置，请设置 QINIU_ACCESS_KEY、QINIU_SECRET_KEY 和存储空间");
        }
    }
}
