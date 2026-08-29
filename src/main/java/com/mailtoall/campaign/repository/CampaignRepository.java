package com.mailtoall.campaign.repository;

import com.mailtoall.campaign.entity.Campaign;
import com.mailtoall.campaign.entity.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, UUID> {
    List<Campaign> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Campaign> findByIdAndUserId(UUID id, UUID userId);
    List<Campaign> findByStatus(CampaignStatus status);
}
