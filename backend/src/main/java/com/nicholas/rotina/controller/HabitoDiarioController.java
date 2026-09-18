package com.nicholas.rotina.controller;

import com.nicholas.rotina.dto.ReordenarHabitosRequest;
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
        return repository.findAllByOrderByOrdemAsc();
    }

    /**
     * A ordem do novo hábito é calculada automaticamente (max atual + 1),
     * então ele sempre entra no fim da lista do seu período.
     */
    @PostMapping
    public ResponseEntity<HabitoDiario> criar(@Valid @RequestBody HabitoDiarioRequest request) {
        HabitoDiario habito = new HabitoDiario();
        habito.setNome(request.getNome());
        if (request.getPeriodo() != null) habito.setPeriodo(request.getPeriodo());
        habito.setMeta(request.getMeta());
        int proximaOrdem = repository.findAllByOrderByOrdemAsc().stream()
                .mapToInt(HabitoDiario::getOrdem)
                .max()
                .orElse(-1) + 1;
        habito.setOrdem(proximaOrdem);
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

    /**
     * Recebe a lista completa de hábitos já na ordem/período finais
     * (o frontend calcula isso no drag-and-drop) e só persiste — o
     * backend não decide a nova posição, apenas grava o que chegou.
     */
    @PutMapping("/reordenar")
    public ResponseEntity<List<HabitoDiario>> reordenar(@Valid @RequestBody ReordenarHabitosRequest request) {
        List<HabitoDiario> atualizados = request.getHabitos().stream().map(item -> {
            HabitoDiario habito = repository.findById(item.getId())
                    .orElseThrow(() -> new IllegalArgumentException("hábito não encontrado: " + item.getId()));
            habito.setPeriodo(item.getPeriodo());
            habito.setOrdem(item.getOrdem());
            return habito;
        }).toList();
        repository.saveAll(atualizados);
        return ResponseEntity.ok(repository.findAllByOrderByOrdemAsc());
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
