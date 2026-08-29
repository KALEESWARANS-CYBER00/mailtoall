package com.mailtoall.template.service;

import com.mailtoall.contact.entity.Contact;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TemplateEngineService {

    private static final Pattern VAR_PATTERN = Pattern.compile("\\{\\{\\s*([^{}]+)\\s*\\}\\}");
    private static final Pattern IF_PATTERN = Pattern.compile("\\{\\{#if\\s+([a-zA-Z0-9_]+)\\}\\}(.*?)\\{\\{/if\\}\\}", Pattern.DOTALL);

    public String render(String template, Contact contact) {
        if (template == null || template.isEmpty() || contact == null) {
            return template;
        }

        // 1. Process conditional blocks {{#if variable}}...{{/if}}
        String processed = processConditionals(template, contact);

        // 2. Process variable substitution {{ variable }}
        return processVariables(processed, contact);
    }

    private String processConditionals(String text, Contact contact) {
        Matcher matcher = IF_PATTERN.matcher(text);
        StringBuilder sb = new StringBuilder();

        while (matcher.find()) {
            String varName = matcher.group(1).trim();
            String innerContent = matcher.group(2);
            String val = getVariableValue(varName, contact);

            if (val != null && !val.trim().isEmpty()) {
                matcher.appendReplacement(sb, Matcher.quoteReplacement(innerContent));
            } else {
                matcher.appendReplacement(sb, "");
            }
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private String processVariables(String text, Contact contact) {
        Matcher matcher = VAR_PATTERN.matcher(text);
        StringBuilder sb = new StringBuilder();

        while (matcher.find()) {
            String varName = matcher.group(1).trim();
            String replacement = getVariableValue(varName, contact);
            if (replacement == null) {
                replacement = "";
            }
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private String getVariableValue(String varName, Contact contact) {
        if ("name".equalsIgnoreCase(varName)) return contact.getName();
        if ("email".equalsIgnoreCase(varName)) return contact.getEmail();
        if ("company".equalsIgnoreCase(varName)) return contact.getCompany();
        if ("role".equalsIgnoreCase(varName)) return contact.getRole();
        if ("location".equalsIgnoreCase(varName)) return contact.getLocation();

        if (contact.getCustomFields() != null) {
            if (contact.getCustomFields().containsKey(varName)) {
                return contact.getCustomFields().get(varName);
            }
            String lower = varName.toLowerCase();
            for (Map.Entry<String, String> entry : contact.getCustomFields().entrySet()) {
                if (entry.getKey().equalsIgnoreCase(lower)) {
                    return entry.getValue();
                }
            }
        }
        return "";
    }
}
