package com.avirapyrotech.admin.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "settings")
public class Setting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_key", nullable = false, unique = true)
    private String configKey;

    @Column(name = "config_value", columnDefinition = "TEXT")
    private String configValue;

    public Setting() {}

    public Setting(Long id, String configKey, String configValue) {
        this.id = id;
        this.configKey = configKey;
        this.configValue = configValue;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getConfigKey() { return configKey; }
    public void setConfigKey(String configKey) { this.configKey = configKey; }

    public String getConfigValue() { return configValue; }
    public void setConfigValue(String configValue) { this.configValue = configValue; }

    public static SettingBuilder builder() {
        return new SettingBuilder();
    }

    public static class SettingBuilder {
        private Long id;
        private String configKey;
        private String configValue;

        public SettingBuilder id(Long id) { this.id = id; return this; }
        public SettingBuilder configKey(String configKey) { this.configKey = configKey; return this; }
        public SettingBuilder configValue(String configValue) { this.configValue = configValue; return this; }

        public Setting build() {
            return new Setting(id, configKey, configValue);
        }
    }
}
