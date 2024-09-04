# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.

# All rules use Bash.
SHELL := bash

# One Bash process is started per rule.
.ONESHELL:

# http://redsymbol.net/articles/unofficial-bash-strict-mode/
.SHELLFLAGS := -ceuo pipefail

# Make does not clog stdout.
.SILENT:

# https://www.gnu.org/software/make/manual/html_node/Secondary-Expansion.html
.SECONDEXPANSION:

# This makefile may use as much power as possible.
ifeq ($(EXECUTION), parallel)

# Use as many processors as possible.
MAKEFLAGS := --jobs=$(shell nproc)

# Logs make sens, even if jobs are parallelized.
MAKEFLAGS += --output-sync=recurse
endif

# $(call list_files,${dir},${regex}) is the list of files under ${dir} verifying ${regex} pattern.
define list_files
	$(shell fd -t f -g '$(2)' $(1))
endef

# $(call objective, $objective). Prints ${objective}.
define objective
	echo "┌─"
	echo "│objective: $(1)"
	echo "└─"
endef

# $(call result, $result) prints ${result}. Prints ${result}.
define result
	echo "┌─"
	echo "│result: $(1)"
	echo "└─"
endef

# Context
PORT := 8082
ENV := PORT=${PORT}

# Context
# Result
# Rule
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "make %-30s %s\n", $$1, $$2}'

# Context
# Result
# Rule
.PHONY: repl
repl:  ## A REPL is started.
	$(call objective,"REPL")
	${ENV} iex -S mix
	$(call result,"repl")

# Context
# Result
# Rule
.PHONY: test
test:  ## The application is tested.
	$(call objective,"Test")
	${ENV} mix test
	$(call result,"test")

# Context
# Result
# Rule
.PHONY: release
release:  ## A release of the application is built.
	$(call objective,"Release")
	${ENV} MIX_ENV=prod mix release
	$(call result,"release")

# Context
# Result
# Rule
.PHONY: clean
clean:  ## Generated files are deleted.
	$(call objective,"Clean")
	rm -rf _build
	$(call result,"clean")

