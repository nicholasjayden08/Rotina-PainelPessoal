package com.nicholas.rotina.controller;

import com.nicholas.rotina.dto.EstatisticaMesRequest;
import com.nicholas.rotina.dto.EstatisticasRequest;
import com.nicholas.rotina.dto.MelhorDiaRequest;
import com.nicholas.rotina.dto.MelhorSemanaRequest;
import org.springframework.web.bind.annotation.RequestParam;
import com.nicholas.rotina.model.Humor;
import com.nicholas.rotina.model.QualidadeSono;
import com.nicholas.rotina.model.RegistroAtomico;
import com.nicholas.rotina.repository.RegistroAtomicoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Resumo estatístico de um mês: percentuais de hábito, humor
 * predominante, média de sono, horários médios de dormir/acordar, e o
 * melhor dia e a melhor semana do mês (com o porquê — ver pontuarDia()).
 * listarMeses() usa os registros existentes pra descobrir quais
 * meses têm dado suficiente pra aparecer no seletor da tela.
 */
@RestController
@RequestMapping("/api/estatisticas")
public class EstatisticasController {

    private final RegistroAtomicoRepository repository;

    private static final double WATER_GOAL = 4.0;
    private static final int MIN_DIAS_SEMANA = 3;

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

        response.setMelhorDia(calcularMelhorDia(registros));
        response.setMelhorSemana(calcularMelhorSemana(registros));

