FROM maven:3.9.11-eclipse-temurin-17 AS builder
WORKDIR /build
COPY pom.xml ./
COPY ruoyi-admin ./ruoyi-admin
COPY ruoyi-common ./ruoyi-common
COPY ruoyi-framework ./ruoyi-framework
COPY ruoyi-generator ./ruoyi-generator
COPY ruoyi-quartz ./ruoyi-quartz
COPY ruoyi-system ./ruoyi-system
COPY vizora-business ./vizora-business
RUN mvn -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /build/ruoyi-admin/target/ruoyi-admin.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
