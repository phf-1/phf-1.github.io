defmodule HelloWorld.Telemetry do
  @moduledoc """
  Handles telemetry events for request counting.
  """

  def setup() do
    :ok = :telemetry.attach_many(
      "hello-world-request-handler",
      [
        [:hello_world, :router, :start],
        [:hello_world, :router, :stop],
        [:hello_world, :router, :exception],
      ],
      &HelloWorld.Telemetry.handle_event/4,
      %{}
    )
  end

  def handle_event([:hello_world, :router, :start], _measurements, _metadata, _config) do
    HelloWorld.Alarm.increment()
  end

  def handle_event([:hello_world, :router, :stop], _measurements, _metadata, _config) do
    HelloWorld.Alarm.decrement()
  end

  def handle_event([:hello_world, :router, :exception], _measurements, _metadata, _config) do
    HelloWorld.Alarm.decrement()
  end
end
