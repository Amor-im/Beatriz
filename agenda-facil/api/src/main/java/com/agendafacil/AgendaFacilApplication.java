package com.agendafacil;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class AgendaFacilApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgendaFacilApplication.class, args);
    }
}
