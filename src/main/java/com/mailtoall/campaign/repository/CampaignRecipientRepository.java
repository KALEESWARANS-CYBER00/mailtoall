package com.mailtoall.campaign.repository;

import com.mailtoall.campaign.entity.CampaignRecipient;
import com.mailtoall.campaign.entity.RecipientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CampaignRecipientRepository extends JpaRepository<CampaignRecipient, UUID> {
    List<CampaignRecipient> findByCampaignId(UUID campaignId);
    List<CampaignRecipient> findByCampaignIdAndStatus(UUID campaignId, RecipientStatus status);
    long countByCampaignIdAndStatus(UUID campaignId, RecipientStatus status);
}
