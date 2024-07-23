defmodule AProject.MixProject do
  use Mix.Project

  def project do
	[
	  app: :a_project,
	  version: "0.0.0",
	  elixir: "~> 1.16",
	  start_permanent: Mix.env() == :prod,
	  deps: deps()
	]
  end

  def application do
	[
	  extra_applications: [:logger],
	  mod: {AProjet.Application, []}
	]
  end

  defp deps do
	[
	  {:test_project, path: "/gnu/store/fks61451l1wx2gbwzfrd4a7knfyi5m14-elixir-test-project-0/lib/elixir/1.17"},
	  {:telemetry, path: "/gnu/store/k2blpmzb8z15idsppifq1dhkxhwpgh0k-erlang-telemetry-1.2.1"}
	]
  end
end
