package com.mailtoall.contact.repository;

import com.mailtoall.contact.entity.ContactList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactListRepository extends JpaRepository<ContactList, UUID> {
    List<ContactList> findByUserId(UUID userId);
    Optional<ContactList> findByIdAndUserId(UUID id, UUID userId);
}
