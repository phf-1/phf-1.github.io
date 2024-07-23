defmodule TestProject.Instrument do
  require Logger

  def setup do
    events = [[:hello]]
    :telemetry.attach_many("test-project-instrument", events, &__MODULE__.handle_event/4, nil)
  end
  
  def handle_event([:hello], measurements, _metadata, _config) do
    Logger.info("[Name telemetry: #{measurements.name}]")
  end
end
