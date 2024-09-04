defmodule HelloWorld.Application do
  use Application

  @impl true
  def start(_type, _args) do
		HelloWorld.Telemetry.setup()
		port = Application.fetch_env!(:hello_world, :port)
    children = [
			{HelloWorld.Server, [port: port]},
			HelloWorld.Alarm
		]
    opts = [strategy: :one_for_one, name: HelloWorld.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
