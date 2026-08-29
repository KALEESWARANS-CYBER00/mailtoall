package com.mailtoall.contact.service;

import com.mailtoall.contact.entity.Contact;
import com.mailtoall.contact.entity.ContactList;
import com.mailtoall.contact.repository.ContactListRepository;
import com.mailtoall.contact.repository.ContactRepository;
import com.mailtoall.suppression.repository.SuppressionRepository;
import com.mailtoall.user.entity.User;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class CsvImportService {

    private final ContactRepository contactRepository;
    private final ContactListRepository contactListRepository;
    private final SuppressionRepository suppressionRepository;

    public CsvImportService(
            ContactRepository contactRepository,
            ContactListRepository contactListRepository,
            SuppressionRepository suppressionRepository) {
        this.contactRepository = contactRepository;
        this.contactListRepository = contactListRepository;
        this.suppressionRepository = suppressionRepository;
    }

    @Transactional
    public Map<String, Object> importCsv(User user, MultipartFile file, String listName) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty");
        }

        ContactList contactList = ContactList.builder()
                .user(user)
                .name(listName != null && !listName.trim().isEmpty() ? listName : "Import " + System.currentTimeMillis())
                .totalContacts(0)
                .build();
        contactList = contactListRepository.save(contactList);

        int totalRows = 0;
        int validCount = 0;
        int duplicateCount = 0;
        int suppressedCount = 0;
        int invalidCount = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setIgnoreSurroundingSpaces(true).build())) {

            Map<String, Integer> headerMap = csvParser.getHeaderMap();
            String emailHeader = findHeader(headerMap, "email", "emails");

            if (emailHeader == null) {
                throw new IllegalArgumentException("CSV missing 'email' or 'emails' column header");
            }

            String nameHeader = findHeader(headerMap, "name", "full_name");
            String companyHeader = findHeader(headerMap, "company", "organization");
            String roleHeader = findHeader(headerMap, "role", "title", "position");
            String locationHeader = findHeader(headerMap, "location", "city", "country");

            for (CSVRecord record : csvParser) {
                totalRows++;
                String rawEmail = record.get(emailHeader);
                if (rawEmail == null || rawEmail.trim().isEmpty()) {
                    invalidCount++;
                    continue;
                }

                // Handle multi-recipient rows separated by comma or semicolon
                String[] emails = rawEmail.replace(";", ",").split(",");
                for (String emailItem : emails) {
                    String cleanEmail = emailItem.trim().toLowerCase();
                    if (!isValidEmail(cleanEmail)) {
                        invalidCount++;
                        continue;
                    }

                    if (suppressionRepository.existsByUserIdAndEmail(user.getId(), cleanEmail)) {
                        suppressedCount++;
                        continue;
                    }

                    if (contactRepository.existsByUserIdAndEmail(user.getId(), cleanEmail)) {
                        duplicateCount++;
                        continue;
                    }

                    Map<String, String> customFields = new HashMap<>();
                    for (Map.Entry<String, Integer> entry : headerMap.entrySet()) {
                        String col = entry.getKey();
                        if (!col.equalsIgnoreCase(emailHeader) && record.isSet(col)) {
                            customFields.put(col.toLowerCase(), record.get(col));
                        }
                    }

                    Contact contact = Contact.builder()
                            .user(user)
                            .contactList(contactList)
                            .email(cleanEmail)
                            .name(nameHeader != null && record.isSet(nameHeader) ? record.get(nameHeader) : null)
                            .company(companyHeader != null && record.isSet(companyHeader) ? record.get(companyHeader) : null)
                            .role(roleHeader != null && record.isSet(roleHeader) ? record.get(roleHeader) : null)
                            .location(locationHeader != null && record.isSet(locationHeader) ? record.get(locationHeader) : null)
                            .customFields(customFields)
                            .status("SUBSCRIBED")
                            .build();

                    contactRepository.save(contact);
                    validCount++;
                }
            }
        }

        contactList.setTotalContacts(validCount);
        contactListRepository.save(contactList);

        Map<String, Object> summary = new HashMap<>();
        summary.put("contact_list_id", contactList.getId());
        summary.put("contact_list_name", contactList.getName());
        summary.put("total_rows_parsed", totalRows);
        summary.put("valid_imported", validCount);
        summary.put("duplicates_skipped", duplicateCount);
        summary.put("suppressed_skipped", suppressedCount);
        summary.put("invalid_skipped", invalidCount);

        return summary;
    }

    private String findHeader(Map<String, Integer> headerMap, String... candidates) {
        for (String candidate : candidates) {
            for (String actualHeader : headerMap.keySet()) {
                if (actualHeader.equalsIgnoreCase(candidate)) {
                    return actualHeader;
                }
            }
        }
        return null;
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    }
}
