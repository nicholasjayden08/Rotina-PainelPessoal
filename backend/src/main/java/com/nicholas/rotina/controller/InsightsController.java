package com.nicholas.rotina.controller;

import com.nicholas.rotina.dto.InsightItemRequest;
import com.nicholas.rotina.dto.InsightResponseRequest;
import com.nicholas.rotina.model.Humor;
import com.nicholas.rotina.model.RegistroAtomico;
import com.nicholas.rotina.repository.RegistroAtomicoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/insights")
public class InsightsController {

    // dias registrados mínimos no mês pra sequer tentar gerar insight
    private static final int MIN_DIAS_REGISTRADOS = 20;
    // dias mínimos em cada grupo (com hábito / sem hábito) pra comparação valer
    private static final int MIN_OCORRENCIAS_POR_GRUPO = 5;
    // diferença mínima pra considerar o padrão relevante o suficiente pra mostrar
    private static final double LIMIAR_SONO_MINUTOS = 15;
    private static final double LIMIAR_HUMOR = 0.5;
    private static final double LIMIAR_AGUA = 0.3;
    private static final int MAX_INSIGHTS = 3;

    private final RegistroAtomicoRepository repository;

    public InsightsController(RegistroAtomicoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public InsightResponseRequest buscarInsights(@RequestParam int ano, @RequestParam int mes) {
        YearMonth yearMonth = YearMonth.of(ano, mes);
        LocalDate inicio = yearMonth.atDay(1);
        LocalDate fim = yearMonth.atEndOfMonth();

        List<RegistroAtomico> registros = repository.findByDataBetween(inicio, fim);

        InsightResponseRequest response = new InsightResponseRequest();

        long diasRegistrados = registros.stream().filter(this::temAlgumDado).count();

        if (diasRegistrados < MIN_DIAS_REGISTRADOS) {
            response.setDadosSuficientes(false);
            response.setInsights(List.of());
            return response;
        }

        List<Candidato> candidatos = new ArrayList<>();

        Map<String, Predicate<RegistroAtomico>> condicoes = new LinkedHashMap<>();
        condicoes.put("academia", RegistroAtomico::isAcademia);
        condicoes.put("estudos", RegistroAtomico::isEstudos);
        condicoes.put("trabalho", RegistroAtomico::isTrabalho);
        condicoes.put("acordar cedo", RegistroAtomico::isAcordarCedo);

        for (Map.Entry<String, Predicate<RegistroAtomico>> entry : condicoes.entrySet()) {
            String nome = entry.getKey();
            Predicate<RegistroAtomico> predicado = entry.getValue();

            List<RegistroAtomico> comHabito = registros.stream().filter(predicado).collect(Collectors.toList());
            List<RegistroAtomico> semHabito = registros.stream().filter(r -> !predicado.test(r)).collect(Collectors.toList());

            avaliarSono(nome, comHabito, semHabito, candidatos);
            avaliarHumor(nome, comHabito, semHabito, candidatos);
            avaliarAgua(nome, comHabito, semHabito, candidatos);
        }

        List<InsightItemRequest> selecionados = candidatos.stream()
                .sorted(Comparator.comparingDouble(Candidato::forca).reversed())
                .limit(MAX_INSIGHTS)
                .map(c -> new InsightItemRequest(c.tipo(), c.mensagem()))
                .collect(Collectors.toList());

        response.setDadosSuficientes(true);
        response.setInsights(selecionados);
        return response;
    }

    private boolean temAlgumDado(RegistroAtomico r) {
        return r.getAgua() > 0
                || r.getHumor() != null
                || r.getSono() != null
                || r.isEstudos()
                || r.isTrabalho()
                || r.isAcademia()
                || r.isAcordarCedo()
                || r.getAcordeiAs() != null
                || r.getDormiAs() != null;
    }

    private void avaliarSono(String nomeCondicao, List<RegistroAtomico> comHabito, List<RegistroAtomico> semHabito, List<Candidato> candidatos) {
        List<Long> minutosCom = minutosSono(comHabito);
        List<Long> minutosSem = minutosSono(semHabito);

        if (minutosCom.size() < MIN_OCORRENCIAS_POR_GRUPO || minutosSem.size() < MIN_OCORRENCIAS_POR_GRUPO) return;

        double mediaCom = minutosCom.stream().mapToLong(Long::longValue).average().orElse(0);
        double mediaSem = minutosSem.stream().mapToLong(Long::longValue).average().orElse(0);
        double diff = mediaCom - mediaSem;

        if (Math.abs(diff) < LIMIAR_SONO_MINUTOS) return;

        String direcao = diff > 0 ? "a mais" : "a menos";
        String mensagem = String.format(
                "Nos dias em que você registrou %s, você dormiu em média %d minutos %s.",
                nomeCondicao, Math.round(Math.abs(diff)), direcao
        );

        candidatos.add(new Candidato("sono", mensagem, Math.abs(diff) / Math.max(mediaSem, 1)));
    }

    private List<Long> minutosSono(List<RegistroAtomico> lista) {
        return lista.stream()
                .filter(r -> r.getDormiAs() != null && r.getAcordeiAs() != null)
                .map(r -> {
                    long dormir = r.getDormiAs().toSecondOfDay();
                    long acordar = r.getAcordeiAs().toSecondOfDay();
                    long diff = acordar >= dormir ? acordar - dormir : (86400 - dormir) + acordar;
                    return diff / 60;
                })
                .collect(Collectors.toList());
    }

    private void avaliarHumor(String nomeCondicao, List<RegistroAtomico> comHabito, List<RegistroAtomico> semHabito, List<Candidato> candidatos) {
        List<Integer> humorCom = comHabito.stream()
                .map(RegistroAtomico::getHumor).filter(Objects::nonNull).map(this::scoreHumor)
                .collect(Collectors.toList());
        List<Integer> humorSem = semHabito.stream()
                .map(RegistroAtomico::getHumor).filter(Objects::nonNull).map(this::scoreHumor)
                .collect(Collectors.toList());

        if (humorCom.size() < MIN_OCORRENCIAS_POR_GRUPO || humorSem.size() < MIN_OCORRENCIAS_POR_GRUPO) return;

        double mediaCom = humorCom.stream().mapToInt(Integer::intValue).average().orElse(0);
        double mediaSem = humorSem.stream().mapToInt(Integer::intValue).average().orElse(0);
        double diff = mediaCom - mediaSem;

        if (Math.abs(diff) < LIMIAR_HUMOR) return;

        String direcao = diff > 0 ? "melhor" : "pior";
        String mensagem = String.format(
                "Seu humor médio foi %s nos dias em que você registrou %s.",
                direcao, nomeCondicao
        );

        candidatos.add(new Candidato("humor", mensagem, Math.abs(diff) / Math.max(mediaSem, 1)));
    }

    private int scoreHumor(Humor humor) {
        return switch (humor) {
            case PRODUTIVO -> 5;
            case NORMAL -> 4;
            case ANSIOSO -> 3;
            case CANSADO -> 2;
            case TRISTE -> 1;
        };
    }

    private void avaliarAgua(String nomeCondicao, List<RegistroAtomico> comHabito, List<RegistroAtomico> semHabito, List<Candidato> candidatos) {
        List<Double> aguaCom = comHabito.stream().map(RegistroAtomico::getAgua).filter(a -> a > 0).collect(Collectors.toList());
        List<Double> aguaSem = semHabito.stream().map(RegistroAtomico::getAgua).filter(a -> a > 0).collect(Collectors.toList());

        if (aguaCom.size() < MIN_OCORRENCIAS_POR_GRUPO || aguaSem.size() < MIN_OCORRENCIAS_POR_GRUPO) return;

        double mediaCom = aguaCom.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double mediaSem = aguaSem.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double diff = mediaCom - mediaSem;

        if (Math.abs(diff) < LIMIAR_AGUA) return;

        String direcao = diff > 0 ? "a mais" : "a menos";
        String mensagem = String.format(
                "Nos dias em que você registrou %s, você bebeu em média %.1fL %s de água.",
                nomeCondicao, Math.abs(diff), direcao
        );

        candidatos.add(new Candidato("agua", mensagem, Math.abs(diff) / Math.max(mediaSem, 0.1)));
    }

    private record Candidato(String tipo, String mensagem, double forca) {
    }
}