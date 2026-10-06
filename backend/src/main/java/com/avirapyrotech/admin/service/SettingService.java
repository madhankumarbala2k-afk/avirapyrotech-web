package com.avirapyrotech.admin.service;

import com.avirapyrotech.admin.entity.Setting;
import com.avirapyrotech.admin.repository.SettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
public class SettingService {

    @Autowired
    private SettingRepository settingRepository;

    public Map<String, String> getAllSettings() {
        List<Setting> settingsList = settingRepository.findAll();
        Map<String, String> settingsMap = new HashMap<>();
        for (Setting setting : settingsList) {
            settingsMap.put(setting.getConfigKey(), setting.getConfigValue());
        }
        return settingsMap;
    }

    public String getSetting(String key, String defaultValue) {
        return settingRepository.findByConfigKey(key)
                .map(s -> s.getConfigValue())
                .orElse(defaultValue);
    }

    @Transactional
    public void saveSetting(String key, String value) {
        Optional<Setting> existing = settingRepository.findByConfigKey(key);
        if (existing.isPresent()) {
            Setting setting = existing.get();
            setting.setConfigValue(value);
            settingRepository.save(setting);
        } else {
            Setting setting = Objects.requireNonNull(Setting.builder()
                    .configKey(key)
                    .configValue(value)
                    .build());
            settingRepository.save(setting);
        }
    }

    @Transactional
    public void saveAllSettings(Map<String, String> settings) {
        settings.forEach(this::saveSetting);
    }
}
