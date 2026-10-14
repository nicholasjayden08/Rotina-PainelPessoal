package com.nicholas.rotina.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class BackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupService.class);
    private static final DateTimeFormatter FORMATO = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss");

    private final JdbcTemplate jdbcTemplate;
    private final Path pastaBackups;

    public BackupService(JdbcTemplate jdbcTemplate,
                         @Value("${routinely.backup.dir:./data/backups}") String dir) {
        this.jdbcTemplate = jdbcTemplate;
        this.pastaBackups = Path.of(dir).toAbsolutePath().normalize();
    }

    public Path criarBackup() throws IOException {
        Files.createDirectories(pastaBackups);
        Path destino = pastaBackups.resolve("rotina-" + LocalDateTime.now().format(FORMATO) + ".zip");
        String caminhoSql = destino.toString().replace("'", "''");
        jdbcTemplate.execute("BACKUP TO '" + caminhoSql + "'");
        log.info("Backup criado em {}", destino);
        return destino;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void backupAoIniciar() {
        try {
            criarBackup();
        } catch (Exception e) {
            log.error("Falha ao criar backup", e);
        }
    }
}