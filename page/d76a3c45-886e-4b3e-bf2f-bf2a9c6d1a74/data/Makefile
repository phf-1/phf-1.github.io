SHELL := bash
.SHELLFLAGS = -cxeuo pipefail
.ONESHELL:
.SILENT:

.PHONY: experiment
experiment: experiment.tar.gz
experiment.tar.gz:
	tar cvzf $@ experiment
