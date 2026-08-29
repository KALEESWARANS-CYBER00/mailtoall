package com.mailtoall.analytics.controller;

import com.mailtoall.campaign.entity.Campaign;
import com.mailtoall.campaign.repository.CampaignRepository;
import com.mailtoall.contact.repository.ContactRepository;
import com.mailtoall.gmail.repository.GmailAccountRepository;
import com.mailtoall.user.entity.User;
import com.mailtoall.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final CampaignRepository campaignRepository;
    private final GmailAccountRepository gmailAccountRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    public AnalyticsController(
            CampaignRepository campaignRepository,
            GmailAccountRepository gmailAccountRepository,
            ContactRepository contactRepository,
            UserRepository userRepository) {
        this.campaignRepository = campaignRepository;
        this.gmailAccountRepository = gmailAccountRepository;
        this.contactRepository = contactRepository;
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

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardOverview() {
        User user = getOrCreateDemoUser();
        List<Campaign> campaigns = campaignRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        int totalSent = 0;
        int totalFailed = 0;
        int activeCampaigns = 0;

        for (Campaign c : campaigns) {
            totalSent += (c.getSentCount() != null ? c.getSentCount() : 0);
            totalFailed += (c.getFailedCount() != null ? c.getFailedCount() : 0);
            if ("RUNNING".equalsIgnoreCase(c.getStatus().name()) || "QUEUED".equalsIgnoreCase(c.getStatus().name())) {
                activeCampaigns++;
            }
        }

        int connectedAccounts = gmailAccountRepository.findByUserId(user.getId()).size();
        int totalContacts = contactRepository.findByUserId(user.getId()).size();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("connected_accounts", connectedAccounts);
        metrics.put("total_campaigns", campaigns.size());
        metrics.put("active_campaigns", activeCampaigns);
        metrics.put("total_contacts", totalContacts);
        metrics.put("total_emails_sent", totalSent);
        metrics.put("total_emails_failed", totalFailed);
        metrics.put("delivery_success_rate", (totalSent + totalFailed) > 0 ? Math.round(((double) totalSent / (totalSent + totalFailed)) * 100) : 100);

        return ResponseEntity.ok(metrics);
    }
}
