SHELL := bash
.SHELLFLAGS = -cxeuo pipefail
.ONESHELL:
.SILENT:


# $(call list_files, glob, dir) ≡ files : List Path
define list_files
	$(shell fd -uu -t f -g $(2) $(1))
endef


help: ## This help.
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


# archive
## Context
SRC := src
TEST_PROJECT_NAME := test_project
TEST_PROJECT := ${SRC}/${TEST_PROJECT_NAME}
ARCHIVE_FILES := $(call list_files,${TEST_PROJECT},'*')
ARCHIVE_NAME := ${TEST_PROJECT_NAME}.tar.gz
BUILD := _build
$(shell mkdir -p ${BUILD})
## Objective
ARCHIVE := ${BUILD}/${ARCHIVE_NAME}
## Rule
.PHONY: archive
archive: ${ARCHIVE} ## Build the arhive that will serve as the source of the Guix package.
${ARCHIVE}: ${ARCHIVE_FILES}
	pushd ${SRC}
	tar cvzf ${ARCHIVE_NAME} ${TEST_PROJECT_NAME}
	popd
	mv ${SRC}/${ARCHIVE_NAME} $@


# build
## Context
PACKAGE_NAME := test-package.scm
PACKAGE := ${SRC}/${PACKAGE_NAME}
## Objective
BUILD_LOG := ${BUILD}/build_log.txt
## Rule
.PHONY: build
build: ${BUILD_LOG} ## Build the Guix test package.
${BUILD_LOG}: ${ARCHIVE} ${PACKAGE}
	guix build -K -f ${PACKAGE} | tee $@


# aproject
## Context
A_PROJECT_MIX := ${BUILD}/mix.exs
A_PROJECT_LIB := ${BUILD}/lib

## Objective
A_PROJECT := ${A_PROJECT_MIX} ${A_PROJECT_LIB}
## Rule
.PHONY: aproject
aproject: ${A_PROJECT}  ## Builds an empty project that uses our test project.
${A_PROJECT_MIX}: ${SRC}/mix.exs
	cp $< $@

${A_PROJECT_LIB}: ${SRC}/lib
	cp -r $< $@


# repl
## Context
## Objective
## Rule
.PHONY: repl
repl:  ## Start a REPL in a Guix container.
	guix shell --container coreutils elixir -f ${PACKAGE} # -- iex


.PHONY: clean
clean:  ## Clean all built files.
	rm -rvf _*
