package com.avirapyrotech.admin.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Override
    public void addCorsMappings(@NonNull org.springframework.web.servlet.config.annotation.CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        Path uploadDirPath = Paths.get(uploadDir);
        // Automatically use Railway volume mounted at /uploads if using default relative path
        if (!uploadDirPath.isAbsolute() && Files.exists(Paths.get("/uploads")) && Files.isDirectory(Paths.get("/uploads"))) {
            uploadDirPath = Paths.get("/uploads");
        }
        uploadDirPath = uploadDirPath.toAbsolutePath().normalize();
        
        // Expose upload directory to the web under /api/uploads/
        // (Note: because the context path is /api, this handler serves /api/uploads/**)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDirPath.toString() + "/");
    }
}
