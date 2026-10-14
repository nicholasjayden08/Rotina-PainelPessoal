package com.nicholas.rotina;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RotinaApplication {

    public static void main(String[] args) {
        SpringApplication.run(RotinaApplication.class, args);
    }
}