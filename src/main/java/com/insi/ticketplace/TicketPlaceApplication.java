package com.insi.ticketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling   // ← active les tâches planifiées
public class TicketPlaceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TicketPlaceApplication.class, args);
    }

}
