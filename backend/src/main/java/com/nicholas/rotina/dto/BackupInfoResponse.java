package com.nicholas.rotina.dto;

import java.time.LocalDateTime;

public record BackupInfoResponse(String nome, long tamanhoBytes, LocalDateTime criadoEm) {
}