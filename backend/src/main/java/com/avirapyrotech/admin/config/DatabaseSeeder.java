package com.avirapyrotech.admin.config;

import com.avirapyrotech.admin.entity.Category;
import com.avirapyrotech.admin.entity.User;
import com.avirapyrotech.admin.repository.CategoryRepository;
import com.avirapyrotech.admin.repository.UserRepository;
import com.avirapyrotech.admin.service.SettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SettingService settingService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedAdminUser();
        seedDefaultCategories();
        seedDefaultSettings();
    }

    private void seedAdminUser() {
        if (userRepository.count() == 0) {
            User admin = Objects.requireNonNull(User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .active(true)
                    .build());
            userRepository.save(admin);
            System.out.println("========== DATABASE SEEDED: Default admin created (admin / admin123) ==========");
        }
    }

    private void seedDefaultCategories() {
        if (categoryRepository.count() == 0) {
            List<String> defaultCats = Arrays.asList(
                    "Gift Boxes",
                    "Sparklers",
                    "Rockets",
                    "Flower Pots",
                    "Ground Chakkars",
                    "Fancy Crackers"
            );

            for (String catName : defaultCats) {
                Category category = Objects.requireNonNull(Category.builder()
                        .name(catName)
                        .imagePath(null) // Optional category image
                        .build());
                categoryRepository.save(category);
            }
            System.out.println("========== DATABASE SEEDED: Default cracker categories created ==========");
        }
    }

    private void seedDefaultSettings() {
        Map<String, String> defaultSettings = new HashMap<>();
        
        // Shop settings
        defaultSettings.put("shop_name", "AVIRA PYROTECH");
        defaultSettings.put("shop_logo", "");
        defaultSettings.put("phone_number", "8610315901, 9092180927");
        defaultSettings.put("whatsapp_number", "8610315901");
        defaultSettings.put("email", "info@avirapyrotech.com");
        defaultSettings.put("address", "112, Paraipatti, Sattur Road, Sivakasi - 626189, Tamil Nadu, India");
        defaultSettings.put("google_maps_link", "https://www.google.com/maps/search/?api=1&query=112+Paraipatti+Sattur+Road+Sivakasi+626189");
        defaultSettings.put("business_hours", "9:00 AM - 8:00 PM");
        defaultSettings.put("social_facebook", "https://facebook.com/avirapyrotech");
        defaultSettings.put("social_instagram", "https://instagram.com/avirapyrotech");
        defaultSettings.put("social_youtube", "https://youtube.com/avirapyrotech");
        
        // Website settings
        defaultSettings.put("homepage_title", "AVIRA PYROTECH — Buy Sivakasi Crackers Online");
        defaultSettings.put("about_us_content", "Avira Pyrotech is a premier supplier of quality fireworks, crackers, and sparklers based in the fireworks capital of India, Sivakasi. We pride ourselves on safety, quality, and wholesale pricing directly to customers.");
        defaultSettings.put("contact_details", "Phone: +91 98765 43210 | Email: contact@avirapyrotech.com");
        defaultSettings.put("footer_text", "Avira Pyrotech Fireworks Sivakasi - Safe and Premium Quality Crackers.");
        defaultSettings.put("copyright_text", "© 2026 AVIRA PYROTECH. All rights reserved. Developed by Leon-Knight.");

        // Only write values if they are missing
        Map<String, String> existingSettings = settingService.getAllSettings();
        defaultSettings.forEach((key, val) -> {
            if (!existingSettings.containsKey(key)) {
                settingService.saveSetting(key, val);
            }
        });
        
        System.out.println("========== DATABASE SEEDED: Default shop & website settings populated ==========");
    }
}
