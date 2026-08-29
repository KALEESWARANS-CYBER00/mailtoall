package com.mailtoall.suppression.repository;

import com.mailtoall.suppression.entity.Suppression;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SuppressionRepository extends JpaRepository<Suppression, UUID> {
    List<Suppression> findByUserId(UUID userId);
    boolean existsByUserIdAndEmail(UUID userId, String email);
    Optional<Suppression> findByUserIdAndEmail(UUID userId, String email);
}
