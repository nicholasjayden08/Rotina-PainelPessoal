package com.nicholas.rotina.controller;

import com.nicholas.rotina.dto.RetrospectivaAguaRequest;
import com.nicholas.rotina.dto.RetrospectivaDiaSemanaRequest;
import com.nicholas.rotina.dto.RetrospectivaHabitoRequest;
import com.nicholas.rotina.dto.RetrospectivaMesRequest;
import com.nicholas.rotina.dto.RetrospectivaNoiteRequest;
import com.nicholas.rotina.dto.RetrospectivaRequest;
import com.nicholas.rotina.dto.RetrospectivaSonoRequest;
import com.nicholas.rotina.model.RegistroAtomico;
import com.nicholas.rotina.repository.RegistroAtomicoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * Retrospectiva anual dos registros atômicos (só leitura): dias registrados,
 * água, hábitos com maior sequência, dia da semana e mês mais consistentes
 * e resumo de sono. Dia da semana, mês e sono vêm null quando não há dado
 * suficiente (MIN_DIAS_*). Sequências contam dias corridos consecutivos.
 * Tudo observacional (contagens e médias), sem inferir causa.
 * Exemplo: /api/retrospectiva?ano=2026 (sem "ano", usa o ano atual).
 */
@RestController
@RequestMapping("/api/retrospectiva")
public class RetrospectivaController {

    private final RegistroAtomicoRepository repository;

    private static final double WATER_GOAL = 4.0;
    private static final int MIN_DIAS_DIA_SEMANA = 3;
    private static final int MIN_DIAS_MES = 7;

    private static final Map<String, Predicate<RegistroAtomico>> HABITOS = new LinkedHashMap<>();

    static {
        HABITOS.put("estudos", RegistroAtomico::isEstudos);
        HABITOS.put("trabalho", RegistroAtomico::isTrabalho);
        HABITOS.put("acordar cedo", RegistroAtomico::isAcordarCedo);
        HABITOS.put("academia", RegistroAtomico::isAcademia);
    }

