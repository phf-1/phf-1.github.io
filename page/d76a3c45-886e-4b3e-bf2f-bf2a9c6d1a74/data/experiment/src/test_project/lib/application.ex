defmodule TestProject do
  require Logger	
  use Application

  def start(_type, _args) do
		:telemetry.attach_many(
			"test-project-instrument",	[[:hello]],
			&__MODULE__.handle_event/4, nil)
    Supervisor.start_link([], strategy: :one_for_one)
  end

  def handle_event([:hello], measurements, _metadata, _config) do
    Logger.info("[Name telemetry: #{measurements.name}]")
  end
	
  def hello(name) do
    :telemetry.execute([:hello], %{name: name},	%{})		
    "Hello #{name}!"
  end	
end