        return response;
    }

    /**
     * Média "normal" de horário quebra perto da meia-noite (23:50 e
     * 00:10 deveriam dar ~00:00, mas a média aritmética ingênua dá
     * meio-dia). Solução: trata cada horário como um ângulo num círculo
     * de 24h, tira a média dos vetores (seno/cosseno) e converte o
     * ângulo resultante de volta pra horário — assim 23:50 e 00:10
     * corretamente resultam em 00:00.
     */
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

    /**
     * Pontuação de "quão bom foi o dia", pra achar o melhor dia/semana do mês.
     * Cada hábito feito vale 1 ponto (até 4), humor e qualidade do sono
     * entram com o score que já têm (1 a 5 cada, reaproveitando o que já
     * existe em Humor/QualidadeSono), e bater a meta de água vale 2 pontos.
     */
    private int pontuarDia(RegistroAtomico r) {
        int score = 0;
        if (r.isAcademia()) score += 1;
        if (r.isEstudos()) score += 1;
        if (r.isTrabalho()) score += 1;
        if (r.isAcordarCedo()) score += 1;
        if (r.getHumor() != null) score += scoreHumor(r.getHumor());
        if (r.getSono() != null) score += r.getSono().getScore();
        if (r.getAgua() >= WATER_GOAL) score += 2;
        return score;
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

    private String traduzirSono(QualidadeSono sono) {
        return switch (sono) {
            case PERFEITO -> "perfeito";
            case MUITO_BOM -> "muito bom";
            case BOM -> "bom";
            case MAIS_OU_MENOS -> "mais ou menos";
            case RUIM -> "ruim";
        };
    }

    private List<String> motivosDia(RegistroAtomico r) {
        List<String> motivos = new ArrayList<>();
        if (r.isAcademia()) motivos.add("foi pra academia");
        if (r.isEstudos()) motivos.add("estudou");
        if (r.isTrabalho()) motivos.add("trabalhou");
        if (r.isAcordarCedo()) motivos.add("acordou cedo");
        if (r.getHumor() != null && scoreHumor(r.getHumor()) >= 4) {
            motivos.add("humor " + traduzirHumor(r.getHumor()).toLowerCase());
        }
        if (r.getSono() != null && r.getSono().getScore() >= 4) {
            motivos.add("dormiu " + traduzirSono(r.getSono()));
        }
        if (r.getAgua() >= WATER_GOAL) {
            motivos.add(String.format("bateu a meta de água (%.1fL)", r.getAgua()));
        }
        return motivos;
    }

    private MelhorDiaRequest calcularMelhorDia(List<RegistroAtomico> registros) {
        RegistroAtomico melhor = registros.stream()
                .max(Comparator.comparingInt(this::pontuarDia))
                .orElse(null);

        if (melhor == null || pontuarDia(melhor) == 0) return null;

        MelhorDiaRequest resposta = new MelhorDiaRequest();
        resposta.setData(melhor.getData().toString());
        resposta.setPontuacao(pontuarDia(melhor));
        resposta.setMotivos(motivosDia(melhor));
        return resposta;
    }

    private List<String> motivosSemana(List<RegistroAtomico> dias) {
        List<String> motivos = new ArrayList<>();
        int total = dias.size();

        long academia = dias.stream().filter(RegistroAtomico::isAcademia).count();
        long estudos = dias.stream().filter(RegistroAtomico::isEstudos).count();
        long trabalho = dias.stream().filter(RegistroAtomico::isTrabalho).count();
        long acordouCedo = dias.stream().filter(RegistroAtomico::isAcordarCedo).count();
        long metaAgua = dias.stream().filter(r -> r.getAgua() >= WATER_GOAL).count();

        if (academia > 0) motivos.add(String.format("academia em %d de %d dias", academia, total));
        if (estudos > 0) motivos.add(String.format("estudou em %d de %d dias", estudos, total));
        if (trabalho > 0) motivos.add(String.format("trabalhou em %d de %d dias", trabalho, total));
        if (acordouCedo > 0) motivos.add(String.format("acordou cedo em %d de %d dias", acordouCedo, total));
        if (metaAgua > 0) motivos.add(String.format("bateu a meta de água em %d de %d dias", metaAgua, total));

        OptionalDouble mediaHumor = dias.stream()
                .map(RegistroAtomico::getHumor).filter(Objects::nonNull)
                .mapToInt(this::scoreHumor).average();
        if (mediaHumor.isPresent() && mediaHumor.getAsDouble() >= 4) {
            motivos.add("humor bom na maior parte da semana");
        }

        OptionalDouble mediaSono = dias.stream()
                .map(RegistroAtomico::getSono).filter(Objects::nonNull)
                .mapToInt(QualidadeSono::getScore).average();
        if (mediaSono.isPresent() && mediaSono.getAsDouble() >= 4) {
            motivos.add("dormiu bem na maior parte da semana");
        }

        return motivos;
    }

    /**
     * Agrupa os registros por semana (segunda a domingo) e pega a semana
     * com maior MÉDIA de pontuação entre os dias registrados nela — usa
     * média (não soma) pra não favorecer semana com mais dias registrados,
     * e só considera semanas com pelo menos MIN_DIAS_SEMANA dias, senão
     * uma semana de 1 dia ótimo ganharia injustamente de uma semana
     * inteira consistente.
     */
    private MelhorSemanaRequest calcularMelhorSemana(List<RegistroAtomico> registros) {
        Map<LocalDate, List<RegistroAtomico>> porSemana = registros.stream()
                .collect(Collectors.groupingBy(r -> r.getData().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))));

        LocalDate melhorInicio = null;
        double melhorMedia = -1;
        List<RegistroAtomico> melhorDias = null;

        for (Map.Entry<LocalDate, List<RegistroAtomico>> entry : porSemana.entrySet()) {
            List<RegistroAtomico> dias = entry.getValue();
            if (dias.size() < MIN_DIAS_SEMANA) continue;

            double media = dias.stream().mapToInt(this::pontuarDia).average().orElse(0);
            if (media > melhorMedia) {
                melhorMedia = media;
                melhorInicio = entry.getKey();
                melhorDias = dias;
            }
        }

        if (melhorInicio == null) return null;

        MelhorSemanaRequest resposta = new MelhorSemanaRequest();
        resposta.setInicio(melhorInicio.toString());
        resposta.setFim(melhorInicio.plusDays(6).toString());
        resposta.setPontuacaoMedia(Math.round(melhorMedia * 10.0) / 10.0);
        resposta.setMotivos(motivosSemana(melhorDias));
        return resposta;
    }

    private String traduzirHumor(Humor humor) {
        return switch (humor) {
            case PRODUTIVO -> "Produtivo";
            case NORMAL -> "Normal";
            case ANSIOSO -> "Ansioso";
            case CANSADO -> "Cansado";
            case TRISTE -> "Triste";
        };
    }
}