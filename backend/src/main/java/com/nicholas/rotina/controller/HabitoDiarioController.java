package com.nicholas.rotina.controller;

import com.nicholas.rotina.dto.HabitoDiarioRequest;
import com.nicholas.rotina.model.HabitoDiario;
import com.nicholas.rotina.repository.HabitoDiarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habitos-diarios")
public class HabitoDiarioController {

    private final HabitoDiarioRepository repository;

    public HabitoDiarioController(HabitoDiarioRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<HabitoDiario> listarTodos() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<HabitoDiario> criar(@Valid @RequestBody HabitoDiarioRequest request) {
        HabitoDiario habito = new HabitoDiario();
        habito.setNome(request.getNome());
        if (request.getPeriodo() != null) habito.setPeriodo(request.getPeriodo());
        habito.setMeta(request.getMeta());
        HabitoDiario salvo = repository.save(habito);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HabitoDiario> atualizar(@PathVariable Long id, @Valid @RequestBody HabitoDiarioRequest request) {
        return repository.findById(id)
                .map(habito -> {
                    habito.setNome(request.getNome());
                    if (request.getPeriodo() != null) habito.setPeriodo(request.getPeriodo());
                    habito.setMeta(request.getMeta());
                    return ResponseEntity.ok(repository.save(habito));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<HabitoDiario> alternarFeito(@PathVariable Long id) {
        return repository.findById(id)
                .map(habito -> {
                    habito.setFeito(!habito.isFeito());
                    return ResponseEntity.ok(repository.save(habito));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/resetar-dia")
    public ResponseEntity<List<HabitoDiario>> resetarDia() {
        List<HabitoDiario> todos = repository.findAll();
        todos.forEach(h -> h.setFeito(false));
        return ResponseEntity.ok(repository.saveAll(todos));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
