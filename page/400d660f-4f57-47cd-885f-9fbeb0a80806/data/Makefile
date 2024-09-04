SHELL := bash
.SHELLFLAGS = -ceuo pipefail
.ONESHELL:
.SILENT:


# Context
_E358_DOT := $(shell echo *.dot)
# Objective
E358_SVG := ${_E358_DOT:%.dot=%.svg}
# Rule
%.svg: %.dot
	dot -Tsvg "$<" -o "$@"


.PHONY: all
all: ${E358_SVG}
