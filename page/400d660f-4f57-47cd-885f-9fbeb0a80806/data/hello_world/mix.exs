defmodule HelloWorld.MixProject do
  use Mix.Project

  def project do
    [
      app: :hello_world,
      version: "0.1.0",
      elixir: "~> 1.16",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger,:observer,:wx],
      mod: {HelloWorld.Application, []}
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
			{:req, "~> 0.5.6", only: [:dev, :test]},
			{:cowboy, "~> 2.12"},
			{:jason, "~> 1.4"},
			{:plug_cowboy, "~> 2.7"}
    ]
  end
end
