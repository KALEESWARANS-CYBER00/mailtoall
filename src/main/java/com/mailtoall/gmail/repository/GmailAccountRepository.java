package com.mailtoall.gmail.repository;

import com.mailtoall.gmail.entity.GmailAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GmailAccountRepository extends JpaRepository<GmailAccount, UUID> {
    List<GmailAccount> findByUserId(UUID userId);
    Optional<GmailAccount> findByIdAndUserId(UUID id, UUID userId);
    Optional<GmailAccount> findByUserIdAndEmail(UUID userId, String email);
    Optional<GmailAccount> findByUserIdAndIsDefaultTrue(UUID userId);
}
