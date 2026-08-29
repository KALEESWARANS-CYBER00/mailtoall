package com.mailtoall.worker.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import com.mailtoall.common.security.EncryptionService;
import com.mailtoall.gmail.entity.GmailAccount;
import org.apache.commons.codec.binary.Base64;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Properties;

@Service
public class GmailApiSenderService {

    private final EncryptionService encryptionService;

    public GmailApiSenderService(EncryptionService encryptionService) {
        this.encryptionService = encryptionService;
    }

    public void sendEmail(GmailAccount account, String recipientEmail, String subject, String bodyHtml) throws Exception {
        String decryptedAccessToken = encryptionService.decrypt(account.getAccessTokenEncrypted());
        
        GoogleCredential credential = new GoogleCredential().setAccessToken(decryptedAccessToken);

        Gmail service = new Gmail.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance(),
                credential
        ).setApplicationName("MailToAll SaaS").build();

        MimeMessage mimeMessage = createEmail(recipientEmail, account.getEmail(), subject, bodyHtml);
        Message message = createMessageWithEmail(mimeMessage);

        service.users().messages().send("me", message).execute();
    }

    private MimeMessage createEmail(String to, String from, String subject, String bodyText) throws MessagingException {
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);

        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress(from));
        email.addRecipient(jakarta.mail.Message.RecipientType.TO, new InternetAddress(to));
        email.setSubject(subject, "UTF-8");
        email.setContent(bodyText, "text/html; charset=utf-8");
        return email;
    }

    private Message createMessageWithEmail(MimeMessage emailContent) throws MessagingException, IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        emailContent.writeTo(buffer);
        byte[] bytes = buffer.toByteArray();
        String encodedEmail = Base64.encodeBase64URLSafeString(bytes);

        Message message = new Message();
        message.setRaw(encodedEmail);
        return message;
    }
}
