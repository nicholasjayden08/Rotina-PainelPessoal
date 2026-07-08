package com.nicholas.rotina.controller;

import com.nicholas.rotina.dto.RegistroAtomicoRequest;
import com.nicholas.rotina.model.RegistroAtomico;
import com.nicholas.rotina.repository.RegistroAtomicoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/registros-atomicos")
public class RegistroAtomicoController {

    private final RegistroAtomicoRepository repository;

    public RegistroAtomicoController(RegistroAtomicoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<RegistroAtomico> listarTodos() {
        return repository.findAll();
    }

    /**
     * Retorna os registros entre duas datas (inclusive), ordenados por data.
     * Usado pelo frontend para montar os gráficos de evolução (7/14/30 dias).
     * Exemplo: /api/registros-atomicos/intervalo?inicio=2026-06-01&fim=2026-06-23
     */
    @GetMapping("/intervalo")
    public List<RegistroAtomico> buscarPorIntervalo(
            @RequestParam("inicio") String inicio,
            @RequestParam("fim") String fim) {
        LocalDate dataInicio = LocalDate.parse(inicio);
        LocalDate dataFim = LocalDate.parse(fim);
        return repository.findByDataBetweenOrderByDataAsc(dataInicio, dataFim);
    }

    @GetMapping("/hoje")
    public RegistroAtomico buscarOuCriarHoje() {
        return buscarOuCriarPorData(LocalDate.now());
    }

    @GetMapping("/data/{data}")
    public RegistroAtomico buscarOuCriarPorDataPath(@PathVariable("data") String data) {
        return buscarOuCriarPorData(LocalDate.parse(data));
    }

    /**
     * Atualiza parcialmente o registro do dia (cria se não existir).
     * Só os campos enviados no body são alterados - os demais permanecem como estavam.
     * Isso permite o frontend salvar incrementalmente (ex: só mudar a água sem reenviar tudo).
     */
    @PatchMapping("/data/{data}")
    public ResponseEntity<RegistroAtomico> atualizarParcial(
            @PathVariable("data") String data,
            @RequestBody RegistroAtomicoRequest request) {

        LocalDate localDate = LocalDate.parse(data);
        RegistroAtomico registro = buscarOuCriarPorData(localDate);

        if (request.getDormiAs() != null) registro.setDormiAs(request.getDormiAs());
        if (request.getAcordeiAs() != null) registro.setAcordeiAs(request.getAcordeiAs());
        if (request.getAcordarCedo() != null) registro.setAcordarCedo(request.getAcordarCedo());
        if (request.getEstudos() != null) registro.setEstudos(request.getEstudos());
        if (request.getTrabalho() != null) registro.setTrabalho(request.getTrabalho());
        if (request.getAcademia() != null) registro.setAcademia(request.getAcademia());
        if (request.getAgua() != null) registro.setAgua(request.getAgua());
        if (request.getHumor() != null) registro.setHumor(request.getHumor());
        if (request.getSono() != null) registro.setSono(request.getSono());

        return ResponseEntity.ok(repository.save(registro));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private RegistroAtomico buscarOuCriarPorData(LocalDate data) {
        return repository.findByData(data)
                .orElseGet(() -> repository.save(new RegistroAtomico(data)));
    }
}
