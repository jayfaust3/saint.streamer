#!/usr/bin/env bash
docker-compose -f "docker-compose.yml" up -d --build
docker-compose logs -f -t saint-streamer