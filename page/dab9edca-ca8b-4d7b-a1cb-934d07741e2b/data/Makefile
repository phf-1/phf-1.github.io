SHELL := bash
.SHELLFLAGS = -ceuo pipefail
.ONESHELL:
.SILENT:


# Context
_2AE0_FILE := $(shell echo *.dot)
# Objective
2AE0_SUMMARY := ${_2AE0_FILE:%.dot=%.svg}
# Rule
%.svg: %.dot
	dot -Tsvg "$<" -o "$@"


.PHONY: all
all: ${2AE0_SUMMARY}
