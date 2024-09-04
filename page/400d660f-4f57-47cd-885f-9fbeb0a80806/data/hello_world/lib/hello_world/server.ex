defmodule HelloWorld.Server do
	def child_spec([port: port]) do
		Plug.Cowboy.child_spec([scheme: :http, plug: HelloWorld.Router, port: port])
	end
end
