package com.mailtoall.worker.service;

import com.mailtoall.analytics.entity.EmailEvent;
import com.mailtoall.analytics.repository.EmailEventRepository;
import com.mailtoall.campaign.entity.Campaign;
import com.mailtoall.campaign.entity.CampaignRecipient;
import com.mailtoall.campaign.entity.CampaignStatus;
import com.mailtoall.campaign.entity.RecipientStatus;
import com.mailtoall.campaign.repository.CampaignRecipientRepository;
import com.mailtoall.campaign.repository.CampaignRepository;
import com.mailtoall.gmail.entity.GmailAccount;
import com.mailtoall.suppression.repository.SuppressionRepository;
import com.mailtoall.template.service.TemplateEngineService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Service
public class CampaignWorkerService {

    private final CampaignRepository campaignRepository;
    private final CampaignRecipientRepository recipientRepository;
    private final SuppressionRepository suppressionRepository;
    private final TemplateEngineService templateEngineService;
    private final GmailApiSenderService gmailApiSenderService;
    private final EmailEventRepository emailEventRepository;

    public CampaignWorkerService(
            CampaignRepository campaignRepository,
            CampaignRecipientRepository recipientRepository,
            SuppressionRepository suppressionRepository,
            TemplateEngineService templateEngineService,
            GmailApiSenderService gmailApiSenderService,
            EmailEventRepository emailEventRepository) {
        this.campaignRepository = campaignRepository;
        this.recipientRepository = recipientRepository;
        this.suppressionRepository = suppressionRepository;
        this.templateEngineService = templateEngineService;
        this.gmailApiSenderService = gmailApiSenderService;
        this.emailEventRepository = emailEventRepository;
    }

    @Async
    @Transactional
    public void executeCampaignJob(Campaign campaign) {
        log.info("Starting background worker for campaign: {}", campaign.getId());

        campaign.setStatus(CampaignStatus.RUNNING);
        campaign.setStartedAt(OffsetDateTime.now());
        campaignRepository.save(campaign);

        GmailAccount gmailAccount = campaign.getGmailAccount();
        List<CampaignRecipient> recipients = recipientRepository.findByCampaignId(campaign.getId());

        for (CampaignRecipient recipient : recipients) {
            // Check cancellation / pause state
            Campaign freshCampaign = campaignRepository.findById(campaign.getId()).orElse(campaign);
            if (freshCampaign.getStatus() == CampaignStatus.CANCELLED) {
                log.info("Campaign {} was cancelled", campaign.getId());
                break;
            }
            if (freshCampaign.getStatus() == CampaignStatus.PAUSED) {
                log.info("Campaign {} was paused", campaign.getId());
                return;
            }

            // Check suppression list
            if (suppressionRepository.existsByUserIdAndEmail(campaign.getUser().getId(), recipient.getRecipientEmail())) {
                recipient.setStatus(RecipientStatus.FAILED);
                recipient.setErrorMessage("Suppressed recipient email");
                recipientRepository.save(recipient);
                logEvent(campaign, recipient, "SUPPRESSED", "Recipient is on suppression list");
                continue;
            }

            // Process sending
            try {
                recipient.setStatus(RecipientStatus.SENDING);
                recipientRepository.save(recipient);

                String personalizedSubject = templateEngineService.render(campaign.getSubject(), recipient.getContact());
                String personalizedBody = templateEngineService.render(campaign.getBodyHtml(), recipient.getContact());

                gmailApiSenderService.sendEmail(gmailAccount, recipient.getRecipientEmail(), personalizedSubject, personalizedBody);

                recipient.setStatus(RecipientStatus.SENT);
                recipient.setSentAt(OffsetDateTime.now());
                recipientRepository.save(recipient);

                campaign.setSentCount(campaign.getSentCount() + 1);
                campaignRepository.save(campaign);

                logEvent(campaign, recipient, "SENT", null);

                // Rate limiting pause
                if (campaign.getRateLimitPerMinute() != null && campaign.getRateLimitPerMinute() > 0) {
                    long delayMs = 60000L / campaign.getRateLimitPerMinute();
                    Thread.sleep(delayMs);
                }
            } catch (Exception ex) {
                log.error("Failed to send email to {}", recipient.getRecipientEmail(), ex);
                recipient.setStatus(RecipientStatus.FAILED);
                recipient.setErrorMessage(ex.getMessage());
                recipientRepository.save(recipient);

                campaign.setFailedCount(campaign.getFailedCount() + 1);
                campaignRepository.save(campaign);

                logEvent(campaign, recipient, "FAILED", ex.getMessage());
            }
        }

        // Final status update
        Campaign finalCheck = campaignRepository.findById(campaign.getId()).orElse(campaign);
        if (finalCheck.getStatus() != CampaignStatus.CANCELLED && finalCheck.getStatus() != CampaignStatus.PAUSED) {
            finalCheck.setStatus(CampaignStatus.COMPLETED);
            finalCheck.setCompletedAt(OffsetDateTime.now());
            campaignRepository.save(finalCheck);
            log.info("Finished execution for campaign: {}", campaign.getId());
        }
    }

    private void logEvent(Campaign campaign, CampaignRecipient recipient, String eventType, String error) {
        EmailEvent event = EmailEvent.builder()
                .campaign(campaign)
                .recipient(recipient)
                .eventType(eventType)
                .sanitizedError(error)
                .build();
        emailEventRepository.save(event);
    }
}
