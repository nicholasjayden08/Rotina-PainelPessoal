package com.nicholas.rotina.controller;

import com.nicholas.rotina.dto.TarefaRequest;
import com.nicholas.rotina.model.StatusTarefa;
import com.nicholas.rotina.model.Tarefa;
import com.nicholas.rotina.repository.TarefaRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    private final TarefaRepository repository;

    public TarefaController(TarefaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Tarefa> listarTodas() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tarefa> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Tarefa> criar(@Valid @RequestBody TarefaRequest request) {
        Tarefa tarefa = new Tarefa();
        aplicarRequest(tarefa, request);
        Tarefa salva = repository.save(tarefa);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tarefa> atualizar(@PathVariable Long id, @Valid @RequestBody TarefaRequest request) {
        return repository.findById(id)
                .map(tarefa -> {
                    aplicarRequest(tarefa, request);
                    return ResponseEntity.ok(repository.save(tarefa));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Tarefa> atualizarStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String novoStatus = body.get("status");
        if (novoStatus == null) {
            return ResponseEntity.badRequest().build();
        }
        StatusTarefa status;
        try {
            status = StatusTarefa.valueOf(novoStatus);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
        return repository.findById(id)
                .map(tarefa -> {
                    tarefa.setStatus(status);
                    return ResponseEntity.ok(repository.save(tarefa));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void aplicarRequest(Tarefa tarefa, TarefaRequest request) {
        tarefa.setNome(request.getNome());
        tarefa.setDescricao(request.getDescricao());
        if (request.getStatus() != null) tarefa.setStatus(request.getStatus());
        if (request.getPrioridade() != null) tarefa.setPrioridade(request.getPrioridade());
        if (request.getEsforco() != null) tarefa.setEsforco(request.getEsforco());
        tarefa.setTipos(request.getTipos() != null ? request.getTipos() : new HashSet<>());
        tarefa.setPrazo(request.getPrazo());
    }
}
