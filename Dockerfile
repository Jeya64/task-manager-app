# Build the JAR inside the Docker image
FROM maven:3.8.6-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean install -DskipTests

# Use a lightweight JDK image to run the app
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/taskmanager-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
