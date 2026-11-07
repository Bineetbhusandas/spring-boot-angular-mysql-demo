-- Flyway migration V2: a little seed data so the API returns something
-- interesting as soon as the containers are up.

INSERT INTO tasks (title, description, status)
VALUES ('Learn Docker images',
        'Build this Spring Boot application into a Docker image',
        'DONE'),
       ('Run MySQL in a container',
        'Start MySQL 8.4 and connect the app to it over the demo-net Docker network',
        'IN_PROGRESS'),
       ('Test the REST API',
        'Call /api/tasks through the published container port',
        'TODO');