    public RetrospectivaController(RegistroAtomicoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public RetrospectivaRequest buscar(@RequestParam(value = "ano", required = false) Integer ano) {

        int anoAlvo = ano != null ? ano : LocalDate.now().getYear();
        if (anoAlvo < 2000 || anoAlvo > 2100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ano inválido");
        }

        List<RegistroAtomico> registros = repository.findByDataBetweenOrderByDataAsc(
                LocalDate.of(anoAlvo, 1, 1),
                LocalDate.of(anoAlvo, 12, 31));

        return montarRetrospectiva(anoAlvo, registros);
    }

    private RetrospectivaRequest montarRetrospectiva(int ano, List<RegistroAtomico> registros) {

        List<RegistroAtomico> dias = registros.stream()
                .filter(r -> r.getData().getYear() == ano)
                .filter(r -> r.getAgua() > 0
                        || r.getHumor() != null
                        || r.getSono() != null
                        || r.isEstudos()
                        || r.isTrabalho()
                        || r.isAcademia()
                        || r.isAcordarCedo()
                        || r.getAcordeiAs() != null
                        || r.getDormiAs() != null)
                .sorted(Comparator.comparing(RegistroAtomico::getData))
                .toList();

        return new RetrospectivaRequest(
                ano,
                dias.size(),
                maiorSequencia(dias.stream().map(RegistroAtomico::getData).toList()),
                calcularAgua(dias),
                calcularHabitos(dias),
                calcularDiaSemanaMaisForte(dias),
                calcularMesMaisConsistente(dias),
                calcularSono(dias)
        );
    }

    private RetrospectivaAguaRequest calcularAgua(List<RegistroAtomico> dias) {
        double total = dias.stream().mapToDouble(RegistroAtomico::getAgua).sum();
        int diasNaMeta = (int) dias.stream().filter(r -> r.getAgua() >= WATER_GOAL).count();
        return new RetrospectivaAguaRequest(arredondar(total), diasNaMeta);
    }

    private List<RetrospectivaHabitoRequest> calcularHabitos(List<RegistroAtomico> dias) {
        List<RetrospectivaHabitoRequest> resposta = new ArrayList<>();

        for (Map.Entry<String, Predicate<RegistroAtomico>> habito : HABITOS.entrySet()) {
            List<LocalDate> datas = dias.stream()
                    .filter(habito.getValue())
                    .map(RegistroAtomico::getData)
                    .toList();
            resposta.add(new RetrospectivaHabitoRequest(habito.getKey(), datas.size(), maiorSequencia(datas)));
        }

        resposta.sort(Comparator.comparingInt(RetrospectivaHabitoRequest::getDiasFeitos).reversed());
        return resposta;
    }

    private RetrospectivaDiaSemanaRequest calcularDiaSemanaMaisForte(List<RegistroAtomico> dias) {

        Locale brasil = new Locale("pt", "BR");

        Map<DayOfWeek, List<RegistroAtomico>> porDia = dias.stream()
                .collect(Collectors.groupingBy(r -> r.getData().getDayOfWeek()));

        DayOfWeek melhor = null;
        double melhorMedia = -1;

        for (DayOfWeek dia : DayOfWeek.values()) {
            List<RegistroAtomico> lista = porDia.getOrDefault(dia, List.of());
            if (lista.size() < MIN_DIAS_DIA_SEMANA) continue;

            double media = mediaHabitos(lista);
            if (media > melhorMedia) {
                melhorMedia = media;
                melhor = dia;
            }
        }

        if (melhor == null) return null;
        return new RetrospectivaDiaSemanaRequest(melhor.getDisplayName(TextStyle.FULL, brasil), arredondar(melhorMedia));
    }

    private RetrospectivaMesRequest calcularMesMaisConsistente(List<RegistroAtomico> dias) {

        Locale brasil = new Locale("pt", "BR");

        Map<Month, List<RegistroAtomico>> porMes = dias.stream()
                .collect(Collectors.groupingBy(r -> r.getData().getMonth()));

        Month melhor = null;
        double melhorMedia = -1;

        for (Month mes : Month.values()) {
            List<RegistroAtomico> lista = porMes.getOrDefault(mes, List.of());
            if (lista.size() < MIN_DIAS_MES) continue;

            double media = mediaHabitos(lista);
            if (media > melhorMedia) {
                melhorMedia = media;
                melhor = mes;
            }
        }

        if (melhor == null) return null;

        String nome = melhor.getDisplayName(TextStyle.FULL, brasil);
        nome = nome.substring(0, 1).toUpperCase(brasil) + nome.substring(1);
        return new RetrospectivaMesRequest(melhor.getValue(), nome, arredondar(melhorMedia));
    }

    private RetrospectivaSonoRequest calcularSono(List<RegistroAtomico> dias) {

        List<LocalTime> dormir = dias.stream().map(RegistroAtomico::getDormiAs).filter(Objects::nonNull).toList();
        List<LocalTime> acordar = dias.stream().map(RegistroAtomico::getAcordeiAs).filter(Objects::nonNull).toList();
        if (dormir.isEmpty() && acordar.isEmpty()) return null;

        RegistroAtomico noiteMaisLonga = null;
        long maiorMinutos = 0;
        long somaMinutos = 0;
        int noitesCompletas = 0;

        for (RegistroAtomico r : dias) {
            if (r.getDormiAs() == null || r.getAcordeiAs() == null) continue;

            long minutos = minutosDeSono(r.getDormiAs(), r.getAcordeiAs());
            if (minutos <= 0) continue;

            somaMinutos += minutos;
            noitesCompletas++;

            if (minutos > maiorMinutos) {
                maiorMinutos = minutos;
                noiteMaisLonga = r;
            }
        }

        Double mediaHoras = noitesCompletas == 0 ? null : arredondar(somaMinutos / 60.0 / noitesCompletas);
        RetrospectivaNoiteRequest noite = noiteMaisLonga == null
                ? null
                : new RetrospectivaNoiteRequest(noiteMaisLonga.getData().toString(), arredondar(maiorMinutos / 60.0));

        return new RetrospectivaSonoRequest(mediaCircular(dormir), mediaCircular(acordar), mediaHoras, noite);
    }

    // minutos dormidos; se acordou "antes" de dormir, atravessou a meia-noite (+24h)
    private long minutosDeSono(LocalTime dormiu, LocalTime acordou) {
        long minutos = Duration.between(dormiu, acordou).toMinutes();
        return minutos < 0 ? minutos + 24 * 60 : minutos;
    }

    // maior sequência de dias corridos consecutivos (datas ordenadas e sem repetição)
    private int maiorSequencia(List<LocalDate> datas) {
        int maior = 0;
        int atual = 0;
        LocalDate anterior = null;

        for (LocalDate data : datas) {
            atual = (anterior != null && anterior.plusDays(1).equals(data)) ? atual + 1 : 1;
            maior = Math.max(maior, atual);
            anterior = data;
        }
        return maior;
    }

    // média circular: 23:50 e 00:10 resultam em 00:00, não em 12:00
    private String mediaCircular(List<LocalTime> horarios) {
        if (horarios.isEmpty()) return null;

        double sumSin = 0;
        double sumCos = 0;

        for (LocalTime t : horarios) {
            double angulo = 2 * Math.PI * t.toSecondOfDay() / 86400.0;
            sumSin += Math.sin(angulo);
            sumCos += Math.cos(angulo);
        }

        double anguloMedio = Math.atan2(sumSin, sumCos);
        if (anguloMedio < 0) anguloMedio += 2 * Math.PI;

        int segundos = (int) Math.round(anguloMedio / (2 * Math.PI) * 86400) % 86400;
        return String.format("%02d:%02d", segundos / 3600, (segundos % 3600) / 60);
    }

    private double mediaHabitos(List<RegistroAtomico> dias) {
        return dias.stream()
                .mapToLong(r -> HABITOS.values().stream().filter(h -> h.test(r)).count())
                .average()
                .orElse(0);
    }

    private double arredondar(double valor) {
        return Math.round(valor * 100.0) / 100.0;
    }
}