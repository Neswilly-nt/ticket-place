package com.insi.ticketplace;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.jdbc.core.JdbcTemplate;
import javax.sql.DataSource;

@SpringBootApplication
public class TicketPlaceApplication implements CommandLineRunner {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    public TicketPlaceApplication(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        this.dataSource = dataSource;
        this.jdbcTemplate = jdbcTemplate;
    }

    public static void main(String[] args) {
        SpringApplication.run(TicketPlaceApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            // Test database connection
            System.out.println("Testing database connection...");
            
            // Simple connection test
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            System.out.println("✅ Database connection successful!");
            
            // Check if database exists and is accessible
            String dbName = jdbcTemplate.queryForObject("SELECT DATABASE()", String.class);
            System.out.println("✅ Connected to database: " + dbName);
            
        } catch (Exception e) {
            System.err.println("❌ Database connection failed: " + e.getMessage());
            System.err.println("Please ensure MySQL is running and the database 'ticketplace_db' exists.");
            System.err.println("Run the create_database.sql script to create the database.");
        }
    }
}
