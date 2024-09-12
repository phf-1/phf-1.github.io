SHELL := bash
.SHELLFLAGS = -ceuo pipefail
.ONESHELL:
.SILENT:


# Context
_6725_DOT := $(shell echo *.dot)
# Objective
6725_SVG := ${_6725_DOT:%.dot=%.svg}
# Rule
%.svg: %.dot
	dot -Tsvg "$<" -o "$@"


.PHONY: all
all: ${6725_SVG}
