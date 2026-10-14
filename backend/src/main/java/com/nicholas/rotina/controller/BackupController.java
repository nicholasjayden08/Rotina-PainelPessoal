package com.nicholas.rotina.controller;

import com.nicholas.rotina.dto.BackupInfoResponse;
import com.nicholas.rotina.service.BackupService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/backups")
public class BackupController {

    private final BackupService backupService;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
    }

    @GetMapping
    public List<BackupInfoResponse> listar() throws IOException {
        return backupService.listarBackups();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BackupInfoResponse criar() throws IOException {
        return backupService.criarBackup();
    }
}