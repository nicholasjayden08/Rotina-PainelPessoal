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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * Gera insights automáticos comparando o mês inteiro em dois grupos por
 * hábito (academia, estudos, trabalho, acordar cedo): dias em que o
 * hábito foi feito vs dias em que não foi. Pra cada hábito, compara a
 * média de sono, humor e água entre os dois grupos (avaliarSono/
 * avaliarHumor/avaliarAgua) e só considera a diferença relevante se
 * passar tanto o mínimo de ocorrências (MIN_OCORRENCIAS_POR_GRUPO)
 * quanto o limiar de diferença (LIMIAR_*) — evita insight tipo "1 dia
 * de academia então dormiu melhor" com amostra pequena demais.
 *
 * Cada diferença relevante vira um Candidato com uma "força" (diferença
 * normalizada pela média do grupo sem o hábito); no fim, pega só os
 * MAX_INSIGHTS mais fortes pra mostrar.
 */
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

    // dias mínimos registrados NUM dia da semana específico pra comparação valer
    private static final int MIN_DIAS_POR_DIA_SEMANA = 3;
    // diferença mínima de taxa de conclusão (pontos percentuais) pra insight de hábito por dia da semana
    private static final double LIMIAR_TAXA_HABITO = 0.3;

    private static final Map<DayOfWeek, String> NOMES_DIAS_SEMANA = Map.of(
            DayOfWeek.MONDAY, "segundas-feiras",
            DayOfWeek.TUESDAY, "terças-feiras",
            DayOfWeek.WEDNESDAY, "quartas-feiras",
            DayOfWeek.THURSDAY, "quintas-feiras",
            DayOfWeek.FRIDAY, "sextas-feiras",
            DayOfWeek.SATURDAY, "sábados",
            DayOfWeek.SUNDAY, "domingos"
    );

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
            avaliarDiaSemanaHabito(nome, predicado, registros, candidatos);
        }

        avaliarDiaSemanaSono(registros, candidatos);
        avaliarDiaSemanaHumor(registros, candidatos);
        avaliarDiaSemanaAgua(registros, candidatos);

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

    private void avaliarDiaSemanaSono(List<RegistroAtomico> registros, List<Candidato> candidatos) {
        for (DayOfWeek dia : DayOfWeek.values()) {
            List<RegistroAtomico> nesseDia = registros.stream().filter(r -> r.getData().getDayOfWeek() == dia).collect(Collectors.toList());
            List<RegistroAtomico> outrosDias = registros.stream().filter(r -> r.getData().getDayOfWeek() != dia).collect(Collectors.toList());

            List<Long> minutosNesseDia = minutosSono(nesseDia);
            List<Long> minutosOutrosDias = minutosSono(outrosDias);

            if (minutosNesseDia.size() < MIN_DIAS_POR_DIA_SEMANA || minutosOutrosDias.size() < MIN_OCORRENCIAS_POR_GRUPO) continue;

            double mediaNesseDia = minutosNesseDia.stream().mapToLong(Long::longValue).average().orElse(0);
            double mediaOutrosDias = minutosOutrosDias.stream().mapToLong(Long::longValue).average().orElse(0);
            double diff = mediaNesseDia - mediaOutrosDias;

            if (Math.abs(diff) < LIMIAR_SONO_MINUTOS) continue;

            String direcao = diff > 0 ? "a mais" : "a menos";
            String mensagem = String.format(
                    "Suas %s costumam ter sono %d minutos %s que a média.",
                    NOMES_DIAS_SEMANA.get(dia), Math.round(Math.abs(diff)), direcao
            );

            candidatos.add(new Candidato("dia_semana", mensagem, Math.abs(diff) / Math.max(mediaOutrosDias, 1)));
        }
    }

    private void avaliarDiaSemanaHumor(List<RegistroAtomico> registros, List<Candidato> candidatos) {
        for (DayOfWeek dia : DayOfWeek.values()) {
            List<Integer> humorNesseDia = registros.stream()
                    .filter(r -> r.getData().getDayOfWeek() == dia)
                    .map(RegistroAtomico::getHumor).filter(Objects::nonNull).map(this::scoreHumor)
                    .collect(Collectors.toList());
            List<Integer> humorOutrosDias = registros.stream()
                    .filter(r -> r.getData().getDayOfWeek() != dia)
                    .map(RegistroAtomico::getHumor).filter(Objects::nonNull).map(this::scoreHumor)
                    .collect(Collectors.toList());

            if (humorNesseDia.size() < MIN_DIAS_POR_DIA_SEMANA || humorOutrosDias.size() < MIN_OCORRENCIAS_POR_GRUPO) continue;

            double mediaNesseDia = humorNesseDia.stream().mapToInt(Integer::intValue).average().orElse(0);
            double mediaOutrosDias = humorOutrosDias.stream().mapToInt(Integer::intValue).average().orElse(0);
            double diff = mediaNesseDia - mediaOutrosDias;

            if (Math.abs(diff) < LIMIAR_HUMOR) continue;

            String direcao = diff > 0 ? "melhor" : "pior";
            String mensagem = String.format(
                    "Seu humor tende a ser %s às %s.",
                    direcao, NOMES_DIAS_SEMANA.get(dia)
            );

            candidatos.add(new Candidato("dia_semana", mensagem, Math.abs(diff) / Math.max(mediaOutrosDias, 1)));
        }
    }

    private void avaliarDiaSemanaAgua(List<RegistroAtomico> registros, List<Candidato> candidatos) {
        for (DayOfWeek dia : DayOfWeek.values()) {
            List<Double> aguaNesseDia = registros.stream()
                    .filter(r -> r.getData().getDayOfWeek() == dia)
                    .map(RegistroAtomico::getAgua).filter(a -> a > 0).collect(Collectors.toList());
            List<Double> aguaOutrosDias = registros.stream()
                    .filter(r -> r.getData().getDayOfWeek() != dia)
                    .map(RegistroAtomico::getAgua).filter(a -> a > 0).collect(Collectors.toList());

            if (aguaNesseDia.size() < MIN_DIAS_POR_DIA_SEMANA || aguaOutrosDias.size() < MIN_OCORRENCIAS_POR_GRUPO) continue;

            double mediaNesseDia = aguaNesseDia.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            double mediaOutrosDias = aguaOutrosDias.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            double diff = mediaNesseDia - mediaOutrosDias;

            if (Math.abs(diff) < LIMIAR_AGUA) continue;

            String direcao = diff > 0 ? "a mais" : "a menos";
            String mensagem = String.format(
                    "Você bebe em média %.1fL %s de água às %s.",
                    Math.abs(diff), direcao, NOMES_DIAS_SEMANA.get(dia)
            );

            candidatos.add(new Candidato("dia_semana", mensagem, Math.abs(diff) / Math.max(mediaOutrosDias, 0.1)));
        }
    }

    private void avaliarDiaSemanaHabito(String nomeHabito, Predicate<RegistroAtomico> predicado, List<RegistroAtomico> registros, List<Candidato> candidatos) {
        for (DayOfWeek dia : DayOfWeek.values()) {
            List<RegistroAtomico> nesseDia = registros.stream().filter(r -> r.getData().getDayOfWeek() == dia).collect(Collectors.toList());
            List<RegistroAtomico> outrosDias = registros.stream().filter(r -> r.getData().getDayOfWeek() != dia).collect(Collectors.toList());

            if (nesseDia.size() < MIN_DIAS_POR_DIA_SEMANA || outrosDias.size() < MIN_OCORRENCIAS_POR_GRUPO) continue;

            double taxaNesseDia = nesseDia.stream().filter(predicado).count() / (double) nesseDia.size();
            double taxaOutrosDias = outrosDias.stream().filter(predicado).count() / (double) outrosDias.size();
            double diff = taxaNesseDia - taxaOutrosDias;

            if (Math.abs(diff) < LIMIAR_TAXA_HABITO) continue;

            String mensagem = diff > 0
                    ? String.format("Você costuma manter %s em dia às %s.", nomeHabito, NOMES_DIAS_SEMANA.get(dia))
                    : String.format("Você costuma deixar %s de lado às %s.", nomeHabito, NOMES_DIAS_SEMANA.get(dia));

            candidatos.add(new Candidato("dia_semana", mensagem, Math.abs(diff)));
        }
    }

    private record Candidato(String tipo, String mensagem, double forca) {
    }
}