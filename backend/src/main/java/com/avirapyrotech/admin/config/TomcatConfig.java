package com.avirapyrotech.admin.config;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TomcatConfig {

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatCustomizer() {
        return factory -> factory.addConnectorCustomizers(connector -> {
            // Enable body parsing for PUT, PATCH, and DELETE in Tomcat
            // By default, Tomcat only parses form parameters and multipart for POST
            connector.setParseBodyMethods("POST,PUT,PATCH,DELETE");
        });
    }
}
