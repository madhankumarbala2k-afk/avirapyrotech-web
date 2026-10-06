# ==========================================
# Stage 1: Build the Spring Boot Application
# ==========================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy pom and source files
COPY pom.xml .
COPY src ./src

# Build the JAR
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Lightweight Production Runtime
# ==========================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create persistent upload folders
RUN mkdir -p uploads/products uploads/categories uploads/banners

# Copy the generated JAR
COPY --from=builder /app/target/admin-0.0.1-SNAPSHOT.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Dserver.port=8080", "-jar", "app.jar", "--spring.profiles.active=dev"]
