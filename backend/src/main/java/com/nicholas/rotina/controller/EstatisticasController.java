package com.nicholas.rotina.controller;

import com.nicholas.rotina.dto.EstatisticaMesRequest;
import com.nicholas.rotina.dto.EstatisticasRequest;
import org.springframework.web.bind.annotation.RequestParam;
import com.nicholas.rotina.model.RegistroAtomico;
import com.nicholas.rotina.repository.RegistroAtomicoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;

@RestController
@RequestMapping("/api/estatisticas")
public class EstatisticasController {

    private final RegistroAtomicoRepository repository;

    public EstatisticasController(RegistroAtomicoRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/meses")
    public List<EstatisticaMesRequest> listarMeses() {

        Locale brasil = new Locale("pt", "BR");

        Map<String, RegistroAtomico> meses = new LinkedHashMap<>();

        repository.findAll()
                .stream()
                .filter(r -> r.getAgua() > 0
                        || r.getHumor() != null
                        || r.getSono() != null
                        || r.isEstudos()
                        || r.isTrabalho()
                        || r.isAcademia()
                        || r.isAcordarCedo()
                        || r.getAcordeiAs() != null
                        || r.getDormiAs() != null)
                .sorted(Comparator.comparing(RegistroAtomico::getData).reversed())
                .forEach(registro -> {
                    String chave = registro.getData().getYear()
                            + "-"
                            + registro.getData().getMonthValue();
                    meses.putIfAbsent(chave, registro);
                });
        List<EstatisticaMesRequest> resposta = new ArrayList<>();

        for (RegistroAtomico registro : meses.values()) {
            int ano = registro.getData().getYear();
            int mes = registro.getData().getMonthValue();
            String nomeMes = Month.of(mes).getDisplayName(TextStyle.FULL, brasil);
            nomeMes = nomeMes.substring(0, 1).toUpperCase() + nomeMes.substring(1);
            resposta.add(new EstatisticaMesRequest(ano, mes, nomeMes + " " + ano));
        }

        return resposta;
    }

    @GetMapping
    public EstatisticasRequest buscarEstatisticas(
            @RequestParam int ano,
            @RequestParam int mes) {

        YearMonth yearMonth = YearMonth.of(ano, mes);
        LocalDate inicio = yearMonth.atDay(1);
        LocalDate fim = yearMonth.atEndOfMonth();

        List<RegistroAtomico> registros = repository.findByDataBetween(inicio, fim);

        EstatisticasRequest response = new EstatisticasRequest();

        int totalDias = yearMonth.lengthOfMonth();
        int diasRegistrados = (int) registros.stream().filter(r ->
                r.getAgua() > 0 ||
                r.getHumor() != null ||
                r.getSono() != null ||
                r.isEstudos() ||
                r.isTrabalho() ||
                r.isAcademia() ||
                r.isAcordarCedo() ||
                r.getAcordeiAs() != null ||
                r.getDormiAs() != null
        ).count();

        response.setDiasRegistrados(diasRegistrados);
        response.setTotalDiasMes(totalDias);

        // Média de água
        double mediaAgua = registros.stream()
                .mapToDouble(RegistroAtomico::getAgua)
                .average()
                .orElse(0.0);
        response.setMediaAgua(Math.round(mediaAgua * 100.0) / 100.0);

        // Dias de hábitos
        int diasEstudo = (int) registros.stream().filter(RegistroAtomico::isEstudos).count();
        int diasTrabalho = (int) registros.stream().filter(RegistroAtomico::isTrabalho).count();
        int diasAcademia = (int) registros.stream().filter(RegistroAtomico::isAcademia).count();
        int diasAcordouCedo = (int) registros.stream().filter(RegistroAtomico::isAcordarCedo).count();

        response.setDiasEstudo(diasEstudo);
        response.setDiasTrabalho(diasTrabalho);
        response.setDiasAcademia(diasAcademia);
        response.setDiasAcordouCedo(diasAcordouCedo);

        // Percentuais
        double base = diasRegistrados > 0 ? diasRegistrados : 1;
        response.setPercentualEstudo(Math.round((diasEstudo / base) * 100.0));
        response.setPercentualTrabalho(Math.round((diasTrabalho / base) * 100.0));
        response.setPercentualAcademia(Math.round((diasAcademia / base) * 100.0));
        response.setPercentualAcordouCedo(Math.round((diasAcordouCedo / base) * 100.0));

        // Humor predominante
        registros.stream()
                .filter(r -> r.getHumor() != null)
                .collect(java.util.stream.Collectors.groupingBy(RegistroAtomico::getHumor, java.util.stream.Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .ifPresentOrElse(
                        e -> response.setHumorPredominante(traduzirHumor(e.getKey())),
                        () -> response.setHumorPredominante("—")
                );

        // Média de sono
        List<Long> minutosSono = registros.stream()
                .filter(r -> r.getDormiAs() != null && r.getAcordeiAs() != null)
                .map(r -> {
                    long dormir = r.getDormiAs().toSecondOfDay();
                    long acordar = r.getAcordeiAs().toSecondOfDay();
                    long diff = acordar >= dormir ? acordar - dormir : (86400 - dormir) + acordar;
                    return diff / 60;
                })
                .collect(java.util.stream.Collectors.toList());

        if (!minutosSono.isEmpty()) {
            long mediaMinutos = (long) minutosSono.stream().mapToLong(Long::longValue).average().orElse(0);
            long h = mediaMinutos / 60;
            long m = mediaMinutos % 60;
            response.setMediaSono(String.format("%dh%02d", h, m));
        } else {
            response.setMediaSono("—");
        }

        // Média de horário: dormir e acordar (média circular, cruzamento de meia-noite)
        List<java.time.LocalTime> horariosDormir = registros.stream()
                .map(RegistroAtomico::getDormiAs)
                .filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.toList());

        List<java.time.LocalTime> horariosAcordar = registros.stream()
                .map(RegistroAtomico::getAcordeiAs)
                .filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.toList());

        response.setMediaDormiAs(mediaCircular(horariosDormir));
        response.setMediaAcordeiAs(mediaCircular(horariosAcordar));

        return response;
    }

    private String mediaCircular(List<java.time.LocalTime> horarios) {
        if (horarios.isEmpty()) return "—";

        double sumSin = 0, sumCos = 0;
        for (java.time.LocalTime t : horarios) {
            double angulo = 2 * Math.PI * t.toSecondOfDay() / 86400.0;
            sumSin += Math.sin(angulo);
            sumCos += Math.cos(angulo);
        }

        double anguloMedio = Math.atan2(sumSin, sumCos);
        if (anguloMedio < 0) anguloMedio += 2 * Math.PI;

        int segundosMedios = (int) Math.round(anguloMedio / (2 * Math.PI) * 86400);
        int h = (segundosMedios / 3600) % 24;
        int m = (segundosMedios % 3600) / 60;

        return String.format("%02d:%02d", h, m);
    }

    private String traduzirHumor(com.nicholas.rotina.model.Humor humor) {
        return switch (humor) {
            case PRODUTIVO -> "Produtivo";
            case NORMAL -> "Normal";
            case ANSIOSO -> "Ansioso";
            case CANSADO -> "Cansado";
            case TRISTE -> "Triste";
        };
    }
}