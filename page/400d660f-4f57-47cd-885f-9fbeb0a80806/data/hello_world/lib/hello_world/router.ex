defmodule HelloWorld.Router do

  use Plug.Router
  use Plug.ErrorHandler
	alias HelloWorld.Message.World
	alias HelloWorld.Message.Error

	plug Plug.Telemetry, event_prefix: [:hello_world, :router]
  plug Plug.Parsers, parsers: [:json], json_decoder: Jason
	plug Plug.Logger, log: :debug
	plug :match
  plug :dispatch

	post "/" do
		{code, msg} =
			case conn.body_params do
				%{"type" => "hello"} -> {200, %World{}}
			end
		reply(conn, code, msg)
	end


	##################
	# Error Handling #
	##################

	@impl Plug.ErrorHandler
	def handle_errors(conn, %{reason: reason}) do
    reply(conn, conn.status, %Error{msg: reason.term})
  end


	###########
	# Private #
	###########

	defp reply(conn, code, msg) do
		json = msg |> Map.from_struct |> Jason.encode!
		conn |> put_resp_content_type("application/json")	|> send_resp(code, json)
	end
end
