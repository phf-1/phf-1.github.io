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
PACKAGE := test-project-package.scm
## Objective
BUILD_LOG := ${BUILD}/build_log.txt
## Rule
.PHONY: build
build: ${BUILD_LOG} ## Build the Guix test package.
${BUILD_LOG}: ${ARCHIVE} ${PACKAGE}
	guix build -K -f ${PACKAGE} | tee $@


# compile
## Context
## Objective
LIB := src/test_project/_build/prod/lib/test_project
## Rule
.PHONY: compile
compile: ${LIB}
${LIB}:
	pushd src/test_project
	MIX_ENV=prod mix compile --no-deps-check


# test
## Context
## Objective
## Rule
.PHONY: test
test:  ## Test test_project.
	iex test_script.exs


# container
## Context
## Objective
## Rule
.PHONY: container
container:  ## Start a REPL in a Guix container.
	guix shell -C --nesting -D -f ${PACKAGE} which fd tree guile --preserve=LC_ALL

.PHONY: clean
clean:  ## Clean all built files.
	rm -rvf _*
