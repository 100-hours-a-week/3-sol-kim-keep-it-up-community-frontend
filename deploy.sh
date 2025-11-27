#!/bin/bash

cd /var/lib/jenkins/frontend
docker compose pull
docker compose up -d