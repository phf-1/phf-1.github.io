import Config
{port, _} = Integer.parse(System.get_env("PORT"))
config :hello_world, port: port
import_config "#{config_env()}.exs"

