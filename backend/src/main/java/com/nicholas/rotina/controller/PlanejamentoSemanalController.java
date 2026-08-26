package com.nicholas.rotina.controller;

import com.nicholas.rotina.dto.PlanejamentoRequest;
import com.nicholas.rotina.model.ItemMetaSemanal;
import com.nicholas.rotina.model.PlanejamentoSemanal;
import com.nicholas.rotina.model.StatusPlanejamento;
import com.nicholas.rotina.repository.ItemMetaSemanalRepository;
import com.nicholas.rotina.repository.PlanejamentoSemanalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@RestController
@RequestMapping("/api/planejamentos")
public class PlanejamentoSemanalController {

    private final PlanejamentoSemanalRepository repository;
    private final ItemMetaSemanalRepository itemRepository;

    public PlanejamentoSemanalController(PlanejamentoSemanalRepository repository,
                                         ItemMetaSemanalRepository itemRepository) {
        this.repository = repository;
        this.itemRepository = itemRepository;
    }

    private LocalDate segundaFeiraAtual() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    @GetMapping("/semana-atual")
    public ResponseEntity<PlanejamentoSemanal> semanaAtual() {
        return repository.findByDataInicioSemana(segundaFeiraAtual())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/historico")
    public List<PlanejamentoSemanal> historico() {
        return repository.findAllByDataInicioSemanaBeforeOrderByDataInicioSemanaDesc(segundaFeiraAtual());
    }

    @PostMapping
    public ResponseEntity<PlanejamentoSemanal> criar(@RequestBody PlanejamentoRequest request) {
        LocalDate inicioSemana = segundaFeiraAtual();
        if (repository.findByDataInicioSemana(inicioSemana).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        PlanejamentoSemanal planejamento = new PlanejamentoSemanal();
        planejamento.setDataInicioSemana(inicioSemana);
        planejamento.setStatus(StatusPlanejamento.RASCUNHO);
        planejamento.setTextoBruto(request.getTextoBruto() != null ? request.getTextoBruto() : "");
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(planejamento));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanejamentoSemanal> atualizarRascunho(@PathVariable Long id, @RequestBody PlanejamentoRequest request) {
        return repository.findById(id).map(planejamento -> {
            if (planejamento.getStatus() != StatusPlanejamento.RASCUNHO) {
                return ResponseEntity.status(HttpStatus.CONFLICT).<PlanejamentoSemanal>build();
            }
            planejamento.setTextoBruto(request.getTextoBruto() != null ? request.getTextoBruto() : "");
            return ResponseEntity.ok(repository.save(planejamento));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/fechar")
    public ResponseEntity<PlanejamentoSemanal> fechar(@PathVariable Long id) {
        return repository.findById(id).map(planejamento -> {
            if (planejamento.getStatus() != StatusPlanejamento.RASCUNHO) {
                return ResponseEntity.status(HttpStatus.CONFLICT).<PlanejamentoSemanal>build();
            }

            planejamento.getItens().clear();
            String texto = planejamento.getTextoBruto() != null ? planejamento.getTextoBruto() : "";
            String[] linhas = texto.split("\\r?\\n");
            int ordem = 0;
            for (String linha : linhas) {
                String linhaTexto = linha.trim();
                if (linhaTexto.isEmpty()) continue;
                ItemMetaSemanal item = new ItemMetaSemanal();
                item.setPlanejamento(planejamento);
                item.setTexto(linhaTexto);
                item.setOrdem(ordem++);
                planejamento.getItens().add(item);
            }

            planejamento.setStatus(StatusPlanejamento.FECHADO);
            return ResponseEntity.ok(repository.save(planejamento));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/reabrir")
    public ResponseEntity<PlanejamentoSemanal> reabrir(@PathVariable Long id) {
        return repository.findById(id).map(planejamento -> {
            if (planejamento.getStatus() != StatusPlanejamento.FECHADO) {
                return ResponseEntity.status(HttpStatus.CONFLICT).<PlanejamentoSemanal>build();
            }

            StringBuilder texto = new StringBuilder();
            for (ItemMetaSemanal item : planejamento.getItens()) {
                texto.append(item.getTexto()).append("\n");
            }
            planejamento.setTextoBruto(texto.toString().stripTrailing());
            planejamento.getItens().clear();
            planejamento.setStatus(StatusPlanejamento.RASCUNHO);
            return ResponseEntity.ok(repository.save(planejamento));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/itens/{itemId}/concluir")
    public ResponseEntity<ItemMetaSemanal> alternarConcluida(@PathVariable Long itemId) {
        return itemRepository.findById(itemId).map(item -> {
            item.setConcluida(!item.isConcluida());
            return ResponseEntity.ok(itemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }
}