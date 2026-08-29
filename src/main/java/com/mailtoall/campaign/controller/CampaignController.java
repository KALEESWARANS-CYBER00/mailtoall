package com.mailtoall.campaign.controller;

import com.mailtoall.campaign.entity.Campaign;
import com.mailtoall.campaign.entity.CampaignRecipient;
import com.mailtoall.campaign.repository.CampaignRecipientRepository;
import com.mailtoall.campaign.repository.CampaignRepository;
import com.mailtoall.campaign.service.CampaignService;
import com.mailtoall.user.entity.User;
import com.mailtoall.user.repository.UserRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    private final CampaignService campaignService;
    private final CampaignRepository campaignRepository;
    private final CampaignRecipientRepository recipientRepository;
    private final UserRepository userRepository;

    public CampaignController(
            CampaignService campaignService,
            CampaignRepository campaignRepository,
            CampaignRecipientRepository recipientRepository,
            UserRepository userRepository) {
        this.campaignService = campaignService;
        this.campaignRepository = campaignRepository;
        this.recipientRepository = recipientRepository;
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

    @PostMapping
    public ResponseEntity<Campaign> createCampaign(@RequestBody Map<String, Object> req) {
        User user = getOrCreateDemoUser();
        Campaign campaign = campaignService.createCampaign(user, req);
        return ResponseEntity.ok(campaign);
    }

    @GetMapping
    public ResponseEntity<List<Campaign>> listCampaigns() {
        User user = getOrCreateDemoUser();
        return ResponseEntity.ok(campaignRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Campaign> getCampaign(@PathVariable UUID id) {
        User user = getOrCreateDemoUser();
        return campaignRepository.findByIdAndUserId(id, user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Campaign> startCampaign(@PathVariable UUID id) {
        User user = getOrCreateDemoUser();
        return ResponseEntity.ok(campaignService.startCampaign(id, user));
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<Campaign> pauseCampaign(@PathVariable UUID id) {
        User user = getOrCreateDemoUser();
        return ResponseEntity.ok(campaignService.pauseCampaign(id, user));
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<Campaign> resumeCampaign(@PathVariable UUID id) {
        User user = getOrCreateDemoUser();
        return ResponseEntity.ok(campaignService.resumeCampaign(id, user));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Campaign> cancelCampaign(@PathVariable UUID id) {
        User user = getOrCreateDemoUser();
        return ResponseEntity.ok(campaignService.cancelCampaign(id, user));
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<Map<String, String>> previewCampaign(@PathVariable UUID id) {
        User user = getOrCreateDemoUser();
        return ResponseEntity.ok(campaignService.previewCampaign(id, user));
    }

    @GetMapping("/{id}/recipients")
    public ResponseEntity<List<CampaignRecipient>> getRecipients(@PathVariable UUID id) {
        return ResponseEntity.ok(recipientRepository.findByCampaignId(id));
    }

    @GetMapping(value = "/{id}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamProgress(@PathVariable UUID id) {
        SseEmitter emitter = new SseEmitter(180000L); // 3 minutes timeout
        ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();

        executor.scheduleAtFixedRate(() -> {
            try {
                Optional<Campaign> campaignOpt = campaignRepository.findById(id);
                if (campaignOpt.isPresent()) {
                    Campaign campaign = campaignOpt.get();
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", campaign.getId());
                    data.put("status", campaign.getStatus());
                    data.put("total", campaign.getTotalRecipients());
                    data.put("sent", campaign.getSentCount());
                    data.put("failed", campaign.getFailedCount());
                    int processed = campaign.getSentCount() + campaign.getFailedCount();
                    int progress = campaign.getTotalRecipients() > 0 ? (int) Math.round((double) processed / campaign.getTotalRecipients() * 100) : 0;
                    data.put("progress", progress);

                    emitter.send(SseEmitter.event().name("campaign-progress").data(data));

                    if (campaign.getStatus().name().equals("COMPLETED") || campaign.getStatus().name().equals("CANCELLED")) {
                        emitter.complete();
                        executor.shutdown();
                    }
                }
            } catch (IOException e) {
                emitter.completeWithError(e);
                executor.shutdown();
            }
        }, 0, 1, TimeUnit.SECONDS);

        emitter.onCompletion(executor::shutdown);
        emitter.onTimeout(executor::shutdown);

        return emitter;
    }
}
