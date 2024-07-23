(use-modules (guix packages)
             (guix download)
             (guix build-system mix)
             (guix build-system rebar)
             (guix gexp)
             ((guix licenses) #:prefix license:))

(define erlang-telemetry
  (package
    (name "erlang-telemetry")
    (version "1.2.1")
    (source
     (origin
       (method url-fetch)
       (uri (hexpm-uri "telemetry" version))
       (sha256
        (base32 "1mgyx9zw92g6w8fp9pblm3b0bghwxwwcbslrixq23ipzisfwxnfs"))))
    (build-system rebar-build-system)
    (synopsis "Dynamic dispatching library for metrics and instrumentation")
    (description
     "Dynamic dispatching library for metrics and instrumentation.")
    (home-page "https://hexdocs.pm/telemetry/")
    (license license:asl2.0)))

(package
  (name "elixir-test-project")
  (version "0")
  (source (local-file (canonicalize-path "_build/test_project.tar.gz")))
  (inputs (list erlang-telemetry))
  (build-system mix-build-system)
  (arguments
   `(#:modules ((guix build mix-build-system)
                (guix build utils)
                (ice-9 match))
     #:phases
     (modify-phases %standard-phases
       (add-before 'build 'collect-erlang-packages
         (lambda* (#:key inputs #:allow-other-keys)
           (let* ((erlang-dependencies
                   (filter (match-lambda
                            ((label . _) (string-prefix? "erlang-" label)))
                           inputs))
                  (erl-libs
                   (string-join
                    (map (match-lambda
                          ((_ . dir)
                           (pk( string-append
                                dir "/lib/erlang/lib"))))
                         erlang-dependencies)
                    ":")))
             (setenv "ERL_LIBS" erl-libs)))))))
  (synopsis "Test package")
  (description "Test package.")
  (home-page "https://example.com")
  (license #f))
