# MySQL Database Setup for Ticket-Place

## Prerequisites
- MySQL Server installed and running
- MySQL command line tool or GUI tool (like MySQL Workbench, DBeaver, etc.)

## Setup Instructions

### 1. Create the Database
Run the provided SQL script to create the database:

**Using MySQL Command Line:**
```bash
mysql -u root -p < create_database.sql
```

**Using MySQL Workbench or other GUI:**
1. Connect to your MySQL server
2. Open and execute the `create_database.sql` script

### 2. Update Database Credentials (if needed)
Edit `src/main/resources/application.properties` to match your MySQL configuration:

```properties
# Update these values if needed
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.url=jdbc:mysql://localhost:3306/ticketplace_db
```

### 3. Test the Connection
Run the Spring Boot application:
```bash
./mvnw spring-boot:run
```

The application will automatically test the database connection on startup and display the result.

## Database Configuration
The application is configured with:
- **Database Name**: `ticketplace_db`
- **Host**: `localhost`
- **Port**: `3306`
- **Username**: `root` (change as needed)
- **Password**: (empty by default, change as needed)
- **Hibernate DDL**: `update` (automatically creates/updates tables)
- **SQL Logging**: Enabled for debugging

## Troubleshooting
- **Connection Failed**: Ensure MySQL server is running
- **Database Not Found**: Run the `create_database.sql` script
- **Authentication Error**: Check username/password in application.properties
- **Port Issues**: Verify MySQL is running on port 3306
