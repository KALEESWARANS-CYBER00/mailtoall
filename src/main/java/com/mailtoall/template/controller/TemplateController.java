package com.mailtoall.template.controller;

import com.mailtoall.template.entity.EmailTemplate;
import com.mailtoall.template.repository.EmailTemplateRepository;
import com.mailtoall.user.entity.User;
import com.mailtoall.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    private final EmailTemplateRepository templateRepository;
    private final UserRepository userRepository;

    public TemplateController(
            EmailTemplateRepository templateRepository,
            UserRepository userRepository) {
        this.templateRepository = templateRepository;
        this.userRepository = userRepository;
    }

    private User getOrCreateDemoUser() {
        return userRepository.findByEmail("demo@mailtoall.io")
                .orElseGet(() -> userRepository.save(User.builder()
                        .googleSub("demo-sub-12345")
                        .email("demo@mailtoall.io")
                        .name("Demo Operator")
                        .build()));
    }

    @GetMapping
    public ResponseEntity<List<EmailTemplate>> listTemplates() {
        User user = getOrCreateDemoUser();
        return ResponseEntity.ok(templateRepository.findByUserId(user.getId()));
    }

    @PostMapping
    public ResponseEntity<EmailTemplate> createTemplate(@RequestBody Map<String, String> body) {
        User user = getOrCreateDemoUser();
        EmailTemplate template = EmailTemplate.builder()
                .user(user)
                .name(body.get("name"))
                .subject(body.get("subject"))
                .bodyHtml(body.get("body_html"))
                .bodyText(body.get("body_text"))
                .build();
        return ResponseEntity.ok(templateRepository.save(template));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailTemplate> getTemplate(@PathVariable UUID id) {
        User user = getOrCreateDemoUser();
        return templateRepository.findByIdAndUserId(id, user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        User user = getOrCreateDemoUser();
        templateRepository.findByIdAndUserId(id, user.getId())
                .ifPresent(templateRepository::delete);
        return ResponseEntity.noContent().build();
    }
}
