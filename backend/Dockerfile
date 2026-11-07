# syntax=docker/dockerfile:1

####################################################################
# Stage 1 - BUILD
# A full Maven + JDK image is used ONLY to compile the application.
# It is thrown away afterwards, so the final image stays small.
####################################################################
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy the POM first. Docker caches this layer, so dependencies are only
# re-downloaded when pom.xml changes (much faster rebuilds).
COPY pom.xml .
RUN mvn -B -q -DskipTests dependency:resolve

# Copy the source code and build the executable JAR.
COPY src ./src
RUN mvn -B -q -DskipTests clean package

####################################################################
# Stage 2 - RUNTIME
# A slim JRE-only image: no Maven, no JDK, no source code.
####################################################################
FROM eclipse-temurin:21-jre-alpine

LABEL org.opencontainers.image.title="spring-boot-docker-demo"
LABEL org.opencontainers.image.description="Spring Boot + MySQL demo used to learn Docker"

# Never run the application as root inside the container.
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app
# --chown avoids a second 55 MB layer that a separate `RUN chown` would create
COPY --from=build --chown=app:app /workspace/target/app.jar app.jar

USER app

EXPOSE 8080

# Docker (and Compose) will report "healthy" only when Spring Boot answers.
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/actuator/health | grep -q '"status":"UP"' || exit 1

# MaxRAMPercentage lets the JVM respect the container memory limit.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
