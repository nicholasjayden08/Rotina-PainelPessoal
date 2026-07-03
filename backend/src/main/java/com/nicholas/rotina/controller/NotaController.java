package com.nicholas.rotina.controller;

import com.nicholas.rotina.dto.NotaRequest;
import com.nicholas.rotina.model.Nota;
import com.nicholas.rotina.repository.NotaRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notas")
public class NotaController {

    private final NotaRepository repository;

    public NotaController(NotaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Nota> listar() {
        return repository.findAllByOrderByDataAtualizacaoDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Nota> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Nota> criar(@Valid @RequestBody NotaRequest request) {
        Nota nota = new Nota();
        nota.setTitulo(request.getTitulo());
        nota.setConteudo(request.getConteudo() != null ? request.getConteudo() : "");
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(nota));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Nota> atualizar(@PathVariable Long id, @Valid @RequestBody NotaRequest request) {
        return repository.findById(id).map(nota -> {
            nota.setTitulo(request.getTitulo());
            nota.setConteudo(request.getConteudo() != null ? request.getConteudo() : "");
            return ResponseEntity.ok(repository.save(nota));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.notFound().build();
    }
}
