package com.mailtoall.gmail.controller;

import com.mailtoall.common.security.EncryptionService;
import com.mailtoall.gmail.entity.GmailAccount;
import com.mailtoall.gmail.entity.GmailAccountStatus;
import com.mailtoall.gmail.repository.GmailAccountRepository;
import com.mailtoall.user.entity.User;
import com.mailtoall.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/gmail/accounts")
public class GmailAccountController {

    private final GmailAccountRepository gmailAccountRepository;
    private final UserRepository userRepository;
    private final EncryptionService encryptionService;

    @Value("${mailtoall.google.client-id:demo-client-id}")
    private String clientId;

    @Value("${mailtoall.google.redirect-uri:http://localhost:8080/api/auth/google/callback}")
    private String redirectUri;

    public GmailAccountController(
            GmailAccountRepository gmailAccountRepository,
            UserRepository userRepository,
            EncryptionService encryptionService) {
        this.gmailAccountRepository = gmailAccountRepository;
        this.userRepository = userRepository;
        this.encryptionService = encryptionService;
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
    public ResponseEntity<List<Map<String, Object>>> listAccounts() {
        User user = getOrCreateDemoUser();
        List<GmailAccount> accounts = gmailAccountRepository.findByUserId(user.getId());
        List<Map<String, Object>> response = new ArrayList<>();

        for (GmailAccount acc : accounts) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", acc.getId());
            map.put("email", acc.getEmail());
            map.put("is_default", acc.getIsDefault());
            map.put("status", acc.getStatus());
            map.put("created_at", acc.getCreatedAt());
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/oauth-url")
    public ResponseEntity<Map<String, String>> getOAuthUrl() {
        String scope = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly";
        String url = "https://accounts.google.com/o/oauth2/v2/auth?" +
                "client_id=" + clientId +
                "&redirect_uri=" + redirectUri +
                "&response_type=code" +
                "&scope=" + scope +
                "&access_type=offline" +
                "&prompt=consent";
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/connect-mock")
    public ResponseEntity<GmailAccount> connectMockAccount(@RequestBody Map<String, String> body) {
        User user = getOrCreateDemoUser();
        String email = body.getOrDefault("email", "john.doe@gmail.com");

        boolean isFirst = gmailAccountRepository.findByUserId(user.getId()).isEmpty();

        GmailAccount account = GmailAccount.builder()
                .user(user)
                .googleSub("gmail-sub-" + System.currentTimeMillis())
                .email(email)
                .isDefault(isFirst)
                .accessTokenEncrypted(encryptionService.encrypt("mock-access-token-" + UUID.randomUUID()))
                .refreshTokenEncrypted(encryptionService.encrypt("mock-refresh-token-" + UUID.randomUUID()))
                .tokenExpiry(OffsetDateTime.now().plusHours(1))
                .scopes("https://www.googleapis.com/auth/gmail.send")
                .status(GmailAccountStatus.ACTIVE)
                .build();

        return ResponseEntity.ok(gmailAccountRepository.save(account));
    }

    @PostMapping("/{id}/make-default")
    public ResponseEntity<GmailAccount> makeDefault(@PathVariable UUID id) {
        User user = getOrCreateDemoUser();
        List<GmailAccount> accounts = gmailAccountRepository.findByUserId(user.getId());
        GmailAccount target = null;

        for (GmailAccount acc : accounts) {
            if (acc.getId().equals(id)) {
                acc.setIsDefault(true);
                target = acc;
            } else {
                acc.setIsDefault(false);
            }
            gmailAccountRepository.save(acc);
        }
        return target != null ? ResponseEntity.ok(target) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> disconnectAccount(@PathVariable UUID id) {
        User user = getOrCreateDemoUser();
        Optional<GmailAccount> accountOpt = gmailAccountRepository.findByIdAndUserId(id, user.getId());
        if (accountOpt.isPresent()) {
            gmailAccountRepository.delete(accountOpt.get());
            return ResponseEntity.ok(Map.of("disconnected", true));
        }
        return ResponseEntity.notFound().build();
    }
}
