#!/bin/bash

# 로그 파일 경로
LOG_FILE="./log/webApp.log"

# 새 로그 파일 이름 (날짜 포함)
NEW_LOG_FILE="./log/webApp-$(date +%Y-%m-%d).log"

# 현재 로그 파일을 새 이름으로 이동
mv "$LOG_FILE" "$NEW_LOG_FILE"

# Node.js 프로세스에 SIGHUP 시그널을 보내 로그 파일을 다시 열도록 함
pkill -SIGHUP node

# 필요한 경우 로그 파일 압축
gzip "$NEW_LOG_FILE"