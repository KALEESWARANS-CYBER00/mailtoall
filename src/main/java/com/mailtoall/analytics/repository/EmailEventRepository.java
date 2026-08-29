package com.mailtoall.analytics.repository;

import com.mailtoall.analytics.entity.EmailEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmailEventRepository extends JpaRepository<EmailEvent, UUID> {
    List<EmailEvent> findByCampaignIdOrderByCreatedAtDesc(UUID campaignId);
}
