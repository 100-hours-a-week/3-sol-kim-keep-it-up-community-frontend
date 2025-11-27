#!/bin/bash

cd /var/lib/jenkins/backend
docker compose pull
docker compose up -d