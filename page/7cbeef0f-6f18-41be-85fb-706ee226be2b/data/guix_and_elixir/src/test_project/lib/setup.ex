defmodule TestProject.Setup do
  use Application

  def start(_type, _args) do
    TestProject.Instrument.setup()

    children = []
    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
