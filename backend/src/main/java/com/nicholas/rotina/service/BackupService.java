package com.nicholas.rotina.service;

import com.nicholas.rotina.dto.BackupInfoResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
public class BackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupService.class);
    private static final DateTimeFormatter FORMATO = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss");
    private static final String PREFIXO = "rotina-";
    private static final String SUFIXO = ".zip";
    private static final long HORAS_ENTRE_BACKUPS = 24;

    private final JdbcTemplate jdbcTemplate;
    private final Path pastaBackups;
    private final int manter;

    public BackupService(JdbcTemplate jdbcTemplate,
                         @Value("${routinely.backup.dir:./data/backups}") String dir,
                         @Value("${routinely.backup.keep:7}") int manter) {
        this.jdbcTemplate = jdbcTemplate;
        this.pastaBackups = Path.of(dir).toAbsolutePath().normalize();
        this.manter = Math.max(1, manter);
    }

    public synchronized BackupInfoResponse criarBackup() throws IOException {
        Files.createDirectories(pastaBackups);
        Path destino = pastaBackups.resolve(PREFIXO + LocalDateTime.now().format(FORMATO) + SUFIXO);
        String caminhoSql = destino.toString().replace("'", "''");
        jdbcTemplate.execute("BACKUP TO '" + caminhoSql + "'");
        log.info("Backup criado em {}", destino);
        aplicarRotacao();
        return paraInfo(destino);
    }

    public List<BackupInfoResponse> listarBackups() throws IOException {
        List<BackupInfoResponse> resultado = new ArrayList<>();
        for (Path arquivo : listarArquivos()) {
            resultado.add(paraInfo(arquivo));
        }
        return resultado;
    }

    // roda todo dia às 3h enquanto o app estiver no ar
    @Scheduled(cron = "0 0 3 * * *")
    public void backupAgendado() {
        try {
            criarBackup();
        } catch (Exception e) {
            log.error("Falha no backup agendado", e);
        }
    }

    // o Mac pode estar dormindo às 3h, então ao subir confere se o último backup já passou de 24h
    @EventListener(ApplicationReadyEvent.class)
    public void backupAoIniciar() {
        try {
            List<Path> existentes = listarArquivos();
            if (!existentes.isEmpty()) {
                Instant ultimo = Files.getLastModifiedTime(existentes.get(0)).toInstant();
                if (Duration.between(ultimo, Instant.now()).toHours() < HORAS_ENTRE_BACKUPS) {
                    log.info("Backup recente encontrado, pulando backup de inicialização");
                    return;
                }
            }
            criarBackup();
        } catch (Exception e) {
            log.error("Falha no backup de inicialização", e);
        }
    }

    // só mexe em arquivos rotina-*.zip dentro da pasta de backups, mais novo primeiro
    private List<Path> listarArquivos() throws IOException {
        if (!Files.isDirectory(pastaBackups)) {
            return List.of();
        }
        try (Stream<Path> arquivos = Files.list(pastaBackups)) {
            return arquivos
                    .filter(p -> {
                        String nome = p.getFileName().toString();
                        return nome.startsWith(PREFIXO) && nome.endsWith(SUFIXO);
                    })
                    .sorted(Comparator.comparing((Path p) -> p.getFileName().toString()).reversed())
                    .toList();
        }
    }

    private void aplicarRotacao() throws IOException {
        List<Path> arquivos = listarArquivos();
        for (int i = manter; i < arquivos.size(); i++) {
            Files.deleteIfExists(arquivos.get(i));
            log.info("Backup antigo removido: {}", arquivos.get(i).getFileName());
        }
    }

    private BackupInfoResponse paraInfo(Path arquivo) throws IOException {
        LocalDateTime criadoEm = LocalDateTime.ofInstant(
                Files.getLastModifiedTime(arquivo).toInstant(), ZoneId.systemDefault());
        return new BackupInfoResponse(arquivo.getFileName().toString(), Files.size(arquivo), criadoEm);
    }
}