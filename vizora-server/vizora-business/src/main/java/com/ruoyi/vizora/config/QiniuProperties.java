package com.ruoyi.vizora.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "qiniu")
public class QiniuProperties
{
    private String accessKey;
    private String secretKey;
    private String privateBucket;
    private String publicBucket;
    private String privateDomain;
    private String publicDomain;
    private String callbackUrl;
    private long tokenExpireSeconds = 3600;

    public String getAccessKey() { return accessKey; }
    public void setAccessKey(String accessKey) { this.accessKey = accessKey; }
    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
    public String getPrivateBucket() { return privateBucket; }
    public void setPrivateBucket(String privateBucket) { this.privateBucket = privateBucket; }
    public String getPublicBucket() { return publicBucket; }
    public void setPublicBucket(String publicBucket) { this.publicBucket = publicBucket; }
    public String getPrivateDomain() { return privateDomain; }
    public void setPrivateDomain(String privateDomain) { this.privateDomain = privateDomain; }
    public String getPublicDomain() { return publicDomain; }
    public void setPublicDomain(String publicDomain) { this.publicDomain = publicDomain; }
    public String getCallbackUrl() { return callbackUrl; }
    public void setCallbackUrl(String callbackUrl) { this.callbackUrl = callbackUrl; }
    public long getTokenExpireSeconds() { return tokenExpireSeconds; }
    public void setTokenExpireSeconds(long tokenExpireSeconds) { this.tokenExpireSeconds = tokenExpireSeconds; }
}
