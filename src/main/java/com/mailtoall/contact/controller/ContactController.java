package com.mailtoall.contact.controller;

import com.mailtoall.contact.entity.Contact;
import com.mailtoall.contact.entity.ContactList;
import com.mailtoall.contact.repository.ContactListRepository;
import com.mailtoall.contact.repository.ContactRepository;
import com.mailtoall.contact.service.CsvImportService;
import com.mailtoall.user.entity.User;
import com.mailtoall.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final CsvImportService csvImportService;
    private final ContactListRepository contactListRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    public ContactController(
            CsvImportService csvImportService,
            ContactListRepository contactListRepository,
            ContactRepository contactRepository,
            UserRepository userRepository) {
        this.csvImportService = csvImportService;
        this.contactListRepository = contactListRepository;
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

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importContacts(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "list_name", required = false) String listName) throws Exception {
        User user = getOrCreateDemoUser();
        Map<String, Object> summary = csvImportService.importCsv(user, file, listName);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/lists")
    public ResponseEntity<List<ContactList>> listContactLists() {
        User user = getOrCreateDemoUser();
        return ResponseEntity.ok(contactListRepository.findByUserId(user.getId()));
    }

    @GetMapping("/lists/{id}/contacts")
    public ResponseEntity<List<Contact>> getContactsInList(@PathVariable UUID id) {
        return ResponseEntity.ok(contactRepository.findByContactListId(id));
    }

    @GetMapping
    public ResponseEntity<List<Contact>> getAllContacts() {
        User user = getOrCreateDemoUser();
        return ResponseEntity.ok(contactRepository.findByUserId(user.getId()));
    }
}
