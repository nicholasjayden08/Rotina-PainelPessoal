package com.nicholas.rotina.controller;

import com.nicholas.rotina.dto.FocoRequest;
import com.nicholas.rotina.model.Foco;
import com.nicholas.rotina.repository.FocoRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessoes-foco")
public class FocoController {

    private final FocoRepository repository;

    public FocoController(FocoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Foco> listar() {
        return repository.findAllByOrderByConcluidaEmDesc();
    }

    @PostMapping
    public ResponseEntity<Foco> criar(@Valid @RequestBody FocoRequest request) {
        Foco sessao = new Foco();
        sessao.setTitulo(request.getTitulo());
        sessao.setDuracaoMinutos(request.getDuracaoMinutos());
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(sessao));
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