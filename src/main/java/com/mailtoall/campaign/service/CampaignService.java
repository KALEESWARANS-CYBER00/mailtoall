package com.mailtoall.campaign.service;

import com.mailtoall.campaign.entity.*;
import com.mailtoall.campaign.repository.CampaignRecipientRepository;
import com.mailtoall.campaign.repository.CampaignRepository;
import com.mailtoall.contact.entity.Contact;
import com.mailtoall.contact.repository.ContactListRepository;
import com.mailtoall.contact.repository.ContactRepository;
import com.mailtoall.gmail.entity.GmailAccount;
import com.mailtoall.gmail.repository.GmailAccountRepository;
import com.mailtoall.template.entity.EmailTemplate;
import com.mailtoall.template.repository.EmailTemplateRepository;
import com.mailtoall.template.service.TemplateEngineService;
import com.mailtoall.user.entity.User;
import com.mailtoall.worker.service.CampaignWorkerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignRecipientRepository recipientRepository;
    private final GmailAccountRepository gmailAccountRepository;
    private final ContactListRepository contactListRepository;
    private final ContactRepository contactRepository;
    private final EmailTemplateRepository templateRepository;
    private final TemplateEngineService templateEngineService;
    private final CampaignWorkerService campaignWorkerService;

    public CampaignService(
            CampaignRepository campaignRepository,
            CampaignRecipientRepository recipientRepository,
            GmailAccountRepository gmailAccountRepository,
            ContactListRepository contactListRepository,
            ContactRepository contactRepository,
            EmailTemplateRepository templateRepository,
            TemplateEngineService templateEngineService,
            CampaignWorkerService campaignWorkerService) {
        this.campaignRepository = campaignRepository;
        this.recipientRepository = recipientRepository;
        this.gmailAccountRepository = gmailAccountRepository;
        this.contactListRepository = contactListRepository;
        this.contactRepository = contactRepository;
        this.templateRepository = templateRepository;
        this.templateEngineService = templateEngineService;
        this.campaignWorkerService = campaignWorkerService;
    }

    @Transactional
    public Campaign createCampaign(User user, Map<String, Object> req) {
        String name = (String) req.get("name");
        String subject = (String) req.get("subject");
        String bodyHtml = (String) req.get("body_html");
        String gmailAccountId = (String) req.get("gmail_account_id");
        String contactListId = (String) req.get("contact_list_id");
        String templateId = (String) req.get("template_id");

        GmailAccount gmailAccount = gmailAccountRepository.findByIdAndUserId(UUID.fromString(gmailAccountId), user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Gmail Account not found or unauthorized"));

        Campaign.CampaignBuilder builder = Campaign.builder()
                .user(user)
                .name(name)
                .subject(subject)
                .bodyHtml(bodyHtml)
                .gmailAccount(gmailAccount)
                .status(CampaignStatus.DRAFT);

        if (contactListId != null) {
            contactListRepository.findByIdAndUserId(UUID.fromString(contactListId), user.getId())
                    .ifPresent(builder::contactList);
        }
        if (templateId != null) {
            templateRepository.findByIdAndUserId(UUID.fromString(templateId), user.getId())
                    .ifPresent(builder::template);
        }

        Campaign campaign = campaignRepository.save(builder.build());

        // Create campaign recipient records from contact list
        if (campaign.getContactList() != null) {
            List<Contact> contacts = contactRepository.findByContactListId(campaign.getContactList().getId());
            List<CampaignRecipient> recipients = new ArrayList<>();
            for (Contact contact : contacts) {
                recipients.add(CampaignRecipient.builder()
                        .campaign(campaign)
                        .contact(contact)
                        .recipientEmail(contact.getEmail())
                        .recipientName(contact.getName())
                        .status(RecipientStatus.QUEUED)
                        .build());
            }
            recipientRepository.saveAll(recipients);
            campaign.setTotalRecipients(recipients.size());
            campaignRepository.save(campaign);
        }

        return campaign;
    }

    @Transactional
    public Campaign startCampaign(UUID campaignId, User user) {
        Campaign campaign = campaignRepository.findByIdAndUserId(campaignId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        if (campaign.getStatus() == CampaignStatus.RUNNING || campaign.getStatus() == CampaignStatus.COMPLETED) {
            throw new IllegalStateException("Campaign cannot be started in state: " + campaign.getStatus());
        }

        campaign.setStatus(CampaignStatus.QUEUED);
        campaignRepository.save(campaign);

        // Async execution via Redis / Spring Worker
        campaignWorkerService.executeCampaignJob(campaign);

        return campaign;
    }

    @Transactional
    public Campaign pauseCampaign(UUID campaignId, User user) {
        Campaign campaign = campaignRepository.findByIdAndUserId(campaignId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        campaign.setStatus(CampaignStatus.PAUSED);
        return campaignRepository.save(campaign);
    }

    @Transactional
    public Campaign resumeCampaign(UUID campaignId, User user) {
        Campaign campaign = campaignRepository.findByIdAndUserId(campaignId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        campaign.setStatus(CampaignStatus.RUNNING);
        campaignRepository.save(campaign);

        campaignWorkerService.executeCampaignJob(campaign);
        return campaign;
    }

    @Transactional
    public Campaign cancelCampaign(UUID campaignId, User user) {
        Campaign campaign = campaignRepository.findByIdAndUserId(campaignId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        campaign.setStatus(CampaignStatus.CANCELLED);
        return campaignRepository.save(campaign);
    }

    public Map<String, String> previewCampaign(UUID campaignId, User user) {
        Campaign campaign = campaignRepository.findByIdAndUserId(campaignId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));

        Contact dummyContact = null;
        if (campaign.getContactList() != null) {
            List<Contact> contacts = contactRepository.findByContactListId(campaign.getContactList().getId());
            if (!contacts.isEmpty()) {
                dummyContact = contacts.get(0);
            }
        }
        if (dummyContact == null) {
            dummyContact = Contact.builder()
                    .name("Alex Smith")
                    .email("alex@example.com")
                    .company("Innovate Tech")
                    .role("Head of Engineering")
                    .location("San Francisco")
                    .build();
        }

        String renderedSubject = templateEngineService.render(campaign.getSubject(), dummyContact);
        String renderedBody = templateEngineService.render(campaign.getBodyHtml(), dummyContact);

        Map<String, String> preview = new HashMap<>();
        preview.put("subject", renderedSubject);
        preview.put("body_html", renderedBody);
        return preview;
    }
}
