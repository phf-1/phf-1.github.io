defmodule TestProject.MixProject do
  use Mix.Project

  def project do
    [
      app: :test_project,
      version: "0.1.0",
      elixir: "~> 1.16",
      start_permanent: Mix.env() == :prod,
			deps: [{:telemetry, "~> 1.2"}],
			escript: escript()
    ]
  end

  def application do
    [
      extra_applications: [:logger],
			mod: {TestProject, []}
    ]
  end

	defp escript do
		[main_module: TestProject.CLI]
	end
end
